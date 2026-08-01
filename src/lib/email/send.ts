import 'server-only';

import { Resend } from 'resend';

import { emailEnabled, emailEnv } from '@/lib/env';

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer; contentType?: string }[];
};

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    client = new Resend(emailEnv.resendApiKey);
  }
  return client;
}

/**
 * Envoie un email via Resend.
 *
 * Sans `RESEND_API_KEY`, l'envoi est simplement journalisé : le parcours reste
 * testable en local sans compte Resend. Un échec d'envoi ne doit jamais faire
 * échouer la réponse du destinataire — l'appelant traite le résultat comme
 * best-effort.
 */
export async function sendEmail(email: OutgoingEmail): Promise<{ ok: boolean; error?: string }> {
  if (!emailEnabled()) {
    console.info(
      `[email] RESEND_API_KEY absente, email non envoyé à ${email.to} : « ${email.subject} »`,
    );
    return { ok: false, error: 'RESEND_API_KEY absente' };
  }

  try {
    const { error } = await getClient().emails.send({
      from: emailEnv.from,
      to: email.to,
      replyTo: emailEnv.replyTo,
      subject: email.subject,
      html: email.html,
      text: email.text,
      attachments: email.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (error) {
      console.error('[email] Envoi refusé par Resend', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[email] Envoi impossible', error);
    return { ok: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
