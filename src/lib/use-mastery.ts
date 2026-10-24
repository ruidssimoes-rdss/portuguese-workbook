"use client";

/**
 * useMastery — the signed-in user's mastery records for one content type,
 * keyed by content_id, plus helpers to turn a record into an Aula word state.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserMastery, type ContentType, type MasteryRecord } from "@/lib/learning-engine/mastery-tracker";
import { isDue, isOverdue, daysUntilReview } from "@/lib/review-status";

export type WordState = "unseen" | "learning" | "overdue" | "mastered";

export const STATE_LABEL: Record<WordState, string> = {
  unseen: "Por ver",
  learning: "A aprender",
  overdue: "Em atraso",
  mastered: "Dominada",
};

/** «Em atraso» only for a genuinely overdue review (see src/lib/review-status.ts). */
export function stateOf(r: MasteryRecord | undefined, now = Date.now()): WordState {
  if (!r || r.mastery_level === 0) return "unseen";
  if (isOverdue(r, now)) return "overdue";
  if (r.mastery_level >= 4) return "mastered";
  return "learning";
}

/** «hoje», «amanhã», «3 dias», «em atraso», «dominada», «por ver» */
export function dueLabel(r: MasteryRecord | undefined, now = Date.now()): string {
  const s = stateOf(r, now);
  if (s === "unseen") return "por ver";
  if (s === "overdue") return "em atraso";
  if (!r?.next_review_at) return s === "mastered" ? "dominada" : "—";
  if (isDue(r, now)) return "hoje";
  const days = daysUntilReview(r, now);
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  if (days > 60) return "dominada";
  return `${days} dias`;
}

export function useMastery(type: ContentType) {
  const { user, loading: authLoading } = useAuth();
  const [map, setMap] = useState<Map<string, MasteryRecord>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const userId = user.id;
    let cancelled = false;
    function load() {
      getUserMastery(userId, { contentType: type }).then((rows) => {
        if (cancelled) return;
        setMap(new Map(rows.map((r) => [r.content_id, r])));
        setLoaded(true);
      }).catch(() => {
        if (!cancelled) setLoaded(true);
      });
    }
    load();
    const onRefresh = () => load();
    window.addEventListener("aula-mastery", onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener("aula-mastery", onRefresh);
    };
  }, [user, authLoading, type]);

  return { map, loaded: loaded || (!authLoading && !user), signedIn: !!user };
}
