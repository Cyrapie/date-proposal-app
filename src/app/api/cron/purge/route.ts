import { NextResponse, type NextRequest } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Purge RGPD des invitations expirées.
 *
 * À déclencher par un Cron Vercel (voir vercel.json). Protégé par un secret
 * partagé : Vercel envoie l'en-tête `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET non configuré.' }, { status: 503 });
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const graceDays = Number(process.env.PURGE_GRACE_DAYS ?? 30);
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc('purge_expired_proposals', {
    grace_days: graceDays,
  });

  if (error) {
    console.error('[cron/purge] Purge impossible', error);
    return NextResponse.json({ error: 'Purge impossible.' }, { status: 500 });
  }

  return NextResponse.json({ deleted: data ?? 0, graceDays });
}
