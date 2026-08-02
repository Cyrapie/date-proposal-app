import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Règles de la communauté',
};

const SECTIONS = [
  {
    title: 'Le principe',
    body: [
      "Une invitation s'adresse à une personne que vous connaissez, pour lui proposer un rendez-vous réel. Ce n'est ni un canal de démarchage, ni un espace de diffusion publique.",
    ],
  },
  {
    title: 'Contenu interdit',
    body: [
      "Sont interdits : le harcèlement, les menaces, les contenus à caractère haineux, discriminatoire ou sexuel non sollicité, l'usurpation d'identité, et l'envoi d'invitations à des personnes qui n'ont pas consenti à être contactées de cette façon.",
    ],
  },
  {
    title: 'Photos et messages',
    body: [
      "La photo et le message d'une invitation doivent rester licites et respectueux du destinataire. Le service se réserve le droit de suspendre un compte à l'origine d'un contenu contraire à ces règles.",
    ],
  },
  {
    title: 'Signalement',
    body: [
      "Un destinataire qui reçoit une invitation abusive peut le signaler via la page /contact. Adresse dédiée au signalement à préciser ici avant mise en production.",
    ],
  },
  {
    title: 'Sanctions',
    body: [
      "Selon la gravité, une violation de ces règles peut entraîner un avertissement, la suspension ou la suppression définitive du compte créateur concerné.",
    ],
  },
];

export default function ReglesCommunautePage() {
  return (
    <>
      <PageHeader eyebrow="Bon usage" title="Règles de la" accent="communauté">
        <p>Un rendez-vous se propose avec respect. Voici le cadre.</p>
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
