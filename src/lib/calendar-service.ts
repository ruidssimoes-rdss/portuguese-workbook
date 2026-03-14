import { createClient } from "@/lib/supabase/client";
import { updateStreak } from "@/lib/streak-service";

export type CalendarEventType = "planned" | "auto_lesson" | "auto_exam" | "auto_practice" | "goal";
export type LinkedType = "lesson" | "exam" | "practice" | "verb" | "grammar" | null;

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  is_all_day: boolean;
  event_type: CalendarEventType;
  linked_type: LinkedType;
  linked_id: string | null;
  linked_label: string | null;
  linked_score: number | null;
  linked_passed: boolean | null;
  color: string | null;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function getEventsForMonth(
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data, error } = await supabase
    .from("user_calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .gte("event_date", start)
    .lte("event_date", end)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error || !data) return [];
  return data.map(mapRowToEvent);
}

export async function getEventsForDate(
  date: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .eq("event_date", date)
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error || !data) return [];
  return data.map(mapRowToEvent);
}

export async function getEventsInRange(
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_calendar_events")
    .select("*")
    .eq("user_id", user.id)
    .gte("event_date", startDate)
    .lte("event_date", endDate)
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error || !data) return [];
  return data.map(mapRowToEvent);
}

export interface CreatePlannedEventData {
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  color?: string | null;
}

export async function createPlannedEvent(
  data: CreatePlannedEventData
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      event_date: data.eventDate,
      start_time: data.startTime ?? null,
      end_time: data.endTime ?? null,
      is_all_day: data.allDay ?? true,
      event_type: "planned",
      linked_type: null,
      linked_id: null,
      linked_label: null,
      linked_score: null,
      linked_passed: null,
      color: data.color ?? null,
    })
    .select()
    .single();

  if (error || !row) return null;
  updateStreak().catch(() => {});
  return mapRowToEvent(row);
}

export async function updateEvent(
  eventId: string,
  data: Partial<
    Pick<
      CalendarEvent,
      "title" | "description" | "event_date" | "start_time" | "end_time" | "is_all_day" | "color"
    >
  >
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.event_date !== undefined) payload.event_date = data.event_date;
  if (data.start_time !== undefined) payload.start_time = data.start_time;
  if (data.end_time !== undefined) payload.end_time = data.end_time;
  if (data.is_all_day !== undefined) payload.is_all_day = data.is_all_day;
  if (data.color !== undefined) payload.color = data.color;

  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .update(payload)
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !row) return null;
  return mapRowToEvent(row);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("user_calendar_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id);

  return !error;
}

/** Move a single goal event to a new date (does not regenerate the full plan). */
export async function moveGoalEvent(
  eventId: string,
  newDate: string
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .update({ event_date: newDate })
    .eq("id", eventId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !row) return null;
  return mapRowToEvent(row);
}

const LESSON_PASSED_COLOR = "#16A34A";
const PRACTICE_COLOR = "#8B5CF6";
const LESSON_FAILED_COLOR = "#F59E0B";
const EXAM_PASSED_COLOR = "#003399";
const EXAM_FAILED_COLOR = "#F59E0B";

export async function logLessonCompletion(
  lessonId: string,
  lessonTitle: string,
  score: number,
  passed: boolean
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const color = passed ? LESSON_PASSED_COLOR : LESSON_FAILED_COLOR;
  const today = new Date().toISOString().slice(0, 10);

  const insertData = {
    user_id: user.id,
    title: lessonTitle,
    description: null,
    event_date: today,
    start_time: null,
    end_time: null,
    is_all_day: true,
    event_type: "auto_lesson" as const,
    linked_type: "lesson" as const,
    linked_id: lessonId,
    linked_label: lessonTitle,
    linked_score: score,
    linked_passed: passed,
    color,
  };
  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("[CALENDAR LOG] Insert error:", error);
    return null;
  }
  if (!row) return null;
  return mapRowToEvent(row);
}

export async function logExamAttempt(
  examId: string,
  examTitle: string,
  score: number,
  passed: boolean
): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const color = passed ? EXAM_PASSED_COLOR : EXAM_FAILED_COLOR;
  const today = new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .insert({
      user_id: user.id,
      title: examTitle,
      description: null,
      event_date: today,
      start_time: null,
      end_time: null,
      is_all_day: true,
      event_type: "auto_exam",
      linked_type: "exam",
      linked_id: examId,
      linked_label: examTitle,
      linked_score: score,
      linked_passed: passed,
      color,
    })
    .select()
    .single();

  if (error || !row) return null;
  return mapRowToEvent(row);
}

export interface LogPracticeSessionData {
  practiceType: string;
  title: string;
  score?: number;
  questionsTotal?: number;
  questionsCorrect?: number;
}

export interface CreateGoalEventData {
  title: string;
  eventDate: string;
  linkedType: "lesson" | "verb" | "grammar";
  linkedId: string;
  linkedLabel: string;
}

export async function createGoalEvents(events: CreateGoalEventData[]): Promise<CalendarEvent[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || events.length === 0) return [];

  const rows = events.map((e) => ({
    user_id: user.id,
    title: e.title,
    description: null,
    event_date: e.eventDate,
    start_time: null,
    end_time: null,
    is_all_day: true,
    event_type: "goal" as const,
    linked_type: e.linkedType,
    linked_id: e.linkedId,
    linked_label: e.linkedLabel,
    linked_score: null,
    linked_passed: null,
    color: "#0EA5E9",
  }));

  const { data, error } = await supabase
    .from("user_calendar_events")
    .insert(rows)
    .select();

  if (error || !data) return [];
  return data.map(mapRowToEvent);
}

