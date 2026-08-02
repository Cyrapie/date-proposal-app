import { anyTypeMeta, type AnyProposalType } from '@/lib/domain/proposal';
import { formatSlotRange } from '@/lib/format';

export type GroupEmailContext = {
  participantName: string;
  status: 'confirmed' | 'waitlisted' | 'promoted';
  capacity: number;
  confirmedCount: number;
  waitlistPosition?: number;
  /** Absent pour l'email de promotion : la place est déjà acquise, plus rien à annuler avant. */
  cancelUrl?: string;
};

export type ResponseEmailData = {
  recipientName: string;
  type: AnyProposalType;
  locationLabel: string | null;
  locationAddress: string | null;
  slotStart: string;
  slotEnd: string;
  note: string | null;
  googleCalendarUrl: string;
  proposalUrl: string;
  /** Contre-proposition : le destinataire a proposé sa propre date. */
  countered?: boolean;
  /** Présent uniquement pour une invitation de groupe. */
  group?: GroupEmailContext;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const COLORS = {
  bg: '#faf6f0',
  surface: '#fffdf9',
  ink: '#2a2320',
  muted: '#7d6f66',
  accent: '#6d1b2c',
  border: '#e6dbcd',
};

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:16px;">
      <tr>
        <td style="padding:32px 28px;">
          ${bodyHtml}
        </td>
      </tr>
    </table>
    <p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.6;color:${COLORS.muted};text-align:center;">
      Cet email a été envoyé automatiquement suite à une réponse sur votre lien de proposition.
    </p>
  </body>
</html>`;
}

function detailsTable(data: ResponseEmailData): string {
  const rows: string[] = [
    `<tr>
       <td style="padding:10px 0;font-size:13px;color:${COLORS.muted};width:96px;vertical-align:top;">${data.countered ? 'Proposé' : 'Quand'}</td>
       <td style="padding:10px 0;font-size:15px;font-weight:600;">${escapeHtml(formatSlotRange(data.slotStart, data.slotEnd))}</td>
     </tr>`,
  ];

  if (data.locationLabel) {
    const address = data.locationAddress
      ? `<br /><span style="font-weight:400;font-size:13px;color:${COLORS.muted};">${escapeHtml(data.locationAddress)}</span>`
      : '';
    rows.push(
      `<tr>
         <td style="padding:10px 0;font-size:13px;color:${COLORS.muted};vertical-align:top;">Où</td>
         <td style="padding:10px 0;font-size:15px;font-weight:600;">${escapeHtml(data.locationLabel)}${address}</td>
       </tr>`,
    );
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLORS.border};border-bottom:1px solid ${COLORS.border};margin:20px 0;">${rows.join('')}</table>`;
}

function noteBlock(note: string | null): string {
  if (!note) return '';
  return `<div style="background:${COLORS.bg};border-left:3px solid ${COLORS.accent};padding:14px 16px;border-radius:0 8px 8px 0;margin:0 0 20px;">
      <p style="margin:0;font-size:13px;color:${COLORS.muted};">Un mot pour toi</p>
      <p style="margin:6px 0 0;font-size:15px;font-style:italic;">« ${escapeHtml(note)} »</p>
    </div>`;
}

function calendarButton(url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${COLORS.accent};color:#fffdf9;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600;">Ajouter à Google Calendar</a>`;
}

