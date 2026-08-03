import Image from 'next/image';

const ICON_RATIO = 1427 / 1490;
const LOCKUP_RATIO = 3904 / 1490;

/** Icône seule (clé ailée) : toujours bordeaux, lisible aussi bien sur fond clair que sombre. */
export function BrandIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/icon.png"
      alt=""
      width={Math.round(size * ICON_RATIO)}
      height={size}
      className={className}
    />
  );
}

/**
 * Logo complet (icône + mot-symbole + accroche).
 *
 * Bascule entre les deux fichiers fournis — mot-symbole sombre sur fond
 * clair, pâle sur fond sombre — via la classe `.dark` posée sur `<html>`
 * avant tout rendu (voir `themeBootScript`). Un choix en pur CSS plutôt
 * qu'une détection JS après hydratation, qui ferait clignoter la mauvaise
 * version le temps d'un rendu.
 */
export function BrandLockup({ height = 32, className }: { height?: number; className?: string }) {
  const width = Math.round(height * LOCKUP_RATIO);

  return (
    <span className={`relative inline-block align-middle ${className ?? ''}`} style={{ width, height }}>
      <Image
        src="/brand/logo-light.png"
        alt="Keerelle — la clé qui ouvre un moment"
        width={width}
        height={height}
        className="dark:hidden"
        priority
      />
      <Image
        src="/brand/logo-dark.png"
        alt="Keerelle — la clé qui ouvre un moment"
        width={width}
        height={height}
        className="hidden dark:block"
        priority
      />
    </span>
  );
}
