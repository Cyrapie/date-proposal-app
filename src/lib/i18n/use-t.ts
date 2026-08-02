'use client';

import { dictionaries, type Dictionary } from '@/lib/i18n/dictionary';
import { useLang } from '@/lib/i18n/language';

/** Dictionnaire complet pour la langue courante. */
export function useT(): Dictionary {
  return dictionaries[useLang()];
}
