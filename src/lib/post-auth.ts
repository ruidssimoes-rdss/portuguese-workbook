import { hasCompletedOnboarding } from "@/lib/onboarding-service";
import { safeNextPath } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/client";

/**
 * After a successful sign-in or confirmed sign-up: new accounts go to
 * onboarding, and anyone who already finished it goes to the app
 * (or to a safe `next` path).
 */
export async function pathAfterAuth(next: string | null | undefined): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return safeNextPath(next);
  const done = await hasCompletedOnboarding();
  if (!done) return "/onboarding";
  return safeNextPath(next);
}
