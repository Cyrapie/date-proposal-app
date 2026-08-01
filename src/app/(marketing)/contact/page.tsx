import { Faq, type FaqItem } from '@/components/marketing/Faq';
import { InquiryForm } from '@/components/marketing/InquiryForm';
import { PageHeader } from '@/components/marketing/PageHeader';

export const metadata = {
  title: 'Contact',
  description:
    'Une question, un bug, une suggestion ? Écrivez-nous, nous lisons tout et répondons sous deux jours ouvrés.',
};

const CONTACT_FAQ: FaqItem[] = [
  {
    q: 'La personne qui reçoit doit-elle créer un compte ?',
    a: 'Non. Elle ouvre le lien, elle choisit, c’est tout. Aucun compte, aucun mot de passe, aucune application à installer.',
  },
  {
    q: 'Vous connectez-vous à mon agenda ?',
    a: 'Jamais. Nous générons un fichier .ics et un lien Google Calendar déjà rempli. Vous gardez la main : rien n’est ajouté sans votre clic.',
  },
  {
    q: 'Combien de temps le lien reste-t-il valable ?',
    a: 'Vous le choisissez à la création, entre 7 et 90 jours. Passé ce délai, le contenu n’est plus consultable, puis il est supprimé définitivement.',
  },
  {
    q: 'Puis-je modifier une invitation déjà envoyée ?',
    a: 'Pas encore. Pour l’instant, créez-en une nouvelle et renvoyez le lien. C’est en haut de la liste des améliorations prévues.',
  },
  {
    q: 'Sous quel délai répondez-vous ?',
    a: 'Deux jours ouvrés en général. Si votre message concerne une invitation déjà envoyée, précisez-le : ces demandes passent devant.',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Dites-nous" accent="tout">
        <p>
          Une question, un bug, une idée d’amélioration. Nous lisons chaque message et répondons
          sous deux jours ouvrés.
        </p>
      </PageHeader>

      <div className="mx-auto w-full max-w-2xl px-5 py-16">
        <h2 className="font-serif text-3xl font-black text-ink-900">Écrivez-nous</h2>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-ink-400">
          Les champs marqués d’une étoile sont nécessaires pour vous répondre.
        </p>
        <InquiryForm
          kind="contact"
          messageLabel="Votre message"
          messagePlaceholder="Décrivez votre question ou ce que vous avez rencontré…"
          submitLabel="Envoyer"
        />
      </div>

      <Faq items={CONTACT_FAQ} />
    </>
  );
}
