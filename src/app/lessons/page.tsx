"use client";

/**
 * Lições — the level path (Figma: Lições — índice + O teu percurso).
 * "Próxima lição" is an adaptive /learn session generated from what you need
 * next, titled by its focus. Below the level cards, every curriculum lesson is
 * listed by level (read-only, from src/data/curriculum*.ts) and links to
 * /lessons/[id]; completion comes from user_lesson_progress.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getFullProgression } from "@/lib/learning-engine/cefr-readiness";
import { getReviewSummary, getUserMastery, type CEFRProgress } from "@/lib/learning-engine/mastery-tracker";
import { getGrammarPool } from "@/lib/learning-engine/content-pool";
import { getLessonProgressMap } from "@/lib/lesson-progress";
import { createClient } from "@/lib/supabase/client";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { NextLessonCard, LessonList } from "@/components/lessons/lessons-index";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Label, ScreenTitle, PanelCard, Track, KV } from "@/components/aula";

interface LevelProgression {
  progress: CEFRProgress;
  unlocked: boolean;
}

const LEVELS = [
  {
    key: "a1" as const,
    level: "A1",
    name: "Iniciação",
    can: ["Apresentar-te e cumprimentar", "Pedir um café e pagar", "Dizer as horas, os dias, os números"],
    exam: null,
  },
  {
    key: "a2" as const,
    level: "A2",
    name: "Sobreviver no dia a dia",
    can: ["Falar do que fizeste ontem e de como era", "Ir ao médico, à farmácia, às compras", "Escrever uma mensagem curta a um vizinho"],
    exam: "CIPLE · o exame oficial de A2",
  },
  {
    key: "b1" as const,
    level: "B1",
    name: "Conversar à vontade",
    can: ["Contar uma história com princípio, meio e fim", "Dar a tua opinião e justificá-la", "Tratar de assuntos nas Finanças ou no banco"],
    exam: "DEPLE · o exame oficial de B1",
  },
];

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const [progression, setProgression] = useState<Record<"a1" | "a2" | "b1", LevelProgression> | null>(null);
  /** Seen items that can be reviewed now, and how many of those are genuinely overdue. */
  const [reviews, setReviews] = useState({ due: 0, overdue: 0 });
  /** grammar topics the learner has already met: the next session starts with the first one they have not. */
  const [seenGrammar, setSeenGrammar] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [curriculum, setCurriculum] = useState<CurriculumLesson[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      const [prog, summary, mastery, lessonProgress] = await Promise.all([
        getFullProgression(currentUser.id),
        getReviewSummary(currentUser.id),
        getUserMastery(currentUser.id, { contentType: "grammar" }),
        getLessonProgressMap().catch(() => ({})),
      ]);
      setProgression(prog);
      setReviews(summary);
      setSeenGrammar(new Set(mastery.filter((r) => r.mastery_level >= 1).map((r) => r.content_id)));
      setCompleted(new Set(Object.entries(lessonProgress).filter(([, p]) => p.completed).map(([id]) => id)));
      setLoading(false);
    }
    load();
  }, []);

  // The curriculum is only needed for the list, so keep it out of the first bundle.
  useEffect(() => {
    import("@/data/curriculum").then((m) => setCurriculum([...m.A1_LESSONS, ...m.A2_LESSONS, ...m.B1_LESSONS, ...m.EXTRA_LESSONS]));
  }, []);

  // Current level = highest unlocked level that isn't finished.
  const current = progression
    ? (LEVELS.filter((l) => progression[l.key].unlocked && progression[l.key].progress.readiness < 1).at(-1)?.key ??
      LEVELS.filter((l) => progression[l.key].unlocked).at(-1)?.key ??
      "a1")
    : null;
  const cur = current && progression ? progression[current] : null;
  const curMeta = LEVELS.find((l) => l.key === current);

  // The next session's focus. generateLesson() takes new grammar in pool order,
  // so the first topic the learner has not met is the one it will teach. With
  // none left, the level itself is the focus.
  const focusTopic = curMeta ? getGrammarPool(curMeta.level).find((t) => !seenGrammar.has(t.id)) : undefined;

  const panel = (
    <div className="flex flex-col gap-6">
      {cur && curMeta && (
        <PanelCard title={`Nível ${curMeta.level}`} aside={<span className="text-[12px] font-medium text-aula-accent">{Math.round(cur.progress.readiness * 100)}%</span>}>
          <div className="mb-3">
            <Track value={cur.progress.readiness} />
          </div>
          <KV k="Itens dominados" v={`${cur.progress.mastered} de ${cur.progress.totalItems}`} />
          <KV k="A aprender" v={cur.progress.familiar + cur.progress.introduced} />
          <KV k="Para rever" v={reviews.due} />
          <KV k="Em atraso" v={reviews.overdue} tone={reviews.overdue > 0 ? "overdue" : undefined} />
          <Link href="/learn" className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
            Próxima lição <ArrowRight size={13} strokeWidth={1.5} />
          </Link>
        </PanelCard>
      )}
      <div>
        <Label className="mb-2">Como funcionam as lições</Label>
        <div className="flex flex-col gap-2 text-[12px] leading-relaxed text-aula-text-2">
          <p>Cada lição é feita para ti a partir do que precisas de aprender a seguir. Não há duas iguais.</p>
          <p>Mistura palavras e regras novas, exercícios sobre o que acabaste de ver, revisões do que já viste e verificações do que já dominas.</p>
          <p>
            Passas uma lição com <span className="font-medium text-aula-text">80%</span>. O nível seguinte abre quando estiveres <span className="font-medium text-aula-text">75%</span> pronto.
          </p>
          <Link href="/guide" className="inline-flex items-center gap-1 font-medium text-aula-accent">
            Como funciona o Aula <ArrowRight size={12} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Lições" }]} />} panel={panel}>
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle title="Lições" subtitle="Três níveis, do primeiro «olá» a conversar sem pensar. As lições adaptam-se ao que precisas." />

        {loading || authLoading ? (
          <div className="py-16 text-center text-[13px] text-aula-text-3">A carregar o teu progresso…</div>
        ) : !user || !progression ? (
          <div className="rounded-xl border border-aula-border p-8 text-center">
            <p className="text-[15px] font-semibold text-aula-text">Entra para começar</p>
            <p className="mx-auto mt-1.5 max-w-[360px] text-[13px] text-aula-text-2">As lições adaptam-se ao teu progresso, por isso precisam de saber quem és.</p>
            <Link href="/auth/login" className="mt-4 inline-flex h-8 items-center rounded-lg bg-aula-accent px-4 text-[12.5px] font-medium text-white">
              Entrar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {curMeta && (
              <NextLessonCard
                level={curMeta.level}
                levelName={curMeta.name}
                topic={focusTopic ? { titlePt: focusTopic.titlePt, title: focusTopic.title } : null}
                reviews={reviews}
              />
            )}
            {LEVELS.map((L) => {
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
            {curriculum && current && <LessonList lessons={curriculum} completed={completed} currentLevel={LEVELS.find((l) => l.key === current)!.level} />}
          </div>
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
