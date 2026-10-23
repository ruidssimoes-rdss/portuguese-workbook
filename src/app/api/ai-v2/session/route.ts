import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { planSession } from "@/lib/ai-v2/session-planner";
import { planToLesson } from "@/lib/ai-v2/plan-to-lesson";

export async function POST() {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Plan the session from reviews and level. Nothing leaves the app.
    const plan = await planSession(user.id);

    // 3. Resolve content keys into a Lesson for the player
    const lesson = planToLesson(plan);

    // 4. Save session to Supabase
    const { error: saveError } = await supabase
      .from("tutor_sessions")
      .insert({
        user_id: user.id,
        session_title: plan.sessionTitle,
        session_title_pt: plan.sessionTitlePt,
        description: `${plan.difficulty} session with ${plan.focusAreas.length} focus areas`,
        stages: plan.focusAreas,
        rationale: `Built from reviews and level. Review priority: ${plan.reviewPriority}.`,
        estimated_minutes: plan.estimatedMinutes,
        difficulty: plan.difficulty,
      });

    if (saveError) {
      console.error("Failed to save tutor session:", saveError);
    }

    // 5. Return the lesson
    return NextResponse.json({
      success: true,
      lesson,
      sessionId: lesson.id,
    });
  } catch (error) {
    console.error("AI session error:", error);
    return NextResponse.json(
      { error: "Failed to generate session" },
      { status: 500 },
    );
  }
}
