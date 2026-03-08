/**
 * Client-side goal plan generation. No API calls — uses curriculum/verbs/grammar data.
 */

export interface GoalItem {
  id: string;
  title: string;
}

export interface GoalEvent {
  title: string;
  date: string; // YYYY-MM-DD
  linkedId: string;
  linkedType: "lesson" | "verb" | "grammar";
}

/** Get study days between from and to (inclusive) that fall on given weekdays. 1=Mon, 7=Sun. */
export function getStudyDaysBetween(
  from: Date,
  to: Date,
  studyDays: number[]
): string[] {
  const out: string[] = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(23, 59, 59, 999);
  while (d <= end) {
    const day = d.getDay();
    const iso = day === 0 ? 7 : day;
    if (studyDays.includes(iso)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      out.push(`${y}-${m}-${dayNum}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/** Distribute remaining items evenly across available days. */
export function generateGoalPlan(
  remainingItems: GoalItem[],
  availableDays: string[],
  linkedType: "lesson" | "verb" | "grammar"
): GoalEvent[] {
  const plan: GoalEvent[] = [];
  let dayIndex = 0;
  for (const item of remainingItems) {
    if (dayIndex >= availableDays.length) break;
    plan.push({
      title: item.title,
      date: availableDays[dayIndex],
      linkedId: item.id,
      linkedType,
    });
    dayIndex++;
  }
  return plan;
}
