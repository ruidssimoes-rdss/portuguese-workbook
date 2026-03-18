import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateFamiliarityFromSession, type SessionAnswerWithContext } from "@/lib/familiarity-updater";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, answers, accuracy, passed } = body as {
      sessionId: string;
      answers: SessionAnswerWithContext[];
      accuracy: number;
      passed: boolean;
    };

    // 1. Update familiarity for vocab and verbs
    const { vocabUpdated, verbsUpdated } = await updateFamiliarityFromSession(
      supabase,
      user.id,
      answers ?? [],
    );

    // 2. Update tutor_sessions record if this is an AI session
    if (sessionId) {
      await supabase
        .from("tutor_sessions")
        .update({
          completed: true,
          accuracy_score: accuracy / 100,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("completed", false)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    return NextResponse.json({
      success: true,
      updated: { vocab: vocabUpdated, verbs: verbsUpdated },
    });
  } catch (error) {
    console.error("Session completion error:", error);
    return NextResponse.json(
      { error: "Failed to save session completion" },
      { status: 500 },
    );
  }
}
