import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  StatCard,
  SectionLabel,
  ListContainer,
  ListRow,
  CardShell,
} from "@/components/primitives";
import { getProgressStats, type ProgressStats, type TimelineEvent } from "@/lib/progress-stats-service";
import { getFullProgression, getCurrentStudyLevel } from "@/lib/learning-engine/cefr-readiness";
import { getReviewCount } from "@/lib/learning-engine/mastery-tracker";
import { getAllContentTotals } from "@/lib/learning-engine/content-pool";
import { HomeLoadError } from "@/components/home/home-load-error";
import { Greeting } from "@/components/home/greeting";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// ─── Helpers ────────────────────────────────────────────────────────────────

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
};

function eventDotColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "lesson":
      return "bg-[#0F6E56]";
    case "exam":
      return "bg-[#185FA5]";
    case "level-complete":
      return "bg-[#854F0B]";
    case "milestone":
      return "bg-[#185FA5]";
    case "goal-complete":
      return "bg-[#0F6E56]";
    case "streak":
      return "bg-[#854F0B]";
    default:
      return "bg-[#9B9DA3]";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Data ───────────────────────────────────────────────────────────────────

interface HomeData {
  currentLevel: string;
  readinessPct: number;
  totalMastered: number;
  totalItems: number;
  reviewCount: number;
  displayName: string | null;
  progressStats: ProgressStats | null;
}

/** One round trip per source, one auth read (the caller already knows the user). */
async function loadHomeData(supabase: SupabaseClient, userId: string): Promise<HomeData> {
  const [progression, level, reviewCount, progressStats, profileRes] = await Promise.all([
    getFullProgression(userId, supabase),
    getCurrentStudyLevel(userId, supabase),
    getReviewCount(userId, supabase),
    getProgressStats(supabase, userId).catch(() => null),
    supabase.from("profiles").select("google_display_name").eq("id", userId).maybeSingle(),
  ]);

  const activeProgress = progression[level.toLowerCase() as "a1" | "a2" | "b1"];
  const totals = getAllContentTotals();
  const totalMastered =
    progression.a1.progress.mastered + progression.a2.progress.mastered + progression.b1.progress.mastered;
  const totalItems =
    totals.A1.vocab + totals.A1.verbs + totals.A1.grammar +
    totals.A2.vocab + totals.A2.verbs + totals.A2.grammar +
    totals.B1.vocab + totals.B1.verbs + totals.B1.grammar;

  return {
    currentLevel: level,
    readinessPct: Math.round(activeProgress.progress.readiness * 100),
    totalMastered,
    totalItems,
    reviewCount,
    displayName: profileRes.data?.google_display_name ?? null,
    progressStats,
  };
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const contentTotals = getAllContentTotals();
  const totalVocab = contentTotals.A1.vocab + contentTotals.A2.vocab + contentTotals.B1.vocab;
  const totalVerbs = contentTotals.A1.verbs + contentTotals.A2.verbs + contentTotals.B1.verbs;

  let data: HomeData | null = null;
  let loadError: string | null = null;
  if (user) {
    try {
      data = await loadHomeData(supabase, user.id);
    } catch (err) {
      console.error("Home page load error:", err);
      loadError = err instanceof Error ? err.message : "Could not load your progress.";
    }
  }

  if (user && loadError) {
    return (
      <PageShell>
        <PageHeader title={<Greeting name={null} />} subtitle="We couldn't load your progress." />
        <HomeLoadError message={loadError} />
      </PageShell>
    );
  }

  const streak = data?.progressStats
    ? { current: data.progressStats.currentStreak, longest: data.progressStats.longestStreak }
    : null;

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title={<Greeting name={user ? data?.displayName ?? null : null} />}
        subtitle={
          user && data
            ? data.readinessPct > 0
              ? `${data.currentLevel} level · ${data.readinessPct}% ready`
              : "Start your first lesson to begin learning"
            : "Learn European Portuguese at your own pace"
        }
      />

      {/* Quick action CTA — authenticated */}
      {user && data && (
        <div className="flex gap-3 mb-8">
          <Link
            href="/learn"
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
          >
            Start next lesson
            <ArrowRight size={14} />
          </Link>

          {data.reviewCount > 0 && (
            <Link
              href="/learn?mode=review"
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
            >
              <RotateCcw size={14} />
              Review {data.reviewCount} items
            </Link>
          )}
        </div>
      )}

      {/* Stats grid — authenticated */}
      {user && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Current level"
            value={data.currentLevel}
            subtitle={levelLabels[data.currentLevel] || "Beginner"}
          />
          <StatCard
            label="Items mastered"
            value={String(data.totalMastered)}
            total={String(data.totalItems)}
            progress={Math.round((data.totalMastered / data.totalItems) * 100)}
          />
          <StatCard
            label="Streak"
            value={streak ? `${streak.current}d` : "0d"}
            subtitle={
              streak && streak.longest > streak.current
                ? `Best: ${streak.longest}d`
                : streak && streak.current > 0
                  ? "Keep going!"
                  : undefined
            }
          />
          <StatCard
            label="To review"
            value={String(data.reviewCount)}
            subtitle={data.reviewCount > 0 ? "Items due" : "All caught up"}
          />
        </div>
      )}

      {/* Content overview — non-authenticated */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Link href="/vocabulary" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">{totalVocab.toLocaleString()} words</div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">across 16 categories</div>
            </CardShell>
          </Link>
          <Link href="/grammar" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">42 grammar topics</div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">A1 through B1</div>
            </CardShell>
          </Link>
          <Link href="/conjugations" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">{totalVerbs} verbs</div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">fully conjugated</div>
            </CardShell>
          </Link>
        </div>
      )}

      {/* Recent activity — authenticated */}
      {user && data?.progressStats && data.progressStats.timeline.length > 0 && (
        <div className="mb-8">
          <SectionLabel>Recent activity</SectionLabel>
          <ListContainer>
            {data.progressStats.timeline.slice(0, 5).map((event, i) => (
              <ListRow key={i}>
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventDotColor(event.type)}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#111111]">{event.title}</span>
                    {event.subtitle && (
                      <span className="text-[12px] text-[#9B9DA3] ml-2">{event.subtitle}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9B9DA3] flex-shrink-0">{formatDate(event.date)}</span>
                </div>
              </ListRow>
            ))}
          </ListContainer>
        </div>
      )}

      {/* Quick access — always visible */}
      <SectionLabel>Quick access</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/vocabulary" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">Browse vocabulary</div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">{totalVocab.toLocaleString()} words · 16 categories</div>
          </CardShell>
        </Link>
        <Link href="/conjugations" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">Practice verbs</div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">{totalVerbs} verbs · 6 tenses</div>
          </CardShell>
        </Link>
        <Link href="/lessons" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">Continue lessons</div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">Adaptive · A1 to B1</div>
          </CardShell>
        </Link>
      </div>
    </PageShell>
  );
}
