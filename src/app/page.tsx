"use client";

/**
 * Hoje — home screen (Figma: Ecrãs / Hoje).
 * Centred column: greeting, composer (opens search), three suggested actions,
 * and an «Esta semana» strip pinned to the bottom of the panel.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, RotateCcw, Sparkles, Search, ChevronRight, LogIn, BookA, Baseline, Type } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageShell } from "@/components/layout/page-shell";
import { SearchModal } from "@/components/search-modal";
import { getProgressStats } from "@/lib/progress-stats-service";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getCurrentStudyLevel, getReviewCount } from "@/lib/learning-engine";
import { getAllContentTotals } from "@/lib/learning-engine/content-pool";
import { createClient } from "@/lib/supabase/client";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 20) return "Boa tarde";
  return "Boa noite";
}

interface HomeStats {
  level: string;
  readinessPct: number;
  mastered: number;
  reviewCount: number;
  streak: number;
  accuracy: number | null;
  firstName: string | null;
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { setLoading(false); return; }

      const [progression, level, reviews, ps, profileRes] = await Promise.all([
        getFullProgression(currentUser.id),
        getCurrentStudyLevel(currentUser.id),
        getReviewCount(currentUser.id),
        getProgressStats().catch(() => null),
        supabase.from("profiles").select("google_display_name").eq("id", currentUser.id).single(),
      ]);

      const active = progression[level.toLowerCase() as "a1" | "a2" | "b1"];
      const mastered =
        progression.a1.progress.mastered + progression.a2.progress.mastered + progression.b1.progress.mastered;
      const fullName = (profileRes.data?.google_display_name as string | null) ?? null;

      setStats({
        level,
        readinessPct: Math.round(active.progress.readiness * 100),
        mastered,
        reviewCount: reviews,
        streak: ps?.currentStreak ?? 0,
        accuracy: ps && ps.averageAccuracy > 0 ? Math.round(ps.averageAccuracy) : null,
        firstName: fullName ? fullName.split(" ")[0] : null,
      });
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  const greeting = getGreeting();
  const totals = getAllContentTotals();
  const totalVocab = totals.A1.vocab + totals.A2.vocab + totals.B1.vocab;
  const totalVerbs = totals.A1.verbs + totals.A2.verbs + totals.B1.verbs;
  const totalGrammar = totals.A1.grammar + totals.A2.grammar + totals.B1.grammar;

  const nextLevel = stats?.level === "A1" ? "A2" : stats?.level === "A2" ? "B1" : null;
  const subtitle = !user
    ? "Português europeu, do A1 ao B1."
    : !stats
      ? " "
      : [
          stats.reviewCount > 0 ? `${stats.reviewCount} revisões à espera` : "Tudo em dia",
          stats.streak > 0 ? `sequência de ${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const suggestions: { href: string; icon: typeof CalendarDays; label: string; meta: string }[] = user
    ? [
        { href: "/learn", icon: CalendarDays, label: "Começar a sessão de hoje", meta: stats ? `${stats.level}` : "" },
        ...(stats && stats.reviewCount > 0
          ? [{ href: "/learn?mode=review", icon: RotateCcw, label: `Rever ${stats.reviewCount} ${stats.reviewCount === 1 ? "palavra" : "palavras"}`, meta: "Em atraso" }]
          : []),
        { href: "/tutor", icon: Sparkles, label: "Pedir uma sessão ao Professor Elísio", meta: "Personalizada" },
      ]
    : [
        { href: "/vocabulary", icon: BookA, label: "Explorar o vocabulário", meta: `${totalVocab.toLocaleString("pt-PT")} palavras` },
        { href: "/grammar", icon: Baseline, label: "Ver a gramática", meta: `${totalGrammar} tópicos` },
        { href: "/conjugations", icon: Type, label: "Conjugar verbos", meta: `${totalVerbs} verbos` },
      ];

  return (
    <PageShell>
      <div className="flex min-h-[calc(100dvh-140px)] flex-col">
        <div className="flex-1" />

        {/* Centre column */}
        <div className="mx-auto w-full max-w-[640px]">
          <h1 className="text-center text-[17px] font-semibold tracking-[-0.01em] text-aula-text">
            {user && stats?.firstName ? `${greeting}, ${stats.firstName}` : greeting}
          </h1>
          <p className="mt-1 min-h-[18px] text-center text-[11.5px] text-aula-text-3">
            {authLoading || (user && loading) ? "" : subtitle}
          </p>

          {/* Composer → search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mt-5 flex w-full flex-col gap-7 rounded-[14px] border border-aula-border bg-aula-panel px-4 pb-3 pt-3.5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-colors hover:border-aula-text-4"
          >
            <span className="text-[12.5px] text-aula-text-3">Procura uma palavra, um verbo ou uma regra…</span>
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-aula-border text-aula-text-2">
                <Search size={14} strokeWidth={1.5} />
              </span>
              <span className="flex-1" />
              <kbd className="rounded bg-aula-sunken px-1.5 py-0.5 text-[10.5px] text-aula-text-3">⌘K</kbd>
            </span>
          </button>

          {/* Suggestions */}
          <div className="mt-4 flex flex-col gap-1.5">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.href + s.label}
                  href={s.href}
                  className="group flex h-11 items-center gap-3 rounded-[10px] bg-aula-sunken px-3.5 transition-colors hover:bg-aula-selected"
                >
                  <Icon size={16} strokeWidth={1.5} className="text-aula-text-2" />
                  <span className="text-[12.5px] text-aula-text">{s.label}</span>
                  <span className="flex-1" />
                  <span className="text-[11px] text-aula-text-3">{s.meta}</span>
                  <ChevronRight size={14} strokeWidth={1.5} className="text-aula-text-4 transition-colors group-hover:text-aula-text-3" />
                </Link>
              );
            })}
            {!authLoading && !user && (
              <Link
                href="/auth/login"
                className="mt-2 flex h-9 items-center justify-center gap-2 rounded-[10px] bg-aula-accent text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
              >
                <LogIn size={14} strokeWidth={1.5} />
                Entrar para guardar o progresso
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Esta semana */}
        {user && stats && (
          <div className="mx-auto mt-10 w-full max-w-[640px]">
            <div className="mb-2.5 text-[11px] text-aula-text-3">O teu estado</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Stat label="Revisões em atraso" value={String(stats.reviewCount)} tone={stats.reviewCount > 0 ? "overdue" : "default"} />
              <Stat label="Sequência" value={`${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}`} />
              <Stat label="Itens dominados" value={stats.mastered.toLocaleString("pt-PT")} />
              <Stat
                label={nextLevel ? `A caminho de ${nextLevel}` : `Nível ${stats.level}`}
                value={`${stats.readinessPct}%`}
              />
            </div>
          </div>
        )}
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </PageShell>
  );
}

function Stat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "overdue" }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] bg-aula-sunken px-3.5 py-3">
      <span className="text-[11px] text-aula-text-3">{label}</span>
      <span className={`text-[15px] font-semibold ${tone === "overdue" ? "text-aula-overdue" : "text-aula-text"}`}>{value}</span>
    </div>
  );
}
