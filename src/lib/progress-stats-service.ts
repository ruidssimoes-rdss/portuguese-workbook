import { createClient } from "@/lib/supabase/client";
import { getResolvedLessons } from "@/data/resolve-lessons";
import { getCurriculumLesson } from "@/data/resolve-lessons";

const A1_TOTAL = 18;
const A2_TOTAL = 16;
const B1_TOTAL = 10;
const A1_LAST_ORDER = 18;
const A2_LAST_ORDER = 34;
const B1_LAST_ORDER = 44;

export interface ProgressStats {
  currentLevel: "A1" | "A2" | "B1" | "Complete";
  a1Progress: { completed: number; total: number };
  a2Progress: { completed: number; total: number };
  b1Progress: { completed: number; total: number };
  totalLessonsCompleted: number;
  totalWordsEncountered: number;
  totalVerbsDrilled: number;
  totalGrammarTopicsStudied: number;
  totalCultureItemsSeen: number;
  totalNotesWritten: number;
  totalStudySessions: number;
  totalPracticeSessions: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  bestLessonScore: { lessonId: string; score: number } | null;
  memberSince: string;
  daysActive: number;
  goalsCompleted: number;
  goalsActive: number;
  timeline: TimelineEvent[];
  completedLessonDates: { lessonId: string; completedAt: string; order: number }[];
}

export interface TimelineEvent {
  date: string;
  type: "started" | "lesson" | "level-complete" | "exam" | "milestone" | "goal-complete" | "streak";
  title: string;
  subtitle?: string;
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

export async function getProgressStats(): Promise<ProgressStats | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const lessons = getResolvedLessons().sort((a, b) => a.order - b.order);

