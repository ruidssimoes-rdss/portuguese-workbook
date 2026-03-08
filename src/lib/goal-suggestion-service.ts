import { createClient } from "@/lib/supabase/client";
import { getStudyDaysBetween, generateGoalPlan } from "./goals";
import { createGoalWithEvents } from "./goals-service";
import { getLessonProgressMap } from "./lesson-progress";

const GOAL_SUGGESTIONS: Record<
  string,
  { goalType: string; titlePt: string; titleEn: string; description: string }
> = {
  "reach-a2": {
    goalType: "lessons_a1",
    titlePt: "Completar todas as lições A1",
    titleEn: "Complete all A1 lessons first",
    description: "Para alcançar o A2, primeiro tens de dominar o A1.",
  },
  "reach-b1": {
    goalType: "lessons_a1",
    titlePt: "Completar todas as lições A1",
    titleEn: "Start your journey to B1",
    description: "Passo a passo — começa pelo A1.",
  },
  "pass-ciple-a2": {
    goalType: "lessons_a1",
    titlePt: "Preparar para o CIPLE A2",
    titleEn: "Prepare for the CIPLE A2 exam",
    description: "Completa as lições A1 para desbloquear exames simulados.",
  },
  "pass-ciple-b1": {
    goalType: "lessons_a1",
    titlePt: "Preparar para o CIPLE B1",
    titleEn: "Prepare for the CIPLE B1 exam",
    description: "Começa pelo A1 e vai subindo de nível.",
  },
  conversational: {
    goalType: "lessons_a1",
    titlePt: "Conseguir conversar em português",
    titleEn: "Become conversational",
    description: "As lições levam-te lá — passo a passo.",
  },
};

export interface GoalSuggestionResult {
  goalType: string;
  titlePt: string;
  description: string;
  estimatedDate: string;
  estimatedDateIso: string;
  targetDescription: string;
  studyDaysPerWeek: number;
}

/** Pick goal type based on progress: A1 done → lessons_a2, A2 done → lessons_b1, all done → null. */
function suggestGoalType(
  _targetGoal: string,
  a1Completed: number,
  a2Completed: number,
  b1Completed: number,
  totalA1: number,
  totalA2: number,
  totalB1: number
): string | null {
  if (a1Completed < totalA1) return "lessons_a1";
  if (a2Completed < totalA2) return "lessons_a2";
  if (b1Completed < totalB1) return "lessons_b1";
  return null;
}

/** Estimate completion date: from today, spread remaining items across study days. */
function estimateCompletionDate(
  remainingItems: number,
  studyDaysPerWeek: number
): string {
  if (remainingItems <= 0) return new Date().toISOString().slice(0, 10);
  const n = Math.min(7, Math.max(1, Math.round(studyDaysPerWeek)));
  const studyDays = Array.from({ length: n }, (_, i) => i + 1);
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + 365);
  const available = getStudyDaysBetween(from, to, studyDays);
  const index = Math.min(remainingItems - 1, available.length - 1);
  return index >= 0 ? available[index] : from.toISOString().slice(0, 10);
}

