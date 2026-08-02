import { BlogTeaser } from '@/components/marketing/BlogTeaser';
import { HomeContent } from '@/components/marketing/HomeContent';

export const metadata = {
  title: 'Proposez un rendez-vous, joliment',
  description:
    'Créez une invitation animée et envoyez-la en un lien. La personne choisit le lieu et le créneau, le rendez-vous part dans vos deux agendas. Sans compte pour elle.',
};

export default function HomePage() {
  return <HomeContent blogTeaser={<BlogTeaser />} />;
}
