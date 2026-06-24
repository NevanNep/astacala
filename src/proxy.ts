import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that require an authenticated (relawan) session. Anyone hitting these
// without a valid Supabase session is bounced to /login. The public landing
// page ("/"), published berita ("/berita"), and the auth pages stay open.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/misi",
  "/notifikasi",
  "/report",
  "/security",
];

// Admin area. Authentication is enforced here; the admin *role* check still
// lives in the admin pages/route handlers (proxy only has the auth session,
// not the profile role).
const ADMIN_PREFIX = "/admin";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function requiresAuth(pathname: string) {
  return (
    matchesPrefix(pathname, ADMIN_PREFIX) ||
    PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))
  );
}

export async function proxy(request: NextRequest) {
  // Bridge cookies between the incoming request and the outgoing response so
  // Supabase can refresh the session (rotate tokens) on every request. This is
  // the session-refresh layer that the server client in
  // `utils/supabase/server.ts` relies on.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() validates the token against Supabase Auth. Do not use
  // getSession() here — it does not verify the JWT and can be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && requiresAuth(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    // Preserve where the user was heading so login can send them back.
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (route handlers enforce their own auth and must not be redirected)
     * - _next/static, _next/image (build assets)
     * - favicon.ico and common static image/font assets in /public
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$).*)",
  ],
};
