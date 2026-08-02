import { UsersTable } from '@/components/console/UsersTable';
import { listConsoleUsers } from '@/lib/console/data';

export const metadata = { title: 'Utilisateurs' };

export default async function ConsoleUsersPage() {
  const users = await listConsoleUsers();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">Utilisateurs</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          Formule, suspension et suppression. Un compte suspendu conserve ses invitations
          existantes — elles restent consultables par leurs destinataires — mais ne peut plus en
          créer. Chaque action est inscrite au journal.
        </p>
      </header>

      <UsersTable users={users} />
    </div>
  );
}
