import { Faq, type FaqItem } from '@/components/marketing/Faq';
import { PageHeader } from '@/components/marketing/PageHeader';
import { PricingTable } from '@/components/marketing/PricingTable';
import { currencyForCountry } from '@/lib/domain/countries';
import { XOF_PER_EUR } from '@/lib/domain/pricing';
import { getRequestCountry } from '@/lib/geo/request-country';

// La devise affichée dépend du pays de la requête.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tarifs',
  description:
    'Gratuit jusqu’à 5 invitations par mois. Premium à 2 500 XOF pour 10 invitations, Premium Gold à 10 000 XOF pour 50.',
};

const TARIF_FAQ: FaqItem[] = [
  {
    q: 'Que se passe-t-il quand j’atteins ma limite ?',
    a: 'Les invitations déjà envoyées continuent de fonctionner normalement. Vous ne pouvez simplement plus en créer de nouvelle avant le mois suivant, ou avant de changer de formule.',
  },
  {
    q: 'Le compteur se remet à zéro quand ?',
    a: 'Le premier de chaque mois. Il compte les invitations créées, pas les réponses reçues : une invitation restée sans réponse compte quand même.',
  },
  {
    q: 'Pourquoi des prix en francs CFA ?',
    a: `Le produit est né en Afrique de l’Ouest. Le franc CFA est en parité fixe avec l’euro, à 1 € = ${XOF_PER_EUR} XOF, donc les deux montants correspondent exactement et ne bougeront pas avec le marché.`,
  },
  {
    q: 'Puis-je changer de formule ou arrêter ?',
    a: 'À tout moment, sans engagement de durée. En cas d’arrêt, vous repassez simplement sur la formule gratuite au terme du mois payé.',
  },
];

export default async function PricingPage() {
  const country = await getRequestCountry();
  const devise = currencyForCountry(country);

  return (
    <>
      <PageHeader eyebrow="Tarifs" title="Un prix qui suit" accent="votre rythme" align="center">
        <p>
          La plupart des gens invitent quelques fois par an, et la formule gratuite leur suffira
          toujours. Les formules payantes s’adressent à ceux qui en envoient vraiment beaucoup.
        </p>
      </PageHeader>

      <section className="py-16">
        <PricingTable devise={devise} />

        <p className="mx-auto mt-10 max-w-2xl px-5 text-center text-sm leading-relaxed text-ink-400">
          Tous les montants s’entendent par mois, sans engagement. Le franc CFA étant en parité
          fixe avec l’euro, les deux prix affichés sont équivalents au centime près.
        </p>
      </section>

      <Faq items={TARIF_FAQ} />
    </>
  );
}
