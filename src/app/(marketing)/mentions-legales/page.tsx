import { LegalLayout, type LegalSection } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Mentions légales',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'editeur',
    title: 'Éditeur',
    paragraphs: [
      "Le service « Une invitation » est édité par Otyche. Raison sociale, forme juridique, adresse du siège et numéro d'immatriculation à renseigner ici avant mise en production.",
    ],
  },
  {
    id: 'directeur-publication',
    title: 'Directeur de publication',
    paragraphs: ["Nom et contact du directeur de publication à renseigner ici avant mise en production."],
  },
  {
    id: 'hebergement',
    title: 'Hébergement',
    paragraphs: [
      "L'application est hébergée par Vercel Inc. Base de données et authentification hébergées par Supabase.",
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    paragraphs: ["Pour toute question relative à ce site, une adresse de contact est à renseigner ici avant mise en production."],
    note: 'En attendant, écrivez-nous depuis la page Contact du site : votre message nous parvient directement.',
  },
];

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHeader eyebrow="Informations légales" title="Mentions" accent="légales">
        <p>Qui édite ce service, qui l&apos;héberge, et comment nous contacter.</p>
      </PageHeader>

      <LegalLayout sections={SECTIONS} />
    </>
  );
}
