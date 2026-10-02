"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Lock, ArrowRight } from "lucide-react";
import { Label, ScreenTitle, PanelCard, Track, KV } from "@/components/aula";
import { getAllExams } from "@/data/exams";
import { MOCK_EXAM_UNLOCKS } from "@/data/curriculum";
import { getResolvedLessons } from "@/data/resolve-lessons";
import { getAllExamResults, type ExamResult } from "@/lib/exam-progress";
import { getLessonProgressMap } from "@/lib/lesson-progress";

const exams = getAllExams();
const A1_TOTAL = getResolvedLessons().filter((l) => l.cefr === "A1").length;


const CLASS_TONE: Record<string, string> = {
  "Muito Bom": "border-[#D3DAEB] bg-aula-accent-faint text-aula-accent",
  Bom: "border-[#D3DAEB] bg-aula-accent-faint text-aula-accent",
  Suficiente: "border-[#BFE3D8] bg-[#E1F2ED] text-[#1F7A68]",
};

function Dots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-center gap-[3px]" title={`Dificuldade ${level} de 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-[5px] w-[5px] rounded-full ${i <= level ? "bg-aula-accent" : "bg-aula-border"}`} />
      ))}
    </span>
  );
}

export default function ExamsPage() {
  const [results, setResults] = useState<Record<string, ExamResult>>({});
  const [lessonProgressMap, setLessonProgressMap] = useState<
    Record<string, { completed: boolean }>
  >({});

  useEffect(() => {
    getAllExamResults()
      .then(setResults)
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[AulaPT] Exam results fetch failed:", err);
        }
      });
  }, []);

  useEffect(() => {
    getLessonProgressMap()
      .then((map) => {
        const byCompleted = Object.fromEntries(
          Object.entries(map).map(([id, p]) => [id, { completed: p.completed }])
        );
        setLessonProgressMap(byCompleted);
      })
      .catch(() => {});
  }, []);

  const totalCompleted = Object.entries(lessonProgressMap).filter(
    ([id, p]) =>
      (id.startsWith("a1-") || id.startsWith("a2-") || id.startsWith("b1-")) &&
      p.completed
  ).length;

  const done = exams.filter((e) => results[e.id]);
  const best = done.reduce((m, e) => Math.max(m, results[e.id].overallScore), 0);

  const panel = (
    <div className="flex flex-col gap-6">
      <PanelCard title="Os teus exames">
        <KV k="Feitos" v={`${done.length} de ${exams.filter((e) => e.available).length}`} />
        <KV k="Melhor nota" v={done.length ? `${Math.round(best)}%` : "—"} />
        <KV k="Lições A1 feitas" v={`${Math.min(totalCompleted, A1_TOTAL)} de ${A1_TOTAL}`} />
      </PanelCard>
      <div>
        <Label className="mb-2">Sobre o CIPLE</Label>
        <div className="flex flex-col gap-2 text-[12px] leading-relaxed text-aula-text-2">
          <p>O CIPLE é o exame oficial de português de nível A2. Cada simulado segue o mesmo formato: três partes, com tempo.</p>
          <p>Compreensão da leitura e produção escrita valem 45%, compreensão do oral 30% e expressão oral 25%.</p>
          <p>
            Passas com <span className="font-medium text-aula-text">Suficiente</span> (55%). <span className="font-medium text-aula-text">Bom</span> a partir de 70% e{" "}
            <span className="font-medium text-aula-text">Muito Bom</span> a partir de 85%.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Exames" }]} />} panel={panel}>
      <div className="mx-auto max-w-[680px]">
        <ScreenTitle title="Exames" subtitle="Simulados mensais no formato do CIPLE A2: três partes, com tempo, e a nota calculada como no exame real." />

        <div className="flex flex-col gap-1">
          {exams.map((exam) => {
            const result = results[exam.id];
            const lessonsRequired = MOCK_EXAM_UNLOCKS[exam.id]?.lessonsRequired ?? 0;
            const unlocked = lessonsRequired === 0 || totalCompleted >= lessonsRequired;
            const minutes = exam.sections.reduce((s, sec) => s + sec.timeMinutes, 0);
            const open = exam.available && unlocked;

            const row = (
              <div className={`flex min-h-[64px] items-center gap-4 rounded-[10px] px-3 py-2.5 transition-colors ${open ? "hover:bg-aula-sunken" : ""}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[10.5px] font-semibold uppercase ${open ? "bg-aula-sunken text-aula-text-2" : "bg-aula-sunken text-aula-text-4"}`}>
                  {exam.monthPt.slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-[12.5px] font-medium ${open ? "text-aula-text" : "text-aula-text-3"}`}>{exam.titlePt}</span>
                    <Dots level={exam.difficulty} />
                  </div>
                  {!exam.available ? (
                    <div className="text-[11px] text-aula-text-3">Em breve</div>
                  ) : !unlocked ? (
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-[120px]">
                        <Track value={totalCompleted / lessonsRequired} />
                      </div>
                      <span className="text-[11px] text-aula-text-3">
                        abre com {lessonsRequired} lições A1 · faltam {lessonsRequired - totalCompleted}
                      </span>
                    </div>
                  ) : (
                    <div className="truncate text-[11px] text-aula-text-3">
                      {exam.monthPt} · 3 partes · ~{minutes} min
                    </div>
                  )}
                </div>
                {!open ? (
                  <Lock size={13} strokeWidth={1.5} className="text-aula-text-4" />
                ) : result ? (
                  <span className={`inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium ${CLASS_TONE[result.classification] ?? "border-aula-border text-aula-text-2"}`}>
                    {Math.round(result.overallScore)}% · {result.classification === "Not yet" ? "Ainda não" : result.classification}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-aula-accent">
                    Começar <ArrowRight size={12} strokeWidth={1.5} />
                  </span>
                )}
              </div>
            );

            return open ? (
              <Link key={exam.id} href={`/exams/${exam.id}`}>
                {row}
              </Link>
            ) : (
              <div key={exam.id}>{row}</div>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
