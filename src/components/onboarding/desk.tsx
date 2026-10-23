"use client";

import { ArrowRight, Award, Baseline, BookA, CalendarDays, ChevronLeft, Info, Send, Type, X } from "lucide-react";
import { Sidebar, useSidebarCollapsed } from "@/components/layout/sidebar";

const STEP_NAMES = ["Porquê", "Nível", "Ritmo", "Objetivo", "Nome"] as const;

const PLACE_LIST = [
  { k: "Hoje", v: "O que fazer agora: a próxima lição e as revisões em atraso.", icon: CalendarDays },
  { k: "Vocabulário", v: "Todas as palavras por tema, com pronúncia, exemplo e o teu domínio.", icon: BookA },
  { k: "Conjugações", v: "Cada verbo em 9 tempos, do presente ao conjuntivo.", icon: Type },
  { k: "Gramática", v: "As regras explicadas com exemplos e uma verificação rápida.", icon: Baseline },
  { k: "Exames", v: "Simulados do CIPLE com tempo e a nota calculada como no exame real.", icon: Award },
  { k: "Elísio", v: "O teu professor: prepara uma sessão sobre o que te está a custar.", icon: Send },
];

const LEVELS = [
  {
    level: "A1",
    name: "Iniciação",
    can: "Apresentas-te, pedes um café, dizes as horas e os números. Sobrevives a uma conversa curta e lenta.",
    learn: "Presente dos verbos regulares e de ser, estar, ter, ir. Artigos, género, plural. Cerca de 500 palavras.",
    exam: null as string | null,
  },
  {
    level: "A2",
    name: "Sobreviver no dia a dia",
    can: "Contas o que fizeste ontem e como era antes. Tratas de compras, médico, farmácia. Escreves uma mensagem simples.",
    learn: "Pretérito perfeito e imperfeito, futuro, pronomes, preposições. Cerca de 1000 palavras.",
    exam: "CIPLE",
  },
  {
    level: "B1",
    name: "Conversar à vontade",
    can: "Dás a tua opinião e justificas. Contas uma história inteira. Tratas de assuntos nas Finanças, no banco, com o senhorio.",
    learn: "Conjuntivo (presente, imperfeito e futuro), condicional, frases com «se». Cerca de 2000 palavras.",
    exam: "DEPLE",
  },
];

const MASTERY = [
  { label: "Por ver", next: "—", bar: "bg-[#E6E6E4]" },
  { label: "Visto uma vez", next: "amanhã", bar: "bg-[#C5CDE0]" },
  { label: "A aprender", next: "daqui a 3 dias", bar: "bg-[#8FA0C8]" },
  { label: "Familiar", next: "daqui a 1 semana", bar: "bg-[#1B2B61]" },
  { label: "Quase lá", next: "daqui a 2 semanas", bar: "bg-[#1B2B61]" },
  { label: "Dominado", next: "daqui a 1 mês", bar: "bg-[#1F7A68]" },
];

const LESSON_PARTS = [
  { k: "Novo", v: "Algumas palavras, um verbo ou uma regra que ainda não viste, escolhidos pelo que precisas a seguir." },
  { k: "Praticar", v: "Exercícios sobre o que acabaste de ver: escolher, escrever, ouvir, construir a frase." },
  { k: "Rever", v: "O que está na hora de voltar a ver, antes de te esqueceres." },
  { k: "Verificar", v: "Uma ou duas perguntas sobre o que já dominas, para confirmar que ficou." },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 20) return "Boa tarde";
  return "Boa noite";
}

function goalLevel(goal: string): string | null {
  if (goal === "reach-a2" || goal === "pass-ciple-a2") return "A2";
  if (goal === "reach-b1" || goal === "pass-ciple-b1") return "B1";
  if (goal === "conversational") return "B1";
  return null;
}

export function DeskOption({
  selected,
  title,
  hint,
  onClick,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        selected ? "border-[#1B2B61] bg-[#F3F5FA]" : "border-[#E6E6E4] bg-white hover:border-[#C5CDE0]"
      }`}
    >
      <span
        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-[#1B2B61] bg-[#1B2B61]" : "border-[#6B6B69] bg-white"
        }`}
        aria-hidden
      >
        {selected && <span className="h-1 w-1 rounded-full bg-white" />}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-[#1F1F1F]">{title}</span>
        {hint && <span className="mt-1 block text-[12px] leading-relaxed text-[#5A5A57]">{hint}</span>}
      </span>
    </button>
  );
}

