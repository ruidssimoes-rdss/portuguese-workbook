/**
 * Zod schemas for validating all AI responses before they reach the app.
 */

import { z } from "zod";

// ── Focus Area Schema ──────────────────────────────────────

const focusAreaSchema = z.object({
  type: z.enum(["vocabulary", "verbs", "grammar", "culture"]),
  vocabCategories: z.array(z.string()).optional(),
  vocabCefr: z.enum(["A1", "A2", "B1"]).optional(),
  vocabCount: z.number().min(1).max(15).optional(),
  verbSlugs: z.array(z.string()).optional(),
  verbTenses: z.array(z.string()).optional(),
  verbCount: z.number().min(1).max(10).optional(),
  grammarTopicSlugs: z.array(z.string()).optional(),
  cultureCount: z.number().min(1).max(5).optional(),
});

// ── Session Plan Schema ────────────────────────────────────

export const sessionPlanSchema = z.object({
  sessionTitle: z.string().min(3).max(100),
  sessionTitlePt: z.string().min(3).max(100),
  difficulty: z.enum(["foundation", "developing", "confident"]),
  estimatedMinutes: z.number().min(5).max(30),
  focusAreas: z.array(focusAreaSchema).min(1).max(6),
  reviewPriority: z.enum(["new", "weak", "mixed"]),
});

// ── Explanation Schema ─────────────────────────────────────

export const explanationSchema = z.object({
  explanation: z.string().min(10).max(500),
  tip: z.string().min(5).max(200),
  relatedRule: z.string().optional(),
});

// Export inferred types
export type ValidatedSessionPlan = z.infer<typeof sessionPlanSchema>;
export type ValidatedExplanation = z.infer<typeof explanationSchema>;
