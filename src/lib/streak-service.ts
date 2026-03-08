import { createClient } from "@/lib/supabase/client";

export async function updateStreak(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date")
    .eq("id", user.id)
    .single();

  if (!profile) return;

  const lastActive = profile.last_active_date as string | null;

  if (lastActive === today) return;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  const current = (profile.current_streak as number) ?? 0;
  const longest = (profile.longest_streak as number) ?? 0;

  let newStreak: number;
  if (lastActive === yesterdayStr) {
    newStreak = current + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, longest);

  await supabase
    .from("profiles")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
}
