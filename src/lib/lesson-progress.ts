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

// ─── user_lesson_progress (scoring, pass/fail, sequential unlock) ───

export interface LessonAttemptResult {
  completed: boolean;
  accuracy_score: number;
  attempts: number;
  best_score: number;
  completed_at: string | null;
}

export interface WrongItem {
  type: "verb" | "practice";
  verbKey?: string;
  tense?: string;
  pronoun?: string;
  userAnswer: string;
  correctAnswer: string;
  sentencePt?: string;
  sentenceEn?: string;
}

export async function getLessonProgressMap(): Promise<
  Record<string, LessonAttemptResult>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, completed, accuracy_score, attempts, best_score, completed_at")
    .eq("user_id", user.id);

  if (error || !data) return {};

  return data.reduce(
    (acc, row) => {
      acc[row.lesson_id] = {
        completed: row.completed ?? false,
        accuracy_score: row.accuracy_score ?? 0,
        attempts: row.attempts ?? 0,
        best_score: row.best_score ?? 0,
        completed_at: row.completed_at ?? null,
      };
      return acc;
    },
    {} as Record<string, LessonAttemptResult>
  );
}

export async function saveLessonAttempt(
  lessonId: string,
  accuracyScore: number,
  completed: boolean,
  wrongItems: WrongItem[]
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: existing } = await supabase
    .from("user_lesson_progress")
    .select("attempts, best_score")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .single();

  const attempts = (existing?.attempts ?? 0) + 1;
  const bestScore = Math.max(
    existing?.best_score ?? 0,
    accuracyScore
  );

  const { error } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        accuracy_score: accuracyScore,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        attempts,
        best_score: bestScore,
        wrong_items: wrongItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

  return !error;
}

export async function getRecentWrongItems(): Promise<
  { lessonId: string; wrongItems: WrongItem[] }[]
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, wrong_items, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data
    .filter((row) => Array.isArray(row.wrong_items) && (row.wrong_items as WrongItem[]).length > 0)
    .map((row) => ({
      lessonId: row.lesson_id,
      wrongItems: row.wrong_items as WrongItem[],
    }));
}
