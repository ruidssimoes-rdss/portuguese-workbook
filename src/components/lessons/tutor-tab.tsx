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
  "A analisar o teu progresso…",
  "A montar a sessão…",
  "A escolher o conteúdo…",
  "Quase pronto…",
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `há ${Math.max(mins, 1)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "ontem";
  return `há ${days} dias`;
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
        setError(data.error || "Não foi possível preparar a sessão.");
        return;
      }

      setPlan(data.plan);
      setSource(data.source);
      setStatus("ready");
    } catch {
      setStatus("error");
      setError("Sem ligação. Verifica a tua internet.");
    }
  }, []);

  const handleStart = useCallback(() => {
    if (!plan) return;
    sessionStorage.setItem(`ai-session-${plan.meta.id}`, JSON.stringify(plan));
    router.push(`/lessons/${plan.meta.id}`);
  }, [plan, router]);

  const btn = "inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[12px] font-medium transition-colors";
  const primary = `${btn} bg-aula-accent text-white hover:bg-aula-accent-hover`;
  const secondary = `${btn} border border-aula-border bg-white text-aula-text hover:border-aula-text-4`;

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-aula-accent text-[14px] font-semibold text-white">E</span>
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">Professor Elísio</h1>
          <p className="text-[13px] text-aula-text-2">Prepara uma sessão sobre o que te está a custar.</p>
        </div>
      </div>

      <div className="rounded-xl border border-aula-border bg-white p-5">
        {status === "idle" && (
          <div>
            <p className="text-[15px] font-semibold text-aula-text">Pronto para praticar?</p>
            <p className="mt-1.5 max-w-[500px] text-[12.5px] leading-relaxed text-aula-text-2">
              O Elísio olha para os teus pontos fracos, para as revisões em atraso e para o teu nível, e monta uma sessão só para ti. O conteúdo vem sempre do Aula, em português europeu verificado.
            </p>
            <button onClick={handleGenerate} className={`${primary} mt-4`}>
              Preparar sessão
            </button>
          </div>
        )}

        {status === "generating" && (
          <div>
            <div className="animate-pulse space-y-2.5">
              <div className="h-4 w-2/3 rounded bg-aula-sunken" />
              <div className="h-3 w-1/3 rounded bg-aula-sunken" />
              <div className="mt-3 h-14 w-full rounded bg-aula-sunken" />
            </div>
            <p className="mt-4 text-[12px] text-aula-text-3">{loadingMsg}</p>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="text-[13px] font-medium text-aula-text">Algo correu mal</p>
            <p className="mt-1 text-[12px] text-aula-text-2">{error}</p>
            <button onClick={handleGenerate} className={`${secondary} mt-4`}>
              Tentar outra vez
            </button>
          </div>
        )}

        {status === "ready" && plan && (
          <div>
            <p className="text-[15px] font-semibold text-aula-text">{plan.meta.ptTitle || plan.meta.title}</p>
            {plan.meta.ptTitle && <p className="mt-0.5 text-[12px] text-aula-text-3">{plan.meta.title}</p>}
            <div className="mt-4 flex gap-8">
              {[
                { v: plan.learnBlocks.length + plan.exerciseBlocks.length, k: "Itens" },
                { v: `${plan.meta.estimatedMinutes} min`, k: "Duração" },
                { v: plan.meta.cefr, k: "Nível" },
              ].map((x) => (
                <div key={x.k}>
                  <p className="text-[18px] font-semibold text-aula-text">{x.v}</p>
                  <p className="text-[11px] text-aula-text-3">{x.k}</p>
                </div>
              ))}
            </div>
            {source === "fallback" && <p className="mt-3 text-[11.5px] text-aula-text-3">Preparada sem IA, a partir das tuas revisões e do teu nível.</p>}
            <div className="mt-5 flex items-center gap-2">
              <button onClick={handleStart} className={primary}>
                Começar
              </button>
              <button onClick={handleGenerate} className={secondary}>
                Preparar outra
              </button>
            </div>
          </div>
        )}
      </div>

      {pastSessions.length > 0 && (
        <div className="mt-10">
          <p className="mb-2 px-3 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Sessões anteriores</p>
          {pastSessions.map((ps) => (
            <div key={ps.id} className="flex min-h-[48px] items-center gap-4 rounded-[10px] px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] text-aula-text">{ps.session_title_pt || ps.session_title}</p>
                <p className="text-[11px] text-aula-text-3">
                  {timeAgo(ps.created_at)}
                  {ps.estimated_minutes ? ` · ${ps.estimated_minutes} min` : ""}
                </p>
              </div>
              {ps.completed && ps.accuracy_score != null ? (
                <span className="text-[12px] font-medium text-[#1F7A68]">{Math.round(ps.accuracy_score * 100)}%</span>
              ) : (
                <span className="text-[11px] text-aula-text-3">Por acabar</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
