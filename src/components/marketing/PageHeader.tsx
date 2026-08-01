import type { ReactNode } from 'react';

/**
 * Bandeau d'en-tête commun à toutes les pages. Uniformise la hauteur, le
 * rythme typographique et la teinte de fond, pour que la navigation d'une
 * page à l'autre ne donne pas l'impression de changer de site.
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  children,
  align = 'left',
}: {
  /** Surtitre court, en capitales. */
  eyebrow: string;
  title: string;
  /** Second morceau de titre, rendu en dégradé bordeaux. */
  accent?: string;
  /** Paragraphe d'introduction. */
  children?: ReactNode;
  align?: 'left' | 'center';
}) {
  const centre = align === 'center';

  return (
    <header className="entete-page border-b border-cream-300">
      <div
        className={`mx-auto w-full max-w-6xl px-5 py-16 sm:py-20 ${
          centre ? 'text-center' : ''
        }`}
      >
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] text-bordeaux-500 ${
            centre ? '' : ''
          }`}
        >
          {eyebrow}
        </p>

        <h1
          className={`mt-4 font-serif text-4xl font-black leading-[1.06] text-ink-900 sm:text-6xl ${
            centre ? 'mx-auto max-w-3xl' : 'max-w-3xl'
          }`}
        >
          {title}
          {accent ? (
            <>
              {' '}
              <span className="gradient-text">{accent}</span>
            </>
          ) : null}
        </h1>

        {children ? (
          <div
            className={`mt-5 text-lg leading-relaxed text-ink-600 ${
              centre ? 'mx-auto max-w-2xl' : 'max-w-2xl'
            }`}
          >
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
