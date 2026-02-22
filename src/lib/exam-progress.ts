import { createClient } from "@/lib/supabase/client";

// ═══════════════════════════════════════════════════
// Exam Progress — Supabase Integration
// ═══════════════════════════════════════════════════

export interface SectionScore {
  sectionId: string;
  sectionType: "reading-writing" | "listening" | "speaking";
  pointsEarned: number;
  pointsTotal: number;
  percentage: number;
}

export interface ExamResult {
  examId: string;
  overallScore: number;
  classification: string;
  sectionScores: SectionScore[];
  answers: Record<string, unknown>;
  completedAt: string;
}

/**
 * Save an exam result to Supabase.
 * Uses upsert so retaking an exam overwrites the previous result.
 */
export async function saveExamResult(
  examId: string,
  result: Omit<ExamResult, "examId" | "completedAt">
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("exam_results").upsert(
    {
      user_id: user.id,
      exam_id: examId,
      overall_score: result.overallScore,
      classification: result.classification,
      section_scores: result.sectionScores,
      answers: result.answers,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,exam_id" }
  );

  return !error;
}

/**
 * Get a single exam result for the current user.
 */
export async function getExamResult(
  examId: string
): Promise<ExamResult | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("exam_results")
    .select("*")
    .eq("user_id", user.id)
    .eq("exam_id", examId)
    .single();

  if (error || !data) return null;

  return {
    examId: data.exam_id,
    overallScore: data.overall_score,
    classification: data.classification,
    sectionScores: data.section_scores as SectionScore[],
    answers: data.answers as Record<string, unknown>,
    completedAt: data.completed_at,
  };
}

/**
 * Get all exam results for the current user.
 */
export async function getAllExamResults(): Promise<
  Record<string, ExamResult>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("exam_results")
    .select("*")
    .eq("user_id", user.id);

  if (error || !data) return {};

  const results: Record<string, ExamResult> = {};
  data.forEach((row) => {
    results[row.exam_id] = {
      examId: row.exam_id,
      overallScore: row.overall_score,
      classification: row.classification,
      sectionScores: row.section_scores as SectionScore[],
      answers: row.answers as Record<string, unknown>,
      completedAt: row.completed_at,
    };
  });

  return results;
}

// ═══════════════════════════════════════════════════
// SQL Migration (for reference)
// ═══════════════════════════════════════════════════
//
// create table if not exists exam_results (
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid references auth.users(id) on delete cascade,
//   exam_id text not null,
//   overall_score numeric not null,
//   classification text not null,
//   section_scores jsonb not null,
//   answers jsonb not null,
//   completed_at timestamptz default now(),
//   unique(user_id, exam_id)
// );
//
// -- RLS policies
// alter table exam_results enable row level security;
//
// create policy "Users can read own exam results"
//   on exam_results for select
//   using (auth.uid() = user_id);
//
// create policy "Users can insert own exam results"
//   on exam_results for insert
//   with check (auth.uid() = user_id);
//
// create policy "Users can update own exam results"
//   on exam_results for update
//   using (auth.uid() = user_id);
