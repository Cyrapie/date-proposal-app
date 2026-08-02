import { LegalLayout, type LegalSection } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Règles de la communauté',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'le-principe',
    title: 'Le principe',
    paragraphs: [
      "Une invitation s'adresse à une personne que vous connaissez, pour lui proposer un rendez-vous réel. Ce n'est ni un canal de démarchage, ni un espace de diffusion publique.",
    ],
  },
  {
    id: 'contenu-interdit',
    title: 'Contenu interdit',
    paragraphs: [
      "Sont interdits : le harcèlement, les menaces, les contenus à caractère haineux, discriminatoire ou sexuel non sollicité, l'usurpation d'identité, et l'envoi d'invitations à des personnes qui n'ont pas consenti à être contactées de cette façon.",
    ],
  },
  {
    id: 'photos-messages',
    title: 'Photos et messages',
    paragraphs: [
      "La photo et le message d'une invitation doivent rester licites et respectueux du destinataire. Le service se réserve le droit de suspendre un compte à l'origine d'un contenu contraire à ces règles.",
    ],
  },
  {
    id: 'signalement',
    title: 'Signalement',
    paragraphs: [
      "Un destinataire qui reçoit une invitation abusive peut le signaler via la page /contact.",
    ],
    note: 'Adresse dédiée au signalement à préciser ici avant mise en production.',
  },
  {
    id: 'sanctions',
    title: 'Sanctions',
    paragraphs: [
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

      <LegalLayout sections={SECTIONS} />
    </>
  );
}
