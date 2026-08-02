'use client';

import { useState } from 'react';

import { inputClass } from '@/components/ui/Field';
import { SuggestionScroller } from '@/components/ui/SuggestionScroller';
import { mapsUrl, roundCoord } from '@/lib/domain/geo';

export type LocationDraft = {
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Saisie d'un lieu, avec relevé facultatif de la position.
 *
 * Aucune clé API n'est employée : la position vient de l'API de
 * géolocalisation du navigateur, et le lien cartographique est une simple URL
 * de recherche Google Maps. Le destinataire y accède d'un clic depuis son
 * invitation.
 */
export function LocationPicker({
  index,
  value,
  suggestions,
  onChange,
  onRemove,
}: {
  index: number;
  value: LocationDraft;
  suggestions: string[];
  onChange: (patch: Partial<LocationDraft>) => void;
  onRemove?: () => void;
}) {
  const [etat, setEtat] = useState<'idle' | 'locating' | 'error'>('idle');
  const [messageErreur, setMessageErreur] = useState<string | null>(null);

  const lien = mapsUrl(value);
  const positionne = value.latitude !== null && value.longitude !== null;

  function releverPosition() {
    if (!('geolocation' in navigator)) {
      setEtat('error');
      setMessageErreur('Votre navigateur ne sait pas relever la position.');
      return;
    }

    setEtat('locating');
    setMessageErreur(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: roundCoord(position.coords.latitude),
          longitude: roundCoord(position.coords.longitude),
        });
        setEtat('idle');
      },
      (erreur) => {
        setEtat('error');
        setMessageErreur(
          erreur.code === erreur.PERMISSION_DENIED
            ? 'Accès à la position refusé. Saisissez l’adresse à la main.'
            : 'Position introuvable. Saisissez l’adresse à la main.',
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="bloc p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-400">Lieu {index + 1}</span>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-500"
          >
            Retirer
          </button>
        ) : null}
      </div>

      <input
        value={value.label}
        onChange={(event) => onChange({ label: event.target.value })}
        placeholder="Nom du lieu"
        maxLength={120}
        className={`${inputClass} mt-3`}
      />

      {suggestions.length > 0 && !value.label ? (
        <div className="mt-2">
          <SuggestionScroller
            items={suggestions}
            onPick={(idee) => onChange({ label: idee })}
            icon="📍"
            ariaLabel="Idées de lieux"
          />
        </div>
      ) : null}

      <input
        value={value.address}
        onChange={(event) => onChange({ address: event.target.value })}
        placeholder="Adresse (facultatif)"
        maxLength={300}
        className={`${inputClass} mt-2`}
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={releverPosition}
          disabled={etat === 'locating'}
          className="rounded-full border border-cream-300 px-3.5 py-2 text-xs font-medium text-ink-600 transition hover:border-bordeaux-500 hover:text-bordeaux-500 disabled:opacity-60"
        >
          {etat === 'locating'
            ? 'Relevé en cours…'
            : positionne
              ? 'Actualiser ma position'
              : 'Utiliser ma position'}
        </button>

        {positionne ? (
          <>
            <span className="text-xs text-bordeaux-600">
              Position enregistrée ({value.latitude?.toFixed(4)}, {value.longitude?.toFixed(4)})
            </span>
            <button
              type="button"
              onClick={() => onChange({ latitude: null, longitude: null })}
              className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-500"
            >
              Effacer
            </button>
          </>
        ) : null}

        {lien ? (
          <a
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-500"
          >
            Vérifier sur la carte
          </a>
        ) : null}
      </div>

      {messageErreur ? (
        <p className="mt-2 text-xs font-medium text-bordeaux-600">{messageErreur}</p>
      ) : null}

      <p className="mt-2 text-xs leading-relaxed text-ink-400">
        La position est facultative. Elle sert à envoyer un point exact plutôt qu’une adresse à
        interpréter, et elle est transmise avec le lien d’invitation.
      </p>
    </div>
  );
}
