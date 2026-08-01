/** Bloc « Pourquoi choisir ». Chaque carte bascule en bordeaux au survol. */

type Benefit = { icon: string; title: string; body: string };

const BENEFITS: Benefit[] = [
  {
    icon: '✉️',
    title: 'Un lien, rien de plus',
    body: 'Pas d’application à installer, pas de compte à créer pour la personne qui reçoit. Elle clique, elle découvre.',
  },
  {
    icon: '🎬',
    title: 'Sept types d’occasion',
    body: 'Cinéma, restaurant, weekend, activité, surprise, anniversaire. Ou juste comme ça, sans raison.',
  },
  {
    icon: '🗓️',
    title: 'Direct dans vos agendas',
    body: 'Dès la réponse, chacun reçoit un fichier .ics et un lien Google Calendar déjà rempli.',
  },
  {
    icon: '🔒',
    title: 'Votre agenda reste à vous',
    body: 'Aucune connexion Google, Outlook ou Apple. Nous ne lisons rien, nous n’ajoutons rien sans votre clic.',
  },
  {
    icon: '⏳',
    title: 'Des liens qui expirent',
    body: 'De 7 à 90 jours, à votre choix. Ensuite le contenu disparaît, définitivement.',
  },
  {
    icon: '💌',
    title: 'Une vraie mise en scène',
    body: 'Une enveloppe scellée, une lettre, une photo. L’effet n’a rien à voir avec un message texte.',
  },
];

export function Benefits() {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500">
          Pourquoi nous choisir
        </p>
        <h2 className="mt-4 font-serif text-4xl font-black leading-[1.06] text-ink-900 sm:text-5xl">
          Tout ce qu’un SMS
          <br className="hidden sm:block" /> ne sait pas faire
        </h2>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <article key={benefit.title} className="bloc bloc-plein p-7">
            <span
              aria-hidden="true"
              data-fixe
              className="pastille flex h-12 w-12 items-center justify-center rounded-2xl bg-bordeaux-50 text-2xl"
            >
              {benefit.icon}
            </span>
            <h3 className="mt-5 font-serif text-xl font-bold text-ink-900">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{benefit.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
