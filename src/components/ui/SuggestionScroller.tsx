/**
 * Bandeau de suggestions qui défile en boucle, en pause au survol ou au
 * focus. Utilisé pour les idées de lieux et pour les messages suggérés :
 * même mécanique, deux jeux de contenu différents.
 */
export function SuggestionScroller({
  items,
  onPick,
  icon = '✨',
  ariaLabel,
}: {
  items: string[];
  onPick: (item: string) => void;
  icon?: string;
  ariaLabel: string;
}) {
  if (items.length === 0) return null;

  // Dupliquée : la piste peut boucler sans coupure visible (voir globals.css).
  const track = [...items, ...items];
  // Vitesse proportionnée à la longueur de la liste plutôt qu'une durée
  // fixe : une liste à deux idées ne doit pas défiler aussi lentement qu'une
  // à huit.
  const dureeSecondes = Math.max(12, items.length * 4);

  return (
    <div className="suggestion-scroller" role="group" aria-label={ariaLabel}>
      <div
        className="suggestion-scroller-track"
        style={{ animationDuration: `${dureeSecondes}s` }}
      >
        {track.map((item, index) => {
          // La seconde moitié est une copie purement visuelle : hors du
          // parcours clavier et invisible aux lecteurs d'écran.
          const doublon = index >= items.length;
          return (
            <button
              key={`${item}-${index}`}
              type="button"
              onClick={() => onPick(item)}
              tabIndex={doublon ? -1 : 0}
              aria-hidden={doublon || undefined}
              className="suggestion-pill"
            >
              <span aria-hidden="true">{icon}</span> {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}