  const [
    profileRes,
    progressRows,
    eventsRes,
    notesRes,
    goalsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("created_at, current_streak, longest_streak").eq("id", user.id).single(),
    supabase
      .from("user_lesson_progress")
      .select("lesson_id, completed, accuracy_score, best_score, completed_at")
      .eq("user_id", user.id),
    supabase
      .from("user_calendar_events")
      .select("event_date, event_type, linked_label, linked_score, linked_passed")
      .eq("user_id", user.id)
      .order("event_date", { ascending: false }),
    supabase.from("user_notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_goals").select("id, is_active, goal_type, updated_at").eq("user_id", user.id),
  ]);

  const profile = profileRes.data;
  const progressList = progressRows.data ?? [];
  const events = eventsRes.data ?? [];
  const notesCount = (notesRes as { count?: number }).count ?? 0;
  const goals = goalsRes.data ?? [];

  const progressMap = progressList.reduce(
    (acc, row) => {
      acc[row.lesson_id] = {
        completed: row.completed ?? false,
        accuracy_score: row.accuracy_score ?? 0,
        best_score: row.best_score ?? 0,
        completed_at: row.completed_at ?? null,
      };
      return acc;
    },
    {} as Record<string, { completed: boolean; accuracy_score: number; best_score: number; completed_at: string | null }>
  );

  const completedLessonIds = Object.entries(progressMap)
    .filter(([, p]) => p.completed)
    .map(([id]) => id);

  const a1Completed = lessons.filter((l) => l.order >= 1 && l.order <= A1_LAST_ORDER && progressMap[l.id]?.completed).length;
  const a2Completed = lessons.filter((l) => l.order >= A1_LAST_ORDER + 1 && l.order <= A2_LAST_ORDER && progressMap[l.id]?.completed).length;
  const b1Completed = lessons.filter((l) => l.order >= A2_LAST_ORDER + 1 && l.order <= B1_LAST_ORDER && progressMap[l.id]?.completed).length;

  let currentLevel: ProgressStats["currentLevel"] = "A1";
  if (b1Completed === B1_TOTAL) currentLevel = "Complete";
  else if (a2Completed === A2_TOTAL) currentLevel = "B1";
  else if (a1Completed === A1_TOTAL) currentLevel = "A2";

  let totalWordsEncountered = 0;
  let totalVerbsDrilled = 0;
  const grammarTopicIds = new Set<string>();
  const cultureIds = new Set<string>();

  for (const lessonId of completedLessonIds) {
    const cl = getCurriculumLesson(lessonId);
    if (cl) {
      totalWordsEncountered += cl.stages.vocabulary.words.length;
      totalVerbsDrilled += cl.stages.verbs.verbs.length;
      cl.stages.grammar.topics.forEach((t) => grammarTopicIds.add(t));
      const cultureItems = (cl.stages as { culture?: { items: { type: string; id: string }[] } }).culture?.items ?? [];
      cultureItems.forEach((c) => cultureIds.add(`${c.type}-${c.id}`));
    }
  }

  const totalStudySessions = events.filter((e) => e.event_type === "auto_lesson" || e.event_type === "goal").length;
  const totalPracticeSessions = events.filter((e) => e.event_type === "auto_practice").length;
  const distinctDays = new Set(events.map((e) => e.event_date)).size;

  const completedWithDates = lessons
    .filter((l) => progressMap[l.id]?.completed && progressMap[l.id]?.completed_at)
    .map((l) => ({
      lessonId: l.id,
      completedAt: progressMap[l.id].completed_at!,
      order: l.order,
    }))
    .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

  const accuracyScores = progressList.filter((r) => r.completed && r.accuracy_score != null).map((r) => r.accuracy_score);
  const averageAccuracy =
    accuracyScores.length > 0
      ? Math.round((accuracyScores.reduce((s, a) => s + a, 0) / accuracyScores.length) * 100) / 100
      : 0;

  let bestLessonScore: { lessonId: string; score: number } | null = null;
  for (const row of progressList) {
    if (row.completed && row.best_score != null) {
      const score = Math.round(row.best_score * 100);
      if (!bestLessonScore || score > bestLessonScore.score) {
        bestLessonScore = { lessonId: row.lesson_id, score };
      }
    }
  }

  const goalsActive = goals.filter((g) => g.is_active).length;
  const goalsCompleted = goals.filter((g) => !g.is_active).length;

  const memberSince = profile?.created_at ?? new Date().toISOString();

  const timeline = buildTimeline({
    memberSince,
    currentStreak: (profile?.current_streak as number) ?? 0,
    longestStreak: (profile?.longest_streak as number) ?? 0,
    completedWithDates,
    lessons,
    events,
    goals,
    totalWordsEncountered,
    goalsCompleted,
  });

  return {
    currentLevel,
    a1Progress: { completed: a1Completed, total: A1_TOTAL },
    a2Progress: { completed: a2Completed, total: A2_TOTAL },
    b1Progress: { completed: b1Completed, total: B1_TOTAL },
    totalLessonsCompleted: completedLessonIds.length,
    totalWordsEncountered,
    totalVerbsDrilled,
    totalGrammarTopicsStudied: grammarTopicIds.size,
    totalCultureItemsSeen: cultureIds.size,
    totalNotesWritten: notesCount,
    totalStudySessions,
    totalPracticeSessions,
    currentStreak: (profile?.current_streak as number) ?? 0,
    longestStreak: (profile?.longest_streak as number) ?? 0,
    averageAccuracy,
    bestLessonScore,
    memberSince,
    daysActive: distinctDays,
    goalsCompleted,
    goalsActive,
    timeline,
    completedLessonDates: completedWithDates,
  };
}

interface BuildTimelineInput {
  memberSince: string;
  currentStreak: number;
  longestStreak: number;
  completedWithDates: { lessonId: string; completedAt: string; order: number }[];
  lessons: { id: string; order: number; title: string; ptTitle?: string }[];
  events: { event_date: string; event_type: string; linked_label: string | null; linked_score: number | null; linked_passed: boolean | null }[];
  goals: { id: string; is_active: boolean; goal_type: string; updated_at: string }[];
  totalWordsEncountered: number;
  goalsCompleted: number;
}

