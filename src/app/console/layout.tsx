export const metadata = {
  title: { default: 'Console', template: '%s · Console' },
  robots: { index: false, follow: false },
};

/**
 * Enveloppe commune à toute la console, connexion comprise. Elle ne porte
 * aucun contrôle d'accès : la garde vit dans le groupe `(authed)`, pour que
 * `/console/login` reste joignable sans boucler sur lui-même.
 */
export default function ConsoleRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
