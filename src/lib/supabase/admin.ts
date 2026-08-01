import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';
import { requirePublicEnv, requireServiceRoleKey } from '@/lib/env';

/**
 * Client `service_role` : contourne RLS.
 *
 * Réservé au parcours destinataire (non authentifié) — lecture d'une
 * proposition par son slug, marquage « vue », enregistrement de la réponse.
 * Ne doit jamais être importé depuis un composant client : le garde
 * `server-only` fait échouer le build si c'était le cas.
 */
export function createAdminClient() {
  const { supabaseUrl } = requirePublicEnv();
  return createClient<Database>(supabaseUrl, requireServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
