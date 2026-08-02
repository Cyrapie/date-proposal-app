import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getConsoleProposal } from '@/lib/console/data';
import { PROPOSAL_STATUS_LABEL, PROPOSAL_TYPE_META } from '@/lib/domain/proposal';
import { formatDateTime, formatSlotRange, isPast } from '@/lib/format';

export const metadata = { title: 'Détail d’une invitation' };

/** Forme retournée par la RPC `console_get_proposal`. */
type Detail = {
  proposal: {
    id: string;
    slug: string;
    recipient_name: string;
    type: string;
    status: string;
    message: string | null;
    photo_url: string | null;
    theme: string;
    viewed_at: string | null;
    expires_at: string;
    created_at: string;
  };
  creator_email: string | null;
  locations: { id: string; label: string; address: string | null; position: number }[];
  slots: { id: string; start_time: string; end_time: string; position: number }[];
  response: {
    chosen_location_id: string | null;
    chosen_slot_id: string | null;
    recipient_note: string | null;
    recipient_email: string | null;
    proposed_start: string | null;
    proposed_end: string | null;
    proposed_location: string | null;
    responded_at: string;
  } | null;
};

function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-b border-cream-200 py-2.5 last:border-0">
      <dt className="text-sm text-ink-400">{label}</dt>
      <dd className="text-sm font-medium text-ink-900">{children}</dd>
    </div>
  );
}

export default async function ConsoleProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = (await getConsoleProposal(id)) as Detail | null;

  if (!data?.proposal) notFound();

  const { proposal, creator_email, locations, slots, response } = data;
  const meta = PROPOSAL_TYPE_META[proposal.type as keyof typeof PROPOSAL_TYPE_META];
  const expiree = isPast(proposal.expires_at);

  return (
    <div>
      <Link
        href="/console/invitations"
        className="text-xs font-semibold text-bordeaux-600 underline underline-offset-4 hover:text-bordeaux-500"
      >
        ← Toutes les invitations
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">
          {meta?.emoji} {proposal.recipient_name}
        </h1>
        <p className="mt-1 font-mono text-xs text-ink-400">{proposal.slug}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Invitation</h2>
          <dl className="mt-3">
            <Ligne label="Créateur">{creator_email ?? '—'}</Ligne>
            <Ligne label="Occasion">{meta?.label ?? proposal.type}</Ligne>
            <Ligne label="Statut">
              {PROPOSAL_STATUS_LABEL[proposal.status as keyof typeof PROPOSAL_STATUS_LABEL] ??
                proposal.status}
            </Ligne>
            <Ligne label="Thème">{proposal.theme}</Ligne>
            <Ligne label="Créée le">{formatDateTime(proposal.created_at)}</Ligne>
            <Ligne label="Ouverte le">
              {proposal.viewed_at ? formatDateTime(proposal.viewed_at) : 'Jamais'}
            </Ligne>
            <Ligne label="Expire le">
              <span className={expiree ? 'text-bordeaux-600' : undefined}>
                {formatDateTime(proposal.expires_at)}
                {expiree ? ' (expirée)' : ''}
              </span>
            </Ligne>
            <Ligne label="Photo">{proposal.photo_url ? 'Oui' : 'Non'}</Ligne>
          </dl>

          {proposal.message ? (
            <div className="mt-4 rounded-xl bg-cream-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-600">
                {proposal.message}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Réponse</h2>

          {response ? (
            <dl className="mt-3">
              <Ligne label="Répondu le">{formatDateTime(response.responded_at)}</Ligne>
              <Ligne label="Lieu retenu">
                {locations.find((l) => l.id === response.chosen_location_id)?.label ?? '—'}
              </Ligne>
              <Ligne label="Créneau retenu">
                {(() => {
                  const slot = slots.find((s) => s.id === response.chosen_slot_id);
                  return slot ? formatSlotRange(slot.start_time, slot.end_time) : '—';
                })()}
              </Ligne>
              <Ligne label="Email laissé">{response.recipient_email ?? '—'}</Ligne>
              {response.proposed_start ? (
                <Ligne label="Contre-proposition">
                  {formatSlotRange(response.proposed_start, response.proposed_end ?? response.proposed_start)}
                  {response.proposed_location ? ` · ${response.proposed_location}` : ''}
                </Ligne>
              ) : null}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-400">Pas encore de réponse.</p>
          )}

          {response?.recipient_note ? (
            <div className="mt-4 rounded-xl bg-cream-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                Mot du destinataire
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-600">
                {response.recipient_note}
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            Lieux proposés ({locations.length})
          </h2>
          <ul className="mt-3 space-y-2.5">
            {locations.map((location) => (
              <li key={location.id} className="text-sm">
                <span className="font-medium text-ink-900">{location.label}</span>
                {location.address ? (
                  <span className="block text-xs text-ink-400">{location.address}</span>
                ) : null}
              </li>
            ))}
            {locations.length === 0 ? <li className="text-sm text-ink-400">Aucun.</li> : null}
          </ul>
        </section>

        <section className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
            Créneaux proposés ({slots.length})
          </h2>
          <ul className="mt-3 space-y-2.5">
            {slots.map((slot) => (
              <li key={slot.id} className="text-sm text-ink-600">
                {formatSlotRange(slot.start_time, slot.end_time)}
              </li>
            ))}
            {slots.length === 0 ? <li className="text-sm text-ink-400">Aucun.</li> : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
