"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";
import type { LessonBlockPlan } from "@/types/blocks";

type Status = "idle" | "generating" | "ready" | "error";

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

const LOADING_MESSAGES = [
  "Analysing your progress...",
  "Building your session...",
  "Selecting content...",
  "Almost ready...",
];

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

export function TutorTabV2() {
  const router = useRouter();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [plan, setPlan] = useState<LessonBlockPlan | null>(null);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const msgInterval = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // Rotate loading messages
  useEffect(() => {
    if (status === "generating") {
      let idx = 0;
      msgInterval.current = setInterval(() => {
        idx = (idx + 1) % LOADING_MESSAGES.length;
        setLoadingMsg(LOADING_MESSAGES[idx]);
      }, 2000);
      return () => {
        if (msgInterval.current) clearInterval(msgInterval.current);
      };
    }
  }, [status]);

  const handleGenerate = useCallback(async () => {
    setStatus("generating");
    setError(null);
    setLoadingMsg(LOADING_MESSAGES[0]);

    try {
      const res = await fetch("/api/ai-v2/session", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Failed to generate session.");
        return;
      }

      setPlan(data.plan);
      setSource(data.source);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Network error. Check your connection.");
    }
  }, []);

  const handleStart = useCallback(() => {
    if (!plan) return;
    sessionStorage.setItem(`ai-session-${plan.meta.id}`, JSON.stringify(plan));
    router.push(`/lessons/${plan.meta.id}`);
  }, [plan, router]);

  return (
    <div className="max-w-[896px] mx-auto">
      {/* Intro */}
      <div className="mb-10">
        <h2 className="text-[22px] font-medium text-[#111111]">AI Tutor</h2>
        <p className="text-[13px] font-medium text-[#9B9DA3] italic mt-0.5">
          Sessões personalizadas baseadas no teu progresso
        </p>
        <p className="text-[14px] text-[#6C6B71] leading-relaxed mt-3 max-w-[640px]">
          Each session adapts to your weak areas, overdue reviews, and current level.
          Content comes from verified European Portuguese data — the AI only decides
          what to practice and how to sequence it.
        </p>
      </div>

      {/* Session card */}
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white">
        {/* Idle state */}
        {status === "idle" && (
          <div>
            <p className="text-[16px] font-medium text-[#111111]">
              Ready for practice
            </p>
            <p className="text-[14px] text-[#6C6B71] mt-2 max-w-[500px]">
              Your tutor will analyse your progress and create a personalized review session.
            </p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors mt-5"
            >
              Generate Session
            </button>
            <p className="text-[12px] text-[#9B9DA3] mt-3">
              Powered by AI · Adapts to your weak areas
            </p>
          </div>
        )}

        {/* Generating state */}
        {status === "generating" && (
          <div>
            <div className="space-y-3 animate-pulse">
              <div className="h-5 bg-[#F7F7F5] rounded w-2/3" />
              <div className="h-3 bg-[#F7F7F5] rounded w-1/3" />
              <div className="h-16 bg-[#F7F7F5] rounded w-full mt-3" />
              <div className="flex gap-8 mt-3">
                <div className="h-8 bg-[#F7F7F5] rounded w-16" />
                <div className="h-8 bg-[#F7F7F5] rounded w-16" />
                <div className="h-8 bg-[#F7F7F5] rounded w-16" />
              </div>
            </div>
            <p className="text-[13px] text-[#9B9DA3] mt-5">{loadingMsg}</p>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div>
            <p className="text-[14px] font-medium text-[#111111]">Something went wrong</p>
            <p className="text-[13px] text-[#6C6B71] mt-1">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors mt-4"
            >
              Try again
            </button>
          </div>
        )}

        {/* Ready state */}
        {status === "ready" && plan && (
          <div>
            <h3 className="text-[18px] font-medium text-[#111111]">
              {plan.meta.title}
            </h3>
            <p className="text-[13px] text-[#9B9DA3] italic mt-1">
              {plan.meta.ptTitle}
            </p>

            <div className="flex gap-8 mt-5">
              <div>
                <p className="text-[20px] font-medium text-[#111111]">
                  {plan.learnBlocks.length + plan.exerciseBlocks.length}
                </p>
                <p className="text-[11px] text-[#9B9DA3]">Items</p>
              </div>
              <div>
                <p className="text-[20px] font-medium text-[#111111]">
                  {plan.meta.estimatedMinutes}
                </p>
                <p className="text-[11px] text-[#9B9DA3]">Minutes</p>
              </div>
              <div>
                <p className="text-[20px] font-medium text-[#111111]">{plan.meta.cefr}</p>
                <p className="text-[11px] text-[#9B9DA3]">Level</p>
              </div>
            </div>

            {source === "fallback" && (
              <p className="text-[12px] text-[#9B9DA3] mt-3">
                Generated without AI (offline mode)
              </p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleStart}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
              >
                Start Session
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
              >
                Generate New
              </button>
            </div>
          </div>
        )}
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
