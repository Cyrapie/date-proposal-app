import 'server-only';

/**
 * Liste des adresses autorisées à ouvrir la console.
 *
 * Volontairement en dur dans le code plutôt qu'en base : c'est la barrière que
 * même un accès en écriture à la table `users` ne suffit pas à franchir.
 * `CONSOLE_ADMIN_EMAILS` (séparées par des virgules) permet de la surcharger
 * sans redéployer, par exemple pour un second opérateur.
 */
const DEFAULT_ALLOWLIST = ['bcyrapie.mail@gmail.com'];

export function consoleAllowlist(): string[] {
  const fromEnv = process.env.CONSOLE_ADMIN_EMAILS;
  const list = fromEnv
    ? fromEnv.split(',').map((entry) => entry.trim()).filter(Boolean)
    : DEFAULT_ALLOWLIST;

  return list.map((email) => email.toLowerCase());
}

export function isAllowedConsoleEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return consoleAllowlist().includes(email.trim().toLowerCase());
}
