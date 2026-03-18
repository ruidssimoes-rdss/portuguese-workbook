"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { getProgressStats, type ProgressStats, type TimelineEvent } from "@/lib/progress-stats-service";
import { ProgressBlock } from "@/components/blocks/content/progress-block";

function formatPortugueseDate(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : iso + "T12:00:00");
  return d.toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CefrJourney({ stats }: { stats: ProgressStats }) {
  const { a1Progress, a2Progress, b1Progress } = stats;
  const a1Complete = a1Progress.completed === a1Progress.total;
  const a2Complete = a2Progress.completed === a2Progress.total;
  const a1Percent = a1Progress.total > 0 ? (a1Progress.completed / a1Progress.total) * 100 : 0;
  const a2Percent = a2Progress.total > 0 ? (a2Progress.completed / a2Progress.total) * 100 : 0;
  const currentLevelIndex = stats.currentLevel === "Complete" ? 2 : stats.currentLevel === "B1" ? 2 : stats.currentLevel === "A2" ? 1 : 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-[12px] p-6 md:p-8 mb-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-6 md:mb-8">
        A tua jornada
      </h2>

      <div className="relative">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div
            className="flex-1 h-1 rounded-full transition-colors"
            style={{
              background: a1Complete
                ? "var(--brand)"
                : `linear-gradient(to right, var(--brand) ${a1Percent}%, var(--border-primary) ${a1Percent}%)`,
            }}
          />
          <div
            className="flex-1 h-1 mx-1 md:mx-4 rounded-full transition-colors"
            style={{
              background: a2Complete
                ? "var(--brand)"
                : a1Complete
                  ? `linear-gradient(to right, var(--brand) ${a2Percent}%, var(--border-primary) ${a2Percent}%)`
                  : "var(--border-primary)",
            }}
          />
          <div
            className="flex-1 h-1 rounded-full"
            style={{
              background: a2Complete ? "var(--brand)" : "var(--border-primary)",
            }}
          />
        </div>

        <div className="flex items-start justify-between mt-4 md:mt-6 gap-2">
          {[
            { label: "A1", sublabel: "Iniciante", progress: a1Progress },
            { label: "A2", sublabel: "Elementar", progress: a2Progress },
            { label: "B1", sublabel: "Intermédio", progress: b1Progress },
          ].map((level, i) => (
            <div key={level.label} className="flex flex-col items-center min-w-0 flex-1">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  level.progress.completed === level.progress.total
                    ? "bg-[var(--brand)] border-[var(--brand)]"
                    : level.progress.completed > 0
                      ? "bg-[var(--bg-card)] border-[var(--brand)]"
                      : "bg-[var(--bg-card)] border-[var(--border-primary)]"
                }`}
              >
                {level.progress.completed === level.progress.total && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <p className="text-[14px] font-bold text-[var(--text-primary)] mt-2">{level.label}</p>
              <p className="text-[11px] text-[var(--text-muted)]">{level.sublabel}</p>
              <p className="text-[12px] font-medium text-[var(--text-secondary)] mt-1">
                {level.progress.completed}/{level.progress.total}
              </p>
              {currentLevelIndex === i && (
                <p className="text-[11px] font-medium text-[var(--brand)] mt-1">Estás aqui</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: ProgressStats }) {
  const memberSinceShort = stats.memberSince
    ? formatPortugueseDate(stats.memberSince).split(" ").slice(1).join(" ")
    : "—";

  return (
    <div className="mb-8 space-y-6">
      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProgressBlock
          data={{ current: stats.totalLessonsCompleted, max: 44, label: "Lições", sublabel: "completas" }}
          variant="stat"
        />
        <ProgressBlock
          data={{ current: Math.round(stats.averageAccuracy * 100), max: 100, label: "Precisão", unit: "%" }}
          variant="ring"
        />
        <ProgressBlock
          data={{ current: stats.currentStreak, max: stats.longestStreak || stats.currentStreak, label: "Série", sublabel: `Máx: ${stats.longestStreak}` }}
          variant="streak"
        />
        <ProgressBlock
          data={{ current: stats.totalWordsEncountered, max: 840, label: "Palavras", sublabel: "aprendidas" }}
          variant="stat"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProgressBlock data={{ current: stats.totalVerbsDrilled, max: 177, label: "Verbos", sublabel: "praticados" }} variant="stat" />
        <ProgressBlock data={{ current: stats.totalGrammarTopicsStudied, max: 31, label: "Gramática", sublabel: "tópicos" }} variant="stat" />
        <ProgressBlock data={{ current: stats.bestLessonScore?.score ?? 0, max: 100, label: "Melhor nota", unit: "%" }} variant="stat" />
        <ProgressBlock data={{ current: stats.daysActive, max: stats.daysActive, label: "Dias ativos", sublabel: "com atividade" }} variant="stat" />
      </div>

      {/* Tertiary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ProgressBlock data={{ current: stats.totalNotesWritten, max: stats.totalNotesWritten, label: "Notas", sublabel: "escritas" }} variant="stat" />
        <ProgressBlock data={{ current: stats.totalStudySessions + stats.totalPracticeSessions, max: stats.totalStudySessions + stats.totalPracticeSessions, label: "Sessões", sublabel: "de estudo" }} variant="stat" />
        <ProgressBlock data={{ current: stats.goalsCompleted, max: stats.goalsCompleted + stats.goalsActive, label: "Objetivos", sublabel: "concluídos" }} variant="stat" />
        <ProgressBlock data={{ current: parseInt(memberSinceShort) || 0, max: 0, label: "Membro desde", sublabel: memberSinceShort }} variant="stat" />
      </div>

      {/* Per-level progress bars */}
      <div className="space-y-3">
        <ProgressBlock data={{ current: stats.a1Progress.completed, max: stats.a1Progress.total, label: "A1 — Iniciante", sublabel: `${stats.a1Progress.completed}/${stats.a1Progress.total}` }} variant="bar" />
        <ProgressBlock data={{ current: stats.a2Progress.completed, max: stats.a2Progress.total, label: "A2 — Elementar", sublabel: `${stats.a2Progress.completed}/${stats.a2Progress.total}` }} variant="bar" />
        <ProgressBlock data={{ current: stats.b1Progress.completed, max: stats.b1Progress.total, label: "B1 — Intermédio", sublabel: `${stats.b1Progress.completed}/${stats.b1Progress.total}` }} variant="bar" />
      </div>
    </div>
  );
}

function LearningTimeline({ timeline }: { timeline: TimelineEvent[] }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-[12px] p-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-6">
        A tua história
      </h2>

      {timeline.length === 0 ? (
        <p className="text-[14px] text-[var(--text-muted)] text-center py-8">
          A tua história começa quando completares a primeira lição.
        </p>
      ) : (
        <div className="space-y-0">
          {timeline.map((event, i) => (
            <div key={`${event.date}-${event.type}-${i}`} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    event.type === "level-complete"
                      ? "bg-[var(--brand)]"
                      : event.type === "started"
                        ? "bg-[#16A34A]"
                        : "bg-[var(--text-muted)]"
                  }`}
                />
                {i < timeline.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px] bg-[var(--border-primary)] my-1" />
                )}
              </div>
              <div className="pb-6">
                <p className="text-[11px] text-[var(--text-muted)] mb-0.5">
                  {formatPortugueseDate(event.date)}
                </p>
                <p className="text-[14px] font-medium text-[var(--text-primary)]">
                  {event.title}
                </p>
                {event.subtitle && (
                  <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
                    {event.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {timeline.length === 0 && (
        <div className="flex justify-center pt-2">
          <Link
            href="/lessons"
            className="text-[14px] font-medium text-[var(--brand)] hover:underline"
          >
            Ir para as lições
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgressStats().then((data) => {
      setStats(data ?? null);
      setLoading(false);
    });
  }, []);

  return (
    <ProtectedRoute>
      <Topbar />
      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-bold text-[var(--text-primary)]">
            O teu progresso
          </h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Acompanha a tua jornada de aprendizagem.
          </p>
        </div>

        {loading ? (
          <p className="text-[var(--text-secondary)]">A carregar...</p>
        ) : stats ? (
          <>
            <CefrJourney stats={stats} />
            <StatsGrid stats={stats} />
            <LearningTimeline timeline={stats.timeline} />
          </>
        ) : (
          <p className="text-[var(--text-secondary)]">Não foi possível carregar o progresso.</p>
        )}
      </main>
    </ProtectedRoute>
  );
}
