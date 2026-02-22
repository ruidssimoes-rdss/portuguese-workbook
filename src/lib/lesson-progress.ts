import { createClient } from "@/lib/supabase/client";

export async function getLessonProgress(
  lessonId: string
): Promise<Record<string, boolean>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("item_id, completed")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId);

  if (error || !data) return {};

  return data.reduce(
    (acc, row) => {
      acc[row.item_id] = row.completed;
      return acc;
    },
    {} as Record<string, boolean>
  );
}

export async function toggleLessonItem(
  lessonId: string,
  itemId: string,
  completed: boolean
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      item_id: itemId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    {
      onConflict: "user_id,lesson_id,item_id",
    }
  );

  return !error;
}

export async function getAllLessonProgress(): Promise<
  Record<string, { completed: number; total: number }>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id);

  if (error || !data) return {};

  const result: Record<string, { completed: number; total: number }> = {};
  data.forEach((row) => {
    if (!result[row.lesson_id])
      result[row.lesson_id] = { completed: 0, total: 0 };
    result[row.lesson_id].total++;
    if (row.completed) result[row.lesson_id].completed++;
  });

  return result;
}

export async function completeLessonFull(
  lessonId: string,
  itemIds: string[]
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const records = itemIds.map((itemId) => ({
    user_id: user.id,
    lesson_id: lessonId,
    item_id: itemId,
    completed: true,
    completed_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(records, { onConflict: "user_id,lesson_id,item_id" });

  return !error;
}
