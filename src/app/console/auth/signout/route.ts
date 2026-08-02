import { NextResponse, type NextRequest } from 'next/server';

import { createConsoleClient } from '@/lib/supabase/console';

/**
 * Ferme la session console — et elle seule : la session créateur éventuelle,
 * sur un autre cookie, reste intacte.
 */
export async function POST(request: NextRequest) {
  const supabase = await createConsoleClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/console/login', request.nextUrl.origin), {
    status: 303,
  });
}
