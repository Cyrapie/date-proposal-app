export type FaqItem = { q: string; a: string };

export const HOME_FAQ: FaqItem[] = [
  {
    q: 'La personne qui reçoit doit-elle créer un compte ?',
    a: 'Non. Elle ouvre le lien, découvre l’invitation, choisit le lieu et le créneau. Aucun compte, aucun mot de passe, aucune application.',
  },
  {
    q: 'Vous connectez-vous à mon agenda ?',
    a: 'Jamais. Nous produisons un fichier .ics et un lien Google Calendar pré-rempli. Rien n’entre dans votre calendrier sans votre clic.',
  },
  {
    q: 'Est-ce un site de rencontre ?',
    a: 'Non. Nous ne mettons personne en relation. L’outil sert à inviter quelqu’un que vous connaissez déjà : un conjoint, un ami, une personne rencontrée ailleurs.',
  },
  {
    q: 'Combien de temps le lien reste-t-il valable ?',
    a: 'Entre 7 et 90 jours, vous choisissez à la création. Passé ce délai le contenu n’est plus consultable, puis il est supprimé de nos serveurs.',
  },
  {
    q: 'Et si la personne dit non ?',
    a: 'Le bouton « Non » se dérobe et finit par ne plus répondre. C’est une plaisanterie assumée. Un vrai refus se dit de vive voix, pas en cliquant.',
  },
];

/**
 * Accordéon en HTML natif (`<details>`) : accessible au clavier et fonctionnel
 * sans JavaScript, donc sans coût d'hydratation sur une page marketing.
 */
export function Faq({ items = HOME_FAQ }: { items?: FaqItem[] }) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-20">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
        Questions fréquentes
      </p>
      <h2 className="mt-4 text-center font-serif text-4xl font-black leading-[1.06] text-ink-900">
        Ce qu’on nous demande
      </h2>

      <div className="mt-10 space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="bloc group px-6 open:border-bordeaux-200 open:bg-bordeaux-50"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink-900 marker:content-none">
              {item.q}
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bordeaux-50 text-bordeaux-500 transition group-open:rotate-45"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="pb-5 text-sm leading-relaxed text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
