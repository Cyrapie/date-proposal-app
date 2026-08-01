import { NextResponse, type NextRequest } from 'next/server';

import { sendEmail } from '@/lib/email/send';
import { emailEnv } from '@/lib/env';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { inquirySchema } from '@/lib/validation/inquiry';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Réception des formulaires Contact et Devenir partenaire.
 *
 * L'email part vers `INQUIRIES_TO`, ou à défaut vers `EMAIL_REPLY_TO`.
 * Sans destinataire configuré, la demande est journalisée plutôt que perdue
 * silencieusement — et l'appelant reçoit une erreur explicite.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Formulaire incomplet.' },
      { status: 422 },
    );
  }

  const input = parsed.data;

  // Piège à robots rempli : on répond 200 sans rien envoyer.
  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  // Turnstile. Neutralisé tant que les clés ne sont pas configurées.
  const captcha = await verifyTurnstile(
    input.turnstileToken || undefined,
    request.headers.get('x-forwarded-for'),
  );

  if (!captcha.ok) {
    return NextResponse.json(
      { error: 'Vérification anti-robot échouée. Rechargez la page et réessayez.' },
      { status: 403 },
    );
  }

  const to = process.env.INQUIRIES_TO || emailEnv.replyTo;

  if (!to) {
    console.warn(
      `[inquiries] Aucun destinataire configuré (INQUIRIES_TO). Demande ${input.kind} de ${input.email} non transmise.`,
    );
    return NextResponse.json(
      { error: "Le formulaire n'est pas encore configuré. Écrivez-nous directement." },
      { status: 503 },
    );
  }

  const isPartner = input.kind === 'partner';
  const subject = isPartner
    ? `Demande de partenariat : ${input.company || input.name}`
    : `Message de ${input.name}`;

  const rows = [
    ['Nom', input.name],
    ['Email', input.email],
    ...(isPartner && input.company ? [['Structure', input.company]] : []),
  ];

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2a2320;line-height:1.6;">
      <h1 style="font-size:20px;color:#6d1b2c;margin:0 0 16px;">${escapeHtml(subject)}</h1>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#7d6f66;font-size:13px;">${label}</td><td style="padding:4px 0;font-size:14px;font-weight:600;">${escapeHtml(value)}</td></tr>`,
          )
          .join('')}
      </table>
      <div style="border-left:3px solid #6d1b2c;padding:12px 16px;background:#faf6f0;white-space:pre-wrap;font-size:14px;">${escapeHtml(input.message)}</div>
    </div>`;

  const text = [
    subject,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    '',
    input.message,
  ].join('\n');

  const result = await sendEmail({ to, subject, html, text });

  if (!result.ok) {
    // La demande est tracée dans les logs : elle n'est pas perdue.
    console.error(
      `[inquiries] Envoi impossible (${result.error}). Demande ${input.kind} de ${input.email} : ${input.message.slice(0, 200)}`,
    );
    return NextResponse.json(
      { error: "L'envoi a échoué. Réessayez, ou écrivez-nous directement." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
