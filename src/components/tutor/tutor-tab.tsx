"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

interface PastSession {
  id: string;
  session_title: string;
  session_title_pt: string | null;
  estimated_minutes: number | null;
  accuracy_score: number | null;
  completed: boolean;
  difficulty: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

/**
 * TutorTabV2 — Professor Elísio is offline.
 * The LLM session planner (/api/ai-v2) was removed; this is a placeholder
 * until a replacement generator exists. Past sessions are still listed.
 */
export function TutorTabV2() {
  const { user } = useAuth();
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);

  // Fetch past sessions
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("tutor_sessions")
      .select("id, session_title, session_title_pt, estimated_minutes, accuracy_score, completed, difficulty, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setPastSessions(data);
      });
  }, [user]);

  return (
    <div className="max-w-[896px] mx-auto">
      {/* Intro */}
      <div className="mb-10">
        <h2 className="text-[22px] font-medium text-[#111111]">Professor Elísio</h2>
        <p className="text-[13px] font-medium text-[#9B9DA3] italic mt-0.5">
          Sessões personalizadas baseadas no teu progresso
        </p>
        <p className="text-[14px] text-[#6C6B71] leading-relaxed mt-3 max-w-[640px]">
          Each session adapts to your weak areas, overdue reviews, and current level.
          Content comes from verified European Portuguese data — the AI only decides
          what to practice and how to sequence it.
        </p>
      </div>

      {/* Offline state */}
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white">
        <p className="text-[16px] font-medium text-[#111111]">
          Professor Elísio is offline
        </p>
        <p className="text-[14px] text-[#6C6B71] mt-2 max-w-[500px]">
          Personalised sessions are paused for now. Your past sessions are still
          listed below, and the rest of the app works as usual.
        </p>
        <p className="text-[12px] text-[#9B9DA3] mt-3">
          O Professor Elísio está offline · Voltamos em breve
        </p>
      </div>

      {/* Past sessions */}
      {pastSessions.length > 0 && (
        <div className="mt-12">
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#9B9DA3] mb-4">
            Past sessions · Sessões anteriores
          </p>
          <div>
            {pastSessions.map((ps, i) => (
              <div
                key={ps.id}
                className={`flex items-center justify-between py-3 ${
                  i < pastSessions.length - 1 ? "border-b border-[rgba(0,0,0,0.06)]" : ""
                }`}
              >
                <div>
                  <p className="text-[14px] font-medium text-[#111111]">
                    {ps.session_title}
                  </p>
                  <p className="text-[12px] text-[#9B9DA3]">
                    {timeAgo(ps.created_at)}
                    {ps.difficulty ? ` · ${ps.difficulty}` : ""}
                    {ps.estimated_minutes ? ` · ${ps.estimated_minutes} min` : ""}
                  </p>
                </div>
                {ps.completed && ps.accuracy_score != null && (
                  <p className="text-[13px] font-medium text-[#0F6E56]">
                    {Math.round(ps.accuracy_score * 100)}%
                  </p>
                )}
                {!ps.completed && (
                  <p className="text-[12px] text-[#9B9DA3]">Not completed</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
