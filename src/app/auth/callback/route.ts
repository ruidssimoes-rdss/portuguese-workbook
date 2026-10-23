import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NEXT_COOKIE, safeNextPath } from "@/lib/safe-next";
import type { SupabaseClient } from "@supabase/supabase-js";

async function destinationAfterSession(supabase: SupabaseClient, next: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return next;
  if (user.user_metadata?.onboarding_completed === true) return next;

  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return next;
  const done = (data as { onboarding_completed?: boolean | null } | null)?.onboarding_completed === true;
  return done ? next : "/onboarding";
}

function readCookie(header: string | null, name: string): string | null {
  const match = header?.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next") ?? readCookie(request.headers.get("cookie"), NEXT_COOKIE));
  
  // Check for Supabase OAuth errors
  const error = searchParams.get("error");
  const errorCode = searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  const redirectTo = (url: string) => {
    const res = NextResponse.redirect(url);
    res.cookies.set(NEXT_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  };
  
  // If Supabase sent OAuth errors, redirect to login with those params
  if (error || errorCode) {
    const params = new URLSearchParams();
    if (error) params.set("error", error);
    if (errorCode) params.set("error_code", errorCode);
    if (errorDescription) params.set("error_description", errorDescription);
    return redirectTo(`${origin}/auth/login?${params.toString()}`);
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (type === "recovery") {
          return redirectTo(`${origin}/auth/update-password`);
        }
        const dest = await destinationAfterSession(supabase, next);
        return redirectTo(`${origin}${dest}`);
      }
    } catch {
      // Env missing or exchange failed — redirect to login
    }
  }

  return redirectTo(`${origin}/auth/login?error=auth_callback_error`);
}
