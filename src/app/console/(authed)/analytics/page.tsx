import { AnalyticsTrendChart } from '@/components/admin/AnalyticsTrendChart';
import { RankedBars } from '@/components/admin/RankedBars';
import { StatTile } from '@/components/admin/StatTile';
import {
  getConsoleAnalyticsOverview,
  listConsoleAnalyticsTop,
} from '@/lib/console/data';

export const metadata = { title: 'Analytics' };

export default async function ConsoleAnalyticsPage() {
  const [overview, topPages, topSections, topLinks] = await Promise.all([
    getConsoleAnalyticsOverview(30),
    listConsoleAnalyticsTop('page_view', 30, 10),
    listConsoleAnalyticsTop('section_view', 30, 10),
    listConsoleAnalyticsTop('link_click', 30, 10),
  ]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">Analytics</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          Trafic du site public et du dashboard, 30 derniers jours.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Vues de page" value={overview?.totalPageViews ?? 0} />
        <StatTile
          label="Visiteurs uniques"
          value={overview?.uniqueVisitors ?? 0}
          hint="Par session de navigation"
        />
        <StatTile label="Clics sur liens" value={overview?.totalLinkClicks ?? 0} />
      </div>

      <div className="mt-6">
        <AnalyticsTrendChart data={overview?.trendDaily ?? []} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <RankedBars title="Pages les plus vues" items={topPages} />
        <RankedBars title="Sections les plus vues" items={topSections} />
        <RankedBars title="Liens les plus cliqués" items={topLinks} />
      </div>
    </div>
  );
}
