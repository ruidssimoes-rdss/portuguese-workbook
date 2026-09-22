import Link from "next/link";
import { Lock, ArrowRight, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getReviewCount, type CEFRProgress } from "@/lib/learning-engine/mastery-tracker";
import { getResolvedLessons } from "@/data/resolve-lessons";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader, SectionLabel } from "@/components/primitives";
import { HowItWorks } from "@/components/learn/how-it-works";

export const dynamic = "force-dynamic";

// ─── CEFR Level Card ────────────────────────────────────

function CEFRLevelCard({
  level,
  label,
  labelPt,
  progress,
  unlocked,
  reviewCount,
}: {
  level: string;
  label: string;
  labelPt: string;
  progress: CEFRProgress;
  unlocked: boolean;
  reviewCount: number;
}) {
  const readinessPct = Math.round(progress.readiness * 100);

  if (!unlocked) {
    return (
      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 opacity-60">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[16px] font-medium text-[#111111]">
            {level} — {label}
            <span className="text-[#9B9DA3] font-normal ml-2">{labelPt}</span>
          </h2>
          <Lock size={16} className="text-[#9B9DA3]" />
        </div>
        <p className="text-[13px] text-[#9B9DA3]">
          Complete 75% of {level === "A2" ? "A1" : "A2"} to unlock
        </p>
      </div>
    );
  }

  return (
    <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-medium text-[#111111]">
          {level} — {label}
          <span className="text-[#9B9DA3] font-normal ml-2">{labelPt}</span>
        </h2>
        <span className="text-[22px] font-medium text-[#111111]">{readinessPct}%</span>
      </div>

      <div className="h-2 bg-[rgba(0,0,0,0.06)] rounded-full mb-4">
        <div className="h-2 bg-[#185FA5] rounded-full transition-all duration-500" style={{ width: `${readinessPct}%` }} />
      </div>

      <div className="flex gap-6 mb-4">
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Items</div>
          <div className="text-[14px] font-medium text-[#111111]">{progress.totalItems}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Mastered</div>
          <div className="text-[14px] font-medium text-[#0F6E56]">{progress.mastered}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">In progress</div>
          <div className="text-[14px] font-medium text-[#854F0B]">{progress.familiar + progress.introduced}</div>
        </div>
        <div>
          <div className="text-[11px] text-[#9B9DA3] uppercase tracking-[0.05em]">Unseen</div>
          <div className="text-[14px] font-medium text-[#9B9DA3]">{progress.unseen}</div>
        </div>
      </div>

      <div className="space-y-1.5 mb-5">
        <SkillBar label="Vocab" value={progress.vocabProgress} />
        <SkillBar label="Verbs" value={progress.verbProgress} />
        <SkillBar label="Grammar" value={progress.grammarProgress} />
      </div>

      <div className="flex gap-3">
        <Link
          href={`/learn?level=${level}`}
          className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors"
        >
          Start next lesson
          <ArrowRight size={14} />
        </Link>

        {reviewCount > 0 && (
          <Link
            href="/learn?mode=review"
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors"
          >
            <RotateCcw size={14} />
            Review {reviewCount} items
          </Link>
        )}
      </div>
    </div>
  );
}

function SkillBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-[#9B9DA3] w-14">{label}</span>
      <div className="flex-1 h-1 bg-[rgba(0,0,0,0.06)] rounded-full">
        <div className="h-1 bg-[#185FA5] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] text-[#9B9DA3] w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Curriculum lesson list ─────────────────────────────

interface CurriculumRow {
  id: string;
  title: string;
  ptTitle: string;
  cefr: "A1" | "A2" | "B1";
  order: number;
  completed: boolean;
  bestScore: number | null;
}

function CurriculumList({ rows }: { rows: CurriculumRow[] }) {
  const levels: Array<{ level: CurriculumRow["cefr"]; label: string }> = [
    { level: "A1", label: "A1 — Beginner" },
    { level: "A2", label: "A2 — Elementary" },
    { level: "B1", label: "B1 — Intermediate" },
  ];

  return (
    <div className="mt-10">
      <SectionLabel>Curriculum lessons</SectionLabel>
      <p className="text-[12px] text-[#9B9DA3] mb-4 -mt-2">
        Fixed lessons in order. They play through the same player and count towards the same mastery.
      </p>
      <div className="space-y-6">
        {levels.map(({ level, label }) => {
          const list = rows.filter((r) => r.cefr === level);
          if (list.length === 0) return null;
          return (
            <div key={level}>
              <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-2">{label}</div>
              <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden">
                {list.map((row, i) => (
                  <Link
                    key={row.id}
                    href={`/learn?lesson=${encodeURIComponent(row.id)}`}
                    className={`flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#F7F7F5] transition-colors ${
                      i > 0 ? "border-t-[0.5px] border-[rgba(0,0,0,0.06)]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[11px] text-[#9B9DA3] w-6 shrink-0">{row.order}</span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#111111] truncate">{row.title}</div>
                        <div className="text-[12px] text-[#9B9DA3] truncate">{row.ptTitle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {row.completed ? (
                        <span className="text-[12px] font-medium text-[#0F6E56]">
                          {row.bestScore != null ? `${Math.round(row.bestScore)}%` : "Done"}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#9B9DA3]">Start</span>
                      )}
                      <ArrowRight size={14} className="text-[#9B9DA3]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────

export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [progression, reviewCount, progressRows] = user
    ? await Promise.all([
        getFullProgression(user.id, supabase),
        getReviewCount(user.id, supabase),
        supabase
          .from("user_lesson_progress")
          .select("lesson_id, completed, best_score")
          .eq("user_id", user.id)
          .then(({ data }) => data ?? []),
      ])
    : [null, 0, []];

  const progressById = new Map(progressRows.map((r) => [r.lesson_id as string, r]));
  const curriculum: CurriculumRow[] = getResolvedLessons()
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((l) => {
      const p = progressById.get(l.id);
      return {
        id: l.id,
        title: l.title,
        ptTitle: l.ptTitle,
        cefr: l.cefr,
        order: l.order,
        completed: Boolean(p?.completed),
        bestScore: p?.best_score ?? null,
      };
    });

  return (
    <PageShell>
      <PageHeader title="Lições" subtitle="Your personalised learning journey" />

      <HowItWorks />

      {progression ? (
        <div className="space-y-4">
          <CEFRLevelCard level="A1" label="Beginner" labelPt="Iniciante" progress={progression.a1.progress} unlocked={progression.a1.unlocked} reviewCount={reviewCount} />
          <CEFRLevelCard level="A2" label="Elementary" labelPt="Elementar" progress={progression.a2.progress} unlocked={progression.a2.unlocked} reviewCount={0} />
          <CEFRLevelCard level="B1" label="Intermediate" labelPt="Intermédio" progress={progression.b1.progress} unlocked={progression.b1.unlocked} reviewCount={0} />
        </div>
      ) : (
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-8 text-center">
          <p className="text-[14px] font-medium text-[#111111]">Sign in to start learning</p>
          <p className="text-[12px] text-[#9B9DA3] mt-1">Inicia sessão para começar a aprender</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#111111] text-white rounded-lg text-[13px] font-medium hover:bg-[#333] transition-colors mt-4"
          >
            Entrar
          </Link>
        </div>
      )}

      <CurriculumList rows={curriculum} />
    </PageShell>
  );
}
