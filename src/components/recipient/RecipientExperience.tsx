'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ConfirmationScreen } from '@/components/recipient/ConfirmationScreen';
import { DecisionScreen } from '@/components/recipient/DecisionScreen';
import { EnvelopeScreen } from '@/components/recipient/EnvelopeScreen';
import { LetterScreen } from '@/components/recipient/LetterScreen';
import { SelectionScreen, type SelectionPayload } from '@/components/recipient/SelectionScreen';
import type { ConfirmedResponse, PublicProposal } from '@/components/recipient/types';
import { themeStyle } from '@/lib/domain/themes';

type Step = 'envelope' | 'letter' | 'decision' | 'selection' | 'confirmation';

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
  const [step, setStep] = useState<Step>(initialResponse ? 'confirmation' : 'envelope');
  const [response, setResponse] = useState<ConfirmedResponse | null>(initialResponse);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(body?.error ?? 'Enregistrement impossible. Réessayez.');
      }

      setResponse(body.response as ConfirmedResponse);
      setStep('confirmation');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="themed min-h-dvh" style={themeStyle(proposal.theme)}>
      <AnimatePresence mode="wait">
        {step === 'envelope' ? (
          <EnvelopeScreen key="envelope" onOpen={() => setStep('letter')} />
        ) : null}

        {step === 'letter' ? (
          <LetterScreen key="letter" proposal={proposal} onContinue={() => setStep('decision')} />
        ) : null}

        {step === 'decision' ? (
          <DecisionScreen
            key="decision"
            recipientName={proposal.recipientName}
            onYes={() => setStep('selection')}
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
          <ConfirmationScreen key="confirmation" response={response} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
