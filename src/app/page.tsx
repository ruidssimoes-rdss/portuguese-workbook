"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  StatCard,
  SectionLabel,
  ListContainer,
  ListRow,
  CardShell,
} from "@/components/primitives";
import {
  getProgressStats,
  type ProgressStats,
  type TimelineEvent,
} from "@/lib/progress-stats-service";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getCurrentStudyLevel, getReviewCount } from "@/lib/learning-engine";
import { getAllContentTotals } from "@/lib/learning-engine/content-pool";
import { createClient } from "@/lib/supabase/client";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

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

// ─── Mastery Stats ──────────────────────────────────────────────────────────

interface MasteryStats {
  currentLevel: string;
  readinessPct: number;
  totalMastered: number;
  totalItems: number;
  reviewCount: number;
  displayName: string | null;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [masteryStats, setMasteryStats] = useState<MasteryStats | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [streakData, setStreakData] = useState<{ current: number; longest: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { setLoading(false); return; }

      // Load mastery data and timeline in parallel
      const [progression, level, reviews, ps] = await Promise.all([
        getFullProgression(currentUser.id),
        getCurrentStudyLevel(currentUser.id),
        getReviewCount(currentUser.id),
        getProgressStats().catch(() => null),
      ]);

      // Get display name
      const { data: profile } = await supabase
        .from("profiles")
        .select("google_display_name")
        .eq("id", currentUser.id)
        .single();

      const activeProgress = progression[level.toLowerCase() as "a1" | "a2" | "b1"];
      const totals = getAllContentTotals();
      const totalMastered =
        progression.a1.progress.mastered +
        progression.a2.progress.mastered +
        progression.b1.progress.mastered;
      const totalItems =
        totals.A1.vocab + totals.A1.verbs + totals.A1.grammar +
        totals.A2.vocab + totals.A2.verbs + totals.A2.grammar +
        totals.B1.vocab + totals.B1.verbs + totals.B1.grammar;

      setMasteryStats({
        currentLevel: level,
        readinessPct: Math.round(activeProgress.progress.readiness * 100),
        totalMastered,
        totalItems,
        reviewCount: reviews,
        displayName: profile?.google_display_name ?? null,
      });

      if (ps) {
        setProgressStats(ps);
        setStreakData({
          current: ps.currentStreak,
          longest: ps.longestStreak,
        });
      }

      setLoading(false);
    }

    load();
  }, [user, authLoading]);

  // Loading
  if (authLoading || loading) {
    return (
      <PageShell>
        <PageHeader title={getGreeting()} subtitle="Loading..." />
      </PageShell>
    );
  }

  const greeting = getGreeting();
  const contentTotals = getAllContentTotals();
  const totalVocab = contentTotals.A1.vocab + contentTotals.A2.vocab + contentTotals.B1.vocab;
  const totalVerbs = contentTotals.A1.verbs + contentTotals.A2.verbs + contentTotals.B1.verbs;

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title={
          user && masteryStats?.displayName
            ? `${greeting}, ${masteryStats.displayName}`
            : greeting
        }
        subtitle={
          user && masteryStats
            ? masteryStats.readinessPct > 0
              ? `${masteryStats.currentLevel} level · ${masteryStats.readinessPct}% ready`
              : "Start your first lesson to begin learning"
            : "Learn European Portuguese at your own pace"
        }
      />

      {/* Quick action CTA — authenticated */}
      {user && masteryStats && (
        <div className="flex gap-3 mb-8">
          <Link
            href="/learn"
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
          >
            Start next lesson
            <ArrowRight size={14} />
          </Link>

          {masteryStats.reviewCount > 0 && (
            <Link
              href="/learn?mode=review"
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
            >
              <RotateCcw size={14} />
              Review {masteryStats.reviewCount} items
            </Link>
          )}
        </div>
      )}

      {/* Stats grid — authenticated */}
      {user && masteryStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            label="Current level"
            value={masteryStats.currentLevel}
            subtitle={levelLabels[masteryStats.currentLevel] || "Beginner"}
          />
          <StatCard
            label="Items mastered"
            value={String(masteryStats.totalMastered)}
            total={String(masteryStats.totalItems)}
            progress={Math.round((masteryStats.totalMastered / masteryStats.totalItems) * 100)}
          />
          <StatCard
            label="Streak"
            value={streakData ? `${streakData.current}d` : "0d"}
            subtitle={
              streakData && streakData.longest > streakData.current
                ? `Best: ${streakData.longest}d`
                : streakData && streakData.current > 0
                  ? "Keep going!"
                  : undefined
            }
          />
          <StatCard
            label="To review"
            value={String(masteryStats.reviewCount)}
            subtitle={masteryStats.reviewCount > 0 ? "Items due" : "All caught up"}
          />
        </div>
      )}

      {/* Content overview — non-authenticated */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Link href="/vocabulary" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                {totalVocab.toLocaleString()} words
              </div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                across 16 categories
              </div>
            </CardShell>
          </Link>
          <Link href="/grammar" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                42 grammar topics
              </div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                A1 through B1
              </div>
            </CardShell>
          </Link>
          <Link href="/conjugations" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                {totalVerbs} verbs
              </div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                fully conjugated
              </div>
            </CardShell>
          </Link>
        </div>
      )}

      {/* Recent activity — authenticated */}
      {user && progressStats && progressStats.timeline.length > 0 && (
        <div className="mb-8">
          <SectionLabel>Recent activity</SectionLabel>
          <ListContainer>
            {progressStats.timeline.slice(0, 5).map((event, i) => (
              <ListRow key={i}>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventDotColor(event.type)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-[#111111]">
                      {event.title}
                    </span>
                    {event.subtitle && (
                      <span className="text-[12px] text-[#9B9DA3] ml-2">
                        {event.subtitle}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#9B9DA3] flex-shrink-0">
                    {formatDate(event.date)}
                  </span>
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
            <div className="text-[13px] font-medium text-[#111111]">
              Browse vocabulary
            </div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">
              {totalVocab.toLocaleString()} words · 16 categories
            </div>
          </CardShell>
        </Link>
        <Link href="/conjugations" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">
              Practice verbs
            </div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">
              {totalVerbs} verbs · 6 tenses
            </div>
          </CardShell>
        </Link>
        <Link href="/lessons" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">
              Continue lessons
            </div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">
              Adaptive · A1 to B1
            </div>
          </CardShell>
        </Link>
      </div>
    </PageShell>
  );
}
