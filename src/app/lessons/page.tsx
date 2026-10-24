"use client";

/**
 * Curso — one spine through the existing chapters (A1, then A2, then B1).
 * Phone keeps the earlier lessons index. From 744px up, Continuar sits on the
 * unfinished chapter. Resume still comes from aula-course-resume.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getReviewSummary, type CEFRProgress } from "@/lib/learning-engine/mastery-tracker";
import { createClient } from "@/lib/supabase/client";
import { LessonList } from "@/components/lessons/lessons-index";
import { ContinuarCard } from "@/components/course/continuar-card";
import { CourseDesktop, COURSE_LEVELS, courseBands, type CourseLevelStat } from "@/components/course/course-spine";
import { chapterDone, useCourseSnapshot } from "@/components/course/use-course";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Label, ScreenTitle, Track, KV } from "@/components/aula";

interface LevelProgression {
  progress: CEFRProgress;
  unlocked: boolean;
}

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const course = useCourseSnapshot();
  const [progression, setProgression] = useState<Record<"a1" | "a2" | "b1", LevelProgression> | null>(null);
  /** Seen items that can be reviewed now, and how many of those are genuinely overdue. */
  const [reviews, setReviews] = useState({ due: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;
        const [prog, summary] = await Promise.all([
          getFullProgression(currentUser.id),
          getReviewSummary(currentUser.id),
        ]);
        if (cancelled) return;
        setProgression(prog);
        setReviews(summary);
      } catch {
        /* The course list still renders from the curriculum on this device. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Current level = highest unlocked level that isn't finished.
  const current = progression
    ? (COURSE_LEVELS.filter((l) => progression[l.key].unlocked && progression[l.key].progress.readiness < 1).at(-1)?.key ??
      COURSE_LEVELS.filter((l) => progression[l.key].unlocked).at(-1)?.key ??
      "a1")
    : null;
  const cur = current && progression ? progression[current] : null;
  const curMeta = COURSE_LEVELS.find((l) => l.key === current);

  const finishedIds = new Set(course.lessons.filter((lesson) => chapterDone(lesson.id, course)).map((lesson) => lesson.id));
  const listLevel = course.resume?.cefrLevel ?? "A1";
  const doneCount = finishedIds.size;
  const total = course.lessons.length;
  const activeBand = course.resume
    ? courseBands(course.lessons).find((band) => band.lessons.some((lesson) => lesson.id === course.resume?.id))
    : null;
  const bandDone = activeBand ? activeBand.lessons.filter((lesson) => finishedIds.has(lesson.id)).length : doneCount;
  const bandTotal = activeBand?.lessons.length ?? total;
  const pathPct = cur
    ? Math.round(cur.progress.readiness * 100)
    : bandTotal > 0
      ? Math.round((bandDone / bandTotal) * 100)
      : 0;
  const nextLevel = course.resume?.cefrLevel === "A1" ? "A2" : course.resume?.cefrLevel === "A2" ? "B1" : null;
  const following =
    course.resume ? course.lessons.find((lesson) => lesson.number > course.resume!.number) ?? null : null;
  const resumeStarted = Boolean(
    course.resume && (course.read.has(course.resume.id) || course.practiced.has(course.resume.id)),
  );
  const levelStats: CourseLevelStat[] | null = progression
    ? COURSE_LEVELS.map((level) => ({
        key: level.key,
        unlocked: progression[level.key].unlocked,
        readiness: progression[level.key].progress.readiness,
        mastered: progression[level.key].progress.mastered,
        totalItems: progression[level.key].progress.totalItems,
      }))
    : null;

  const panel = (
    <div className="flex flex-col gap-6">
      {course.ready && (
        <div>
          <div className="mb-heading flex items-baseline justify-between gap-item">
            <span className="text-[12px] font-medium text-aula-text">{nextLevel ? `A caminho de ${nextLevel}` : "Curso"}</span>
            <span className="text-[12px] font-medium text-[#1B2B61]">{pathPct}%</span>
          </div>
          <Track value={pathPct / 100} />
          <div className="mt-card">
            <KV k="Capítulos feitos" v={`${doneCount} de ${total}`} />
            <KV k="Para rever" v={reviews.due} />
            <KV k="Em atraso" v={reviews.overdue} tone={reviews.overdue > 0 ? "overdue" : undefined} />
          </div>
        </div>
      )}
      {course.resume && (
        <div>
          <Label className="mb-heading">Agora</Label>
          <Link href={`/lessons/${course.resume.id}`} className="text-[13px] font-medium text-aula-text hover:text-[#1B2B61]">
            {course.resume.number} · {course.resume.titlePt}
          </Link>
          <p className="mt-heading text-[12px] text-[#5A5A57]">{course.resume.title}</p>
        </div>
      )}
      {resumeStarted && following && (
        <div>
          <Label className="mb-heading">A seguir</Label>
          <p className="text-[13px] font-medium text-aula-text">
            {following.number} · {following.titlePt}
          </p>
          <p className="mt-heading text-[12px] text-[#5A5A57]">{following.title}</p>
        </div>
      )}
      {course.finished && !course.resume && (
        <p className="text-[12.5px] font-medium text-[#1F7A68]">Curso concluído</p>
      )}
      {reviews.overdue > 0 && (
        <Link
          href="/learn?mode=review"
          className="flex h-8 items-center justify-center rounded-lg border border-aula-border text-[12px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
        >
          Rever as {reviews.overdue} em atraso
        </Link>
      )}
      {cur && curMeta && (
        <p className="text-[12px] leading-relaxed text-[#5A5A57]">
          Nível {curMeta.level}: {cur.progress.mastered} de {cur.progress.totalItems} itens dominados.
        </p>
      )}
      <Link href="/guide" className="inline-flex items-center gap-1 text-[12px] font-medium text-[#1B2B61]">
        Como funciona o Aula <ArrowRight size={12} strokeWidth={1.5} />
      </Link>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Curso" }]} />} panel={panel}>
      <div className="min-[744px]:hidden">
        <div className="mx-auto max-w-[680px]">
          <ScreenTitle
            title="Curso"
            subtitle="Course. One path, from the first olá to conversation. Continue picks up the next unfinished chapter."
          />

          <div className="mb-6">
            <ContinuarCard />
          </div>

          {loading || authLoading ? (
            <div className="py-16 text-center text-[13px] text-[#5A5A57]">A carregar o teu progresso…</div>
          ) : !user || !progression ? (
            <div className="rounded-xl border border-aula-border p-8 text-center">
              <p className="text-[15px] font-semibold text-aula-text">O curso está aberto</p>
              <p className="mx-auto mt-1.5 max-w-[420px] text-[13px] leading-relaxed text-[#5A5A57]">
                You can start reading now. Sign in when you want the exercises saved to your account. Your place stays on this device either way.
              </p>
              <Link href="/auth/login" className="mt-4 inline-flex h-8 items-center rounded-lg bg-aula-accent px-4 text-[12.5px] font-medium text-white">
                Entrar
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {COURSE_LEVELS.map((L) => {
                const p = progression[L.key];
                const pct = Math.round(p.progress.readiness * 100);
                const isCur = L.key === current;
                const done = p.unlocked && p.progress.readiness >= 1;
                const locked = !p.unlocked;
                return (
                  <div
                    key={L.key}
                    className={`flex gap-4 rounded-xl border p-[18px] ${isCur ? "border-[#D3DAEB] bg-aula-accent-faint" : "border-aula-border bg-white"} ${locked ? "opacity-70" : ""}`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[12px] font-semibold ${
                        done ? "bg-[#E8ECF6] text-aula-accent" : isCur ? "bg-aula-accent text-white" : "bg-aula-sunken text-aula-text-3"
                      }`}
                    >
                      {L.level}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[13px] font-medium ${locked ? "text-aula-text-2" : "text-aula-text"}`}>{L.name}</span>
                        <span className="flex-1" />
                        <span className={`text-[11px] ${isCur ? "text-aula-accent" : "text-aula-text-3"}`}>
                          {locked ? (
                            <span className="inline-flex items-center gap-1">
                              <Lock size={11} strokeWidth={1.5} /> abre com 75% do nível anterior
                            </span>
                          ) : done ? (
                            "Concluído"
                          ) : isCur ? (
                            `Estás aqui · ${pct}%`
                          ) : (
                            `${pct}%`
                          )}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-aula-text-3">No fim deste nível consegues:</p>
                      <ul className="mt-1 flex flex-col gap-0.5">
                        {L.can.map((c) => (
                          <li key={c} className={`flex items-center gap-2 text-[12px] ${locked ? "text-aula-text-2" : "text-aula-text"}`}>
                            <Check size={12} strokeWidth={1.5} className={done ? "text-aula-accent" : "text-aula-text-3"} /> {c}
                          </li>
                        ))}
                      </ul>
                      {!locked && (
                        <div className="mt-3 flex flex-col gap-1.5">
                          <Skill label="Vocabulário" value={p.progress.vocabProgress} />
                          <Skill label="Verbos" value={p.progress.verbProgress} />
                          <Skill label="Gramática" value={p.progress.grammarProgress} />
                        </div>
                      )}
                      {L.exam && <p className="mt-2.5 text-[11px] text-aula-accent">{L.exam}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {course.ready && <LessonList lessons={course.lessons} completed={finishedIds} currentLevel={listLevel} />}
        </div>
      </div>

      <div className="hidden min-[744px]:block">
        {course.ready ? (
          <CourseDesktop
            lessons={course.lessons}
            resume={course.resume}
            read={course.read}
            practiced={course.practiced}
            finished={course.finished}
            signedIn={Boolean(user)}
            levels={levelStats}
          />
        ) : (
          <div className="py-16 text-center text-[13px] text-[#5A5A57]">A carregar o teu progresso…</div>
        )}
      </div>
    </PageShell>
  );
}

function Skill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[76px] text-[11px] text-aula-text-3">{label}</span>
      <div className="flex-1">
        <Track value={value} />
      </div>
      <span className="w-8 text-right text-[11px] text-aula-text-3">{Math.round(value * 100)}%</span>
    </div>
  );
}
