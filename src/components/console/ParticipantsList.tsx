'use client';

import { useState, useTransition } from 'react';

import { removeGroupParticipant } from '@/app/console/(authed)/invitations/actions';
import { formatDateTime, formatSlotRange } from '@/lib/format';

export type ParticipantRow = {
  id: string;
  participantName: string | null;
  status: string;
  respondedAt: string;
  recipientEmail: string | null;
  chosenSlot: { start: string; end: string } | null;
  chosenLocationLabel: string | null;
};

export function ParticipantsList({
  proposalId,
  participants,
}: {
  proposalId: string;
  participants: ParticipantRow[];
}) {
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);

  function retirer(responseId: string) {
    setErreur(null);
    demarrer(async () => {
      const resultat = await removeGroupParticipant(proposalId, responseId);
      if (!resultat.ok) setErreur(resultat.message ?? 'Retrait impossible.');
    });
  }

  if (participants.length === 0) {
    return <p className="mt-3 text-sm text-ink-400">Personne n’a encore rejoint.</p>;
  }

  return (
    <div className="mt-3 space-y-2.5">
      {erreur ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 px-3 py-2 text-xs text-bordeaux-700">
          {erreur}
        </p>
      ) : null}

      {participants.map((participant) => (
        <div
          key={participant.id}
          className="flex items-start justify-between gap-3 rounded-xl bg-cream-200 p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-900">
              {participant.participantName ?? 'Anonyme'}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  participant.status === 'waitlisted'
                    ? 'bg-cream-300 text-ink-600'
                    : 'bg-accent text-accent-ink'
                }`}
              >
                {participant.status === 'waitlisted' ? 'Attente' : 'Confirmé'}
              </span>
            </p>
            <p className="mt-1 text-xs text-ink-400">
              Répondu le {formatDateTime(participant.respondedAt)}
              {participant.recipientEmail ? ` · ${participant.recipientEmail}` : ''}
            </p>
            {participant.chosenSlot ? (
              <p className="mt-0.5 text-xs text-ink-400">
                {formatSlotRange(participant.chosenSlot.start, participant.chosenSlot.end)}
                {participant.chosenLocationLabel ? ` · ${participant.chosenLocationLabel}` : ''}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            disabled={enCours}
            onClick={() => retirer(participant.id)}
            className="shrink-0 rounded-full border border-bordeaux-200 px-3 py-1.5 text-xs font-semibold text-bordeaux-600 transition hover:bg-bordeaux-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Retirer
          </button>
        </div>
      ))}
    </div>
  );
}
