"use client";

/**
 * Hoje — home screen (Figma: Ecrãs / Hoje).
 * Centred column: greeting, composer (opens search), three suggested actions,
 * and an «Esta semana» strip pinned to the bottom of the panel.
 */

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { CalendarDays, RotateCcw, Sparkles, Search, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageShell } from "@/components/layout/page-shell";
import { SearchModal } from "@/components/search-modal";
import { getProgressStats } from "@/lib/progress-stats-service";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getCurrentStudyLevel, getReviewSummary } from "@/lib/learning-engine";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

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
  /** Seen items that can be reviewed now. */
  reviewDue: number;
  /** Of those, how many are genuinely overdue. */
  reviewOverdue: number;
  streak: number;
  accuracy: number | null;
  firstName: string | null;
  /** Signed in but has not studied anything yet. Unknown (stats failed) counts as not fresh. */
  fresh: boolean;
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <PageShell>
        <div className="flex min-h-[calc(100dvh-140px)] items-center justify-center">
          <div className="text-aula-text-3">A carregar…</div>
        </div>
      </PageShell>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Redirect logged-out visitors to the landing page
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/welcome");
    }
  }, [user, authLoading, router]);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Check for OAuth errors in URL params
  useEffect(() => {
    const err = searchParams.get("error");
    const errorCode = searchParams.get("error_code");
    const errorDescription = searchParams.get("error_description");
    
    if (err || errorCode) {
      let errorMsg = "Ocorreu um erro ao iniciar sessão.";
      
      if (errorCode === "bad_oauth_state" || errorDescription?.includes("OAuth state")) {
        errorMsg = "A sessão de início de sessão expirou.";
      } else if (errorDescription) {
        errorMsg = `Erro de autenticação: ${errorDescription}`;
      }
      
      setOauthError(errorMsg);
      
      // Clean up URL by removing error params
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      newSearchParams.delete("error_code");
      newSearchParams.delete("error_description");
      const newUrl = newSearchParams.toString() 
        ? `${window.location.pathname}?${newSearchParams.toString()}` 
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authLoading || !user) return;
    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { setLoading(false); return; }

      const [progression, level, reviews, ps, profileRes] = await Promise.all([
        getFullProgression(currentUser.id),
        getCurrentStudyLevel(currentUser.id),
        getReviewSummary(currentUser.id),
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
        reviewDue: reviews.due,
        reviewOverdue: reviews.overdue,
        streak: ps?.currentStreak ?? 0,
        accuracy: ps && ps.averageAccuracy > 0 ? Math.round(ps.averageAccuracy) : null,
        firstName: fullName ? fullName.split(" ")[0] : null,
        fresh: !!ps && ps.totalLessonsCompleted === 0 && ps.totalWordsEncountered === 0 && mastered === 0,
      });
      setLoading(false);
    }
    load();
  }, [user, authLoading]);

  const greeting = getGreeting();

  const nextLevel = stats?.level === "A1" ? "A2" : stats?.level === "A2" ? "B1" : null;
  const subtitle = !stats
    ? " "
    : [
          stats.reviewDue > 0 ? `${stats.reviewDue} ${stats.reviewDue === 1 ? "revisão" : "revisões"} à espera` : "Tudo em dia",
          stats.streak > 0 ? `sequência de ${stats.streak} ${stats.streak === 1 ? "dia" : "dias"}` : null,
        ]
          .filter(Boolean)
          .join(" · ");

  const suggestions: { href: string; icon: typeof CalendarDays; label: string; meta: string }[] = [
    { href: "/learn", icon: CalendarDays, label: "Começar a sessão de hoje", meta: stats ? `${stats.level}` : "" },
    ...(stats && stats.reviewDue > 0
      ? [
          {
            href: "/learn?mode=review",
            icon: RotateCcw,
            // Items, not words: the count mixes vocabulary, verbs and grammar topics.
            label: `Rever ${stats.reviewDue} ${stats.reviewDue === 1 ? "item" : "itens"}`,
            meta: stats.reviewOverdue > 0 ? "Em atraso" : "Hoje",
          },
        ]
      : []),
    { href: "/tutor", icon: Sparkles, label: "Pedir uma sessão ao Professor Elísio", meta: "Personalizada" },
  ];

  const showGuest = !authLoading && !user;
  const showStart = !authLoading && !!user && !loading && !!stats?.fresh;

  return (
    <PageShell>
      {/* OAuth error banner */}
      {oauthError && (
        <div className="mx-auto w-full max-w-[640px] mb-6">
          <div className="flex items-start gap-3 rounded-[10px] border border-[#F0C9BE] bg-[#FBE9E4] px-4 py-3">
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[#B94A32]">{oauthError}</p>
              <Link
                href="/auth/login"
                className="mt-2 inline-flex h-8 items-center justify-center rounded-lg bg-[#1B2B61] px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-[#151F4A]"
              >
                Tentar novamente
              </Link>
            </div>
            <button
              onClick={() => setOauthError(null)}
              className="flex h-5 w-5 items-center justify-center rounded text-[#B94A32] transition-colors hover:bg-[#F0C9BE]"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
      
      <div className="flex min-h-[calc(100dvh-140px)] flex-col">
        <div className="flex-1" />

        {/* Centre column */}
        <div className="mx-auto w-full max-w-[640px]">
          {showGuest ? (
            <EmptyPanel
              title="Bem-vindo à Aula"
              copy="Learn European Portuguese from A1 to B1. Pick a place to start."
              cta={{ href: "/auth/login", label: "Entrar para começar" }}
              links={[
                { href: "/vocabulary", label: "Vocabulário" },
                { href: "/grammar", label: "Gramática" },
              ]}
            />
          ) : showStart ? (
            <EmptyPanel
              title="Vamos começar"
              copy="Your first lesson takes about 10 minutes."
              cta={{ href: "/learn", label: "Começar Lição 1" }}
              links={[
                { href: "/vocabulary", label: "Vocabulário" },
                { href: "/grammar", label: "Gramática" },
                { href: "/conjugations", label: "Conjugações" },
              ]}
            />
          ) : (
            <>
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
              {user && (
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
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Esta semana */}
        {user && stats && !stats.fresh && (
          <div className="mx-auto mt-10 w-full max-w-[640px]">
            <div className="mb-2.5 text-[11px] text-aula-text-3">O teu estado</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Stat label="Revisões em atraso" value={String(stats.reviewOverdue)} tone={stats.reviewOverdue > 0 ? "overdue" : "default"} />
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

function EmptyPanel({
  title,
  copy,
  cta,
  links,
}: {
  title: string;
  copy: string;
  cta: { href: string; label: string };
  links: { href: string; label: string }[];
}) {
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[14px] border border-aula-border bg-aula-panel px-8 py-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h1 className="text-[17px] font-semibold tracking-[-0.01em] text-aula-text">{title}</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-aula-text-2">{copy}</p>
      <Link
        href={cta.href}
        className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-aula-accent px-5 text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
      >
        {cta.label}
      </Link>
      <div className="mt-4 flex items-center justify-center gap-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-[12.5px] text-aula-text-2 transition-colors hover:text-aula-text">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
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
