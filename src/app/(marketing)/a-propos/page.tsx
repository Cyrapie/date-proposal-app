import Link from 'next/link';

import { PageHeader } from '@/components/marketing/PageHeader';
import { Heart } from '@/components/ui/Heart';
import { CTA } from '@/lib/marketing/nav';

export const metadata = {
  title: 'À propos',
  description:
    'Pourquoi une invitation mérite mieux qu’un « on se voit quand ? », et comment nous traitons vos données.',
};

const PRINCIPLES = [
  {
    title: 'Le destinataire ne s’inscrit jamais',
    body: 'Demander un compte à quelqu’un pour lui proposer un dîner, c’est déjà avoir perdu. Un lien, une page, un choix. Rien d’autre.',
  },
  {
    title: 'Nous ne touchons pas à votre agenda',
    body: 'Aucune connexion Google, Outlook ou Apple. Nous produisons un fichier .ics et un lien pré-rempli. Vous décidez de ce qui entre dans votre calendrier.',
  },
  {
    title: 'Les liens expirent',
    body: 'Une invitation n’a pas vocation à rester en ligne indéfiniment. Vous fixez sa durée de vie ; ensuite elle disparaît, pour de bon.',
  },
  {
    title: 'Le strict nécessaire',
    body: 'Nous stockons ce qu’il faut pour que l’invitation fonctionne. Pas de traceur, pas de revente, pas de profilage.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="À propos" title="« On se voit" accent="quand ? »">
        <p>
          Cette phrase a tué plus de rendez-vous que tous les emplois du temps réunis. Elle
          demande à l’autre de faire tout le travail : trouver un jour, un lieu, une heure, et
          deviner ce qui vous ferait plaisir.
        </p>
      </PageHeader>

      <div className="mx-auto w-full max-w-3xl px-5 py-16">
      <div className=" space-y-5 text-base leading-relaxed text-ink-600">
        <p>
          L’idée de départ tient en une inversion : proposez, au lieu de demander. Deux ou trois
          lieux que vous avez choisis, quelques créneaux qui vous vont. L’autre n’a plus qu’à
          retenir ce qui l’arrange. Un geste, pas une négociation.
        </p>
        <p>
          Restait la forme. Un message texte fait le travail, mais il ne raconte rien. Alors
          l’invitation s’ouvre comme une lettre : une enveloppe scellée, un mot, une photo si vous
          en avez une. Le fond est pratique ; la forme, elle, doit donner envie de dire oui.
        </p>
        <p>
          Et puisqu’il faut bien qu’un rendez-vous finisse quelque part : dès la réponse, chacun
          reçoit le récapitulatif et le fichier à glisser dans son agenda. Sans avoir donné le
          moindre accès à son calendrier.
        </p>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-3xl font-black text-ink-900">Ce à quoi nous tenons</h2>
        <dl className="mt-8 space-y-8">
          {PRINCIPLES.map((principle) => (
            <div key={principle.title}>
              <dt className="flex items-start gap-3">
                <Heart className="mt-1 h-4 w-4 shrink-0 text-bordeaux-600" />
                <span className="font-serif text-xl font-bold text-ink-900">{principle.title}</span>
              </dt>
              <dd className="mt-2 pl-7 text-base leading-relaxed text-ink-600">
                {principle.body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 rounded-[var(--radius-vitrine)] border border-cream-300 bg-cream-50 p-8">
        <h2 className="font-serif text-2xl font-extrabold text-ink-900">Et vos données ?</h2>
        <p className="mt-3 text-base leading-relaxed text-ink-600">
          Tout est détaillé, sans jargon, dans notre{' '}
          <Link href="/privacy" className="text-bordeaux-600 underline underline-offset-4">
            politique de confidentialité
          </Link>
          . En résumé : votre email pour vous connecter et vous prévenir, le contenu de vos
          invitations pour les afficher, et rien de plus longtemps que nécessaire.
        </p>
      </section>

      <div className="mt-16 text-center">
        <Link
          href={CTA.href}
          className="inline-block rounded-full bg-accent px-8 py-4 text-base font-medium text-accent-ink transition hover:bg-accent-hover active:scale-[0.99]"
        >
          {CTA.label}
        </Link>
      </div>
      </div>
    </>
  );
}
