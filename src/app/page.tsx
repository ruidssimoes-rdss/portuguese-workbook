"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
  getHomepageData,
  type HomepageData,
} from "@/lib/homepage-service";
import {
  getProgressStats,
  type ProgressStats,
  type TimelineEvent,
} from "@/lib/progress-stats-service";

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [homeData, setHomeData] = useState<HomepageData | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([getHomepageData(), getProgressStats()]).then(
      ([hd, ps]) => {
        setHomeData(hd);
        setProgressStats(ps);
        setLoading(false);
      }
    );
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
  const nextLesson = homeData?.nextLesson;

  return (
    <PageShell>
      {/* Header */}
      <PageHeader
        title={
          user && homeData?.displayName
            ? `${greeting}, ${homeData.displayName}`
            : greeting
        }
        subtitle={
          user && homeData
            ? nextLesson
              ? `You're on lesson ${homeData.totalLessonsCompleted + 1} of 44 — keep going.`
              : homeData.totalLessonsCompleted >= 44
                ? "You've completed the entire curriculum. Parabéns!"
                : "Learn European Portuguese at your own pace"
            : "Learn European Portuguese at your own pace"
        }
      />

      {/* Continue learning CTA */}
      {user && nextLesson && (
        <Link href={`/lessons/${nextLesson.id}`} className="block mb-8">
          <CardShell interactive>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-1.5">
                  Continue where you left off
                </div>
                <div className="text-[14px] font-medium text-[#111111]">
                  {nextLesson.title}
                </div>
                <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                  {nextLesson.titlePt} · {nextLesson.cefr}
                </div>
              </div>
              <ChevronRight
                size={20}
                className="text-[#9B9DA3] flex-shrink-0"
              />
            </div>
          </CardShell>
        </Link>
      )}

      {/* Stats grid — authenticated */}
      {user && homeData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Lessons completed"
            value={String(homeData.totalLessonsCompleted)}
            total="44"
            progress={Math.round((homeData.totalLessonsCompleted / 44) * 100)}
          />
          <StatCard
            label="Words encountered"
            value={String(homeData.totalWordsEncountered)}
            total="840"
            progress={Math.round(
              (homeData.totalWordsEncountered / 840) * 100
            )}
          />
          <StatCard
            label="Current level"
            value={homeData.currentCefrLevel}
            subtitle={levelLabels[homeData.currentCefrLevel] || "Beginner"}
          />
        </div>
      )}

      {/* Streak + study days — authenticated */}
      {user && homeData && homeData.currentStreak > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-8">
          <StatCard
            label="Current streak"
            value={`${homeData.currentStreak}d`}
            subtitle={
              homeData.longestStreak > homeData.currentStreak
                ? `Best: ${homeData.longestStreak}d`
                : undefined
            }
          />
          <StatCard
            label="This week"
            value={`${homeData.weeklyStudyDays}/${homeData.weeklyTargetDays}`}
            subtitle="study days"
          />
        </div>
      )}

      {/* Content overview — non-authenticated */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <Link href="/vocabulary" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                840 words
              </div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                across 16 categories
              </div>
            </CardShell>
          </Link>
          <Link href="/grammar" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                31 grammar topics
              </div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                A1 through B1
              </div>
            </CardShell>
          </Link>
          <Link href="/conjugations" className="block">
            <CardShell interactive>
              <div className="text-[14px] font-medium text-[#111111]">
                177 verbs
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
              840 words · 16 categories
            </div>
          </CardShell>
        </Link>
        <Link href="/conjugations" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">
              Practice verbs
            </div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">
              177 verbs · 6 tenses
            </div>
          </CardShell>
        </Link>
        <Link href="/lessons" className="block">
          <CardShell interactive>
            <div className="text-[13px] font-medium text-[#111111]">
              Continue lessons
            </div>
            <div className="text-[11px] text-[#9B9DA3] mt-0.5">
              44 lessons · A1 to B1
            </div>
          </CardShell>
        </Link>
      </div>
    </PageShell>
  );
}
