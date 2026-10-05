/**
 * The signed-in learner and their mastery records, read once per request.
 * Every shell surface derives from this snapshot.
 */

import "server-only";

import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getUserMastery, type MasteryRecord } from "@/lib/learning-engine/mastery-tracker";
import { selectReviewCandidates } from "@/lib/learning-engine/review-selector";
import { standingFromRecords } from "@/lib/learning-engine/cefr-readiness";
import { dueRank, itemState, type ItemState } from "@/lib/learning-state";
import { getWordByContentId, type LibraryWord } from "@/lib/library";
import type { ExplorerRow, ShellData } from "./types";

export interface Learner {
  user: User;
  supabase: SupabaseClient;
  records: MasteryRecord[];
  byKey: Map<string, MasteryRecord>;
}

export const getLearner = cache(async (): Promise<Learner | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const records = await getUserMastery(user.id, undefined, supabase);
  const byKey = new Map(records.map((r) => [`${r.content_type}:${r.content_id}`, r]));
  return { user, supabase, records, byKey };
});

export function wordState(learner: Learner | null, word: LibraryWord, now: Date = new Date()): ItemState {
  return itemState(learner?.byKey.get(`vocab:${word.portuguese}`), now);
}

export function wordRow(word: LibraryWord, s: ItemState): ExplorerRow {
  return { id: word.href, label: word.title, href: word.href, state: s.state, overdueDays: s.overdueDays };
}

export interface DueWord {
  word: LibraryWord;
  state: ItemState;
}

/** Vocabulary due now, most overdue first. */
export function dueWords(learner: Learner, now: Date = new Date()): DueWord[] {
  const out: DueWord[] = [];
  for (const r of learner.records) {
    if (r.content_type !== "vocab") continue;
    const s = itemState(r, now);
    if (!s.due) continue;
    const word = getWordByContentId(r.content_id);
    if (word) out.push({ word, state: s });
  }
  return out.sort((a, b) => dueRank(a.state) - dueRank(b.state));
}

export function displayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = [meta?.full_name, meta?.name].find((v): v is string => typeof v === "string" && v.trim() !== "");
  if (fromMeta) return fromMeta.split(" ")[0];
  return user.email?.split("@")[0] ?? "Tu";
}

export function buildShellData(learner: Learner, now: Date = new Date()): ShellData {
  return {
    user: { name: displayName(learner.user) },
    reviewCount: selectReviewCandidates(learner.records, now).length,
    due: dueWords(learner, now).map(({ word, state }) => wordRow(word, state)),
    standing: standingFromRecords(learner.records),
    masteredCount: learner.records.filter((r) => itemState(r, now).state === "mastered").length,
  };
}
