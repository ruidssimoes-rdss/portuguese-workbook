/**
 * Aula UI pieces shared by the rebuilt screens (Figma: Componentes).
 */

import type { WordState } from "@/lib/use-mastery";

const PIP_COLOR: Record<WordState, string> = {
  unseen: "bg-[#E6E6E4]",
  learning: "bg-[#5B45B8]",
  overdue: "bg-aula-overdue",
  mastered: "bg-aula-accent",
};

/** Five-dash mastery meter (Figma: Pips). */
export function Pips({ level, state }: { level: number; state: WordState }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`Domínio ${level} de 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-[3px] w-[10px] rounded-full ${i < level ? PIP_COLOR[state] : "bg-[#E6E6E4]"}`} />
      ))}
    </span>
  );
}

const LEVEL_TAG: Record<string, string> = {
  A1: "text-[#1F7A68] bg-[#E1F2ED]",
  A2: "text-[#1B2B61] bg-[#E8ECF6]",
  B1: "text-[#5B45B8] bg-[#ECE8F8]",
};

/** CEFR level tag (Figma: Tag). */
export function LevelTag({ level }: { level: string }) {
  return (
    <span className={`inline-flex h-[18px] items-center rounded-[5px] px-1.5 text-[10.5px] font-medium ${LEVEL_TAG[level] ?? "bg-aula-sunken text-aula-text-2"}`}>
      {level}
    </span>
  );
}

/** Enclosed white card used in the right panel. */
export function PanelCard({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[10px] border border-aula-border bg-white p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-aula-text">{title}</span>
        {aside}
      </div>
      {children}
    </div>
  );
}

/** Small uppercase label used inside panels and lists (Figma: SectionLabel). */
export function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3 ${className}`}>{children}</div>;
}

/** Key / value row. */
export function KV({ k, v, tone }: { k: string; v: React.ReactNode; tone?: "overdue" | "accent" }) {
  const c = tone === "overdue" ? "text-aula-overdue" : tone === "accent" ? "text-aula-accent" : "text-aula-text";
  return (
    <div className="flex items-center justify-between gap-3 py-[3px] text-[12px]">
      <span className="text-aula-text-2">{k}</span>
      <span className={`font-medium ${c}`}>{v}</span>
    </div>
  );
}

/** Thin progress track (Figma: ProgressBar). value 0–1. */
export function Track({ value, tone = "accent" }: { value: number; tone?: "accent" | "learning" | "overdue" }) {
  const c = tone === "learning" ? "bg-[#5B45B8]" : tone === "overdue" ? "bg-aula-overdue" : "bg-aula-accent";
  return (
    <div className="h-1 overflow-hidden rounded-full bg-[#E6E6E4]">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

/** Page title block for rebuilt screens. */
export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[13px] text-aula-text-2">{subtitle}</p>}
    </div>
  );
}

/** Portuguese names for vocab category ids. */
export const CATEGORY_PT: Record<string, string> = {
  "greetings-expressions": "Cumprimentos e expressões",
  "numbers-time": "Números e tempo",
  "colours-weather": "Cores e tempo",
  "food-drink": "Comida e bebida",
  "travel-directions": "Viagens e direções",
  "home-rooms": "Casa",
  "family-daily-routine": "Família e rotina",
  "work-education": "Trabalho e estudos",
  "health-body": "Saúde e corpo",
  "shopping-money": "Compras e dinheiro",
  "nature-animals": "Natureza e animais",
  "emotions-personality": "Emoções e personalidade",
  "colloquial-slang": "Calão e coloquial",
  "technology-internet": "Tecnologia e internet",
  "clothing-appearance": "Roupa e aparência",
  opposites: "Opostos",
  "countries-nationalities": "Países e nacionalidades",
  "hobbies-leisure": "Passatempos e lazer",
  "holidays-celebrations": "Festas e feriados",
  "adjectives-descriptions": "Adjetivos e descrições",
  "materials-measurements": "Materiais e medidas",
  "services-bureaucracy": "Serviços e burocracia",
  "renting-home-life": "Arrendamento e vida em casa",
  "news-society": "Notícias e sociedade",
  environment: "Ambiente",
  "opinions-connectors": "Opiniões e argumentos",
};

/** Link to a word's note page. */
export function wordHref(categoryId: string, portuguese: string) {
  return `/vocabulary/${categoryId}/${encodeURIComponent(portuguese)}`;
}
