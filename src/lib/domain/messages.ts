import type { AnyProposalType } from '@/lib/domain/proposal';
import type { Lang } from '@/lib/i18n/language';

/**
 * Messages suggérés par occasion, proposés au créateur comme point de départ
 * — jamais imposés tels quels : le champ reste éditable après le choix.
 *
 * Pas de génération par IA ici volontairement : un pool rédigé à la main,
 * dans le même ton que le reste du produit, coûte zéro appel réseau et
 * n'attend jamais de réponse d'un modèle. Pour la même raison, la version
 * anglaise est traduite à la main plutôt que calquée mot à mot : un message
 * d'invitation traduit littéralement sonne faux.
 */
type SuggestionPool = Record<AnyProposalType, string[]>;

const FR: SuggestionPool = {
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
    'Un changement de décor nous ferait du bien, non ?',
  ],
  activity: [
    "J'ai une idée de sortie qui sort un peu de l'ordinaire. Tentée ?",
    "Ça te dirait qu'on essaie quelque chose de nouveau, tous les deux ?",
    "J'ai repéré une activité qui devrait te plaire. Voici les créneaux possibles.",
  ],
  surprise: [
    "J'ai une idée en tête, mais je garde le lieu secret jusqu'à ton oui.",
    'Fais-moi confiance sur celle-ci : choisis juste le créneau, le reste est une surprise.',
    "Je te réserve quelque chose. Tu n'as qu'à dire oui.",
  ],
  birthday: [
    "Pour marquer le coup comme il faut, j'ai pensé à ça.",
    'Ton anniversaire mérite plus qu’un message. Voici ce que je propose.',
    "J'ai envie de fêter ça avec toi, à ma façon.",
  ],
  just_because: [
    "Aucune raison particulière, juste l'envie de te voir.",
    'Pas besoin d’occasion pour ça. Tu es libre quand ?',
    'Ça faisait trop longtemps. On se voit ?',
  ],
  friends: [
    "Ça fait un moment qu'on ne s'est pas tous retrouvés. Qui est partant ?",
    'Petit rassemblement en vue. Places limitées, premiers arrivés !',
    "On se fait une soirée entre nous ? J'ai fixé le lieu et l'heure.",
  ],
  club: [
    'Prochaine sortie du club : places limitées, inscrivez-vous vite.',
    'On se retrouve pour la prochaine session. Confirmez votre présence.',
    'Nouvelle date fixée. Réservez votre place dès maintenant.',
  ],
  colleagues: [
    'Petit moment convivial entre collègues, hors du bureau.',
    'On se retrouve pour souffler un peu, tous ensemble.',
    "Une pause bien méritée s'impose. Places limitées.",
  ],
  events: [
    'Un événement à ne pas manquer. Réservez votre place.',
    'On vous attend nombreux pour cette occasion.',
    'Places limitées : confirmez votre présence dès que possible.',
  ],
  chill: [
    'Un moment tranquille, sans prise de tête. Qui vient ?',
    'On se pose ensemble, dans le calme. Places limitées.',
    "Rien de prévu de spécial, juste l'envie de se voir à plusieurs.",
  ],
  afterwork: [
    'Petit afterwork pour décompresser. Places limitées.',
    'On se retrouve après le travail, entre nous.',
    'Un verre après le boulot ? Confirmez votre présence.',
  ],
};

const EN: SuggestionPool = {
  cinema: [
    'I spotted a screening you should like. Which time works for you?',
    'Popcorn, a dark room, two hours just for us. Tempted?',
    "There's a film I'd rather watch with you than alone on my screen.",
  ],
  restaurant: [
    'I found two or three places you should like. Your pick?',
    "It's been a while since we sat down for a proper meal.",
    'I feel like sharing a good dinner with you. Here are a few ideas.',
  ],
  weekend: [
    'What if we slipped away for two days, far from everything?',
    'I found a few places where we could breathe a little, together.',
    'A change of scenery would do us good, no?',
  ],
  activity: [
    'I have an idea for an outing that is a little out of the ordinary. Game?',
    'How about we try something new, the two of us?',
    'I found an activity you should like. Here are the possible slots.',
  ],
  surprise: [
    "I have something in mind, but the place stays secret until you say yes.",
    'Trust me on this one: just pick the slot, the rest is a surprise.',
    "I'm saving something for you. All you have to do is say yes.",
  ],
  birthday: [
    'To mark the occasion properly, I thought of this.',
    'Your birthday deserves more than a message. Here is what I suggest.',
    'I want to celebrate it with you, my own way.',
  ],
  just_because: [
    'No particular reason, I just want to see you.',
    'No occasion needed for this one. When are you free?',
    "It's been far too long. Shall we?",
  ],
  friends: [
    "It's been a while since we were all together. Who's in?",
    'Small gathering coming up. Limited spots, first come first served!',
    "Shall we do an evening together? I've set the place and the time.",
  ],
  club: [
    'Next club outing: spots are limited, sign up quickly.',
    'We meet again for the next session. Please confirm your attendance.',
    'New date set. Book your spot now.',
  ],
  colleagues: [
    'A relaxed moment with colleagues, away from the office.',
    'Let us get together and unwind a little, all of us.',
    'A well-earned break is in order. Limited spots.',
  ],
  events: [
    'An event not to miss. Book your spot.',
    'We hope to see many of you for this one.',
    'Limited spots: please confirm your attendance as soon as you can.',
  ],
  chill: [
    'Something low-key, no fuss. Who is coming?',
    'Let us just hang out, quietly. Limited spots.',
    'Nothing special planned, just the urge to see everyone.',
  ],
  afterwork: [
    'A little afterwork to unwind. Limited spots.',
    'We meet after work, just us.',
    'A drink after the office? Confirm your attendance.',
  ],
};

const POOLS: Record<Lang, SuggestionPool> = { fr: FR, en: EN };

/** Suggestions de message, quel que soit le type — individuel ou de groupe. */
export function messageSuggestionsFor(type: AnyProposalType, lang: Lang = 'fr'): string[] {
  return POOLS[lang][type];
}
