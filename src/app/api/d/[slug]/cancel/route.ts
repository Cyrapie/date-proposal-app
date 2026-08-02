import { NextResponse, type NextRequest } from 'next/server';

import { getProposalBySlug } from '@/lib/data/proposals';
import { notifyPromotedParticipant } from '@/lib/data/group-promotion';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Annulation d'une place, par le participant lui-même — jamais en `GET` :
 * beaucoup de clients email pré-chargent les liens des messages qu'ils
 * reçoivent, ce qui annulerait silencieusement une place sans qu'elle l'ait
 * réellement voulu. Le lien de l'email mène à une page de confirmation, dont
 * le bouton déclenche cette route en `POST`.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const body = payload as { r?: unknown; t?: unknown };
  const responseId = typeof body?.r === 'string' ? body.r : null;
  const token = typeof body?.t === 'string' ? body.t : null;

  if (!responseId || !token) {
    return NextResponse.json({ error: 'Lien invalide.' }, { status: 422 });
  }

  const proposal = await getProposalBySlug(slug);
  if (!proposal) {
    return NextResponse.json({ error: 'Invitation introuvable.' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('cancel_group_response', {
    p_response_id: responseId,
    p_cancel_token: token,
  });

  if (error) {
    console.error('[cancel] Annulation impossible', error);
    return NextResponse.json({ error: 'Annulation impossible.' }, { status: 500 });
  }

  const result = data?.[0];
  if (!result?.cancelled) {
    return NextResponse.json({ error: 'Lien invalide ou déjà utilisé.' }, { status: 404 });
  }

  if (result.promoted_id && result.promoted_email) {
    void notifyPromotedParticipant(
      proposal,
      result.promoted_id,
      result.promoted_email,
      result.promoted_participant_name ?? '',
    );
  }

  return NextResponse.json({ ok: true });
}
