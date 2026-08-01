import { themeStyle, type Theme } from '@/lib/domain/themes';

export function ExpiredLink({ theme }: { theme: Theme }) {
  return (
    <main
      className="themed flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center"
      style={themeStyle(theme)}
    >
      <div className="max-w-sm">
        <p className="font-serif text-5xl" aria-hidden="true">
          🕰️
        </p>
        <h1 className="mt-6 font-serif text-3xl" style={{ color: 'var(--theme-accent)' }}>
          Ce lien a expiré
        </h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          Les invitations ont une durée de vie limitée : passé ce délai, leur contenu n&apos;est
          plus consultable. Demandez à la personne qui vous l&apos;a envoyée d&apos;en générer une
          nouvelle.
        </p>
      </div>
    </main>
  );
}
