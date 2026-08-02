import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Rafraîchit la session Supabase à chaque requête et protège /dashboard,
 * /admin et /console.
 *
 * Deux sessions cohabitent sur le même domaine, sur deux préfixes de cookie
 * distincts : celle du créateur (`sb-`, par défaut) et celle de la console
 * (`otyche-console`). Une requête vers /console ne touche donc jamais la
 * session créateur, et réciproquement.
 *
 * Next.js 16 a renommé `middleware.ts` en `proxy.ts` — ce fichier remplit le
 * rôle de l'ancien middleware.
 */

// Dupliqué depuis `lib/supabase/console.ts` : ce module tourne dans le runtime
// proxy, qui ne peut pas importer un fichier marqué `server-only`.
const CONSOLE_COOKIE_NAME = 'otyche-console';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Sans configuration Supabase, on laisse passer : les pages concernées
  // afficheront un message d'installation plutôt qu'une erreur opaque.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const { pathname } = request.nextUrl;
  const isConsole = pathname.startsWith('/console');

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    // Sur /console, on rafraîchit la session console et elle seule.
    ...(isConsole ? { cookieOptions: { name: CONSOLE_COOKIE_NAME } } : {}),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isConsole) {
    // La console porte sa propre page de connexion et son propre callback :
    // ils doivent rester joignables sans session.
    const estPublic =
      pathname === '/console/login' || pathname.startsWith('/console/auth');

    if (!user && !estPublic) {
      return NextResponse.redirect(new URL('/console/login', request.url));
    }

    // Le contrôle complet (allowlist d'emails + `is_super_admin`) se fait dans
    // `getConsoleAdmin`. Ici on n'exige qu'une session : le proxy n'a pas
    // accès à la base.
    return response;
  }

  // Le contrôle « est-ce un super-admin ? » se fait dans la page /admin elle-
  // même (lecture RLS de sa propre ligne). Ici, on ne fait qu'exiger une
  // session, comme pour /dashboard.
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Toutes les routes sauf : fichiers statiques, images, métadonnées.
     * Le parcours destinataire /d/[slug] passe par ici sans être protégé —
     * il n'a besoin d'aucune session.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
