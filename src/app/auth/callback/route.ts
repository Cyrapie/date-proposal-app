import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * Point d'atterrissage du magic link : échange le code contre une session,
 * puis redirige vers le dashboard (ou la page demandée avant connexion).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  // Only allow relative redirects, so a crafted link can't bounce elsewhere.
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  if (!code) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'invalid_code');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(destination, origin));
}
