/** Shapes the shell exchanges between server and client. Types only — safe to import anywhere. */

import type { LearningState } from "@/lib/learning-state";
import type { LevelStanding } from "@/lib/learning-engine/cefr-readiness";

export type FolderId = `vocab:${string}` | "grammar" | "verbs" | "culture";

export interface ExplorerRow {
  id: string;
  label: string;
  href: string;
  count?: number;
  state?: LearningState;
  /** Days overdue, shown next to the dot when state is overdue */
  overdueDays?: number | null;
}

export interface ShellData {
  user: { name: string };
  /** Items the Praticar session would deliver right now */
  reviewCount: number;
  /** Vocabulary due now (overdue first) — the A rever folder */
  due: ExplorerRow[];
  standing: LevelStanding;
  masteredCount: number;
}

export interface ExplorerTree {
  vocab: { total: number; categories: { id: string; title: string; href: string; count: number }[] };
  grammar: number;
  verbs: number;
  culture: number;
}
