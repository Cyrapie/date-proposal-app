import { PricingPageContent } from '@/components/marketing/PricingPageContent';
import { currencyForCountry } from '@/lib/domain/countries';
import { getRequestCountry } from '@/lib/geo/request-country';

// La devise affichée dépend du pays de la requête.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Tarifs',
  description:
    'Gratuit jusqu’à 5 invitations par mois. Premium à 2 500 XOF pour 10 invitations, Premium Gold à 10 000 XOF pour 50.',
};

export default async function PricingPage() {
  const country = await getRequestCountry();
  const devise = currencyForCountry(country);

  return <PricingPageContent devise={devise} />;
}
