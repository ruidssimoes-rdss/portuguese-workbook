/**
 * Learning state of one content item, as the shell shows it (pure).
 *
 * overdue  — due, and at least one full day late
 * mastered — mastery level 4 or 5
 * learning — seen, not mastered
 * unseen   — never asked
 *
 * An item due today is still "learning" or "mastered"; it becomes overdue
 * the next day. `due` is true for both.
 */

import type { MasteryLevel } from "@/lib/learning-engine/mastery-tracker";

export type LearningState = "overdue" | "learning" | "mastered" | "unseen";

export interface MasterySnapshot {
  times_seen: number;
  mastery_level: number;
  next_review_at: string | null;
}

export interface ItemState {
  state: LearningState;
  level: MasteryLevel;
  due: boolean;
  /** Whole days past next_review_at (0 when due today). Null when not due. */
  overdueDays: number | null;
  /** Whole days until next_review_at. Null when due or unscheduled. */
  dueInDays: number | null;
}

const DAY = 86_400_000;

export const MASTERED_LEVEL = 4;

export function itemState(record: MasterySnapshot | null | undefined, now: Date = new Date()): ItemState {
  if (!record || record.times_seen === 0) {
    return { state: "unseen", level: 0, due: false, overdueDays: null, dueInDays: null };
  }

  const level = Math.max(0, Math.min(5, record.mastery_level)) as MasteryLevel;
  const next = record.next_review_at ? new Date(record.next_review_at).getTime() : null;
  const due = next !== null && next <= now.getTime();
  const overdueDays = due ? Math.floor((now.getTime() - next) / DAY) : null;
  const dueInDays = !due && next !== null ? Math.ceil((next - now.getTime()) / DAY) : null;

  let state: LearningState;
  if (overdueDays !== null && overdueDays >= 1) state = "overdue";
  else if (level >= MASTERED_LEVEL) state = "mastered";
  else state = "learning";

  return { state, level, due, overdueDays, dueInDays };
}

/** Sort key: most overdue first, then due today, then everything else in input order. */
export function dueRank(s: ItemState): number {
  if (s.overdueDays !== null) return -1 - s.overdueDays;
  return 0;
}

export const STATE_LABEL: Record<LearningState, string> = {
  overdue: "Em atraso",
  learning: "A aprender",
  mastered: "Dominada",
  unseen: "Por ver",
};
