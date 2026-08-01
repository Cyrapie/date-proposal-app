import { z } from 'zod';

import {
  EXPIRY_OPTIONS,
  MAX_LOCATIONS,
  MAX_SLOTS,
  PROPOSAL_TYPES,
} from '@/lib/domain/proposal';
import { THEMES } from '@/lib/domain/themes';

const isoDateTime = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Date invalide.' });

export const createProposalSchema = z
  .object({
    recipientName: z.string().trim().min(1, 'Le prénom est requis.').max(60),
    type: z.enum(PROPOSAL_TYPES),
    message: z.string().trim().max(2000).optional().or(z.literal('')),
    photoUrl: z.string().url().max(2048).optional().or(z.literal('')),
    theme: z.enum(THEMES),
    expiryDays: z
      .number()
      .int()
      .refine((value) => (EXPIRY_OPTIONS as readonly number[]).includes(value), {
        message: 'Durée de conservation non autorisée.',
      }),
    locations: z
      .array(
        z.object({
          label: z.string().trim().min(1, 'Le nom du lieu est requis.').max(120),
          address: z.string().trim().max(300).optional().or(z.literal('')),
          /** Position facultative, relevée via le navigateur du créateur. */
          latitude: z.number().min(-90).max(90).nullable().optional(),
          longitude: z.number().min(-180).max(180).nullable().optional(),
        }),
      )
      .max(MAX_LOCATIONS, `Trois lieux maximum.`),
    slots: z
      .array(z.object({ start: isoDateTime, end: isoDateTime }))
      .min(1, 'Proposez au moins un créneau.')
      .max(MAX_SLOTS, 'Cinq créneaux maximum.'),
  })
  .superRefine((value, ctx) => {
    // Une occasion « surprise » masque le lieu : les lieux deviennent optionnels.
    if (value.type !== 'surprise' && value.locations.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['locations'],
        message: 'Proposez au moins un lieu.',
      });
    }

    value.slots.forEach((slot, index) => {
      if (Date.parse(slot.end) <= Date.parse(slot.start)) {
        ctx.addIssue({
          code: 'custom',
          path: ['slots', index, 'end'],
          message: 'La fin doit suivre le début.',
        });
      }
    });
  });

export type CreateProposalInput = z.infer<typeof createProposalSchema>;

export const respondSchema = z
  .object({
    locationId: z.string().uuid().nullable().optional(),
    /** Nul quand le destinataire propose son propre créneau. */
    slotId: z.string().uuid('Créneau invalide.').nullable().optional(),
    note: z.string().trim().max(1000).optional().or(z.literal('')),
    email: z.string().trim().email('Email invalide.').optional().or(z.literal('')),
    /** Contre-proposition : créneau et lieu souhaités par le destinataire. */
    proposedStart: isoDateTime.nullable().optional(),
    proposedEnd: isoDateTime.nullable().optional(),
    proposedLocation: z.string().trim().max(300).optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    const contreProposition = Boolean(value.proposedStart || value.proposedEnd);

    if (!value.slotId && !contreProposition) {
      ctx.addIssue({
        code: 'custom',
        path: ['slotId'],
        message: 'Choisissez un créneau, ou proposez le vôtre.',
      });
      return;
    }

    if (contreProposition) {
      if (!value.proposedStart || !value.proposedEnd) {
        ctx.addIssue({
          code: 'custom',
          path: ['proposedEnd'],
          message: 'Indiquez le début et la fin de votre créneau.',
        });
        return;
      }

      if (Date.parse(value.proposedEnd) <= Date.parse(value.proposedStart)) {
        ctx.addIssue({
          code: 'custom',
          path: ['proposedEnd'],
          message: 'La fin doit suivre le début.',
        });
      }

      if (Date.parse(value.proposedStart) < Date.now() - 60 * 60 * 1000) {
        ctx.addIssue({
          code: 'custom',
          path: ['proposedStart'],
          message: 'Proposez une date à venir.',
        });
      }
    }
  });

export type RespondInput = z.infer<typeof respondSchema>;
