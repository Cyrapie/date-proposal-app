import { getConsoleHealth } from '@/lib/console/data';
import { formatDateTime } from '@/lib/format';

export const metadata = { title: 'Système' };

/**
 * Présence des variables d'environnement sensibles.
 *
 * Seule leur PRÉSENCE est évaluée, jamais leur valeur : rien de secret ne
 * traverse le rendu.
 */
function configuration() {
  return [
    {
      cle: 'SUPABASE_SERVICE_ROLE_KEY',
      present: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      role: 'Lecture des données de tous les comptes',
      critique: true,
    },
    {
      cle: 'RESEND_API_KEY',
      present: Boolean(process.env.RESEND_API_KEY),
      role: 'Envoi des emails — sans elle, ils sont seulement journalisés',
      critique: true,
    },
    {
      cle: 'CRON_SECRET',
      present: Boolean(process.env.CRON_SECRET),
      role: 'Protège la route de purge des invitations expirées',
      critique: true,
    },
    {
      cle: 'TURNSTILE_SECRET_KEY',
      present: Boolean(process.env.TURNSTILE_SECRET_KEY),
      role: 'Anti-robot des formulaires — sans elle, la vérification est neutralisée',
      critique: false,
    },
    {
      cle: 'NEXT_PUBLIC_SITE_URL',
      present: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      role: 'Base des liens envoyés par email',
      critique: true,
    },
  ];
}

function Metrique({
  label,
  value,
  hint,
  alerte,
}: {
  label: string;
  value: string | number;
  hint?: string;
  alerte?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">{label}</p>
      <p
        className={`mt-2 font-serif text-3xl font-black ${
          alerte ? 'text-bordeaux-600' : 'text-ink-900'
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-400">{hint}</p> : null}
    </div>
  );
}

export default async function ConsoleSystemPage() {
  const health = await getConsoleHealth();
  const config = configuration();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-black text-ink-900">État du système</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
          Santé de la base et configuration du déploiement. Seule la présence des variables est
          vérifiée — aucune valeur secrète n’est lue ni affichée.
        </p>
      </header>

      {!health ? (
        <p role="alert" className="rounded-xl bg-bordeaux-50 px-4 py-3 text-sm text-bordeaux-700">
          La base n’a pas répondu. Vérifiez la clé <code>SUPABASE_SERVICE_ROLE_KEY</code> et l’état
          du projet Supabase.
        </p>
      ) : (
        <>
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">Base</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metrique label="Comptes" value={health.usersTotal} />
              <Metrique
                label="Comptes suspendus"
                value={health.usersSuspended}
                alerte={health.usersSuspended > 0}
              />
              <Metrique label="Invitations" value={health.proposalsTotal} />
              <Metrique label="Réponses" value={health.responsesTotal} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              Expiration et purge
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metrique
                label="Expirées"
                value={health.proposalsExpired}
                hint="Contenu déjà inaccessible ; les lignes partent au prochain passage du cron de purge."
                alerte={health.proposalsExpired > 0}
              />
              <Metrique
                label="Expirent sous 7 jours"
                value={health.proposalsExpiring7d}
              />
              <Metrique
                label="Lieux orphelins"
                value={health.orphanLocations}
                hint="Devrait rester à zéro : la suppression est en cascade."
                alerte={health.orphanLocations > 0}
              />
              <Metrique
                label="Créneaux orphelins"
                value={health.orphanSlots}
                hint="Devrait rester à zéro."
                alerte={health.orphanSlots > 0}
              />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
              Dernière activité
            </h2>
            <dl className="mt-3 rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
              {[
                { label: 'Heure de la base', valeur: health.dbTime },
                { label: 'Dernière inscription', valeur: health.lastSignupAt },
                { label: 'Dernière invitation créée', valeur: health.lastProposalAt },
                { label: 'Dernière réponse reçue', valeur: health.lastResponseAt },
                { label: 'Dernière action d’admin', valeur: health.lastAuditAt },
              ].map((ligne) => (
                <div
                  key={ligne.label}
                  className="flex flex-wrap justify-between gap-3 border-b border-cream-200 py-2.5 last:border-0"
                >
                  <dt className="text-sm text-ink-400">{ligne.label}</dt>
                  <dd className="text-sm font-medium text-ink-900">
                    {ligne.valeur ? formatDateTime(ligne.valeur) : 'Jamais'}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      )}

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-400">
          Configuration
        </h2>
        <ul className="mt-3 rounded-[var(--radius-card)] border border-cream-300 bg-cream-50 p-5">
          {config.map((entree) => (
            <li
              key={entree.cle}
              className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-200 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm text-ink-900">{entree.cle}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-400">{entree.role}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  entree.present
                    ? 'bg-cream-200 text-ink-600'
                    : entree.critique
                      ? 'bg-bordeaux-100 text-bordeaux-700'
                      : 'bg-cream-200 text-ink-400'
                }`}
              >
                {entree.present ? 'Configurée' : entree.critique ? 'Manquante' : 'Non configurée'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
