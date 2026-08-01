import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import { getCurrentSuperAdmin, setCreatorPlan } from '@/lib/data/admin';

const bodySchema = z.object({
  plan: z.enum(['free', 'premium', 'gold']),
});

/**
 * Changement manuel de formule. Ne fait jamais confiance au fait que la
 * requête vienne de la page /admin : revérifie le statut super-admin ici,
 * indépendamment de l'écran qui a émis l'appel.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentSuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Accès refusé.' }, { status: 403 });
  }

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Formule invalide.' }, { status: 422 });
  }

  const result = await setCreatorPlan(id, parsed.data.plan);
  if (!result.ok) {
    return NextResponse.json({ error: 'Changement impossible.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
