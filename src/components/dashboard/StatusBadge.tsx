import { PROPOSAL_STATUS_LABEL, type ProposalStatus } from '@/lib/domain/proposal';

const STYLES: Record<ProposalStatus, string> = {
  created: 'border-cream-300 bg-cream-100 text-ink-400',
  viewed: 'border-bordeaux-100 bg-bordeaux-50 text-bordeaux-600',
  responded: 'border-accent bg-accent text-accent-ink',
  countered: 'border-bordeaux-500 bg-bordeaux-100 text-bordeaux-700',
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${STYLES[status]}`}
    >
      {PROPOSAL_STATUS_LABEL[status]}
    </span>
  );
}