// TODO: Wire up auto_practice logging when practice modes (verb drill, vocab quiz, etc.) ship and have results screens.
export async function logPracticeSession(data: LogPracticeSessionData): Promise<CalendarEvent | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);

  const { data: row, error } = await supabase
    .from("user_calendar_events")
    .insert({
      user_id: user.id,
      title: data.title,
      description: null,
      event_date: today,
      start_time: null,
      end_time: null,
      is_all_day: true,
      event_type: "auto_practice",
      linked_type: "practice",
      linked_id: data.practiceType,
      linked_label: data.title,
      linked_score: data.score ?? null,
      linked_passed: null,
      color: PRACTICE_COLOR,
    })
    .select()
    .single();

  if (error || !row) return null;
  updateStreak().catch(() => {});
  return mapRowToEvent(row);
}

export interface ContentCalendarInfoResult {
  completedDate?: string;
  scheduledDate?: string;
  lastReviewDate?: string;
}

export async function getContentCalendarInfo(
  contentType: string,
  contentId: string
): Promise<ContentCalendarInfoResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const today = new Date().toISOString().split("T")[0];

  if (contentType === "lesson") {
    const { data: completion } = await supabase
      .from("user_calendar_events")
      .select("event_date")
      .eq("user_id", user.id)
      .eq("linked_id", contentId)
      .eq("event_type", "auto_lesson")
      .eq("linked_passed", true)
      .order("event_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (completion?.event_date) return { completedDate: completion.event_date as string };
  }

  const { data: scheduled } = await supabase
    .from("user_calendar_events")
    .select("event_date")
    .eq("user_id", user.id)
    .eq("linked_id", contentId)
    .eq("event_type", "goal")
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (scheduled?.event_date) return { scheduledDate: scheduled.event_date as string };

  if (contentType === "lesson") return {};

  const { data: review } = await supabase
    .from("user_calendar_events")
    .select("event_date")
    .eq("user_id", user.id)
    .eq("linked_id", contentId)
    .in("event_type", ["auto_practice", "planned"])
    .lt("event_date", today)
    .order("event_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (review?.event_date) return { lastReviewDate: review.event_date as string };

  return {};
}

export interface WeeklyStats {
  studyDays: number;
  notesCount: number;
  lessonsCompleted: number;
  practiceSessions: number;
  examsTaken: number;
}

const EMPTY_STATS: WeeklyStats = {
  studyDays: 0,
  notesCount: 0,
  lessonsCompleted: 0,
  practiceSessions: 0,
  examsTaken: 0,
};

export async function getWeeklyStats(
  weekStart: string,
  weekEnd: string
): Promise<WeeklyStats> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_STATS;

  const [eventsRes, notesRes] = await Promise.all([
    supabase
      .from("user_calendar_events")
      .select("event_type, event_date, linked_passed")
      .eq("user_id", user.id)
      .gte("event_date", weekStart)
      .lte("event_date", weekEnd),
    supabase
      .from("user_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("updated_at", weekStart + "T00:00:00")
      .lte("updated_at", weekEnd + "T23:59:59"),
  ]);

  const events = eventsRes.data ?? [];
  const notesCount = notesRes.count ?? 0;

  const studyDays = new Set(events.map((e) => e.event_date)).size;
  const lessonsCompleted = events.filter((e) => e.event_type === "auto_lesson" && e.linked_passed).length;
  const practiceSessions = events.filter((e) => e.event_type === "auto_practice").length;
  const examsTaken = events.filter((e) => e.event_type === "auto_exam").length;

  return {
    studyDays,
    notesCount,
    lessonsCompleted,
    practiceSessions,
    examsTaken,
  };
}

export async function getMonthlyStats(
  monthStart: string,
  monthEnd: string
): Promise<WeeklyStats> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_STATS;

  const [eventsRes, notesRes] = await Promise.all([
    supabase
      .from("user_calendar_events")
      .select("event_type, event_date, linked_passed")
      .eq("user_id", user.id)
      .gte("event_date", monthStart)
      .lte("event_date", monthEnd),
    supabase
      .from("user_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("updated_at", monthStart + "T00:00:00")
      .lte("updated_at", monthEnd + "T23:59:59"),
  ]);

  const events = eventsRes.data ?? [];
  const notesCount = notesRes.count ?? 0;

  const studyDays = new Set(events.map((e) => e.event_date)).size;
  const lessonsCompleted = events.filter((e) => e.event_type === "auto_lesson" && e.linked_passed).length;
  const practiceSessions = events.filter((e) => e.event_type === "auto_practice").length;
  const examsTaken = events.filter((e) => e.event_type === "auto_exam").length;

  return {
    studyDays,
    notesCount,
    lessonsCompleted,
    practiceSessions,
    examsTaken,
  };
}

function mapRowToEvent(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    event_date: row.event_date as string,
    start_time: (row.start_time as string | null) ?? null,
    end_time: (row.end_time as string | null) ?? null,
    is_all_day: Boolean(row.is_all_day),
    event_type: row.event_type as CalendarEventType,
    linked_type: (row.linked_type as LinkedType) ?? null,
    linked_id: (row.linked_id as string | null) ?? null,
    linked_label: (row.linked_label as string | null) ?? null,
    linked_score: row.linked_score != null ? Number(row.linked_score) : null,
    linked_passed: row.linked_passed as boolean | null,
    color: (row.color as string | null) ?? null,
    goal_id: (row.goal_id as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
