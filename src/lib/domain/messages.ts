import type { AnyProposalType, GroupType, ProposalType } from '@/lib/domain/proposal';

/**
 * Messages suggérés par occasion, proposés au créateur comme point de départ
 * — jamais imposés tels quels : le champ reste éditable après le choix.
 *
 * Pas de génération par IA ici volontairement : un pool rédigé à la main,
 * dans le même ton que le reste du produit, coûte zéro appel réseau et
 * n'attend jamais de réponse d'un modèle.
 */
export const MESSAGE_SUGGESTIONS: Record<ProposalType, string[]> = {
  cinema: [
    "J'ai repéré une séance qui devrait te plaire. Tu me dis quel horaire t'arrange ?",
    "Popcorn, salle sombre, deux heures rien qu'à nous. Ça te dit ?",
    "Il y a un film que j'aimerais voir avec toi, pas seul devant mon écran.",
  ],
  restaurant: [
    "J'ai repéré deux ou trois adresses qui devraient te plaire. Tu choisis ?",
    "Ça fait un moment qu'on ne s'est pas posés autour d'une bonne table.",
    "J'ai envie de partager un bon repas avec toi. Voici quelques idées.",
  ],
  weekend: [
    "Et si on s'échappait deux jours, loin de tout ?",
    "J'ai repéré quelques endroits pour souffler un peu, ensemble.",
    "Un changement de décor nous ferait du bien, non ?",
  ],
  activity: [
    "J'ai une idée de sortie qui sort un peu de l'ordinaire. Tentée ?",
    "Ça te dirait qu'on essaie quelque chose de nouveau, tous les deux ?",
    "J'ai repéré une activité qui devrait te plaire. Voici les créneaux possibles.",
  ],
  surprise: [
    "J'ai une idée en tête, mais je garde le lieu secret jusqu'à ton oui.",
    "Fais-moi confiance sur celle-ci : choisis juste le créneau, le reste est une surprise.",
    "Je te réserve quelque chose. Tu n'as qu'à dire oui.",
  ],
  birthday: [
    "Pour marquer le coup comme il faut, j'ai pensé à ça.",
    "Ton anniversaire mérite plus qu'un message. Voici ce que je propose.",
    "J'ai envie de fêter ça avec toi, à ma façon.",
  ],
  just_because: [
    "Aucune raison particulière, juste l'envie de te voir.",
    "Pas besoin d'occasion pour ça. Tu es libre quand ?",
    "Ça faisait trop longtemps. On se voit ?",
  ],
};

export const GROUP_MESSAGE_SUGGESTIONS: Record<GroupType, string[]> = {
  friends: [
    "Ça fait un moment qu'on ne s'est pas tous retrouvés. Qui est partant ?",
    "Petit rassemblement en vue. Places limitées, premiers arrivés !",
    "On se fait une soirée entre nous ? J'ai fixé le lieu et l'heure.",
  ],
  club: [
    "Prochaine sortie du club : places limitées, inscrivez-vous vite.",
    "On se retrouve pour la prochaine session. Confirmez votre présence.",
    "Nouvelle date fixée. Réservez votre place dès maintenant.",
  ],
  colleagues: [
    "Petit moment convivial entre collègues, hors du bureau.",
    "On se retrouve pour souffler un peu, tous ensemble.",
    "Une pause bien méritée s'impose. Places limitées.",
  ],
  events: [
    "Un événement à ne pas manquer. Réservez votre place.",
    "On vous attend nombreux pour cette occasion.",
    "Places limitées : confirmez votre présence dès que possible.",
  ],
  chill: [
    "Un moment tranquille, sans prise de tête. Qui vient ?",
    "On se pose ensemble, dans le calme. Places limitées.",
    "Rien de prévu de spécial, juste l'envie de se voir à plusieurs.",
  ],
  afterwork: [
    "Petit afterwork pour décompresser. Places limitées.",
    "On se retrouve après le travail, entre nous.",
    "Un verre après le boulot ? Confirmez votre présence.",
  ],
};

/** Suggestions de message, quel que soit le type — individuel ou de groupe. */
export function messageSuggestionsFor(type: AnyProposalType): string[] {
  return type in GROUP_MESSAGE_SUGGESTIONS
    ? GROUP_MESSAGE_SUGGESTIONS[type as GroupType]
    : MESSAGE_SUGGESTIONS[type as ProposalType];
}
