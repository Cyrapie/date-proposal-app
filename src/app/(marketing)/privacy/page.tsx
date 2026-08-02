import { LegalLayout, type LegalSection } from '@/components/marketing/LegalLayout';
import { PageHeader } from '@/components/marketing/PageHeader';
import { publicEnv } from '@/lib/env';

export const metadata = {
  title: 'Politique de confidentialité',
};

const SECTIONS: LegalSection[] = [
  {
    id: 'qui-traite',
    title: 'Qui traite vos données',
    paragraphs: [
      "Le service est édité par l'éditeur de cette application, responsable du traitement au sens du RGPD. Pour toute question ou demande, écrivez à l'adresse de contact indiquée en bas de page.",
    ],
    note: "Contact : renseignez ici l'adresse email du responsable de traitement avant mise en production, ainsi que la raison sociale et l'adresse de l'éditeur.",
  },
  {
    id: 'donnees-collectees',
    title: 'Ce que nous collectons',
    paragraphs: [
      "Créateur : votre adresse email (connexion et notifications), et le contenu des invitations que vous composez : prénom du destinataire, type d'occasion, message, photo éventuelle, lieux et créneaux proposés, thème choisi.",
      "Destinataire : aucun compte, aucun profil. Nous enregistrons uniquement le lieu et le créneau retenus, le mot facultatif laissé, l'adresse email si elle est volontairement renseignée pour recevoir la confirmation, et l'horodatage de l'ouverture du lien.",
    ],
  },
  {
    id: 'pourquoi',
    title: 'Pourquoi',
    paragraphs: [
      "Fournir le service : afficher l'invitation, enregistrer la réponse, générer le fichier .ics et envoyer les emails de confirmation. Aucune donnée n'est utilisée à des fins publicitaires, n'est vendue, ni cédée à des tiers à des fins commerciales.",
    ],
  },
  {
    id: 'duree',
    title: 'Combien de temps',
    paragraphs: [
      "Chaque invitation porte une date d'expiration choisie à sa création. Passé ce délai, son contenu n'est plus consultable via le lien.",
      "Les invitations expirées sont ensuite purgées définitivement de la base, avec leurs lieux, créneaux et réponses. Vous pouvez à tout moment demander la suppression immédiate de votre compte et de l'ensemble de vos invitations.",
    ],
  },
  {
    id: 'hebergement',
    title: 'Qui héberge',
    paragraphs: [
      "Base de données, authentification et stockage des photos : Supabase. Hébergement de l'application : Vercel. Envoi des emails transactionnels : Resend. Protection anti-robot des formulaires : Cloudflare. Ces prestataires agissent comme sous-traitants et n'utilisent pas vos données pour leur propre compte.",
      "Aucune connexion à Google Calendar, Outlook ou Apple Calendar n'est établie : les rendez-vous sont transmis sous forme de fichier .ics et de lien pré-rempli, sans accès à votre agenda.",
    ],
  },
  {
    id: 'vos-droits',
    title: 'Vos droits',
    paragraphs: [
      "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données. Ces droits s'exercent sur simple demande à l'adresse de contact. Vous pouvez également introduire une réclamation auprès de la CNIL.",
    ],
  },
  {
    id: 'anti-robot',
    title: 'Protection anti-robot',
    paragraphs: [
      "Les formulaires Contact et Devenir partenaire sont protégés par Cloudflare Turnstile. Ce service vérifie que la soumission provient d'une personne et non d'un script automatisé.",
      "Turnstile a été retenu précisément parce qu'il ne profile pas les visiteurs : il n'exploite pas votre historique de navigation, ne dépose pas de cookie publicitaire et ne sert à aucun ciblage. Cloudflare traite l'adresse IP et des signaux techniques du navigateur le temps de la vérification, en qualité de sous-traitant.",
      "Le widget n'est chargé que sur les deux pages comportant un formulaire. Le reste du site, y compris les pages d'invitation, n'appelle aucun script Cloudflare.",
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies',
    paragraphs: [
      "Seuls des cookies strictement nécessaires sont déposés : ils maintiennent la session de connexion du créateur, et Cloudflare Turnstile en pose un le temps de valider un envoi de formulaire. Aucun cookie publicitaire, aucun traceur comportemental, aucune mesure d'audience.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Confidentialité" title="Politique de" accent="confidentialité">
        <p>
          Le principe est simple : le strict nécessaire pour que l&apos;invitation fonctionne,
          rien de plus, et pas plus longtemps que nécessaire. Durée de conservation par défaut
          d&apos;un lien : {publicEnv.defaultExpiryDays} jours.
        </p>
      </PageHeader>

      <LegalLayout sections={SECTIONS} />
    </>
  );
}
