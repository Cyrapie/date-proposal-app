import type { AnalyticsEventType } from '@/lib/validation/analytics';

const VISITOR_ID_KEY = 'kl_visitor_id';

/**
 * Identifiant de visite en `sessionStorage` (pas un cookie) : distingue les
 * visites au sein d'un même onglet sans persister au-delà de la session, donc
 * sans nécessiter de bannière de consentement.
 */
function getVisitorId(): string {
  try {
    const existing = window.sessionStorage.getItem(VISITOR_ID_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    window.sessionStorage.setItem(VISITOR_ID_KEY, id);
    return id;
  } catch {
    // sessionStorage indisponible (navigation privée stricte, etc.) : un id
    // jetable évite de faire échouer le tracking, au prix d'un sur-comptage
    // négligeable des « visiteurs uniques » dans ce cas rare.
    return crypto.randomUUID();
  }
}

type TrackInput = {
  eventType: AnalyticsEventType;
  path: string;
  targetId?: string;
  targetLabel?: string;
  targetHref?: string;
};

/**
 * Le suivi ne couvre que le site public et le dashboard : `/console` (usage
 * de l'admin, pas du trafic du site) et `/d/[slug]` (parcours destinataire,
 * qui a déjà son propre signal `viewed_at`) en sont exclus.
 */
function isTrackedPath(path: string): boolean {
  return !path.startsWith('/console') && !path.startsWith('/d/');
}

function send(input: TrackInput) {
  if (typeof window === 'undefined' || !isTrackedPath(input.path)) return;

  const body = JSON.stringify({ ...input, visitorId: getVisitorId() });

  if (typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
    if (sent) return;
  }

  // Repli si sendBeacon est absent ou refuse (payload trop gros, etc.).
  // Échec silencieux : un beacon raté ne doit jamais gêner la navigation.
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path: string) {
  send({ eventType: 'page_view', path });
}

export function trackSectionView(path: string, id: string, label: string) {
  send({ eventType: 'section_view', path, targetId: id, targetLabel: label });
}

export function trackLinkClick(path: string, id: string, label: string, href: string) {
  send({ eventType: 'link_click', path, targetId: id, targetLabel: label, targetHref: href });
}
