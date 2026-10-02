"use client";

/**
 * useMastery — the signed-in user's mastery records for one content type,
 * keyed by content_id, plus helpers to turn a record into an Aula word state.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserMastery, type ContentType, type MasteryRecord } from "@/lib/learning-engine/mastery-tracker";

export type WordState = "unseen" | "learning" | "overdue" | "mastered";

export const STATE_LABEL: Record<WordState, string> = {
  unseen: "Por ver",
  learning: "A aprender",
  overdue: "Em atraso",
  mastered: "Dominada",
};

export function stateOf(r: MasteryRecord | undefined, now = Date.now()): WordState {
  if (!r || r.mastery_level === 0) return "unseen";
  if (r.next_review_at && new Date(r.next_review_at).getTime() <= now) return "overdue";
  if (r.mastery_level >= 4) return "mastered";
  return "learning";
}

/** «amanhã», «3 dias», «em atraso», «dominada», «por ver» */
export function dueLabel(r: MasteryRecord | undefined, now = Date.now()): string {
  const s = stateOf(r, now);
  if (s === "unseen") return "por ver";
  if (s === "overdue") return "em atraso";
  if (!r?.next_review_at) return s === "mastered" ? "dominada" : "—";
  const days = Math.ceil((new Date(r.next_review_at).getTime() - now) / 86_400_000);
  if (days <= 1) return "amanhã";
  if (days > 60) return "dominada";
  return `${days} dias`;
}

export function useMastery(type: ContentType) {
  const { user, loading: authLoading } = useAuth();
  const [map, setMap] = useState<Map<string, MasteryRecord>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    getUserMastery(user.id, { contentType: type }).then((rows) => {
      if (cancelled) return;
      setMap(new Map(rows.map((r) => [r.content_id, r])));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, type]);

  return { map, loaded: loaded || (!authLoading && !user), signedIn: !!user };
}