/** Email au créateur : récapitulatif complet de la réponse. */
export function creatorResponseEmail(data: ResponseEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const meta = anyTypeMeta(data.type);
  const group = data.group;
  const who = group ? group.participantName : data.recipientName;

  const subject = group
    ? group.status === 'waitlisted'
      ? `${who} rejoint la liste d'attente ${meta.emoji}`
      : `${who} a une place ${meta.emoji} (${group.confirmedCount}/${group.capacity})`
    : data.countered
      ? `${data.recipientName} propose une autre date ${meta.emoji}`
      : `${data.recipientName} a dit oui ${meta.emoji}`;

  const intro = group
    ? group.status === 'waitlisted'
      ? `${escapeHtml(who)} a rejoint la liste d'attente : toutes les places sont prises pour l'instant.`
      : `${escapeHtml(who)} a rejoint votre invitation. ${group.confirmedCount} place${group.confirmedCount > 1 ? 's' : ''} confirmée${group.confirmedCount > 1 ? 's' : ''} sur ${group.capacity}.`
    : data.countered
      ? "Aucun de vos créneaux ne convenait, voici sa proposition."
      : 'Voici ce qui a été choisi.';

  const html = layout(
    subject,
    `<p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.muted};">${group ? (group.status === 'waitlisted' ? "Liste d'attente" : 'Nouvelle place confirmée') : data.countered ? 'Autre date proposée' : "C'est un oui"}</p>
     <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:600;color:${COLORS.accent};">${escapeHtml(who)} ${group ? (group.status === 'waitlisted' ? 'est en liste d’attente' : 'a rejoint votre invitation') : data.countered ? 'propose une autre date' : 'a accepté votre invitation'}</h1>
     <p style="margin:0;font-size:15px;line-height:1.6;">${escapeHtml(meta.headline)}. ${intro}</p>
     ${detailsTable(data)}
     ${noteBlock(data.note)}
     ${
       group && group.status === 'waitlisted'
         ? ''
         : `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
       Le fichier <strong>.ics</strong> est joint à cet email : ouvrez-le pour ajouter le rendez-vous à votre agenda.
     </p>
     ${calendarButton(data.googleCalendarUrl)}`
     }`,
  );

  const text = [
    group
      ? group.status === 'waitlisted'
        ? `${who} a rejoint la liste d'attente.`
        : `${who} a rejoint votre invitation (${group.confirmedCount}/${group.capacity}).`
      : data.countered
        ? `${data.recipientName} propose une autre date.`
        : `${data.recipientName} a accepté votre invitation.`,
    '',
    `Quand : ${formatSlotRange(data.slotStart, data.slotEnd)}`,
    data.locationLabel ? `Où : ${data.locationLabel}` : null,
    data.locationAddress ? `Adresse : ${data.locationAddress}` : null,
    data.note ? `\nUn mot : « ${data.note} »` : null,
    !group || group.status !== 'waitlisted' ? '' : null,
    !group || group.status !== 'waitlisted' ? `Ajouter à Google Calendar : ${data.googleCalendarUrl}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return { subject, html, text };
}

function cancelBlock(cancelUrl: string | undefined): string {
  if (!cancelUrl) return '';
  return `<p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:${COLORS.muted};">
      Un empêchement ? <a href="${cancelUrl}" style="color:${COLORS.muted};">Annulez votre place</a> pour la libérer.
    </p>`;
}

/** Email de confirmation au destinataire (si l'email a été laissé). */
export function recipientConfirmationEmail(data: ResponseEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const meta = anyTypeMeta(data.type);
  const group = data.group;
  const name = group ? group.participantName : data.recipientName;

  const subject = group
    ? group.status === 'waitlisted'
      ? `Vous êtes en liste d'attente ${meta.emoji}`
      : group.status === 'promoted'
        ? `Une place s'est libérée ${meta.emoji}, vous êtes confirmé`
        : `C'est noté ${meta.emoji}, votre place est confirmée`
    : data.countered
      ? `Votre proposition est transmise ${meta.emoji}`
      : `C'est noté ${meta.emoji}, votre rendez-vous est confirmé`;

  const intro = group
    ? group.status === 'waitlisted'
      ? `Toutes les places sont prises pour l'instant — vous êtes en position ${group.waitlistPosition ?? '?'} sur la liste d'attente. Vous serez prévenu si une place se libère.`
      : group.status === 'promoted'
        ? "Une place vient de se libérer et elle est à vous. Voici les détails."
        : `Votre place est confirmée. ${group.confirmedCount}/${group.capacity} places prises.`
    : data.countered
      ? 'Votre proposition a été transmise, en attente de confirmation.'
      : 'Récapitulatif de votre choix.';

  const showCalendar = !group || group.status !== 'waitlisted';

  const html = layout(
    subject,
    `<p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.muted};">${group?.status === 'waitlisted' ? "Liste d'attente" : 'Confirmation'}</p>
     <h1 style="margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:600;color:${COLORS.accent};">${group?.status === 'waitlisted' ? `Patience, ${escapeHtml(name)}` : `C'est noté, ${escapeHtml(name)}`}</h1>
     <p style="margin:0;font-size:15px;line-height:1.6;">${escapeHtml(meta.headline)}. ${intro}</p>
     ${detailsTable(data)}
     ${
       showCalendar
         ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:${COLORS.muted};">
       Le fichier <strong>.ics</strong> joint ajoute le rendez-vous à votre agenda en un clic.
     </p>
     ${calendarButton(data.googleCalendarUrl)}`
         : ''
     }
     ${cancelBlock(group?.cancelUrl)}`,
  );

  const text = [
    group?.status === 'waitlisted' ? `Patience, ${name}.` : `C'est noté, ${name}.`,
    '',
    `Quand : ${formatSlotRange(data.slotStart, data.slotEnd)}`,
    data.locationLabel ? `Où : ${data.locationLabel}` : null,
    data.locationAddress ? `Adresse : ${data.locationAddress}` : null,
    '',
    showCalendar ? `Ajouter à Google Calendar : ${data.googleCalendarUrl}` : null,
    group?.cancelUrl ? `Annuler votre place : ${group.cancelUrl}` : null,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return { subject, html, text };
}
