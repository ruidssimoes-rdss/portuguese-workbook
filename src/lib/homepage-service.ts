import { createClient } from "@/lib/supabase/client";
import { getLessonProgressMap, getRecentWrongItems } from "./lesson-progress";
import { getEventsInRange } from "./calendar-service";
import { getResolvedLessons } from "@/data/resolve-lessons";
import { getCurriculumLesson } from "@/data/resolve-lessons";
import type { WrongItem } from "./lesson-progress";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";

const vocab = vocabData as { categories: Array<{ id: string; title: string }> };
const grammar = grammarData as {
  topics: Record<string, { id: string; title: string; titlePt?: string }>;
};

export interface HomepageData {
  displayName: string;
  onboarding: {
    learningMotivation: string;
    selfAssessedLevel: string;
    studyDaysPerWeek: number;
    targetGoal: string;
    targetDate?: string;
  };
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalLessonsCompleted: number;
  currentCefrLevel: "A1" | "A2" | "B1";
  currentLevelProgress: { completed: number; total: number };
  nextLesson: { id: string; title: string; titlePt: string; cefr: string } | null;
  weeklyStudyDays: number;
  weeklyTargetDays: number;
  weekDayActivity: boolean[];
  weakVerbs: string[];
  weakCategories: { id: string; title: string }[];
  weakGrammar: { slug: string; title: string }[];
  totalWordsEncountered: number;
  totalVerbsDrilled: number;
}

function getWeekRange(date: Date): { weekStart: string; weekEnd: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  const toKey = (x: Date) =>
    `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  const weekStart = toKey(d);
  d.setDate(d.getDate() + 6);
  const weekEnd = toKey(d);
  return { weekStart, weekEnd };
}

const A1_ORDERS = [1, 18];
const A2_ORDERS = [19, 34];
const B1_ORDERS = [35, 44];

export async function getHomepageData(): Promise<HomepageData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, learning_motivation, self_assessed_level, study_days_per_week, target_goal, target_date, current_streak, longest_streak, last_active_date")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const progressMap = await getLessonProgressMap();
  const lessons = getResolvedLessons().sort((a, b) => a.order - b.order);
  const totalLessonsCompleted = Object.values(progressMap).filter((p) => p.completed).length;

  let nextLesson: HomepageData["nextLesson"] = null;
  let currentCefrLevel: "A1" | "A2" | "B1" = "A1";
  let currentLevelProgress: { completed: number; total: number } = { completed: 0, total: 18 };

  const firstIncomplete = lessons.find((l) => !progressMap[l.id]?.completed);
  if (firstIncomplete) {
    nextLesson = {
      id: firstIncomplete.id,
      title: firstIncomplete.title,
      titlePt: firstIncomplete.ptTitle ?? firstIncomplete.title,
      cefr: firstIncomplete.cefr,
    };
    const order = firstIncomplete.order;
    if (order >= 1 && order <= 18) {
      currentCefrLevel = "A1";
      currentLevelProgress = {
        completed: lessons.filter((l) => l.order >= 1 && l.order <= 18 && progressMap[l.id]?.completed).length,
        total: 18,
      };
    } else if (order >= 19 && order <= 34) {
      currentCefrLevel = "A2";
      currentLevelProgress = {
        completed: lessons.filter((l) => l.order >= 19 && l.order <= 34 && progressMap[l.id]?.completed).length,
        total: 16,
      };
    } else {
      currentCefrLevel = "B1";
      currentLevelProgress = {
        completed: lessons.filter((l) => l.order >= 35 && l.order <= 44 && progressMap[l.id]?.completed).length,
        total: 10,
      };
    }
  } else {
    currentCefrLevel = "B1";
    currentLevelProgress = { completed: 10, total: 10 };
  }

  const { weekStart, weekEnd } = getWeekRange(new Date());
  const weekEvents = await getEventsInRange(weekStart, weekEnd);
  const activeDates = new Set(weekEvents.map((e) => e.event_date));
  const weeklyStudyDays = activeDates.size;
  const weeklyTargetDays = (profile.study_days_per_week as number) ?? 3;
  const weekDayActivity: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    weekDayActivity.push(activeDates.has(key));
  }

  const recentWrong = await getRecentWrongItems();
  const weakVerbsSet = new Set<string>();
  const weakCategoryIds = new Set<string>();
  const weakGrammarSlugs = new Set<string>();
  for (const { lessonId, wrongItems } of recentWrong) {
    const curriculum = getCurriculumLesson(lessonId);
    for (const item of wrongItems as WrongItem[]) {
      if (item.type === "verb" && item.verbKey) {
        weakVerbsSet.add(item.verbKey);
      }
      if (item.type === "practice" && curriculum) {
        const voc = curriculum.stages.vocabulary.words;
        if (voc.length > 0) weakCategoryIds.add(voc[0].categoryId);
        const gr = curriculum.stages.grammar.topics;
        if (gr.length > 0) weakGrammarSlugs.add(gr[0]);
      }
    }
  }
  const weakVerbs = Array.from(weakVerbsSet);
  const weakCategories = Array.from(weakCategoryIds).map((id) => {
    const cat = vocab.categories.find((c) => c.id === id);
    return { id, title: cat?.title ?? id };
  });
  const weakGrammar = Array.from(weakGrammarSlugs).map((slug) => {
    const t = grammar.topics[slug];
    return { slug, title: t?.titlePt ?? t?.title ?? slug };
  });

  let totalWordsEncountered = 0;
  let totalVerbsDrilled = 0;
  for (const [lessonId, p] of Object.entries(progressMap)) {
    if (!p.completed) continue;
    const cl = getCurriculumLesson(lessonId);
    if (cl) {
      totalWordsEncountered += cl.stages.vocabulary.words.length;
      totalVerbsDrilled += cl.stages.verbs.verbs.length;
    }
  }

  const displayName = (profile.display_name as string)?.trim() || "Utilizador";

  return {
    displayName,
    onboarding: {
      learningMotivation: (profile.learning_motivation as string) ?? "",
      selfAssessedLevel: (profile.self_assessed_level as string) ?? "",
      studyDaysPerWeek: (profile.study_days_per_week as number) ?? 3,
      targetGoal: (profile.target_goal as string) ?? "",
      targetDate: (profile.target_date as string) ?? undefined,
    },
    currentStreak: (profile.current_streak as number) ?? 0,
    longestStreak: (profile.longest_streak as number) ?? 0,
    lastActiveDate: (profile.last_active_date as string) ?? null,
    totalLessonsCompleted,
    currentCefrLevel,
    currentLevelProgress,
    nextLesson,
    weeklyStudyDays,
    weeklyTargetDays,
    weekDayActivity,
    weakVerbs,
    weakCategories,
    weakGrammar,
    totalWordsEncountered,
    totalVerbsDrilled,
  };
}
