import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { trackEventSchema } from '@/lib/validation/analytics';

/**
 * Réception des événements analytics (vue de page, vue de section, clic de
 * lien), envoyés en best-effort via `navigator.sendBeacon`.
 *
 * Toujours répondre avec succès : un beacon raté ne doit jamais faire échouer
 * la page qui l'a émis. Les erreurs partent uniquement dans les logs serveur.
 */
export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const parsed = trackEventSchema.safeParse(payload);
  if (!parsed.success) {
    return new NextResponse(null, { status: 204 });
  }

  const input = parsed.data;

  // Connu uniquement sur les pages authentifiées (dashboard) : aucune session
  // cookie sur les pages marketing, donc `null` là-bas.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await createAdminClient()
    .from('analytics_events')
    .insert({
      event_type: input.eventType,
      path: input.path,
      target_id: input.targetId || null,
      target_label: input.targetLabel || null,
      target_href: input.targetHref || null,
      visitor_id: input.visitorId,
      user_id: user?.id ?? null,
    });

  if (error) {
    console.error('[track] Écriture impossible', error);
  }

  return new NextResponse(null, { status: 204 });
}
