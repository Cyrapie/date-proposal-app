'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { CopyLinkButton } from '@/components/dashboard/CopyLinkButton';
import { FormSection } from '@/components/dashboard/FormSection';
import { LocationPicker, type LocationDraft } from '@/components/dashboard/LocationPicker';
import { PhotoUpload } from '@/components/dashboard/PhotoUpload';
import { Field, inputClass } from '@/components/ui/Field';
import { SuggestionScroller } from '@/components/ui/SuggestionScroller';
import {
  EXPIRY_OPTIONS,
  GROUP_TYPES,
  MAX_GROUP_CAPACITY,
  MAX_LOCATIONS,
  MAX_SLOTS,
  MIN_GROUP_CAPACITY,
  PROPOSAL_TYPES,
  type AnyProposalType,
  type ProposalAudience,
  type ProposalType,
} from '@/lib/domain/proposal';
import { suggestionsFor } from '@/lib/domain/countries';
import { messageSuggestionsFor } from '@/lib/domain/messages';
import { canCreateGroupInvitations, type PlanId } from '@/lib/domain/pricing';
import { THEMES, type Theme } from '@/lib/domain/themes';
import { useLang } from '@/lib/i18n/language';
import { useT } from '@/lib/i18n/use-t';
import { useTypeMeta } from '@/lib/i18n/type-meta';
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
  plan,
}: {
  userId: string;
  /** Pays détecté côté serveur, pour adapter les suggestions de lieux. */
  country?: string | null;
  plan: PlanId;
}) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const typeMeta = useTypeMeta();
  const canGroup = canCreateGroupInvitations(plan);

  const [audience, setAudience] = useState<ProposalAudience>('individual');
  const [recipientName, setRecipientName] = useState('');
  const [type, setType] = useState<AnyProposalType>('restaurant');
  const [groupCapacity, setGroupCapacity] = useState(8);
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

  function switchAudience(next: ProposalAudience) {
    if (next === 'group' && !canGroup) return;
    setAudience(next);
    setType(next === 'group' ? 'friends' : 'restaurant');
  }

  const isGroup = audience === 'group';
  const locationsOptional = !isGroup && type === 'surprise';
  // `type` n'est un `ProposalType` que lorsque `audience === 'individual'` —
  // c'est `switchAudience` qui garantit cet invariant à chaque bascule.
  const suggestions = isGroup ? [] : suggestionsFor(country, type as ProposalType);

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
      setError(t.proposalForm.errorNoLocation);
      return;
    }

    const cleanedSlots: { start: string; end: string }[] = [];
    for (const slot of slots) {
      const start = toIso(slot.date, slot.startTime);
      const end = toIso(slot.date, slot.endTime);
      if (!start || !end) continue;
      if (Date.parse(end) <= Date.parse(start)) {
        setError(t.proposalForm.errorSlotOrder);
        return;
      }
      cleanedSlots.push({ start, end });
    }

    if (cleanedSlots.length === 0) {
      setError(t.proposalForm.errorNoSlot);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience,
          recipientName: recipientName.trim(),
          type,
          groupCapacity: isGroup ? groupCapacity : undefined,
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
        throw new Error(body?.issues?.[0]?.message ?? body?.error ?? t.proposalForm.errorCreate);
      }

      setCreatedUrl(body.url as string);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.proposalForm.errorCreate);
    } finally {
      setSubmitting(false);
    }
  }

  if (createdUrl) {
    return (
      <div className="bloc p-6 text-center">
        <p className="font-serif text-2xl font-extrabold text-bordeaux-600">
          {t.proposalForm.doneTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-400">
          {isGroup
            ? t.proposalForm.doneBodyGroup(groupCapacity)
            : t.proposalForm.doneBody(recipientName || t.proposalForm.doneBodyFallback)}
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
            {t.proposalForm.donePreview}
          </a>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="rounded-full border border-cream-300 px-4 py-2 text-xs font-medium text-ink-400 transition hover:border-ink-400 hover:text-ink-600"
          >
            {t.proposalForm.doneFinish}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      <FormSection step={1} title={t.proposalForm.sectionWho} hint={t.proposalForm.sectionWhoHint}>
        <Field label={t.proposalForm.audienceLabel} required>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchAudience('individual')}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                !isGroup
                  ? 'border-accent bg-bordeaux-50 text-bordeaux-700'
                  : 'border-cream-300 bg-cream-50 text-ink-600 hover:border-ink-400'
              }`}
            >
              <span className="font-medium">{t.proposalForm.audienceOne}</span>
              <span className="mt-0.5 block text-xs text-ink-400">
                {t.proposalForm.audienceOneHint}
              </span>
            </button>

            {canGroup ? (
              <button
                type="button"
                onClick={() => switchAudience('group')}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                  isGroup
                    ? 'border-accent bg-bordeaux-50 text-bordeaux-700'
                    : 'border-cream-300 bg-cream-50 text-ink-600 hover:border-ink-400'
                }`}
              >
                <span className="font-medium">{t.proposalForm.audienceGroup}</span>
                <span className="mt-0.5 block text-xs text-ink-400">
                  {t.proposalForm.audienceGroupHint}
                </span>
              </button>
            ) : (
              <Link
                href="/tarifs"
                className="rounded-xl border border-dashed border-cream-300 px-3 py-3 text-left text-sm text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-600"
              >
                <span className="font-medium">{t.proposalForm.audienceGroupLocked}</span>
                <span className="mt-0.5 block text-xs">
                  {t.proposalForm.audienceGroupLockedHint}
                </span>
              </Link>
            )}
          </div>
        </Field>

        <Field
          label={isGroup ? t.proposalForm.nameLabelGroup : t.proposalForm.nameLabel}
          htmlFor="recipientName"
          required
        >
          <input
            id="recipientName"
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            required
            maxLength={60}
            placeholder={
              isGroup ? t.proposalForm.namePlaceholderGroup : t.proposalForm.namePlaceholder
            }
            className={inputClass}
          />
        </Field>

        <Field label={t.proposalForm.occasionLabel} required>
          <div className="grid grid-cols-2 gap-2">
            {(isGroup ? GROUP_TYPES : PROPOSAL_TYPES).map((option) => {
              const meta = typeMeta(option);
              const selected = option === type;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    selected
                      ? 'border-accent bg-bordeaux-50 text-bordeaux-700'
                      : 'border-cream-300 bg-cream-50 text-ink-600 hover:border-ink-400'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cream-100 text-base"
                  >
                    {meta.emoji}
                  </span>
                  <span className="min-w-0 font-medium">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </Field>

        {isGroup ? (
          <Field
            label={t.proposalForm.capacityLabel}
            htmlFor="groupCapacity"
            hint={t.proposalForm.capacityHint(MIN_GROUP_CAPACITY, MAX_GROUP_CAPACITY)}
          >
            <input
              id="groupCapacity"
              type="number"
              min={MIN_GROUP_CAPACITY}
              max={MAX_GROUP_CAPACITY}
              value={groupCapacity}
              onChange={(event) => setGroupCapacity(Number(event.target.value))}
              className={inputClass}
            />
          </Field>
        ) : null}
      </FormSection>

      <FormSection
        step={2}
        title={t.proposalForm.sectionContent}
        hint={t.proposalForm.sectionContentHint}
      >
        <Field label={t.proposalForm.messageLabel} htmlFor="message" hint={t.proposalForm.messageHint}>
          <textarea
            id="message"
            rows={4}
            maxLength={2000}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t.proposalForm.messagePlaceholder}
            className={`${inputClass} resize-none`}
          />

          {!message ? (
            <div className="mt-2">
              <SuggestionScroller
                items={messageSuggestionsFor(type, lang)}
                onPick={setMessage}
                icon="💬"
                ariaLabel={t.proposalForm.messageSuggestionsAria}
              />
            </div>
          ) : null}
        </Field>

        <Field label={t.proposalForm.photoLabel}>
          <PhotoUpload userId={userId} value={photoUrl} onChange={setPhotoUrl} />
        </Field>
      </FormSection>

      <FormSection
        step={3}
        title={t.proposalForm.sectionWhereWhen}
        hint={t.proposalForm.sectionWhereWhenHint}
      >
        <Field
          label={
            locationsOptional ? t.proposalForm.locationsLabelHidden : t.proposalForm.locationsLabel
          }
          required={!locationsOptional}
          hint={
            locationsOptional
              ? t.proposalForm.locationsHintHidden
              : t.proposalForm.locationsHint(MAX_LOCATIONS)
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
                {t.proposalForm.addLocation}
              </button>
            ) : null}
          </div>
        </Field>

        <Field
          label={t.proposalForm.slotsLabel}
          required
          hint={t.proposalForm.slotsHint(MAX_SLOTS)}
        >
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="bloc p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-ink-400">
                    {t.proposalForm.slotNumber(index + 1)}
                  </span>
                  {slots.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setSlots((c) => c.filter((_, i) => i !== index))}
                      className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-600"
                    >
                      {t.proposalForm.removeSlot}
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
                    aria-label={t.proposalForm.startTimeAria}
                  />
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                    className={inputClass}
                    aria-label={t.proposalForm.endTimeAria}
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
                {t.proposalForm.addSlot}
              </button>
            ) : null}
          </div>
        </Field>
      </FormSection>

      <FormSection step={4} title={t.proposalForm.sectionLook} hint={t.proposalForm.sectionLookHint}>
        <Field label={t.proposalForm.themeLabel} required>
          <div className="space-y-2">
            {THEMES.map((option) => {
              const meta = t.themeMeta[option];
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
                  {/* Couleurs lues en CSS (`theme-swatch`, `globals.css`) via
                      `data-theme` : aperçu fidèle au mode clair/sombre actuel,
                      sans dupliquer les teintes en JS. */}
                  <span
                    aria-hidden="true"
                    data-theme={option}
                    className="theme-swatch h-8 w-8 shrink-0 rounded-full border"
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
          label={t.proposalForm.expiryLabel}
          htmlFor="expiryDays"
          hint={t.proposalForm.expiryHint}
        >
          <select
            id="expiryDays"
            value={expiryDays}
            onChange={(event) => setExpiryDays(Number(event.target.value))}
            className={inputClass}
          >
            {EXPIRY_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {t.proposalForm.expiryDays(days)}
              </option>
            ))}
          </select>
        </Field>
      </FormSection>

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
        {submitting ? t.proposalForm.submitting : t.proposalForm.submit}
      </button>
    </form>
  );
}
