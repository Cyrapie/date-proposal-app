'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton';
import { LocationPicker, type LocationDraft } from '@/components/dashboard/LocationPicker';
import { PhotoUpload } from '@/components/dashboard/PhotoUpload';
import { Field, inputClass } from '@/components/ui/Field';
import {
  EXPIRY_OPTIONS,
  MAX_LOCATIONS,
  MAX_SLOTS,
  PROPOSAL_TYPES,
  PROPOSAL_TYPE_META,
  type ProposalType,
} from '@/lib/domain/proposal';
import { suggestionsFor } from '@/lib/domain/countries';
import { THEMES, THEME_META, type Theme } from '@/lib/domain/themes';
import { publicEnv } from '@/lib/env';

type SlotDraft = { date: string; startTime: string; endTime: string };

/** Valeur `datetime-local` → ISO, en conservant le fuseau du navigateur. */
function toIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  const value = new Date(`${date}T${time}`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}

function emptySlot(): SlotDraft {
  return { date: '', startTime: '19:30', endTime: '22:00' };
}

export function ProposalForm({
  userId,
  country = null,
}: {
  userId: string;
  /** Pays détecté côté serveur, pour adapter les suggestions de lieux. */
  country?: string | null;
}) {
  const router = useRouter();

  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState<ProposalType>('restaurant');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [theme, setTheme] = useState<Theme>('classic');
  const [expiryDays, setExpiryDays] = useState<number>(
    EXPIRY_OPTIONS.includes(publicEnv.defaultExpiryDays as (typeof EXPIRY_OPTIONS)[number])
      ? publicEnv.defaultExpiryDays
      : 30,
  );
  const [locations, setLocations] = useState<LocationDraft[]>([
    { label: '', address: '', latitude: null, longitude: null },
  ]);
  const [slots, setSlots] = useState<SlotDraft[]>([emptySlot()]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const locationsOptional = type === 'surprise';
  const suggestions = suggestionsFor(country, type);

  function updateLocation(index: number, patch: Partial<LocationDraft>) {
    setLocations((current) =>
      current.map((location, i) => (i === index ? { ...location, ...patch } : location)),
    );
  }

  function updateSlot(index: number, patch: Partial<SlotDraft>) {
    setSlots((current) => current.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanedLocations = locations
      .map((location) => ({
        label: location.label.trim(),
        address: location.address.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      }))
      .filter((location) => location.label.length > 0);

    if (!locationsOptional && cleanedLocations.length === 0) {
      setError('Proposez au moins un lieu.');
      return;
    }

    const cleanedSlots: { start: string; end: string }[] = [];
    for (const slot of slots) {
      const start = toIso(slot.date, slot.startTime);
      const end = toIso(slot.date, slot.endTime);
      if (!start || !end) continue;
      if (Date.parse(end) <= Date.parse(start)) {
        setError('Chaque créneau doit se terminer après son début.');
        return;
      }
      cleanedSlots.push({ start, end });
    }

    if (cleanedSlots.length === 0) {
      setError('Proposez au moins un créneau complet (date, début et fin).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          type,
          message: message.trim(),
          photoUrl,
          theme,
          expiryDays,
          locations: cleanedLocations,
          slots: cleanedSlots,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.issues?.[0]?.message ?? body?.error ?? 'Création impossible.');
      }

      setCreatedUrl(body.url as string);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Création impossible.');
    } finally {
      setSubmitting(false);
    }
  }

  if (createdUrl) {
    return (
      <div className="bloc p-6 text-center">
        <p className="font-serif text-2xl font-extrabold text-bordeaux-600">Votre lien est prêt</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          Envoyez-le à {recipientName || 'la personne concernée'}. Vous serez notifié par email dès
          la réponse.
        </p>

        <p className="mt-5 truncate rounded-xl border border-cream-300 bg-cream-100 px-4 py-3 text-sm text-ink-600">
          {createdUrl}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <CopyLinkButton url={createdUrl} />
          <a
            href={createdUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-cream-300 px-4 py-2 text-xs font-medium text-ink-400 transition hover:border-ink-400 hover:text-ink-600"
          >
            Aperçu
          </a>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-cream-300 px-4 py-2 text-xs font-medium text-ink-400 transition hover:border-ink-400 hover:text-ink-600"
          >
            Terminer
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Field label="Son prénom" htmlFor="recipientName" required>
        <input
          id="recipientName"
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
          required
          maxLength={60}
          placeholder="Camille"
          className={inputClass}
        />
      </Field>

      <Field label="L'occasion" required>
        <div className="grid grid-cols-2 gap-2">
          {PROPOSAL_TYPES.map((option) => {
            const meta = PROPOSAL_TYPE_META[option];
            const selected = option === type;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                  selected
                    ? 'border-accent bg-bordeaux-50 text-bordeaux-700'
                    : 'border-cream-300 bg-cream-50 text-ink-600 hover:border-ink-400'
                }`}
              >
                <span aria-hidden="true">{meta.emoji}</span>{' '}
                <span className="font-medium">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Votre message"
        htmlFor="message"
        hint="Il s'affichera sur la lettre, en écriture serif."
      >
        <textarea
          id="message"
          rows={4}
          maxLength={2000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="J'ai pensé qu'on pourrait…"
          className={`${inputClass} resize-none`}
        />
      </Field>

      <Field label="Une photo">
        <PhotoUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />
      </Field>

      <Field
        label={locationsOptional ? 'Les lieux (masqués au destinataire)' : 'Les lieux'}
        required={!locationsOptional}
        hint={
          locationsOptional
            ? "Occasion surprise : le lieu ne sera pas révélé avant l'acceptation."
            : `De 1 à ${MAX_LOCATIONS} propositions.`
        }
      >
        <div className="space-y-3">
          {locations.map((location, index) => (
            <LocationPicker
              key={index}
              index={index}
              value={location}
              suggestions={suggestions}
              onChange={(patch) => updateLocation(index, patch)}
              onRemove={
                locations.length > 1
                  ? () => setLocations((c) => c.filter((_, i) => i !== index))
                  : undefined
              }
            />
          ))}

          {locations.length < MAX_LOCATIONS ? (
            <button
              type="button"
              onClick={() =>
                setLocations((c) => [
                  ...c,
                  { label: '', address: '', latitude: null, longitude: null },
                ])
              }
              className="w-full rounded-xl border border-dashed border-cream-300 py-3 text-sm text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-600"
            >
              + Ajouter un lieu
            </button>
          ) : null}
        </div>
      </Field>

      <Field label="Les créneaux" required hint={`De 1 à ${MAX_SLOTS} propositions.`}>
        <div className="space-y-3">
          {slots.map((slot, index) => (
            <div key={index} className="bloc p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink-400">Créneau {index + 1}</span>
                {slots.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSlots((c) => c.filter((_, i) => i !== index))}
                    className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-600"
                  >
                    Retirer
                  </button>
                ) : null}
              </div>

              <input
                type="date"
                value={slot.date}
                onChange={(event) => updateSlot(index, { date: event.target.value })}
                className={`${inputClass} mt-3`}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={slot.startTime}
                  onChange={(event) => updateSlot(index, { startTime: event.target.value })}
                  className={inputClass}
                  aria-label="Heure de début"
                />
                <input
                  type="time"
                  value={slot.endTime}
                  onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                  className={inputClass}
                  aria-label="Heure de fin"
                />
              </div>
            </div>
          ))}

          {slots.length < MAX_SLOTS ? (
            <button
              type="button"
              onClick={() => setSlots((c) => [...c, emptySlot()])}
              className="w-full rounded-xl border border-dashed border-cream-300 py-3 text-sm text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-600"
            >
              + Ajouter un créneau
            </button>
          ) : null}
        </div>
      </Field>

      <Field label="Le thème visuel" required>
        <div className="space-y-2">
          {THEMES.map((option) => {
            const meta = THEME_META[option];
            const selected = option === theme;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  selected ? 'border-accent bg-bordeaux-50' : 'border-cream-300 bg-cream-50'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-8 w-8 shrink-0 rounded-full border"
                  style={{
                    background: meta.tokens['--theme-bg'],
                    borderColor: meta.tokens['--theme-accent'],
                    boxShadow: `inset 0 0 0 4px ${meta.tokens['--theme-accent']}`,
                  }}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">{meta.label}</span>
                  <span className="block text-xs text-ink-400">{meta.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Durée de validité du lien"
        htmlFor="expiryDays"
        hint="RGPD : passé ce délai, le lien n'est plus consultable."
      >
        <select
          id="expiryDays"
          value={expiryDays}
          onChange={(event) => setExpiryDays(Number(event.target.value))}
          className={inputClass}
        >
          {EXPIRY_OPTIONS.map((days) => (
            <option key={days} value={days}>
              {days} jours
            </option>
          ))}
        </select>
      </Field>

      {error ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 p-4 text-sm text-bordeaux-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent px-6 py-4 text-base font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.99] disabled:opacity-60"
      >
        {submitting ? 'Création…' : 'Générer le lien'}
      </button>
    </form>
  );
}
