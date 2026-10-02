"use client";

/**
 * Gramática / regra (Figma: Ecrãs / Gramática).
 * Reading column: intro, numbered rules with examples, tips, and a quick
 * self-check built from the topic's questions. Panel: your mastery + related.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { AudioButton } from "@/components/primitives";
import { Pips, LevelTag, Label, PanelCard, KV } from "@/components/aula";
import { useMastery, stateOf, dueLabel, STATE_LABEL } from "@/lib/use-mastery";
import grammarData from "@/data/grammar.json";
import { grammarGroups } from "@/data/grammar-groups";

interface Rule {
  rule: string;
  rulePt?: string;
  examples?: { pt: string; en: string }[];
  exceptions?: string[];
}
interface Question {
  questionText: string;
  questionTextPt?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation?: string;
}
interface Topic {
  id: string;
  title: string;
  titlePt?: string;
  cefr: string;
  summary?: string;
  intro?: string;
  rules?: Rule[];
  tips?: string[];
  tipsPt?: string[];
  questions?: Question[];
}

const TOPICS = grammarData.topics as unknown as Record<string, Topic>;

/** Bold Portuguese quoted with '…' or «…» inside running text. */
function inline(text: string): ReactNode {
  return text.split(/('.*?'|«.*?»)/g).map((part, i) =>
    /^('.*'|«.*»)$/.test(part) ? (
      <span key={i} className="font-medium text-aula-text">
        {part.startsWith("'") ? part.slice(1, -1) : part}
      </span>
    ) : (
      part
    ),
  );
}

