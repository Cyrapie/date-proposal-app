import { InquiryForm } from '@/components/marketing/InquiryForm';
import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Devenir partenaire',
  description:
    'Restaurants, salles de spectacle, lieux d’activité : apparaissez parmi les lieux proposés au moment où deux personnes décident de leur soirée.',
};

const PROFILES = [
  {
    title: 'Restaurants et bars',
    body: 'Votre table figure parmi les lieux suggérés, au moment précis où le choix se fait.',
  },
  {
    title: 'Cinémas, salles, musées',
    body: 'Vos séances et expositions deviennent des créneaux proposables en deux clics.',
  },
  {
    title: 'Activités et ateliers',
    body: 'Escalade, poterie, dégustation : les sorties à deux se décident souvent le matin même.',
  },
  {
    title: 'Hôtels et maisons d’hôtes',
    body: 'Le format weekend permet de proposer des dates réelles, sans va-et-vient de messages.',
  },
];

const STEPS = [
  'Vous nous écrivez avec le formulaire ci-contre.',
  'Nous échangeons pour comprendre votre lieu et vos disponibilités.',
  'Nous cadrons ensemble le format de présence et les conditions.',
  'Vous apparaissez auprès des personnes qui organisent un rendez-vous près de chez vous.',
];

export default function PartnersPage() {
  return (
    <>
      <PageHeader eyebrow="Devenir partenaire" title="Soyez le lieu" accent="qu’on choisit">
        <p>
          Nos utilisateurs ne cherchent pas « un restaurant ». Ils préparent une soirée précise,
          pour une personne précise, et hésitent entre deux ou trois adresses. C’est à ce
          moment-là que votre lieu a le plus de valeur.
        </p>
      </PageHeader>

      <div className="mx-auto w-full max-w-6xl px-5 py-16">

      <section className="mt-14">
        <h2 className="font-serif text-2xl font-extrabold text-ink-900">À qui ça s’adresse</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PROFILES.map((profile) => (
            <div
              key={profile.title}
              className="bloc bloc-plein p-6"
            >
              <h3 className="font-serif text-xl font-bold text-ink-900">{profile.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{profile.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-16 grid gap-14 lg:grid-cols-[380px_minmax(0,1fr)]">
        <section>
          <h2 className="font-serif text-2xl font-extrabold text-ink-900">Comment ça se passe</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cream-300 text-xs font-medium text-ink-400">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-ink-600">{step}</p>
              </li>
            ))}
          </ol>

          <p className="mt-8 rounded-xl border border-dashed border-cream-300 p-4 text-xs leading-relaxed text-ink-400">
            Le programme partenaire se construit en ce moment. Les modalités précises (visibilité,
            tarifs, engagement) se définissent avec les premiers inscrits.
          </p>
        </section>

        <section className="max-w-xl">
          <h2 className="font-serif text-2xl font-extrabold text-ink-900">Parlons-en</h2>
          <p className="mt-2 mb-6 text-sm leading-relaxed text-ink-400">
            Décrivez votre lieu en quelques lignes. Nous revenons vers vous sous deux jours ouvrés.
          </p>
          <InquiryForm
            kind="partner"
            messageLabel="Votre lieu en quelques lignes"
            messagePlaceholder="Où vous situez-vous, quel type d’expérience proposez-vous, et qu’attendez-vous d’un partenariat ?"
            submitLabel="Envoyer ma demande"
          />
        </section>
      </div>
      </div>
    </>
  );
}
