import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Mentions légales',
};

const SECTIONS = [
  {
    title: 'Éditeur',
    body: [
      "Le service « Une invitation » est édité par Otyche. Raison sociale, forme juridique, adresse du siège et numéro d'immatriculation à renseigner ici avant mise en production.",
    ],
  },
  {
    title: 'Directeur de publication',
    body: ["Nom et contact du directeur de publication à renseigner ici avant mise en production."],
  },
  {
    title: 'Hébergement',
    body: [
      "L'application est hébergée par Vercel Inc. Base de données et authentification hébergées par Supabase.",
    ],
  },
  {
    title: 'Contact',
    body: ["Adresse email de contact à renseigner ici avant mise en production."],
  },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader eyebrow="Informations légales" title="Mentions" accent="légales">
        <p>Qui édite ce service, qui l&apos;héberge, et comment nous contacter.</p>
      </PageHeader>

      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl font-extrabold text-bordeaux-600">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-ink-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