export default function GrammarTopicPage() {
  const params = useParams();
  const slug = params.topic as string;
  const topic = TOPICS[slug];
  const { map, signedIn } = useMastery("grammar");

  const related = useMemo(() => {
    const g = grammarGroups.find((x) => x.topics.includes(slug));
    return (g?.topics ?? []).filter((id) => id !== slug && TOPICS[id]).slice(0, 5);
  }, [slug]);

  const crumbs = <Crumbs items={[{ label: "Gramática", href: "/grammar" }, ...(topic ? [{ label: topic.cefr }, { label: topic.titlePt ?? topic.title }] : [])]} />;

  if (!topic) {
    return (
      <PageShell header={crumbs}>
        <div className="mx-auto max-w-[620px]">
          <h1 className="text-[22px] font-semibold text-aula-text">Tópico não encontrado</h1>
          <Link href="/grammar" className="mt-2 inline-block text-[13px] text-aula-accent">
            Voltar à gramática
          </Link>
        </div>
      </PageShell>
    );
  }

  const rec = map.get(slug);
  const state = stateOf(rec);
  const accuracy = rec && rec.times_seen > 0 ? Math.round((rec.times_correct / rec.times_seen) * 100) : null;
  const paragraphs = (topic.intro ?? "").split("\n").map((p) => p.trim()).filter(Boolean);

  const panel = (
    <div className="flex flex-col gap-6">
      {signedIn ? (
        <PanelCard title="O teu domínio" aside={<span className={`text-[11px] ${state === "overdue" ? "text-aula-overdue" : "text-aula-text-3"}`}>{STATE_LABEL[state].toLowerCase()}</span>}>
          <div className="mb-3">
            <Pips level={rec?.mastery_level ?? 0} state={state} />
          </div>
          <KV k="Próxima revisão" v={dueLabel(rec)} tone={state === "overdue" ? "overdue" : undefined} />
          <KV k="Precisão" v={accuracy === null ? "—" : `${accuracy}%`} />
          <KV k="Tentativas" v={rec?.times_seen ?? 0} />
          <Link href="/learn" className="mt-3 flex h-8 items-center justify-center rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
            Praticar
          </Link>
        </PanelCard>
      ) : (
        <PanelCard title="Guarda o teu progresso">
          <p className="text-[12px] leading-relaxed text-aula-text-2">Entra para acompanhar o teu domínio deste tópico.</p>
        </PanelCard>
      )}
      {related.length > 0 && (
        <div>
          <Label className="mb-2">Relacionado</Label>
          {related.map((id) => (
            <Link key={id} href={`/grammar/${id}`} className="flex h-7 items-center rounded-md px-2 text-[12.5px] text-aula-accent hover:bg-aula-sunken">
              <span className="truncate">{TOPICS[id].titlePt ?? TOPICS[id].title}</span>
              <span className="flex-1" />
              <span className="text-[11px] text-aula-text-3">{TOPICS[id].cefr}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <PageShell header={crumbs} panel={panel}>
      <article className="mx-auto max-w-[620px]">
        <Label className="mb-2">Gramática · {topic.cefr}</Label>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{topic.titlePt ?? topic.title}</h1>
        <p className="mt-1.5 text-[13px] text-aula-text-2">{topic.title}</p>

        {paragraphs.length > 0 && (
          <div className="mt-6 space-y-3 text-[13px] leading-relaxed text-aula-text-2">
            {paragraphs.map((p, i) => (
              <p key={i}>{inline(p)}</p>
            ))}
          </div>
        )}

        {(topic.rules ?? []).map((r, i) => (
          <section key={i} className="mt-9">
            <h2 className="text-[15px] font-semibold text-aula-text">
              Regra {i + 1} · {r.rulePt ?? r.rule}
            </h2>
            {r.rulePt && <p className="mt-1.5 text-[13px] leading-relaxed text-aula-text-2">{inline(r.rule)}</p>}
            {r.examples && r.examples.length > 0 && (
              <div className="mt-3.5 flex flex-col gap-3">
                {r.examples.map((ex, j) => (
                  <div key={j} className="flex gap-2.5">
                    <AudioButton text={ex.pt} />
                    <div>
                      <p className="text-[13px] font-medium text-aula-text">{ex.pt}</p>
                      <p className="text-[11.5px] text-aula-text-3">{ex.en}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {r.exceptions?.map((e, j) => (
              <p key={j} className="mt-2 text-[12px] text-aula-text-2">
                Nota: {e}
              </p>
            ))}
          </section>
        ))}

        {topic.tips && topic.tips.length > 0 && (
          <div className="mt-10 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint px-4 py-3.5">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-[4px] bg-aula-accent px-1.5 py-[1px] text-[10px] font-semibold text-white">PT</span>
              <span className="text-[12px] font-medium text-aula-accent">Dicas</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {topic.tips.map((t, i) => (
                <li key={i} className="text-[12.5px] leading-relaxed text-aula-text">
                  {inline(t)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {topic.questions && topic.questions.length > 0 && <QuickCheck questions={topic.questions.slice(0, 3)} />}
      </article>
    </PageShell>
  );
}

function QuickCheck({ questions }: { questions: Question[] }) {
  return (
    <section className="mt-10">
      <Label className="mb-3">Verifica · {questions.length} perguntas</Label>
      <div className="flex flex-col gap-3">
        {questions.map((q, i) => (
          <CheckBlock key={i} q={q} n={i + 1} total={questions.length} />
        ))}
      </div>
    </section>
  );
}

function CheckBlock({ q, n, total }: { q: Question; n: number; total: number }) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;
  const right = picked === q.correctIndex;
  return (
    <div className="rounded-xl border border-aula-border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-[11px] text-aula-text-3">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-[0.06em] text-[#1F7A68]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1F7A68]" /> Verifica
        </span>
        <span>
          {n} de {total}
        </span>
      </div>
      <p className="mb-3 text-[13px] font-medium text-aula-text">{q.questionTextPt ?? q.questionText}</p>
      <div className="flex flex-wrap gap-2">
        {q.options.map((o, i) => {
          const isRight = done && i === q.correctIndex;
          const isWrong = done && i === picked && !right;
          return (
            <button
              key={i}
              disabled={done}
              onClick={() => setPicked(i)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] transition-colors ${
                isRight
                  ? "border-[#BFE3D8] bg-[#E1F2ED] text-[#1F7A68]"
                  : isWrong
                    ? "border-[#F0C9BE] bg-[#FBE9E4] text-aula-overdue"
                    : done
                      ? "border-aula-border text-aula-text-3"
                      : "border-aula-border text-aula-text hover:border-aula-text-4"
              }`}
            >
              {o}
              {isRight && <Check size={13} strokeWidth={2} />}
            </button>
          );
        })}
      </div>
      {done && q.explanation && <p className="mt-3 text-[12px] text-aula-text-2">{q.explanation}</p>}
    </div>
  );
}
