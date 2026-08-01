import { PageHeader } from '@/components/marketing/PageHeader';
import { publicEnv } from '@/lib/env';

export const metadata = {
  title: 'Politique de confidentialité',
};

const SECTIONS = [
  {
    title: 'Qui traite vos données',
    body: [
      "Le service est édité par l'éditeur de cette application, responsable du traitement au sens du RGPD. Pour toute question ou demande, écrivez à l'adresse de contact indiquée en bas de page.",
    ],
  },
  {
    title: 'Ce que nous collectons',
    body: [
      "Créateur : votre adresse email (connexion et notifications), et le contenu des invitations que vous composez : prénom du destinataire, type d'occasion, message, photo éventuelle, lieux et créneaux proposés, thème choisi.",
      "Destinataire : aucun compte, aucun profil. Nous enregistrons uniquement le lieu et le créneau retenus, le mot facultatif laissé, l'adresse email si elle est volontairement renseignée pour recevoir la confirmation, et l'horodatage de l'ouverture du lien.",
    ],
  },
  {
    title: 'Pourquoi',
    body: [
      "Fournir le service : afficher l'invitation, enregistrer la réponse, générer le fichier .ics et envoyer les emails de confirmation. Aucune donnée n'est utilisée à des fins publicitaires, n'est vendue, ni cédée à des tiers à des fins commerciales.",
    ],
  },
  {
    title: 'Combien de temps',
    body: [
      "Chaque invitation porte une date d'expiration choisie à sa création. Passé ce délai, son contenu n'est plus consultable via le lien.",
      "Les invitations expirées sont ensuite purgées définitivement de la base, avec leurs lieux, créneaux et réponses. Vous pouvez à tout moment demander la suppression immédiate de votre compte et de l'ensemble de vos invitations.",
    ],
  },
  {
    title: 'Qui héberge',
    body: [
      "Base de données, authentification et stockage des photos : Supabase. Hébergement de l'application : Vercel. Envoi des emails transactionnels : Resend. Protection anti-robot des formulaires : Cloudflare. Ces prestataires agissent comme sous-traitants et n'utilisent pas vos données pour leur propre compte.",
      "Aucune connexion à Google Calendar, Outlook ou Apple Calendar n'est établie : les rendez-vous sont transmis sous forme de fichier .ics et de lien pré-rempli, sans accès à votre agenda.",
    ],
  },
  {
    title: 'Vos droits',
    body: [
      "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données. Ces droits s'exercent sur simple demande à l'adresse de contact. Vous pouvez également introduire une réclamation auprès de la CNIL.",
    ],
  },
  {
    title: 'Protection anti-robot',
    body: [
      "Les formulaires Contact et Devenir partenaire sont protégés par Cloudflare Turnstile. Ce service vérifie que la soumission provient d'une personne et non d'un script automatisé.",
      "Turnstile a été retenu précisément parce qu'il ne profile pas les visiteurs : il n'exploite pas votre historique de navigation, ne dépose pas de cookie publicitaire et ne sert à aucun ciblage. Cloudflare traite l'adresse IP et des signaux techniques du navigateur le temps de la vérification, en qualité de sous-traitant.",
      "Le widget n'est chargé que sur les deux pages comportant un formulaire. Le reste du site, y compris les pages d'invitation, n'appelle aucun script Cloudflare.",
    ],
  },
  {
    title: 'Cookies',
    body: [
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

      <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-2xl font-extrabold text-bordeaux-600">{section.title}</h2>
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

      <p className="mt-14 border-t border-cream-300 pt-6 text-xs leading-relaxed text-ink-400">
        Contact : renseignez ici l&apos;adresse email du responsable de traitement avant mise en
        production, ainsi que la raison sociale et l&apos;adresse de l&apos;éditeur.
      </p>
      </main>
    </>
  );
}
