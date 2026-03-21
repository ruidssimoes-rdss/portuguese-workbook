"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  StatCard,
  SectionLabel,
  ListContainer,
  ListRow,
  BadgePill,
} from "@/components/primitives";
import {
  getProgressStats,
  type ProgressStats,
  type TimelineEvent,
} from "@/lib/progress-stats-service";

// ─── Helpers ────────────────────────────────────────────────────────────────

const levelLabels: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
};

function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

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

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getProgressStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, [user]);

  // Loading state
  if (authLoading || loading) {
    return (
      <PageShell>
        <PageHeader title="O teu progresso" subtitle="Your learning journey" />
        <div className="text-[13px] text-[#9B9DA3] text-center py-16">
          A carregar...
        </div>
      </PageShell>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <PageShell>
        <PageHeader title="O teu progresso" subtitle="Your learning journey" />
        <div className="text-center py-16">
          <div className="text-[14px] text-[#6C6B71] mb-4">
            Sign in to track your progress
          </div>
          <a
            href="/auth/login"
            className="inline-flex px-4 py-2 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
          >
            Sign in
          </a>
        </div>
      </PageShell>
    );
  }

  // No stats (shouldn't happen if logged in, but handle gracefully)
  if (!stats) {
    return (
      <PageShell>
        <PageHeader title="O teu progresso" subtitle="Your learning journey" />
        <div className="text-[13px] text-[#9B9DA3] text-center py-16">
          Start your first lesson to see progress here
        </div>
      </PageShell>
    );
  }

  const totalLessons = 44;
  const totalWords = 840;
  const overallProgress = Math.round(
    (stats.totalLessonsCompleted / totalLessons) * 100
  );

  return (
    <PageShell>
      <PageHeader title="O teu progresso" subtitle="Your learning journey" />

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <StatCard
          label="Lessons completed"
          value={String(stats.totalLessonsCompleted)}
          total={String(totalLessons)}
          progress={overallProgress}
        />
        <StatCard
          label="Words encountered"
          value={String(stats.totalWordsEncountered)}
          total={String(totalWords)}
          progress={Math.round(
            (stats.totalWordsEncountered / totalWords) * 100
          )}
        />
        <StatCard
          label="Current level"
          value={stats.currentLevel}
          subtitle={levelLabels[stats.currentLevel] || "Complete"}
        />
      </div>

      {/* Extra stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Current streak"
          value={`${stats.currentStreak}d`}
          subtitle={
            stats.longestStreak > 0
              ? `Best: ${stats.longestStreak}d`
              : undefined
          }
        />
        <StatCard
          label="Avg. accuracy"
          value={`${Math.round(stats.averageAccuracy)}%`}
        />
        <StatCard
          label="Grammar topics"
          value={String(stats.totalGrammarTopicsStudied)}
        />
        <StatCard
          label="Notes written"
          value={String(stats.totalNotesWritten)}
        />
      </div>

      {/* CEFR Journey */}
      <SectionLabel>Your journey</SectionLabel>
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          {(["A1", "A2", "B1"] as const).map((level) => {
            const progress =
              level === "A1"
                ? stats.a1Progress
                : level === "A2"
                  ? stats.a2Progress
                  : stats.b1Progress;
            return (
              <div key={level} className="text-center flex-1">
                <div
                  className={`text-[14px] font-medium ${
                    level === stats.currentLevel
                      ? "text-[#111111]"
                      : "text-[#9B9DA3]"
                  }`}
                >
                  {level}
                </div>
                <div className="text-[11px] text-[#9B9DA3]">
                  {levelLabels[level]}
                </div>
                <div className="text-[11px] text-[#9B9DA3] mt-0.5">
                  {progress.completed}/{progress.total}
                </div>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#185FA5] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>
        <div className="text-[12px] text-[#9B9DA3] text-center mt-3">
          {stats.totalLessonsCompleted} of {totalLessons} lessons complete
        </div>
      </div>

      {/* Recent activity */}
      <SectionLabel>Recent activity</SectionLabel>
      {stats.timeline.length > 0 ? (
        <ListContainer>
          {stats.timeline.slice(0, 10).map((event, i) => (
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
      ) : (
        <div className="text-[13px] text-[#9B9DA3] text-center py-8">
          Complete lessons to see your activity here
        </div>
      )}
    </PageShell>
  );
}
