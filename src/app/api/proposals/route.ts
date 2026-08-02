import { NextResponse, type NextRequest } from 'next/server';

import { getQuotaState, getUserPlan, isUserSuspended } from '@/lib/data/quota';
import { canCreateGroupInvitations } from '@/lib/domain/pricing';
import { generateSlug, proposalUrl } from '@/lib/domain/slug';
import { publicEnv } from '@/lib/env';
import { createClient } from '@/lib/supabase/server';
import { createProposalSchema } from '@/lib/validation/proposal';

/** Nombre de tentatives en cas de collision de slug (extrêmement improbable). */
const SLUG_RETRIES = 5;

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête illisible.' }, { status: 400 });
  }

  const parsed = createProposalSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Formulaire incomplet.',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 422 },
    );
  }

  // Suspension prononcée depuis la console. Contrôlée avant le quota : un
  // compte suspendu n'a pas à savoir où il en est de son plafond.
  if (await isUserSuspended(user.id)) {
    return NextResponse.json(
      {
        error:
          'Votre compte est suspendu. Vos invitations déjà envoyées restent actives, mais la création est bloquée. Contactez-nous pour en savoir plus.',
      },
      { status: 403 },
    );
  }

  const plan = await getUserPlan(user.id);

  // Invitations de groupe : réservées à Premium Gold. Contrôlé ici, pas
  // seulement masqué dans le formulaire — un appel direct à cette route ne
  // doit pas suffire à contourner la formule.
  if (parsed.data.audience === 'group' && !canCreateGroupInvitations(plan)) {
    return NextResponse.json(
      { error: 'Les invitations de groupe sont réservées à la formule Premium Gold.' },
      { status: 403 },
    );
  }

  // Plafond mensuel. Contrôlé ici, côté serveur : l'affichage dans l'interface
  // est une commodité, il ne protège rien.
  const quota = await getQuotaState(user.id, plan);

  if (quota.reached) {
    return NextResponse.json(
      {
        error: `Vous avez atteint la limite de ${quota.plan.maxInvitations} invitations par mois de la formule ${quota.plan.name}. Le compteur repart le 1er du mois prochain.`,
        quota: { used: quota.used, max: quota.plan.maxInvitations, plan: quota.plan.id },
      },
      { status: 402 },
    );
  }

  const input = parsed.data;
  const expiresAt = new Date(Date.now() + input.expiryDays * 24 * 60 * 60 * 1000);

  let proposalId: string | null = null;
  let slug = '';

  for (let attempt = 0; attempt < SLUG_RETRIES; attempt += 1) {
    slug = generateSlug();

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        creator_id: user.id,
        recipient_name: input.recipientName,
        type: input.type,
        audience: input.audience,
        group_capacity: input.audience === 'group' ? (input.groupCapacity ?? null) : null,
        message: input.message ? input.message : null,
        photo_url: input.photoUrl ? input.photoUrl : null,
        theme: input.theme,
        slug,
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (!error && data) {
      proposalId = data.id;
      break;
    }

    // 23505 = violation d'unicité : on retire un nouveau slug.
    if (error && error.code !== '23505') {
      console.error('[proposals] Insertion impossible', error);
      return NextResponse.json({ error: 'Création impossible.' }, { status: 500 });
    }
  }

  if (!proposalId) {
    return NextResponse.json(
      { error: 'Génération du lien impossible. Réessayez.' },
      { status: 500 },
    );
  }

  // Lieux et créneaux. En cas d'échec, on supprime la proposition pour ne pas
  // laisser un lien à moitié constitué.
  if (input.locations.length > 0) {
    const { error } = await supabase.from('proposal_locations').insert(
      input.locations.map((location, index) => ({
        proposal_id: proposalId,
        label: location.label,
        address: location.address ? location.address : null,
        latitude: location.latitude ?? null,
        longitude: location.longitude ?? null,
        position: index,
      })),
    );

    if (error) {
      console.error('[proposals] Insertion des lieux impossible', error);
      await supabase.from('proposals').delete().eq('id', proposalId);
      return NextResponse.json({ error: 'Création impossible.' }, { status: 500 });
    }
  }

  const { error: slotsError } = await supabase.from('proposal_slots').insert(
    input.slots.map((slot, index) => ({
      proposal_id: proposalId,
      start_time: new Date(slot.start).toISOString(),
      end_time: new Date(slot.end).toISOString(),
      position: index,
    })),
  );

  if (slotsError) {
    console.error('[proposals] Insertion des créneaux impossible', slotsError);
    await supabase.from('proposals').delete().eq('id', proposalId);
    return NextResponse.json({ error: 'Création impossible.' }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: proposalId,
      slug,
      url: proposalUrl(publicEnv.siteUrl, slug),
    },
    { status: 201 },
  );
}
