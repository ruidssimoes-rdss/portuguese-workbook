"use client";

/**
 * Como funciona o Aula (Figma: Ecrãs / O teu percurso).
 * The journey A1 → A2 → B1, how a lesson is built, how reviews are spaced,
 * and what each pip means. Static content; links into the library.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Pips, LevelTag, Label, ScreenTitle, PanelCard, KV } from "@/components/aula";
import vocab from "@/data/vocab.json";
import verbs from "@/data/verbs.json";
import grammar from "@/data/grammar.json";

const WORDS = (vocab as unknown as { categories: { words: unknown[] }[] }).categories.reduce((n, c) => n + c.words.length, 0);
const VERBS = (verbs as unknown as { order: string[] }).order.length;
const TOPICS = Object.keys((grammar as unknown as { topics: Record<string, unknown> }).topics).length;

const LEVELS = [
  {
    level: "A1",
    name: "Iniciação",
    hours: "60–100 h",
    time: "2 a 3 meses",
    can: "Apresentas-te, pedes um café, dizes as horas e os números. Sobrevives a uma conversa curta e lenta.",
    learn: "Presente dos verbos regulares e de ser, estar, ter, ir. Artigos, género, plural. Cerca de 500 palavras.",
    exam: null,
  },
  {
    level: "A2",
    name: "Sobreviver no dia a dia",
    hours: "150–200 h",
    time: "5 a 8 meses",
    can: "Contas o que fizeste ontem e como era antes. Tratas de compras, médico, farmácia. Escreves uma mensagem simples.",
    learn: "Pretérito perfeito e imperfeito, futuro, pronomes, preposições. Cerca de 1000 palavras.",
    exam: "CIPLE",
  },
  {
    level: "B1",
    name: "Conversar à vontade",
    hours: "300–400 h",
    time: "12 a 18 meses",
    can: "Dás a tua opinião e justificas. Contas uma história inteira. Tratas de assuntos nas Finanças, no banco, com o senhorio.",
    learn: "Conjuntivo (presente, imperfeito e futuro), condicional, frases com «se». Cerca de 2000 palavras.",
    exam: "DEPLE",
  },
];

const LESSON_PARTS = [
  { k: "Novo", v: "Algumas palavras, um verbo ou uma regra que ainda não viste, escolhidos pelo que precisas a seguir." },
  { k: "Praticar", v: "Exercícios sobre o que acabaste de ver: escolher, escrever, ouvir, construir a frase." },
  { k: "Rever", v: "O que está na hora de voltar a ver, antes de te esqueceres." },
  { k: "Verificar", v: "Uma ou duas perguntas sobre o que já dominas, para confirmar que ficou." },
];

const PIPS = [
  { level: 0, label: "Por ver", next: "—" },
  { level: 1, label: "Visto uma vez", next: "amanhã" },
  { level: 2, label: "A aprender", next: "daqui a 3 dias" },
  { level: 3, label: "Familiar", next: "daqui a 1 semana" },
  { level: 4, label: "Quase lá", next: "daqui a 2 semanas" },
  { level: 5, label: "Dominado", next: "daqui a 1 mês" },
];

export default function GuidePage() {
  const panel = (
    <div className="flex flex-col gap-6">
      <PanelCard title="O que há no Aula">
        <KV k="Palavras" v={WORDS.toLocaleString("pt-PT")} />
        <KV k="Verbos" v={`${VERBS} · 9 tempos`} />
        <KV k="Regras de gramática" v={TOPICS} />
        <KV k="Exames simulados" v="CIPLE A2" />
      </PanelCard>
      <div>
        <Label className="mb-2">Só português europeu</Label>
        <p className="text-[12px] leading-relaxed text-aula-text-2">
          Tudo no Aula é português de Portugal: «autocarro», não «ônibus»; «estou a fazer», não «estou fazendo»; «tu» no dia a dia e «você» com cuidado.
        </p>
      </div>
      <Link href="/lessons" className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-aula-accent text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
        Ver as lições <ArrowRight size={13} strokeWidth={1.5} />
      </Link>
    </div>
  );

  return (
    <PageShell header={<Crumbs items={[{ label: "Como funciona" }]} />} panel={panel}>
      <article className="mx-auto max-w-[680px]">
        <ScreenTitle
          title="Como funciona o Aula"
          subtitle="Três níveis, do primeiro «olá» a conversar sem pensar. Um pouco todos os dias chega."
        />

        <section>
          <Label className="mb-3">O percurso</Label>
          <div className="flex flex-col gap-2.5">
            {LEVELS.map((L, i) => (
              <div key={L.level} className="flex gap-4 rounded-xl border border-aula-border bg-white p-[18px]">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-aula-accent-faint text-[12px] font-semibold text-aula-accent">{L.level}</span>
                  {i < LEVELS.length - 1 && <span className="mt-2 w-px flex-1 bg-aula-border" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-medium text-aula-text">{L.name}</span>
                    <span className="flex-1" />
                    <span className="text-[11px] text-aula-text-3">
                      {L.hours} · {L.time}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-aula-text">{L.can}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-aula-text-2">{L.learn}</p>
                  {L.exam && (
                    <p className="mt-2 text-[11px] text-aula-accent">
                      Fim do nível: {L.exam}, o exame oficial de {L.level}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-aula-text-3">
            Os prazos contam com cerca de 30 minutos por dia e alguma exposição fora do Aula (ouvir rádio, ler notícias). O nível seguinte abre quando estiveres 75% pronto no atual.
          </p>
        </section>

        <section className="mt-10">
          <Label className="mb-3">Uma lição</Label>
          <p className="mb-4 text-[13px] leading-relaxed text-aula-text-2">
            Não há uma lista fixa de lições. Cada uma é montada para ti a partir do que já sabes e do que te falta, por isso não há duas iguais. Leva 10 a 15 minutos e passas com 80%.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {LESSON_PARTS.map((p, i) => (
              <div key={p.k} className="rounded-[10px] bg-aula-sunken px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-aula-text-4">{i + 1}</span>
                  <span className="text-[12.5px] font-medium text-aula-text">{p.k}</span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-aula-text-2">{p.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <Label className="mb-3">Os pontos e as revisões</Label>
          <p className="mb-4 text-[13px] leading-relaxed text-aula-text-2">
            Cada palavra, verbo e regra tem cinco pontos. Acertas, sobe um ponto e a próxima revisão fica mais longe. Erras, desce e volta mais cedo. Quando uma revisão passa do prazo fica <span className="font-medium text-aula-overdue">em atraso</span>.
          </p>
          <div className="rounded-xl border border-aula-border">
            {PIPS.map((p) => (
              <div key={p.level} className="flex min-h-[40px] items-center gap-4 border-b border-aula-line px-4 py-1.5 last:border-0">
                <Pips level={p.level} state={p.level === 0 ? "unseen" : p.level === 5 ? "mastered" : "learning"} />
                <span className="flex-1 text-[12.5px] text-aula-text">{p.label}</span>
                <span className="text-[11px] text-aula-text-3">próxima revisão {p.next}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed text-aula-text-3">As 200 palavras mais usadas voltam mais depressa, porque são as que mais vais ouvir.</p>
        </section>

        <section className="mt-10">
          <Label className="mb-3">Onde está cada coisa</Label>
          <div className="flex flex-col">
            {[
              { href: "/", k: "Hoje", v: "O que fazer agora: a próxima lição e as revisões em atraso." },
              { href: "/vocabulary", k: "Vocabulário", v: "Todas as palavras por tema, com pronúncia, exemplo e o teu domínio." },
              { href: "/conjugations", k: "Conjugações", v: "Cada verbo em 9 tempos, do presente ao conjuntivo." },
              { href: "/grammar", k: "Gramática", v: "As regras explicadas com exemplos e uma verificação rápida." },
              { href: "/exams", k: "Exames", v: "Simulados do CIPLE com tempo e a nota calculada como no exame real." },
              { href: "/tutor", k: "Elísio", v: "O teu professor: prepara uma sessão sobre o que te está a custar." },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="flex min-h-[44px] items-center gap-4 rounded-[10px] px-3 py-2 transition-colors hover:bg-aula-sunken">
                <span className="w-[100px] shrink-0 text-[12.5px] font-medium text-aula-text">{r.k}</span>
                <span className="flex-1 text-[12px] text-aula-text-2">{r.v}</span>
                <ArrowRight size={13} strokeWidth={1.5} className="text-aula-text-4" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 flex items-center gap-2 text-[11.5px] text-aula-text-3">
          <LevelTag level="A1" />
          <LevelTag level="A2" />
          <LevelTag level="B1" />
          <span>Os níveis seguem o Quadro Europeu Comum de Referência (QECR).</span>
        </div>
      </article>
    </PageShell>
  );
}
