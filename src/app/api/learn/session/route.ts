/**
 * POST /api/learn/session — generate a learning session on the server.
 *
 * Mastery reads use the caller's Supabase session. The response is the
 * SessionPayload only: no corpus, no pool data.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLesson } from "@/lib/learning-engine/lesson-generator";
import { generateReviewSession } from "@/lib/learning-engine/review-generator";
import { resolveVocabScope } from "@/lib/library";
import { adaptGeneratedLesson, adaptReviewSession, type AdaptedLesson } from "@/lib/learning-engine/lesson-adapter";
import { getCurrentStudyLevel } from "@/lib/learning-engine/cefr-readiness";
import type { CEFRLevel } from "@/lib/learning-engine/mastery-tracker";
import type { SessionPayload, SessionRequest } from "@/lib/learning-engine/session-payload";
import { generateLessonExercises } from "@/lib/exercise-generator";
import { getResolvedLesson } from "@/data/resolve-lessons";
import type { Lesson } from "@/data/lessons";

export const dynamic = "force-dynamic";

const LEVELS: CEFRLevel[] = ["A1", "A2", "B1"];

function toPayload(adapted: AdaptedLesson, isReview: boolean): SessionPayload {
  const { lesson } = adapted;
  return {
    lesson: { id: lesson.id, title: lesson.title, ptTitle: lesson.ptTitle, cefr: lesson.cefr },
    generated: generateLessonExercises(lesson, adapted.exerciseOnly),
    practiceItems: adapted.practiceItems.map((p) => ({
      contentType: p.contentType,
      contentId: p.contentId,
      contentCefr: p.contentCefr,
      contentCategory: p.contentCategory,
    })),
    isReview,
  };
}

function curriculumPayload(lesson: Lesson): SessionPayload {
  return {
    lesson: { id: lesson.id, title: lesson.title, ptTitle: lesson.ptTitle, cefr: lesson.cefr },
    generated: generateLessonExercises(lesson),
    // Curriculum lessons carry no pool references; attribution falls back to the lesson's CEFR
    practiceItems: [],
    isReview: false,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as SessionRequest;

  try {
    if (body.lesson) {
      const lesson = getResolvedLesson(body.lesson);
      if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      return NextResponse.json(curriculumPayload(lesson));
    }

    // Real lesson number: completed lessons + 1 — drives exercise difficulty
    const { count } = await supabase
      .from("user_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);
    const order = (count ?? 0) + 1;

    if (body.mode === "review") {
      const scope = body.scope ? resolveVocabScope(body.scope) : undefined;
      const review = await generateReviewSession(user.id, undefined, supabase, scope);
      return NextResponse.json(toPayload(adaptReviewSession(review, { order }), true));
    }

    const cefr =
      body.level && LEVELS.includes(body.level)
        ? body.level
        : await getCurrentStudyLevel(user.id, supabase);
    const generated = await generateLesson(user.id, cefr, undefined, supabase);
    return NextResponse.json(toPayload(adaptGeneratedLesson(generated, { order }), false));
  } catch (err) {
    console.error("[learn/session] generation failed:", err);
    return NextResponse.json({ error: "Could not generate a session" }, { status: 500 });
  }
}
