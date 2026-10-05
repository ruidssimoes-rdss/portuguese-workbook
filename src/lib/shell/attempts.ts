/**
 * What the learner typed for a word, from user_lesson_progress.wrong_items.
 * Only wrong answers are stored, so every attempt here is a wrong one.
 * Rows written since the shell redesign carry the content id; older rows are
 * matched on the expected answer.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { WrongItem } from "@/lib/lesson-progress";
import { findWordByAnswer, normalizeAnswer, type LibraryWord } from "@/lib/library";

export interface Attempt {
  at: string;
  typed: string;
  expected: string;
}

export interface Confusion {
  word: LibraryWord;
  times: number;
}

interface Row {
  wrong_items: WrongItem[] | null;
  updated_at: string;
}

export async function loadWrongItems(supabase: SupabaseClient, userId: string): Promise<{ at: string; item: WrongItem }[]> {
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("wrong_items, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return (data as Row[]).flatMap((r) =>
    Array.isArray(r.wrong_items) ? r.wrong_items.map((item) => ({ at: r.updated_at, item })) : []
  );
}

function isAbout(item: WrongItem, word: LibraryWord): boolean {
  if (item.contentId) return item.contentType === "vocab" && item.contentId === word.portuguese;
  const expected = normalizeAnswer(item.correctAnswer ?? "");
  return expected !== "" && (expected === normalizeAnswer(word.portuguese) || expected === normalizeAnswer(word.english));
}

export function attemptsFor(items: { at: string; item: WrongItem }[], word: LibraryWord, limit = 6): Attempt[] {
  return items
    .filter(({ item }) => isAbout(item, word))
    .slice(0, limit)
    .map(({ at, item }) => ({ at, typed: item.userAnswer ?? "", expected: item.correctAnswer ?? "" }));
}

/** Other words this one gets mixed up with, in either direction. */
export function confusionsFor(items: { at: string; item: WrongItem }[], word: LibraryWord): Confusion[] {
  const counts = new Map<string, Confusion>();
  const bump = (other: LibraryWord | undefined) => {
    if (!other || other.portuguese === word.portuguese) return;
    const c = counts.get(other.portuguese) ?? { word: other, times: 0 };
    c.times += 1;
    counts.set(other.portuguese, c);
  };
  for (const { item } of items) {
    const typed = findWordByAnswer(item.userAnswer ?? "");
    if (isAbout(item, word)) bump(typed);
    else if (typed?.portuguese === word.portuguese) {
      bump(item.contentType === "vocab" && item.contentId ? findWordByAnswer(item.contentId) : findWordByAnswer(item.correctAnswer ?? ""));
    }
  }
  return [...counts.values()].sort((a, b) => b.times - a.times).slice(0, 5);
}
