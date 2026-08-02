import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Conditions générales',
};

const SECTIONS = [
  {
    title: 'Objet',
    body: [
      "Les présentes conditions régissent l'utilisation du service « Une invitation », qui permet à un créateur de composer une invitation personnalisée et d'obtenir un lien à transmettre à un destinataire.",
    ],
  },
  {
    title: 'Compte créateur',
    body: [
      "La création d'une invitation nécessite une connexion par lien magique envoyé à votre adresse email. Aucun mot de passe n'est stocké.",
    ],
  },
  {
    title: 'Formules et quotas',
    body: [
      "Le service propose des formules gratuites et payantes détaillées sur la page /tarifs, chacune avec un quota mensuel d'invitations. Le changement de formule est aujourd'hui géré manuellement ; l'intégration d'un paiement en ligne n'est pas encore active.",
    ],
  },
  {
    title: 'Contenu des invitations',
    body: [
      "Vous êtes seul responsable du contenu que vous publiez (message, photo, lieux, créneaux). Il doit rester licite et ne porter atteinte à aucun tiers — voir les règles de la communauté.",
    ],
  },
  {
    title: 'Disponibilité et résiliation',
    body: [
      "Le service est fourni en l'état, sans garantie de disponibilité continue. Vous pouvez demander la suppression de votre compte et de vos invitations à tout moment.",
    ],
  },
  {
    title: 'Droit applicable',
    body: ["Droit applicable et juridiction compétente à renseigner ici avant mise en production."],
  },
];

export default function ConditionsGeneralesPage() {
  return (
    <>
      <PageHeader eyebrow="Cadre d'utilisation" title="Conditions" accent="générales">
        <p>Les règles qui encadrent l&apos;utilisation du service, en clair.</p>
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
