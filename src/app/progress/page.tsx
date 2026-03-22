"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  StatCard,
  SectionLabel,
} from "@/components/primitives";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import {
  getUserMastery,
  getReviewCount,
  type MasteryRecord,
  type CEFRProgress,
} from "@/lib/learning-engine/mastery-tracker";
import {
  getVocabPool,
  getVerbPool,
  getAllContentTotals,
} from "@/lib/learning-engine/content-pool";
import {
  getProgressStats,
  type ProgressStats,
  type TimelineEvent,
} from "@/lib/progress-stats-service";
import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────

interface MasteryData {
  progression: {
    a1: { progress: CEFRProgress; unlocked: boolean };
    a2: { progress: CEFRProgress; unlocked: boolean };
    b1: { progress: CEFRProgress; unlocked: boolean };
  };
  vocabByCategory: Array<{ name: string; mastered: number; total: number }>;
  verbsByGroup: Array<{ name: string; mastered: number; total: number }>;
  recentlyMastered: MasteryRecord[];
  needsAttention: MasteryRecord[];
  reviewCount: number;
}

// ─── Helpers ────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
};

function eventDotColor(type: TimelineEvent["type"]): string {
  switch (type) {
    case "lesson": return "bg-[#0F6E56]";
    case "exam": return "bg-[#185FA5]";
    case "level-complete": return "bg-[#854F0B]";
    case "milestone": return "bg-[#185FA5]";
    case "goal-complete": return "bg-[#0F6E56]";
    case "streak": return "bg-[#854F0B]";
    default: return "bg-[#9B9DA3]";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

// ─── Data Loading ───────────────────────────────────────

async function loadMasteryData(userId: string): Promise<MasteryData> {
  const [progression, allMastery, reviews] = await Promise.all([
    getFullProgression(userId),
    getUserMastery(userId),
    getReviewCount(userId),
  ]);

  // Build mastery lookup
  const masteryByKey = new Map<string, MasteryRecord>();
  for (const r of allMastery) {
    masteryByKey.set(`${r.content_type}:${r.content_id}`, r);
  }

  // Vocab by category
  const catMap = new Map<string, { mastered: number; total: number }>();
  for (const v of getVocabPool()) {
    const entry = catMap.get(v.categoryTitle) ?? { mastered: 0, total: 0 };
    entry.total++;
    const record = masteryByKey.get(`vocab:${v.portuguese}`);
    if (record && record.mastery_level >= 3) entry.mastered++;
    catMap.set(v.categoryTitle, entry);
  }
  const vocabByCategory = Array.from(catMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const pctA = a.total > 0 ? a.mastered / a.total : 0;
      const pctB = b.total > 0 ? b.mastered / b.total : 0;
      return pctB - pctA;
    });

  // Verbs by group
  const groupMap = new Map<string, { mastered: number; total: number }>();
  for (const v of getVerbPool()) {
    const group = v.group.replace(/\s*\(.*\)/, "");
    const entry = groupMap.get(group) ?? { mastered: 0, total: 0 };
    entry.total++;
    const record = masteryByKey.get(`verb:${v.key}`);
    if (record && record.mastery_level >= 3) entry.mastered++;
    groupMap.set(group, entry);
  }
  const verbsByGroup = Array.from(groupMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const pctA = a.total > 0 ? a.mastered / a.total : 0;
      const pctB = b.total > 0 ? b.mastered / b.total : 0;
      return pctB - pctA;
    });

  // Recently mastered
  const recentlyMastered = allMastery
    .filter((r) => r.mastery_level >= 3 && r.last_correct_at)
    .sort(
      (a, b) =>
        new Date(b.last_correct_at!).getTime() -
        new Date(a.last_correct_at!).getTime()
    )
    .slice(0, 5);

  // Needs attention
  const now = new Date();
  const needsAttention = allMastery
    .filter((r) => {
      if (r.mastery_level === 0) return false;
      const accuracy =
        r.times_seen > 0 ? r.times_correct / r.times_seen : 1;
      const isOverdue =
        r.next_review_at && new Date(r.next_review_at) < now;
      const lowAccuracy = r.times_seen >= 3 && accuracy < 0.5;
      const brokenStreak = r.streak === 0 && r.mastery_level >= 2;
      return isOverdue || lowAccuracy || brokenStreak;
    })
    .slice(0, 5);

  return {
    progression,
    vocabByCategory,
    verbsByGroup,
    recentlyMastered,
    needsAttention,
    reviewCount: reviews,
  };
}

