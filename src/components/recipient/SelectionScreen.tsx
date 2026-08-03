'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

import { StepHeader } from '@/components/recipient/StepHeader';
import type { PublicProposal } from '@/components/recipient/types';
import { formatSlotRangeIn } from '@/lib/format';
import { useLang } from '@/lib/i18n/language';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
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
  /** Demandé uniquement sur une invitation de groupe. */
  participantName: string;
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
  const t = useT();
  const lang = useLang();
  const typeMeta = useTypeMeta();
  const meta = typeMeta(proposal.type);

  const offerLocations = !proposal.hideLocations && proposal.locations.length > 0;

  const [locationId, setLocationId] = useState<string | null>(
    offerLocations ? (proposal.locations[0]?.id ?? null) : null,
  );
  const [slotId, setSlotId] = useState<string>(proposal.slots[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [participantName, setParticipantName] = useState('');
  const isGroup = proposal.audience === 'group';

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
              participantName: participantName.trim(),
            });
            return;
          }

          if (!slotId) return;
          if (isGroup && !participantName.trim()) return;
          onSubmit({
            locationId,
            slotId,
            note: note.trim(),
            email: email.trim(),
            proposedStart: null,
            proposedEnd: null,
            proposedLocation: '',
            participantName: participantName.trim(),
          });
        }}
      >
        <StepHeader
          eyebrow={t.recipient.selection.eyebrow}
          title={t.recipient.selection.title}
          icon={meta.emoji}
        />

        {isGroup ? (
          <div className="space-y-2">
            <label
              htmlFor="participant-name"
              className="block text-sm font-medium"
              style={{ color: 'var(--theme-muted)' }}
            >
              {t.recipient.selection.nameLabel}
            </label>
            <input
              id="participant-name"
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              required
              maxLength={60}
              placeholder={t.recipient.selection.namePlaceholder}
              className="w-full rounded-2xl border p-4 text-base outline-none transition focus:ring-2"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-ink)',
              }}
            />
          </div>
        ) : null}

        {offerLocations ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
              {t.recipient.selection.locationLegend}
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
                        {t.recipient.selection.mapLink}
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
            {t.recipient.selection.hiddenLocation}
          </p>
        )}

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium" style={{ color: 'var(--theme-muted)' }}>
            {t.recipient.selection.slotLegend}
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
                <span className="font-medium">{formatSlotRangeIn(slot.start, slot.end, lang)}</span>
              </label>
            );
          })}

          {isGroup ? null : (
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
              <span className="font-medium">{t.recipient.selection.counterToggle}</span>
            </label>
          )}

          {autreDate ? (
            <div
              className="space-y-3 rounded-2xl border p-4"
              style={{
                background: 'var(--theme-surface)',
                borderColor: 'var(--theme-accent)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--theme-muted)' }}>
                {t.recipient.selection.counterIntro}
              </p>

              <div className="space-y-2">
                <label
                  htmlFor="jour-propose"
                  className="block text-sm font-medium"
                  style={{ color: 'var(--theme-muted)' }}
                >
                  {t.recipient.selection.counterDayLabel}
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
                  aria-label={t.recipient.selection.counterStartAria}
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
                  aria-label={t.recipient.selection.counterEndAria}
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
                placeholder={t.recipient.selection.counterLocationPlaceholder}
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
            {t.recipient.selection.noteLabel}{' '}
            <span className="font-normal">({t.common.optional})</span>
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t.recipient.selection.notePlaceholder}
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
            {t.recipient.selection.emailLabel}{' '}
            <span className="font-normal">({t.common.optional})</span>
          </label>
          <input
            id="recipient-email"
            name="recipient-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t.recipient.selection.emailPlaceholder}
            className="w-full rounded-2xl border p-4 text-base outline-none transition focus:ring-2"
            style={{
              background: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-ink)',
            }}
          />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
            {t.recipient.selection.emailHint}
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
          disabled={
            submitting ||
            (autreDate ? !contrePropositionComplete : !slotId) ||
            (isGroup && !participantName.trim())
          }
          className="w-full rounded-full px-8 py-4 text-lg font-medium shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition active:scale-[0.99] disabled:opacity-60"
          style={{
            background: 'var(--theme-accent)',
            color: 'var(--theme-accent-ink)',
          }}
        >
          {submitting
            ? t.recipient.selection.submitting
            : autreDate
              ? t.recipient.selection.submitCounter
              : t.recipient.selection.submit}
        </button>
      </form>
    </motion.div>
  );
}