export async function getGoalSuggestion(
  totalLessonsCompleted: number,
  a1Count: number,
  a2Count: number,
  b1Count: number,
  targetGoal: string,
  studyDaysPerWeek: number,
  activeGoalsCount: number,
  suggestionDismissed: boolean,
  suggestionDismissedAt: string | null
): Promise<GoalSuggestionResult | null> {
  if (activeGoalsCount > 0) return null;
  const base = GOAL_SUGGESTIONS[targetGoal];
  if (!base) return null;
  if (suggestionDismissed && suggestionDismissedAt) {
    const dismissed = new Date(suggestionDismissedAt);
    const daysSince = (Date.now() - dismissed.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 7) return null;
  }

  const totalA1 = 18;
  const totalA2 = 16;
  const totalB1 = 10;
  const a1Completed = Math.min(a1Count, totalA1);
  const a2Completed = Math.min(a2Count, totalA2);
  const b1Completed = Math.min(b1Count, totalB1);

  const goalType = suggestGoalType(
    targetGoal,
    a1Completed,
    a2Completed,
    b1Completed,
    totalA1,
    totalA2,
    totalB1
  );
  if (!goalType) return null;

  let remaining = 0;
  if (goalType === "lessons_a1") remaining = totalA1 - a1Completed;
  else if (goalType === "lessons_a2") remaining = totalA2 - a2Completed;
  else if (goalType === "lessons_b1") remaining = totalB1 - b1Completed;
  if (remaining <= 0) return null;

  const titles: Record<string, string> = {
    lessons_a1: "Completar todas as lições A1",
    lessons_a2: "Completar todas as lições A2",
    lessons_b1: "Completar todas as lições B1",
  };
  const targetDescriptions: Record<string, string> = {
    "reach-a2": "alcançar o nível A2",
    "reach-b1": "alcançar o nível B1",
    "pass-ciple-a2": "passar o exame CIPLE A2",
    "pass-ciple-b1": "passar o exame CIPLE B1",
    conversational: "conseguir conversar em português",
  };

  const estimatedDateIso = estimateCompletionDate(remaining, studyDaysPerWeek);
  const d = new Date(estimatedDateIso + "T12:00:00");
  const estimatedDate = `${d.getDate()} de ${["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][d.getMonth()]}`;

  return {
    goalType,
    titlePt: titles[goalType] ?? base.titlePt,
    description: base.description,
    estimatedDate,
    estimatedDateIso,
    targetDescription: targetDescriptions[targetGoal] ?? "o teu objetivo",
    studyDaysPerWeek,
  };
}

export async function dismissGoalSuggestion(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({
      goal_suggestion_dismissed: true,
      goal_suggestion_dismissed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  return !error;
}

export async function markStreakMilestoneSeen(streak: number): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({
      last_milestone_seen: streak,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  return !error;
}

export async function markProgressMilestoneSeen(milestoneType: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from("profiles")
    .update({
      last_progress_milestone_seen: milestoneType,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  return !error;
}

/** Create a lesson goal from the suggestion (lessons_a1, lessons_a2, or lessons_b1). */
export async function createSuggestedGoal(
  goalType: string,
  targetDate: string,
  studyDaysPerWeek: number
): Promise<boolean> {
  const n = Math.min(7, Math.max(1, Math.round(studyDaysPerWeek)));
  const studyDays = Array.from({ length: n }, (_, i) => i + 1);

  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(targetDate + "T23:59:59");
  const availableDays = getStudyDaysBetween(from, to, studyDays);

  const lessons = (await import("@/data/resolve-lessons")).getResolvedLessons();
  const progressMap = await getLessonProgressMap();
  const completed = new Set(Object.entries(progressMap).filter(([, p]) => p.completed).map(([id]) => id));

  let items: { id: string; title: string }[] = [];
  if (goalType === "lessons_a1") {
    const a1 = lessons.filter((l) => l.cefr === "A1");
    items = a1.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
  } else if (goalType === "lessons_a2") {
    const a2 = lessons.filter((l) => l.cefr === "A2");
    items = a2.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
  } else if (goalType === "lessons_b1") {
    const b1 = lessons.filter((l) => l.cefr === "B1");
    items = b1.filter((l) => !completed.has(l.id)).map((l) => ({ id: l.id, title: l.ptTitle ?? l.title }));
  }
  if (items.length === 0) return false;

  const totalItems = goalType === "lessons_a1" ? 18 : goalType === "lessons_a2" ? 16 : 10;
  const completedItems = totalItems - items.length;
  const plan = generateGoalPlan(items, availableDays, "lesson");
  const result = await createGoalWithEvents({
    goalType,
    targetDate,
    studyDays,
    totalItems,
    completedItems,
    events: plan.map((e) => ({ title: e.title, date: e.date, linkedId: e.linkedId, linkedType: e.linkedType })),
  });
  return result != null;
}
