import 'server-only';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileEnabled(): boolean {
  return Boolean(
    process.env.TURNSTILE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );
}

/**
 * Valide un jeton Turnstile auprès de Cloudflare.
 *
 * Sans clés configurées, la vérification est neutralisée et retourne `true` :
 * le formulaire reste utilisable en local et le déploiement ne casse pas si
 * les clés arrivent plus tard. Le piège à robots, lui, reste actif en toutes
 * circonstances.
 */
export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  if (!turnstileEnabled()) return { ok: true };

  if (!token) return { ok: false, reason: 'jeton absent' };

  try {
    const body = new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY as string,
      response: token,
    });
    if (remoteIp) body.set('remoteip', remoteIp);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // Cloudflare peut être lent : mieux vaut échouer que bloquer la requête.
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json()) as {
      success?: boolean;
      'error-codes'?: string[];
    };

    if (data.success) return { ok: true };
    return { ok: false, reason: data['error-codes']?.join(', ') ?? 'refusé' };
  } catch (error) {
    console.error('[turnstile] Vérification impossible', error);
    // Cloudflare injoignable : on refuse plutôt que d'ouvrir la porte.
    return { ok: false, reason: 'service de vérification injoignable' };
  }
}
