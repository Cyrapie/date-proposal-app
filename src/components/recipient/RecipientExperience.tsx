'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ConfirmationScreen } from '@/components/recipient/ConfirmationScreen';
import { DecisionScreen } from '@/components/recipient/DecisionScreen';
import { EnvelopeScreen } from '@/components/recipient/EnvelopeScreen';
import { GroupRsvpScreen } from '@/components/recipient/GroupRsvpScreen';
import { LetterScreen } from '@/components/recipient/LetterScreen';
import { RecipientLanguageToggle } from '@/components/recipient/RecipientLanguageToggle';
import { RecipientThemeToggle } from '@/components/recipient/RecipientThemeToggle';
import { SelectionScreen, type SelectionPayload } from '@/components/recipient/SelectionScreen';
import type { ConfirmedResponse, PublicProposal } from '@/components/recipient/types';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';

type Step = 'envelope' | 'letter' | 'decision' | 'group-rsvp' | 'selection' | 'confirmation';

export function RecipientExperience({
  proposal,
  initialResponse,
  demo = false,
}: {
  proposal: PublicProposal;
  /** Non nul si la proposition a déjà reçu une réponse : on va droit au récap. */
  initialResponse: ConfirmedResponse | null;
  /** Aperçu de développement : aucun appel réseau, réponse simulée. */
  demo?: boolean;
}) {
  const t = useT();
  const typeMeta = useTypeMeta();
  const [step, setStep] = useState<Step>(initialResponse ? 'confirmation' : 'envelope');
  const [response, setResponse] = useState<ConfirmedResponse | null>(initialResponse);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // L'onglet du navigateur reste sur « Keerelle » du début à la fin sinon :
  // ce n'est pas la page qui change (une seule route), donc Next ne peut pas
  // le faire à notre place — d'où la mise à jour manuelle à chaque étape.
  //
  // Le délai n'est pas cosmétique : au montage, l'App Router réaffirme le
  // titre statique du layout après le premier rendu, sur un tick plus tardif
  // qu'un `setTimeout(fn, 0)` — vérifié : 0 ms perd la course, 50 ms la
  // gagne. Sans lien avec l'affichage, donc imperceptible pour qui lit.
  useEffect(() => {
    const waitlisted = response?.group?.status === 'waitlisted';
    const title =
      step === 'envelope'
        ? t.recipient.envelope.title
        : step === 'letter'
          ? typeMeta(proposal.type).headline
          : step === 'decision'
            ? t.recipient.decision.title
            : step === 'group-rsvp'
              ? t.recipient.group.title
              : step === 'selection'
                ? t.recipient.selection.title
                : waitlisted
                  ? t.recipient.confirmation.titleWaitlisted
                  : response?.countered
                    ? t.recipient.confirmation.titleCountered
                    : t.recipient.confirmation.title;

    const id = window.setTimeout(() => {
      document.title = `${title} · Keerelle`;
    }, 50);
    return () => window.clearTimeout(id);
  }, [step, response, proposal.type, t, typeMeta]);

  // Le statut passe à « vue » dès l'ouverture du lien, avant toute interaction.
  useEffect(() => {
    if (initialResponse || demo) return;

    const controller = new AbortController();
    fetch(`/api/d/${proposal.slug}/view`, {
      method: 'POST',
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Le marquage « vue » est best-effort : il ne doit jamais bloquer le parcours.
    });

    return () => controller.abort();
  }, [proposal.slug, initialResponse, demo]);

  async function handleSubmit(payload: SelectionPayload) {
    setSubmitting(true);
    setError(null);

    if (demo) {
      const slot = proposal.slots.find((item) => item.id === payload.slotId) ?? proposal.slots[0];
      const location = proposal.locations.find((item) => item.id === payload.locationId) ?? null;

      setResponse({
        countered: Boolean(payload.proposedStart),
        slot: payload.proposedStart && payload.proposedEnd
          ? { start: payload.proposedStart, end: payload.proposedEnd }
          : { start: slot.start, end: slot.end },
        location: location ? { label: location.label, address: location.address } : null,
        note: payload.note || null,
        icsUrl: '#',
        googleCalendarUrl: '#',
        group: proposal.group
          ? { status: 'confirmed', capacity: proposal.group.capacity }
          : undefined,
      });
      setStep('confirmation');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/d/${proposal.slug}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? t.recipient.selection.saveError);
      }

      setResponse(body.response as ConfirmedResponse);
      setStep('confirmation');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.recipient.selection.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="themed min-h-dvh" data-theme={proposal.theme}>
      <RecipientThemeToggle />
      <RecipientLanguageToggle />

      <AnimatePresence mode="wait">
        {step === 'envelope' ? (
          <EnvelopeScreen
            key="envelope"
            recipientName={proposal.recipientName}
            type={proposal.type}
            onOpen={() => setStep('letter')}
          />
        ) : null}

        {step === 'letter' ? (
          <LetterScreen
            key="letter"
            proposal={proposal}
            onContinue={() => setStep(proposal.group ? 'group-rsvp' : 'decision')}
          />
        ) : null}

        {step === 'decision' ? (
          <DecisionScreen
            key="decision"
            recipientName={proposal.recipientName}
            type={proposal.type}
            onYes={() => setStep('selection')}
          />
        ) : null}

        {step === 'group-rsvp' && proposal.group ? (
          <GroupRsvpScreen
            key="group-rsvp"
            recipientName={proposal.recipientName}
            type={proposal.type}
            group={proposal.group}
            onJoin={() => setStep('selection')}
          />
        ) : null}

        {step === 'selection' ? (
          <SelectionScreen
            key="selection"
            proposal={proposal}
            onSubmit={handleSubmit}
            submitting={submitting}
            error={error}
          />
        ) : null}

        {step === 'confirmation' && response ? (
          <ConfirmationScreen key="confirmation" response={response} type={proposal.type} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
