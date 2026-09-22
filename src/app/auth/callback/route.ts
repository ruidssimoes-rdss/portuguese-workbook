import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        if (type === "recovery") {
          return NextResponse.redirect(`${origin}/auth/update-password`);
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Env missing or exchange failed — redirect to login
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_error`);
}
