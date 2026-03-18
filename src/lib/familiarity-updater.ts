/**
 * Familiarity Updater — updates user_vocabulary and user_verbs tables
 * after a session using the spaced repetition algorithm.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateReview } from "./spaced-repetition";
import type { AnswerResult } from "@/types/blocks";

export interface SessionAnswerWithContext extends AnswerResult {
  contentType: "vocab" | "verb" | "grammar";
  contentId: string;
  category?: string;
}

export async function updateFamiliarityFromSession(
  supabase: SupabaseClient,
  userId: string,
  answers: SessionAnswerWithContext[],
): Promise<{ vocabUpdated: number; verbsUpdated: number }> {
  const vocabAnswers = answers.filter((a) => a.contentType === "vocab");
  const verbAnswers = answers.filter((a) => a.contentType === "verb");

  let vocabUpdated = 0;
  let verbsUpdated = 0;

  // Update vocabulary
  for (const answer of vocabAnswers) {
    try {
      const { data: existing } = await supabase
        .from("user_vocabulary")
        .select("id, familiarity, times_correct, times_incorrect")
        .eq("user_id", userId)
        .eq("word_portuguese", answer.contentId)
        .single();

      const review = calculateReview(
        existing?.familiarity ?? 0,
        answer.correct,
        existing?.times_correct ?? 0,
        existing?.times_incorrect ?? 0,
      );

      if (existing) {
        await supabase
          .from("user_vocabulary")
          .update({
            familiarity: review.newFamiliarity,
            next_review: review.nextReview.toISOString(),
            times_correct: review.timesCorrect,
            times_incorrect: review.timesIncorrect,
            last_reviewed: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_vocabulary").insert({
          user_id: userId,
          word_portuguese: answer.contentId,
          category: answer.category || "unknown",
          familiarity: review.newFamiliarity,
          next_review: review.nextReview.toISOString(),
          times_correct: review.timesCorrect,
          times_incorrect: review.timesIncorrect,
          last_reviewed: new Date().toISOString(),
        });
      }

      vocabUpdated++;
    } catch (err) {
      console.error(`[Familiarity] Failed to update vocab "${answer.contentId}":`, err);
    }
  }

  // Update verbs
  for (const answer of verbAnswers) {
    try {
      const { data: existing } = await supabase
        .from("user_verbs")
        .select("id, familiarity, times_correct, times_incorrect")
        .eq("user_id", userId)
        .eq("verb", answer.contentId)
        .single();

      const review = calculateReview(
        existing?.familiarity ?? 0,
        answer.correct,
        existing?.times_correct ?? 0,
        existing?.times_incorrect ?? 0,
      );

      if (existing) {
        await supabase
          .from("user_verbs")
          .update({
            familiarity: review.newFamiliarity,
            next_review: review.nextReview.toISOString(),
            times_correct: review.timesCorrect,
            times_incorrect: review.timesIncorrect,
            last_reviewed: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("user_verbs").insert({
          user_id: userId,
          verb: answer.contentId,
          familiarity: review.newFamiliarity,
          next_review: review.nextReview.toISOString(),
          times_correct: review.timesCorrect,
          times_incorrect: review.timesIncorrect,
          last_reviewed: new Date().toISOString(),
        });
      }

      verbsUpdated++;
    } catch (err) {
      console.error(`[Familiarity] Failed to update verb "${answer.contentId}":`, err);
    }
  }

  return { vocabUpdated, verbsUpdated };
}
