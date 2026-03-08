import { createClient } from "@/lib/supabase/client";

export interface OnboardingData {
  learningMotivation: string;
  selfAssessedLevel: string;
  studyDaysPerWeek: number;
  targetGoal: string;
  targetDate?: string;
  displayName?: string;
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  return data?.onboarding_completed ?? false;
}

export async function saveOnboardingData(data: OnboardingData): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const updates: Record<string, unknown> = {
    learning_motivation: data.learningMotivation,
    self_assessed_level: data.selfAssessedLevel,
    study_days_per_week: data.studyDaysPerWeek,
    target_goal: data.targetGoal,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  if (data.targetDate) {
    updates.target_date = data.targetDate;
  }

  if (data.displayName !== undefined) {
    updates.display_name = data.displayName;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  return !error;
}

export async function skipOnboarding(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: true,
      study_days_per_week: 3,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return !error;
}

export async function getOnboardingData(): Promise<OnboardingData | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("learning_motivation, self_assessed_level, study_days_per_week, target_goal, target_date, display_name")
    .eq("id", user.id)
    .single();

  if (!data) return null;

  return {
    learningMotivation: data.learning_motivation ?? "",
    selfAssessedLevel: data.self_assessed_level ?? "",
    studyDaysPerWeek: data.study_days_per_week ?? 3,
    targetGoal: data.target_goal ?? "",
    targetDate: data.target_date ?? undefined,
    displayName: data.display_name ?? "",
  };
}