// ─── Components ─────────────────────────────────────────

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden ${className ?? ""}`}>
      <div
        className="h-full bg-[#185FA5] rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.round(value * 100), 100)}%` }}
      />
    </div>
  );
}

function CEFRProgressCard({
  level,
  progress,
}: {
  level: string;
  progress: CEFRProgress;
}) {
  const readiness = Math.round(progress.readiness * 100);

  return (
    <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-medium text-[#111111]">
          {level}{" "}
          <span className="text-[#9B9DA3] font-normal">
            {LEVEL_LABELS[level]}
          </span>
        </h3>
        <span className="text-[16px] font-medium text-[#111111]">
          {readiness}%
        </span>
      </div>

      <ProgressBar value={progress.readiness} className="mb-3" />

      <div className="flex gap-4 text-[11px]">
        <span className="text-[#0F6E56]">{progress.mastered} mastered</span>
        <span className="text-[#854F0B]">
          {progress.familiar + progress.introduced} in progress
        </span>
        <span className="text-[#9B9DA3]">{progress.unseen} unseen</span>
      </div>

      <div className="space-y-1 mt-3">
        <SkillRow label="Vocab" value={progress.vocabProgress} />
        <SkillRow label="Verbs" value={progress.verbProgress} />
        <SkillRow label="Grammar" value={progress.grammarProgress} />
      </div>
    </div>
  );
}

function SkillRow({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#9B9DA3] w-14">{label}</span>
      <div className="flex-1 h-1 bg-[rgba(0,0,0,0.06)] rounded-full">
        <div
          className="h-1 bg-[#185FA5] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] text-[#9B9DA3] w-8 text-right">
        {pct}%
      </span>
    </div>
  );
}

function CategoryBreakdown({
  title,
  items,
}: {
  title: string;
  items: Array<{ name: string; mastered: number; total: number }>;
}) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <SectionLabel>{title}</SectionLabel>
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg divide-y divide-[rgba(0,0,0,0.06)]">
        {items.map((item) => {
          const pct =
            item.total > 0
              ? Math.round((item.mastered / item.total) * 100)
              : 0;
          return (
            <div key={item.name} className="flex items-center gap-3 px-4 py-3">
              <span className="text-[13px] text-[#111111] flex-1 min-w-0 truncate">
                {item.name}
              </span>
              <div className="w-24 h-1 bg-[rgba(0,0,0,0.06)] rounded-full flex-shrink-0">
                <div
                  className="h-1 bg-[#185FA5] rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-[#9B9DA3] w-12 text-right flex-shrink-0">
                {item.mastered}/{item.total}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MasteryItemList({
  title,
  items,
  variant,
}: {
  title: string;
  items: MasteryRecord[];
  variant: "success" | "warning";
}) {
  if (items.length === 0) return null;

  const dotColor =
    variant === "success" ? "bg-[#0F6E56]" : "bg-[#dc2626]";
  const icon = variant === "success" ? "✓" : "✗";

  return (
    <div className="mb-6">
      <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-2">
        {title}
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <div
            key={`${r.content_type}:${r.content_id}`}
            className="flex items-center gap-2 text-[13px]"
          >
            <span className={`w-4 text-center ${variant === "success" ? "text-[#0F6E56]" : "text-[#dc2626]"}`}>
              {icon}
            </span>
            <span className="text-[#111111]">
              {r.content_id}
            </span>
            <span className="text-[11px] text-[#9B9DA3]">
              {r.content_type}
              {r.last_correct_at && variant === "success"
                ? ` · ${timeAgo(r.last_correct_at)}`
                : ""}
              {variant === "warning" && r.times_seen > 0
                ? ` · ${Math.round((r.times_correct / r.times_seen) * 100)}% accuracy`
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────

export default function ProgressPage() {
  const { user, loading: authLoading } = useAuth();
  const [mastery, setMastery] = useState<MasteryData | null>(null);
  const [legacyStats, setLegacyStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { setLoading(false); return; }

      const [masteryData, stats] = await Promise.all([
        loadMasteryData(currentUser.id),
        getProgressStats().catch(() => null),
      ]);

      setMastery(masteryData);
      setLegacyStats(stats);
      setLoading(false);
    }

    load();
  }, [user]);

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

  if (!mastery) {
    return (
      <PageShell>
        <PageHeader title="O teu progresso" subtitle="Your learning journey" />
        <div className="text-[13px] text-[#9B9DA3] text-center py-16">
          Start your first lesson to see progress here
        </div>
      </PageShell>
    );
  }

  const totals = getAllContentTotals();
  const totalItems =
    totals.A1.vocab + totals.A1.verbs + totals.A1.grammar +
    totals.A2.vocab + totals.A2.verbs + totals.A2.grammar +
    totals.B1.vocab + totals.B1.verbs + totals.B1.grammar;
  const totalMastered =
    mastery.progression.a1.progress.mastered +
    mastery.progression.a2.progress.mastered +
    mastery.progression.b1.progress.mastered;
  const overallPct = totalItems > 0 ? Math.round((totalMastered / totalItems) * 100) : 0;

  return (
    <PageShell>
      <PageHeader title="O teu progresso" subtitle="Your learning journey" />

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Items mastered"
          value={String(totalMastered)}
          total={String(totalItems)}
          progress={overallPct}
        />
        <StatCard
          label="To review"
          value={String(mastery.reviewCount)}
          subtitle={mastery.reviewCount > 0 ? "Items due" : "All caught up"}
        />
        <StatCard
          label="Streak"
          value={legacyStats ? `${legacyStats.currentStreak}d` : "0d"}
          subtitle={
            legacyStats && legacyStats.longestStreak > 0
              ? `Best: ${legacyStats.longestStreak}d`
              : undefined
          }
        />
        <StatCard
          label="Notes"
          value={String(legacyStats?.totalNotesWritten ?? 0)}
        />
      </div>

      {/* CEFR level progression */}
      <SectionLabel>Level progression</SectionLabel>
      <div className="space-y-3 mb-8">
        <CEFRProgressCard level="A1" progress={mastery.progression.a1.progress} />
        <CEFRProgressCard level="A2" progress={mastery.progression.a2.progress} />
        <CEFRProgressCard level="B1" progress={mastery.progression.b1.progress} />
      </div>

      {/* Vocab by category */}
      <CategoryBreakdown
        title="Vocabulary by category"
        items={mastery.vocabByCategory}
      />

      {/* Verbs by group */}
      <CategoryBreakdown
        title="Verbs by group"
        items={mastery.verbsByGroup}
      />

      {/* Recently mastered + Needs attention */}
      <SectionLabel>Status</SectionLabel>
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-5 mb-8">
        <MasteryItemList
          title="Recently mastered"
          items={mastery.recentlyMastered}
          variant="success"
        />
        <MasteryItemList
          title="Needs attention"
          items={mastery.needsAttention}
          variant="warning"
        />
        {mastery.recentlyMastered.length === 0 && mastery.needsAttention.length === 0 && (
          <p className="text-[13px] text-[#9B9DA3] text-center py-4">
            Complete lessons to see your mastery status here
          </p>
        )}
      </div>

      {/* Timeline */}
      {legacyStats && legacyStats.timeline.length > 0 && (
        <>
          <SectionLabel>Recent activity</SectionLabel>
          <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg divide-y divide-[rgba(0,0,0,0.06)]">
            {legacyStats.timeline.slice(0, 10).map((event, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventDotColor(event.type)}`}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] text-[#111111]">{event.title}</span>
                  {event.subtitle && (
                    <span className="text-[12px] text-[#9B9DA3] ml-2">{event.subtitle}</span>
                  )}
                </div>
                <span className="text-[11px] text-[#9B9DA3] flex-shrink-0">
                  {formatDate(event.date)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </PageShell>
  );
}