function GuideExcerpt({ step, goal }: { step: number; goal: string }) {
  const highlight = goalLevel(goal);
  return (
    <article className="mx-auto max-w-[640px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Como funciona</p>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#1F1F1F]">Como funciona o Aula</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#5A5A57]">
        Três níveis, do primeiro «olá» a conversar sem pensar. Um pouco todos os dias chega.
      </p>

      {step === 2 ? (
        <>
          <section className="mt-8">
            <p className="text-[12px] font-medium text-[#6B6B69]">2 Uma lição</p>
            <div className="mt-3 grid grid-cols-2 gap-2 min-[1280px]:grid-cols-4">
              {LESSON_PARTS.map((part, i) => (
                <div key={part.k} className="rounded-xl bg-[#F7F7F6] px-3 py-3">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-[#1F1F1F]">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8ECF6] text-[11px] text-[#1B2B61]">{i + 1}</span>
                    {part.k}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A57]">{part.v}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="mt-8">
            <p className="text-[12px] font-medium text-[#6B6B69]">3 Os pontos e as revisões</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5A5A57]">
              Cada palavra, verbo e regra sobe um degrau quando acertas e volta mais tarde.
            </p>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {MASTERY.map((pip) => (
                <div key={pip.label}>
                  <span className={`block h-1 rounded-full ${pip.bar}`} />
                  <p className="mt-2 text-[11px] leading-snug text-[#1F1F1F]">{pip.label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-[#5A5A57]">{pip.next}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-[#5A5A57]">
              As 200 palavras mais usadas voltam mais depressa, porque são as que mais vais ouvir.
            </p>
          </section>
        </>
      ) : step === 1 || step === 3 ? (
        <section className="mt-8">
          <p className="text-[12px] font-medium text-[#6B6B69]">1 O percurso</p>
          <div className="mt-3 flex flex-col gap-2">
            {LEVELS.map((level) => {
              const on = highlight === level.level;
              return (
                <div
                  key={level.level}
                  className={`rounded-xl border px-4 py-3 ${on ? "border-[#1B2B61] bg-[#F3F5FA]" : "border-[#E6E6E4] bg-white"}`}
                >
                  <p className="flex items-center gap-2 text-[13px] font-medium text-[#1F1F1F]">
                    <span className={`inline-flex h-5 items-center rounded-md px-2 text-[11px] font-semibold ${level.level === "A1" ? "bg-[#E1F2ED] text-[#1F7A68]" : "bg-[#E8ECF6] text-[#1B2B61]"}`}>{level.level}</span>
                    {level.name}
                    {level.exam && (
                      <span className="text-[11px] font-medium text-[#1B2B61]">{level.exam}</span>
                    )}
                  </p>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#5A5A57]">{level.can}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[#5A5A57]">{level.learn}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#5A5A57]">
            <Info size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
            Os níveis seguem o Quadro Europeu Comum de Referência (QECR).
          </p>
        </section>
      ) : (
        <section className="mt-8">
          <p className="text-[12px] font-medium text-[#6B6B69]">4 O que há no Aula</p>
          <div className="mt-3 flex flex-col gap-2">
            {PLACE_LIST.map((row) => {
              const Icon = row.icon;
              const on = step === 4 && row.k === "Hoje";
              return (
                <div
                  key={row.k}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${on ? "border-[#1B2B61] bg-[#F3F5FA]" : "border-[#E6E6E4] bg-white"}`}
                >
                  <Icon size={16} strokeWidth={1.75} className="shrink-0 text-[#1B2B61]" aria-hidden />
                  <span className="w-24 shrink-0 text-[13px] font-medium text-[#1F1F1F]">{row.k}</span>
                  <span className="text-[13px] leading-relaxed text-[#5A5A57]">{row.v}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#5A5A57]">
            <Info size={12} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden />
            Os níveis seguem o Quadro Europeu Comum de Referência (QECR).
          </p>
        </section>
      )}
    </article>
  );
}

export function OnboardingDesk({
  step,
  total,
  title,
  hint,
  children,
  canProceed,
  saving,
  saveError,
  onBack,
  onNext,
  onSkip,
  onClose,
  nextLabel,
  goal,
}: {
  step: number;
  total: number;
  title: string;
  hint: string;
  children: React.ReactNode;
  canProceed: boolean;
  saving: boolean;
  saveError: string | null;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
  nextLabel: string;
  goal: string;
}) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const name = STEP_NAMES[step] ?? "";

  return (
    <div className="hidden h-dvh bg-[#F7F7F6] min-[744px]:flex">
      <Sidebar collapsed={collapsed} onToggle={toggle} className="hidden h-dvh min-[1100px]:flex" />
      <div className="flex min-w-0 flex-1 gap-2 p-2">
        <section className="hidden min-w-0 flex-1 overflow-y-auto rounded-xl border border-[#EFEFED] bg-white px-8 py-8 min-[1100px]:block">
          <GuideExcerpt step={step} goal={goal} />
        </section>
        <section className="mx-auto flex w-full max-w-[440px] min-w-0 flex-col overflow-hidden rounded-xl border border-[#EFEFED] bg-white min-[1100px]:mx-0 min-[1100px]:w-[420px] min-[1100px]:max-w-none">
          <header className="flex h-12 shrink-0 items-center gap-2 px-4">
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5A57] hover:bg-[#F7F7F6]"
              aria-label={step === 0 ? "Voltar ao início" : "Anterior"}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <p className="min-w-0 flex-1 truncate text-[12px] text-[#5A5A57]">
              Começar <span className="px-1 text-[#B5B5AE]">/</span> <span className="font-medium text-[#1F1F1F]">{name}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#5A5A57] hover:bg-[#F7F7F6]"
              aria-label="Fechar"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">
              Começar · {step + 1} de {total}
            </p>
            <div className="mt-2 flex gap-1" aria-hidden>
              {STEP_NAMES.map((label, i) => (
                <span key={label} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#1B2B61]" : "bg-[#E6E6E4]"}`} />
              ))}
            </div>
            <p className="mt-2 text-[12px] text-[#5A5A57]">
              {STEP_NAMES.map((label, i) => (
                <span key={label}>
                  {i > 0 && <span className="px-1 text-[#B5B5AE]">·</span>}
                  <span className={i === step ? "font-medium text-[#1F1F1F]" : undefined}>{label}</span>
                </span>
              ))}
            </p>

            <h1 className="mt-6 text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#1F1F1F]">{title}</h1>
            <p className="mt-1 text-[13px] text-[#5A5A57]">{hint}</p>
            <div className="mt-4">{children}</div>
            {saveError && <p className="mt-3 text-[13px] text-[#B94A32]">{saveError}</p>}
          </div>

          <footer className="flex shrink-0 items-center gap-2 px-4 py-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-[#6B6B69] hover:bg-[#F7F7F6]"
              >
                <ChevronLeft size={14} strokeWidth={1.75} aria-hidden />
                Anterior
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onSkip}
              disabled={saving}
              className="text-[12px] text-[#5A5A57] hover:text-[#1F1F1F] disabled:opacity-50"
            >
              Saltar configuração
            </button>
            <span className="flex-1" />
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed || saving}
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#1B2B61] px-4 text-[13px] font-medium text-white hover:bg-[#14214C] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "A guardar…" : nextLabel}
              {!saving && <ArrowRight size={14} strokeWidth={1.75} aria-hidden />}
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

export function NamePreview({ name, onStart }: { name: string; onStart: () => void }) {
  const who = name.trim();
  return (
    <div className="mt-4 rounded-xl border border-[#E6E6E4] bg-[#F7F7F6] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#5A5A57]">Hoje</p>
      <p className="mt-2 text-[16px] font-semibold text-[#1F1F1F]">
        {who ? `${greeting()}, ${who}` : greeting()}
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1B2B61] text-[13px] font-medium text-white hover:bg-[#14214C]"
      >
        Começar a sessão de hoje
        <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
