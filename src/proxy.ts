import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Routes that need a signed-in user. Everything else (Hoje, vocabulary,
 * grammar, conjugations, culture, guide, the lessons and exams indexes, auth
 * and onboarding screens) stays public. API routes answer 401 themselves.
 */
const PROTECTED_EXACT = new Set(["/progress", "/notes", "/calendar", "/settings", "/learn"]);
const PROTECTED_PREFIXES = ["/lessons/", "/exams/"];

function isProtected(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return PROTECTED_EXACT.has(path) || PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });
  // Refresh session — do NOT remove this line
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && isProtected(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/auth/login";
    login.search = "";
    login.searchParams.set("next", `${pathname}${search}`);
    const redirect = NextResponse.redirect(login);
    // Keep any refreshed/cleared auth cookies on the redirect.
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
