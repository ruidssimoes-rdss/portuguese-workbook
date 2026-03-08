import { createClient } from "@/lib/supabase/client";

export interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  target_date: string;
  study_days: number[];
  total_items: number;
  completed_items: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalWithEventsData {
  goalType: string;
  targetDate: string;
  studyDays: number[];
  totalItems: number;
  completedItems: number;
  events: Array<{
    title: string;
    date: string;
    linkedId: string;
    linkedType: "lesson" | "verb" | "grammar";
  }>;
}

export async function createGoalWithEvents(
  data: CreateGoalWithEventsData
): Promise<{ goal: UserGoal; eventsCreated: number } | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: goal, error: goalError } = await supabase
    .from("user_goals")
    .insert({
      user_id: user.id,
      goal_type: data.goalType,
      target_date: data.targetDate,
      study_days: data.studyDays,
      total_items: data.totalItems,
      completed_items: data.completedItems,
      is_active: true,
    })
    .select()
    .single();

  if (goalError || !goal) return null;

  const eventRows = data.events.map((e) => ({
    user_id: user.id,
    title: e.title,
    description: null,
    event_date: e.date,
    start_time: null,
    end_time: null,
    all_day: true,
    event_type: "goal" as const,
    linked_type: e.linkedType,
    linked_id: e.linkedId,
    linked_label: e.title,
    linked_score: null,
    linked_passed: null,
    color: "#0EA5E9",
    goal_id: goal.id,
  }));

  if (eventRows.length > 0) {
    const { error: eventsError } = await supabase
      .from("user_calendar_events")
      .insert(eventRows);
    if (eventsError) return null;
  }

  return {
    goal: mapRowToGoal(goal),
    eventsCreated: eventRows.length,
  };
}

export async function getActiveGoals(): Promise<UserGoal[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRowToGoal);
}

/** Active goals plus recently completed (for display on calendar page). */
export async function getGoalsForDisplay(): Promise<UserGoal[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];
  return data.map(mapRowToGoal);
}

export async function updateGoalProgress(
  goalType: string,
  completedCount: number
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: goal } = await supabase
    .from("user_goals")
    .select("id, total_items")
    .eq("user_id", user.id)
    .eq("goal_type", goalType)
    .eq("is_active", true)
    .maybeSingle();

  if (!goal) return;

  const isComplete = completedCount >= goal.total_items;

  await supabase
    .from("user_goals")
    .update({
      completed_items: completedCount,
      is_active: !isComplete,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goal.id);
}

function mapRowToGoal(row: Record<string, unknown>): UserGoal {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    goal_type: row.goal_type as string,
    target_date: row.target_date as string,
    study_days: Array.isArray(row.study_days) ? (row.study_days as number[]) : [],
    total_items: Number(row.total_items) ?? 0,
    completed_items: Number(row.completed_items) ?? 0,
    is_active: Boolean(row.is_active),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
