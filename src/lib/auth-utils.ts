import { createClient } from "@/lib/supabase/client";

/** Only allow same-origin relative paths as a post-login destination. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export async function signInWithGoogle(next?: string) {
  const supabase = createClient();
  const callback = new URL("/auth/callback", window.location.origin);
  const dest = safeNextPath(next);
  if (dest !== "/") callback.searchParams.set("next", dest);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
    },
  });
  return { data, error };
}
