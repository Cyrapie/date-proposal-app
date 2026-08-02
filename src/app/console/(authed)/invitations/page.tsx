import { ProposalsTable } from '@/components/console/ProposalsTable';
import { listConsoleProposals } from '@/lib/console/data';

export const metadata = { title: 'Invitations' };

export default async function ConsoleProposalsPage() {
  const proposals = await listConsoleProposals();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">Invitations</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          Toutes les invitations, tous comptes confondus. « Désactiver » ramène la date
          d’expiration à maintenant : le lien cesse d’être servi, la trace reste ici.
        </p>
      </header>

      <ProposalsTable proposals={proposals} />
    </div>
  );
}
