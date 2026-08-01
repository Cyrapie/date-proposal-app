import { z } from 'zod';

export const INQUIRY_KINDS = ['contact', 'partner'] as const;
export type InquiryKind = (typeof INQUIRY_KINDS)[number];

export const inquirySchema = z.object({
  kind: z.enum(INQUIRY_KINDS),
  name: z.string().trim().min(1, 'Votre nom est requis.').max(120),
  email: z.string().trim().email('Email invalide.').max(200),
  /** Raison sociale — utilisé côté partenaire uniquement. */
  company: z.string().trim().max(160).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Détaillez un peu votre demande.').max(4000),
  /**
   * Piège à robots : un champ masqué que seul un script remplit.
   * Le formulaire renvoie alors un succès factice, sans envoyer d'email.
   */
  website: z.string().max(0).optional().or(z.literal('')),
  /** Jeton Turnstile, vérifié côté serveur. */
  turnstileToken: z.string().max(4096).optional().or(z.literal('')),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
