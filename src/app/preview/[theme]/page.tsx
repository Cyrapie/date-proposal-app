import { notFound } from 'next/navigation';

import { RecipientExperience } from '@/components/recipient/RecipientExperience';
import type { PublicProposal } from '@/components/recipient/types';
import { mapsUrl } from '@/lib/domain/geo';
import { isTheme } from '@/lib/domain/themes';

/**
 * Aperçu du parcours destinataire avec des données factices.
 *
 * Disponible uniquement en développement : permet d'itérer sur les animations
 * et les thèmes sans base Supabase ni invitation réelle.
 *   /preview/classic · /preview/fun · /preview/midnight
 */
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ theme: string }>;
}) {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { theme } = await params;
  if (!isTheme(theme)) {
    notFound();
  }

  const inDays = (days: number, hour: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };

  const proposal: PublicProposal = {
    slug: '__preview__',
    recipientName: 'Camille',
    type: 'restaurant',
    audience: 'individual',
    message:
      "Ça fait trop longtemps qu'on n'a pas pris une vraie soirée pour nous deux. J'ai repéré deux endroits, à toi de choisir.",
    photoUrl: null,
    theme,
    locations: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        label: 'Le Petit Comptoir',
        address: '12 rue des Lilas',
        mapUrl: mapsUrl({ label: 'Le Petit Comptoir', address: '12 rue des Lilas' }),
      },
      {
        id: '00000000-0000-4000-8000-000000000002',
        label: 'Chez Mina',
        address: '3 place du Marché',
        mapUrl: mapsUrl({ label: 'Chez Mina', address: '3 place du Marché' }),
      },
    ],
    slots: [
      { id: '00000000-0000-4000-8000-000000000011', start: inDays(3, 20), end: inDays(3, 22) },
      { id: '00000000-0000-4000-8000-000000000012', start: inDays(5, 19), end: inDays(5, 21) },
    ],
    hideLocations: false,
  };

  return <RecipientExperience proposal={proposal} initialResponse={null} demo />;
}
