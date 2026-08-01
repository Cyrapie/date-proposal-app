import { NextResponse } from 'next/server';

import { getProposalBySlug, isExpired, markProposalViewed } from '@/lib/data/proposals';

/**
 * Marque la proposition comme « vue » à la première ouverture du lien.
 * Idempotent, sans authentification : le destinataire n'a pas de compte.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const proposal = await getProposalBySlug(slug);

    if (!proposal || isExpired(proposal)) {
      // On ne distingue pas « inexistant » de « expiré » : pas d'énumération.
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await markProposalViewed(proposal.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[view] Marquage impossible', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
