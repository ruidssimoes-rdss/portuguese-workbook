/** The vocabulary review a folder panel offers — computed exactly as the session route will run it. */

import "server-only";

import { scopeRecords, selectReviewCandidates } from "@/lib/learning-engine/review-selector";
import type { VocabReviewScope } from "@/lib/learning-engine/session-payload";
import { resolveVocabScope, reviewHref } from "@/lib/library";
import type { Learner } from "./learner";

export interface SessionPreview {
  total: number;
  overdue: number;
  startHref: string;
  overdueHref: string;
}

export function previewSession(learner: Learner | null, scope: VocabReviewScope, now: Date = new Date()): SessionPreview {
  const records = learner?.records ?? [];
  const count = (s: VocabReviewScope) => selectReviewCandidates(scopeRecords(records, resolveVocabScope(s), now), now).length;
  return {
    total: count(scope),
    overdue: count({ ...scope, overdueOnly: true }),
    startHref: reviewHref(scope),
    overdueHref: reviewHref({ ...scope, overdueOnly: true }),
  };
}