function buildTimeline(input: BuildTimelineInput): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const {
    memberSince,
    currentStreak,
    completedWithDates,
    lessons,
    events: calendarEvents,
    goals,
    totalWordsEncountered,
  } = input;

  const dateToKey = (d: string) => d.split("T")[0];

  events.push({
    date: memberSince,
    type: "started",
    title: "Início da jornada",
    subtitle: "Bem-vindo ao Aula PT!",
  });

  if (completedWithDates.length > 0) {
    const first = completedWithDates[0];
    const lesson = lessons.find((l) => l.id === first.lessonId);
    events.push({
      date: first.completedAt,
      type: "lesson",
      title: "Primeira lição completa",
      subtitle: lesson ? `${lesson.ptTitle ?? lesson.title}` : first.lessonId,
    });
  }

  const a1Last = completedWithDates.find((c) => c.order === A1_LAST_ORDER);
  if (a1Last) {
    events.push({
      date: a1Last.completedAt,
      type: "level-complete",
      title: "Nível A1 completo",
      subtitle: "18/18 lições concluídas.",
    });
  }

  const a2Last = completedWithDates.find((c) => c.order === A2_LAST_ORDER);
  if (a2Last) {
    events.push({
      date: a2Last.completedAt,
      type: "level-complete",
      title: "Nível A2 completo",
      subtitle: "16/16 lições concluídas.",
    });
  }

  const b1Last = completedWithDates.find((c) => c.order === B1_LAST_ORDER);
  if (b1Last) {
    events.push({
      date: b1Last.completedAt,
      type: "level-complete",
      title: "Currículo completo",
      subtitle: "44/44 lições concluídas.",
    });
  }

  const examEvents = calendarEvents.filter((e) => e.event_type === "auto_exam" && e.linked_passed === true);
  for (const e of examEvents) {
    events.push({
      date: e.event_date,
      type: "exam",
      title: e.linked_label ? `Exame simulado aprovado: ${e.linked_label}` : "Exame simulado aprovado",
      subtitle: e.linked_score != null ? `Nota: ${Math.round(e.linked_score)}%` : undefined,
    });
  }

  const completedGoals = goals.filter((g) => !g.is_active);
  for (const g of completedGoals) {
    const goalLabel = g.goal_type === "lessons_a1" ? "Completar todas as lições A1" : g.goal_type === "lessons_a2" ? "Completar todas as lições A2" : g.goal_type === "lessons_b1" ? "Completar todas as lições B1" : g.goal_type;
    events.push({
      date: g.updated_at,
      type: "goal-complete",
      title: "Objetivo concluído",
      subtitle: goalLabel,
    });
  }

  if (totalWordsEncountered >= 500) {
    let running = 0;
    let date500: string | null = null;
    for (const c of completedWithDates) {
      const cl = getCurriculumLesson(c.lessonId);
      if (cl) running += cl.stages.vocabulary.words.length;
      if (running >= 500) {
        date500 = c.completedAt;
        break;
      }
    }
    if (date500) {
      events.push({
        date: date500,
        type: "milestone",
        title: "500 palavras aprendidas",
        subtitle: "Um marco importante na tua jornada.",
      });
    }
  }
  if (totalWordsEncountered >= 100) {
    let running = 0;
    let date100: string | null = null;
    for (const c of completedWithDates) {
      const cl = getCurriculumLesson(c.lessonId);
      if (cl) running += cl.stages.vocabulary.words.length;
      if (running >= 100) {
        date100 = c.completedAt;
        break;
      }
    }
    if (date100) {
      events.push({
        date: date100,
        type: "milestone",
        title: "100 palavras aprendidas",
        subtitle: "Um marco importante na tua jornada.",
      });
    }
  }

  if (STREAK_MILESTONES.includes(currentStreak) && currentStreak > 0) {
    events.push({
      date: new Date().toISOString().split("T")[0],
      type: "streak",
      title: `Série de ${currentStreak} dias`,
      subtitle: currentStreak >= 7 ? "Uma semana inteira de estudo consecutivo." : "Consistência é a chave.",
    });
  }

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
