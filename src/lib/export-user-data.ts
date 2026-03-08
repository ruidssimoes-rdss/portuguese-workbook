import { createClient } from "@/lib/supabase/client";

export async function exportUserData(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const [profileRes, lessonsRes, notesRes, eventsRes, goalsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_lesson_progress").select("*").eq("user_id", user.id),
    supabase.from("user_notes").select("*").eq("user_id", user.id),
    supabase.from("user_calendar_events").select("*").eq("user_id", user.id),
    supabase.from("user_goals").select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    profile: profileRes.data,
    lessonProgress: lessonsRes.data ?? [],
    notes: notesRes.data ?? [],
    calendarEvents: eventsRes.data ?? [],
    goals: goalsRes.data ?? [],
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aula-pt-data-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
