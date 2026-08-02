import { LegalLayout, type LegalSection } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Conditions générales',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'objet',
    title: 'Objet',
    paragraphs: [
      "Les présentes conditions régissent l'utilisation du service « Une invitation », qui permet à un créateur de composer une invitation personnalisée et d'obtenir un lien à transmettre à un destinataire.",
    ],
    note: 'En créant un compte ou en utilisant le service, vous acceptez les termes de ces conditions générales.',
  },
  {
    id: 'compte-createur',
    title: 'Compte créateur',
    paragraphs: [
      "La création d'une invitation nécessite une connexion par lien magique envoyé à votre adresse email. Aucun mot de passe n'est stocké.",
    ],
  },
  {
    id: 'formules-quotas',
    title: 'Formules et quotas',
    paragraphs: [
      "Le service propose des formules gratuites et payantes détaillées sur la page /tarifs, chacune avec un quota mensuel d'invitations. Le changement de formule est aujourd'hui géré manuellement ; l'intégration d'un paiement en ligne n'est pas encore active.",
    ],
  },
  {
    id: 'contenu-invitations',
    title: 'Contenu des invitations',
    paragraphs: [
      "Vous êtes seul responsable du contenu que vous publiez (message, photo, lieux, créneaux). Il doit rester licite et ne porter atteinte à aucun tiers — voir les règles de la communauté.",
    ],
  },
  {
    id: 'disponibilite-resiliation',
    title: 'Disponibilité et résiliation',
    paragraphs: [
      "Le service est fourni en l'état, sans garantie de disponibilité continue. Vous pouvez demander la suppression de votre compte et de vos invitations à tout moment.",
    ],
  },
  {
    id: 'droit-applicable',
    title: 'Droit applicable',
    paragraphs: ["Droit applicable et juridiction compétente à renseigner ici avant mise en production."],
  },
];

export default function ConditionsGeneralesPage() {
  return (
    <>
      <PageHeader eyebrow="Cadre d'utilisation" title="Conditions" accent="générales">
        <p>Les règles qui encadrent l&apos;utilisation du service, en clair.</p>
      </PageHeader>

      <LegalLayout sections={SECTIONS} />
    </>
  );
}
