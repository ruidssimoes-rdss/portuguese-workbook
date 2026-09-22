/**
 * Learning Engine — session payload (client-safe types).
 *
 * Sessions are generated on the server (POST /api/learn/session). The client
 * receives exactly this shape and nothing else: the exercises to play, the
 * lesson's identity, and the pool references needed to record mastery.
 */

import type { Lesson } from "@/data/lessons";
import type { GeneratedLesson } from "@/lib/exercise-generator";
import type { CEFRLevel, ContentType } from "./mastery-tracker";

export type LessonMeta = Pick<Lesson, "id" | "title" | "ptTitle" | "cefr">;

export interface SessionPracticeItem {
  contentType: ContentType;
  contentId: string;
  contentCefr: CEFRLevel;
  contentCategory?: string;
}

export interface SessionPayload {
  lesson: LessonMeta;
  generated: GeneratedLesson;
  practiceItems: SessionPracticeItem[];
  isReview: boolean;
}

export interface SessionRequest {
  /** "review" for a due-items session; omit for an adaptive lesson */
  mode?: "review";
  /** Force a CEFR level for an adaptive lesson */
  level?: CEFRLevel;
  /** Play a fixed curriculum lesson by id (e.g. "a1-01") */
  lesson?: string;
}
