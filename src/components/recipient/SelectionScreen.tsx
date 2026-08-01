'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { formatSlotRange } from '@/lib/format';
import type { PublicProposal } from '@/components/recipient/types';
import { EASE_OUT_EXPO } from '@/lib/motion';

export type SelectionPayload = {
  locationId: string | null;
  /** Nul quand le destinataire propose son propre créneau. */
  slotId: string | null;
  note: string;
  email: string;
  /** Contre-proposition, au format ISO. */
  proposedStart: string | null;
  proposedEnd: string | null;
  proposedLocation: string;
};

export function SelectionScreen({
  proposal,
  onSubmit,
  submitting,
  error,
}: {
  proposal: PublicProposal;
  onSubmit: (payload: SelectionPayload) => void;
  submitting: boolean;
  error: string | null;
}) {
  const offerLocations = !proposal.hideLocations && proposal.locations.length > 0;

  const [locationId, setLocationId] = useState<string | null>(
    offerLocations ? (proposal.locations[0]?.id ?? null) : null,
  );
  const [slotId, setSlotId] = useState<string>(proposal.slots[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');

  // Contre-proposition : aucun créneau offert ne convient.
  const [autreDate, setAutreDate] = useState(false);
  const [jour, setJour] = useState('');
  const [debut, setDebut] = useState('19:30');
  const [fin, setFin] = useState('22:00');
  const [lieuPropose, setLieuPropose] = useState('');

  const contrePropositionComplete = Boolean(jour && debut && fin);

  const optionStyle = (selected: boolean) => ({
    background: selected ? 'var(--theme-accent-soft)' : 'var(--theme-surface)',
    borderColor: selected ? 'var(--theme-accent)' : 'var(--theme-border)',
    color: 'var(--theme-ink)',
  });

  return (
    <motion.div
      key="selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="flex min-h-dvh flex-col items-center justify-center px-5 py-12"
    >
      <form
        className="w-full max-w-md space-y-7"
        onSubmit={(event) => {
          event.preventDefault();

          if (autreDate) {
            if (!contrePropositionComplete) return;
            // Construit en heure locale, converti en ISO pour le serveur.
            const debutIso = new Date(jour + 'T' + debut).toISOString();
            const finIso = new Date(jour + 'T' + fin).toISOString();
            onSubmit({
              locationId: null,
              slotId: null,
              note: note.trim(),
              email: email.trim(),
              proposedStart: debutIso,
              proposedEnd: finIso,
              proposedLocation: lieuPropose.trim(),
            });
            return;
          }

          if (!slotId) return;
          onSubmit({
            locationId,
            slotId,
            note: note.trim(),
            email: email.trim(),
            proposedStart: null,
            proposedEnd: null,
            proposedLocation: '',
          });
        }}
      >
        <header className="text-center">
          <p
            className="text-xs uppercase tracking-[0.18em]"
            style={{ color: 'var(--theme-muted)' }}
          >
            Presque fini
          </p>
          <h1
            className="mt-3 font-serif text-3xl leading-tight"
            style={{ color: 'var(--theme-accent)' }}
          >
            À toi de choisir
          </h1>
        </header>

        {offerLocations ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
              Le lieu
            </legend>
            {proposal.locations.map((location) => {
              const selected = location.id === locationId;
              return (
                <label
                  key={location.id}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition"
                  style={optionStyle(selected)}
                >
                  <input
                    type="radio"
                    name="location"
                    value={location.id}
                    checked={selected}
                    onChange={() => setLocationId(location.id)}
                    className="mt-1 h-4 w-4 shrink-0 accent-[var(--theme-accent)]"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">{location.label}</span>
                    {location.address ? (
                      <span className="mt-0.5 block text-sm" style={{ color: 'var(--theme-muted)' }}>
                        {location.address}
                      </span>
                    ) : null}
                    {location.mapUrl ? (
                      <a
                        href={location.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="mt-1 inline-block text-xs underline underline-offset-4"
                        style={{ color: 'var(--theme-accent)' }}
                      >
                        Voir sur la carte
                      </a>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <p
            className="rounded-2xl border border-dashed p-4 text-center text-sm"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}
          >
            Le lieu reste une surprise 🤫
          </p>
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
            Le créneau
          </legend>
          {proposal.slots.map((slot) => {
            const selected = slot.id === slotId;
            return (
              <label
                key={slot.id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition"
                style={optionStyle(selected)}
              >
                <input
                  type="radio"
                  name="slot"
                  value={slot.id}
                  checked={selected}
                  onChange={() => setSlotId(slot.id)}
                  className="h-4 w-4 shrink-0 accent-[var(--theme-accent)]"
                  required
                />
                <span className="font-medium">{formatSlotRange(slot.start, slot.end)}</span>
              </label>
            );
          })}

          <label
            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 transition"
            style={{
              background: autreDate ? 'var(--theme-accent-soft)' : 'transparent',
              borderColor: autreDate ? 'var(--theme-accent)' : 'var(--theme-border)',
              color: 'var(--theme-ink)',
            }}
          >
            <input
              type="checkbox"
              checked={autreDate}
              onChange={(event) => setAutreDate(event.target.checked)}
              className="h-4 w-4 shrink-0 accent-[var(--theme-accent)]"
            />
            <span className="font-medium">Aucun ne me va, je propose autre chose</span>
          </label>

          {autreDate ? (
            <div
              className="space-y-3 rounded-2xl border p-4"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-accent)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
                Proposez votre créneau. La personne qui vous a invité recevra votre proposition
                et pourra la confirmer.
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="jour-propose"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  Le jour
                </label>
                <input
                  id="jour-propose"
                  type="date"
                  value={jour}
                  onChange={(event) => setJour(event.target.value)}
                  required={autreDate}
                  className="w-full rounded-xl border p-3 text-base outline-none"
                  style={{
                    background: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-ink)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={debut}
                  onChange={(event) => setDebut(event.target.value)}
                  aria-label="Heure de début proposée"
                  className="w-full rounded-xl border p-3 text-base outline-none"
                  style={{
                    background: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-ink)',
                  }}
                />
                <input
                  type="time"
                  value={fin}
                  onChange={(event) => setFin(event.target.value)}
                  aria-label="Heure de fin proposée"
                  className="w-full rounded-xl border p-3 text-base outline-none"
                  style={{
                    background: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-ink)',
                  }}
                />
              </div>

              <input
                value={lieuPropose}
                onChange={(event) => setLieuPropose(event.target.value)}
                maxLength={300}
                placeholder="Un lieu, si vous en avez un en tête (facultatif)"
                className="w-full rounded-xl border p-3 text-base outline-none"
                style={{
                  background: 'var(--theme-bg)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-ink)',
                }}
              />
            </div>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <label
            htmlFor="note"
            className="block text-sm font-medium"
            style={{ color: 'var(--theme-muted)' }}
          >
            Un mot pour moi <span className="font-normal">(facultatif)</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Hâte d'y être…"
            className="w-full resize-none rounded-2xl border p-4 text-base outline-none transition focus:ring-2"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-ink)',
            }}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="recipient-email"
            className="block text-sm font-medium"
            style={{ color: 'var(--theme-muted)' }}
          >
            Ton email <span className="font-normal">(facultatif)</span>
          </label>
          <input
            id="recipient-email"
            name="recipient-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="pour recevoir ta confirmation + l'invitation agenda"
            className="w-full rounded-2xl border p-4 text-base outline-none transition focus:ring-2"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-ink)',
            }}
          />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
            Utilisé uniquement pour t&apos;envoyer cette confirmation. Rien d&apos;autre.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border p-4 text-sm"
            style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting || (autreDate ? !contrePropositionComplete : !slotId)}
          className="w-full rounded-full px-8 py-4 text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99] disabled:opacity-60"
          style={{
            background: 'var(--theme-accent)',
            color: 'var(--theme-accent-ink)',
          }}
        >
          {submitting
            ? 'On envoie…'
            : autreDate
              ? 'Proposer cette date'
              : "C'est validé"}
        </button>
      </form>
    </motion.div>
  );
}
