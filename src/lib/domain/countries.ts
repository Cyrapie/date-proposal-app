import type { ProposalType } from '@/lib/domain/proposal';

/**
 * Adaptation au pays.
 *
 * Deux usages : la devise affichée sur la grille tarifaire, et des idées de
 * sorties culturellement pertinentes dans le formulaire de création.
 *
 * Les suggestions sont des CATÉGORIES de lieux, jamais des établissements
 * réels : inventer un nom de restaurant qui n'existe pas enverrait la personne
 * dans le vide.
 */

export type CurrencyPreference = 'XOF' | 'EUR';

/** Zone franc CFA (UEMOA) : les tarifs y sont plus parlants en francs. */
const XOF_COUNTRIES = new Set([
  'BJ', // Bénin
  'BF', // Burkina Faso
  'CI', // Côte d'Ivoire
  'GW', // Guinée-Bissau
  'ML', // Mali
  'NE', // Niger
  'SN', // Sénégal
  'TG', // Togo
]);

export function currencyForCountry(country: string | null): CurrencyPreference {
  return country && XOF_COUNTRIES.has(country.toUpperCase()) ? 'XOF' : 'EUR';
}

type SuggestionSet = Partial<Record<ProposalType, string[]>>;

/** Idées par défaut, employées dès que le pays n'a pas de jeu dédié. */
const DEFAULT_SUGGESTIONS: SuggestionSet = {
  restaurant: ['Un restaurant de quartier', 'Une table avec terrasse', 'Un bar à vins'],
  cinema: ['Le cinéma le plus proche', 'Une salle art et essai'],
  activity: ['Une exposition', 'Un atelier à deux', 'Une balade au parc'],
  weekend: ['Une ville à deux heures de route', 'Une maison d’hôtes à la campagne'],
  birthday: ['Le lieu de votre premier rendez-vous', 'Un endroit qu’elle adore'],
  just_because: ['Un café tranquille', 'Un endroit avec vue'],
};

const BY_COUNTRY: Record<string, SuggestionSet> = {
  CI: {
    restaurant: ['Un maquis', 'Du poisson braisé en bord de lagune', 'Une table de garba'],
    activity: ['Une sortie à la plage', 'Un concert de coupé-décalé', 'Le marché artisanal'],
    weekend: ['Grand-Bassam', 'Assinie', 'Yamoussoukro'],
    just_because: ['Un bangala au coin de la rue', 'Un jus de bissap en terrasse'],
  },
  SN: {
    restaurant: ['Un thieboudienne du midi', 'Une table de poisson grillé', 'Un dibiterie'],
    activity: ['Une traversée vers l’île de Gorée', 'Une balade sur la corniche'],
    weekend: ['Saly', 'Le lac Rose', 'Saint-Louis'],
    just_because: ['Un attaya en terrasse', 'Un café touba'],
  },
  BJ: {
    restaurant: ['Une table de poisson braisé', 'Un maquis du quartier'],
    activity: ['Le marché Dantokpa', 'Une sortie à la plage'],
    weekend: ['Ouidah', 'Ganvié', 'Grand-Popo'],
  },
  FR: {
    restaurant: ['Un bistrot de quartier', 'Une brasserie', 'Une table étoilée pour marquer le coup'],
    activity: ['Un musée le dimanche', 'Un cours de cuisine', 'Une séance d’escalade'],
    weekend: ['Une ville à deux heures de train', 'Un gîte à la campagne'],
  },
  BE: {
    restaurant: ['Une brasserie', 'Un resto de moules-frites', 'Un bar à bières'],
    activity: ['Un musée', 'Une balade à vélo'],
  },
  CA: {
    restaurant: ['Un resto de quartier', 'Une cabane à sucre en saison'],
    activity: ['Une randonnée', 'Un match de hockey'],
  },
};

/**
 * Idées de lieux pour un type d'occasion, adaptées au pays détecté.
 * Retourne un tableau vide plutôt que null : l'appelant affiche simplement rien.
 */
export function suggestionsFor(country: string | null, type: ProposalType): string[] {
  const code = country?.toUpperCase() ?? '';
  const local = BY_COUNTRY[code]?.[type];
  if (local && local.length > 0) return local;
  return DEFAULT_SUGGESTIONS[type] ?? [];
}

export function countryHasSuggestions(country: string | null): boolean {
  return Boolean(country && BY_COUNTRY[country.toUpperCase()]);
}
