"use client";

/**
 * Exercise kit (Figma: Componentes / Exercícios).
 * AnswerInput, ChoiceOption, WordChip, ConjugationRow, Feedback — the shared
 * pieces every lesson section is built from, so they all look and behave alike.
 *
 * States: idle (sunken) → typing (navy border) → correct (teal) / wrong (coral,
 * your answer struck through with the right one beside it).
 */

import { forwardRef, type ReactNode } from "react";
import { Check, X } from "lucide-react";

export type Mark = "idle" | "correct" | "wrong";

const TEAL = "border-[#1F7A68] bg-[#E1F2ED]";
const CORAL = "border-[#B94A32] bg-[#FBE9E4]";

// ─── Item: one numbered question ────────────────────────────────────────────

export function Item({ n, mark = "idle", children }: { n: number; mark?: Mark; children: ReactNode }) {
  return (
    <div className="flex gap-3.5 py-5 first:pt-1">
      <span
        className={`mt-[1px] flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10.5px] font-medium ${
          mark === "correct" ? "bg-[#E1F2ED] text-[#1F7A68]" : mark === "wrong" ? "bg-[#FBE9E4] text-[#B94A32]" : "bg-[#F7F7F6] text-[#98988F]"
        }`}
      >
        {n}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Prompt({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-2.5">
      <p className="text-[14px] font-medium leading-snug text-[#1F1F1F]">{children}</p>
      {sub && <p className="mt-0.5 text-[12px] text-[#98988F]">{sub}</p>}
    </div>
  );
}

// ─── AnswerInput ────────────────────────────────────────────────────────────

interface AnswerProps {
  value: string;
  onChange: (v: string) => void;
  mark: Mark;
  correct?: string;
  placeholder?: string;
  multiline?: boolean;
  onEnter?: () => void;
}

export const AnswerInput = forwardRef<HTMLInputElement & HTMLTextAreaElement, AnswerProps>(function AnswerInput(
  { value, onChange, mark, correct, placeholder, multiline, onEnter },
  ref,
) {
  if (mark === "correct") {
    return (
      <div className={`flex min-h-[44px] items-center gap-3 rounded-[10px] border px-3.5 py-2 ${TEAL}`}>
        <span className="flex-1 text-[14px] text-[#1F1F1F]">{value}</span>
        <span className="flex items-center gap-1 text-[12px] font-medium text-[#1F7A68]">
          <Check size={13} strokeWidth={2} /> Certo
        </span>
      </div>
    );
  }
  if (mark === "wrong") {
    return (
      <div className={`rounded-[10px] border px-3.5 py-2.5 ${CORAL}`}>
        <p className="text-[14px] text-[#B94A32] line-through decoration-[#B94A32]/60">{value || "—"}</p>
        <p className="mt-1 flex items-baseline gap-2.5">
          <span className="text-[11px] text-[#98988F]">Resposta</span>
          <span className="text-[14px] text-[#1F1F1F]">{correct}</span>
        </p>
      </div>
    );
  }
  const cls =
    "w-full rounded-[10px] border border-[#E6E6E4] bg-white px-3.5 text-[14px] text-[#1F1F1F] outline-none transition-colors placeholder:text-[#B5B5AE] focus:border-[#1B2B61]";
  const common = {
    value,
    placeholder,
    autoComplete: "off",
    spellCheck: false,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && onEnter) {
        e.preventDefault();
        onEnter();
      }
    },
  };
  return multiline ? (
    <textarea ref={ref} rows={2} className={`${cls} resize-none py-2.5`} {...common} />
  ) : (
    <input ref={ref} type="text" className={`${cls} h-11`} {...common} />
  );
});

// ─── ChoiceOption ───────────────────────────────────────────────────────────

export function Choice({
  n,
  label,
  selected,
  result,
  disabled,
  onClick,
}: {
  n: number;
  label: ReactNode;
  selected: boolean;
  /** After checking: this option is the right answer / your wrong pick / neither. */
  result?: "correct" | "wrong" | "dim";
  disabled?: boolean;
  onClick: () => void;
}) {
  const tone =
    result === "correct"
      ? TEAL
      : result === "wrong"
        ? CORAL
        : result === "dim"
          ? "border-[#EFEFED] bg-white opacity-60"
          : selected
            ? "border-[#1B2B61] bg-[#F3F5FA]"
            : "border-[#E6E6E4] bg-white hover:border-[#CFCFCB]";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[43px] w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-colors ${tone} ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border border-[#E6E6E4] bg-[#F7F7F6] text-[10.5px] text-[#98988F]">{n}</span>
      <span className="flex-1 text-[13px] text-[#1F1F1F]">{label}</span>
      {result === "correct" && <Check size={14} strokeWidth={2} className="text-[#1F7A68]" />}
      {result === "wrong" && <X size={14} strokeWidth={2} className="text-[#B94A32]" />}
    </button>
  );
}

export function choiceResult(i: number, picked: number | undefined, right: number | undefined, checked: boolean) {
  if (!checked) return undefined;
  if (i === right) return "correct" as const;
  if (i === picked) return "wrong" as const;
  return "dim" as const;
}

// ─── WordChip ───────────────────────────────────────────────────────────────

export function Chip({ children, state = "available", onClick, disabled }: { children: ReactNode; state?: "available" | "placed" | "used"; onClick?: () => void; disabled?: boolean }) {
  const tone =
    state === "placed"
      ? "border-[#D3DAEB] bg-[#F3F5FA] text-[#1B2B61]"
      : state === "used"
        ? "border-[#EFEFED] bg-[#F7F7F6] text-[#B5B5AE]"
        : "border-[#E6E6E4] bg-white text-[#1F1F1F] shadow-[0_1px_1px_rgba(0,0,0,0.03)] hover:border-[#CFCFCB]";
  return (
    <button
      type="button"
      disabled={disabled || state === "used"}
      onClick={onClick}
      className={`inline-flex h-[30px] items-center rounded-lg border px-3 text-[13px] transition-colors ${tone}`}
    >
      {children}
    </button>
  );
}

// ─── ConjugationRow ─────────────────────────────────────────────────────────

export const ConjRow = forwardRef<
  HTMLInputElement,
  { person: string; value: string; onChange: (v: string) => void; mark: Mark; correct: string; onEnter?: () => void }
>(function ConjRow({ person, value, onChange, mark, correct, onEnter }, ref) {
  return (
    <div className="grid grid-cols-[96px_1fr] items-center gap-3 py-1">
      <span className="text-[12.5px] text-[#98988F]">{person}</span>
      {mark === "idle" ? (
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder="—"
          autoComplete="off"
          spellCheck={false}
          className="h-9 rounded-lg border border-[#E6E6E4] bg-white px-3 text-[13.5px] text-[#1F1F1F] outline-none transition-colors placeholder:text-[#B5B5AE] focus:border-[#1B2B61]"
        />
      ) : mark === "correct" ? (
        <span className={`flex h-9 items-center rounded-lg border px-3 text-[13.5px] text-[#1F1F1F] ${TEAL}`}>{correct}</span>
      ) : (
        <span className={`flex h-9 items-center gap-2.5 rounded-lg border px-3 text-[13.5px] ${CORAL}`}>
          {value && <span className="text-[#B94A32] line-through decoration-[#B94A32]/60">{value}</span>}
          <span className="text-[#1F1F1F]">{correct}</span>
        </span>
      )}
    </div>
  );
});

// ─── Feedback ───────────────────────────────────────────────────────────────

export function Feedback({ tone, title, children }: { tone: "correct" | "wrong" | "accent"; title: string; children?: ReactNode }) {
  const c =
    tone === "correct"
      ? "border-[#1F7A68] bg-[#E1F2ED] text-[#1F7A68]"
      : tone === "wrong"
        ? "border-[#B94A32] bg-[#FBE9E4] text-[#B94A32]"
        : "border-[#1B2B61] bg-[#F3F5FA] text-[#1B2B61]";
  return (
    <div className={`mt-2.5 rounded-[10px] border px-3.5 py-2.5 ${c}`}>
      <p className="text-[12px] font-semibold">{title}</p>
      {children && <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#1F1F1F]">{children}</p>}
    </div>
  );
}

/** «Atenção ao acento» — accepted, but flags the missing/extra accent. */
export function AccentNote({ hint }: { hint?: string }) {
  if (!hint) return null;
  return (
    <Feedback tone="accent" title="Atenção ao acento">
      Escreve-se «{hint}». Conta como certa.
    </Feedback>
  );
}

// ─── Footer: check → next ───────────────────────────────────────────────────

export function SectionFooter({
  checked,
  ready,
  remaining,
  correct,
  total,
  isLast,
  onCheck,
  onNext,
}: {
  checked: boolean;
  ready: boolean;
  remaining: number;
  correct: number;
  total: number;
  isLast: boolean;
  onCheck: () => void;
  onNext: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-6 mt-2 flex items-center gap-3 rounded-b-xl border-t border-[#EFEFED] bg-white/95 px-6 py-3.5 backdrop-blur">
      {checked ? (
        <span className="text-[12.5px] text-[#6B6B69]">
          <span className={`font-semibold ${correct === total ? "text-[#1F7A68]" : "text-[#1F1F1F]"}`}>
            {correct} de {total}
          </span>{" "}
          certas
        </span>
      ) : (
        <span className="text-[12px] text-[#98988F]">{ready ? "Pronto para verificar" : `Faltam ${remaining}`}</span>
      )}
      <span className="flex-1" />
      {checked ? (
        <button type="button" onClick={onNext} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1B2B61] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#14214C]">
          {isLast ? "Ver resultados" : "Continuar"} →
        </button>
      ) : (
        <button
          type="button"
          onClick={onCheck}
          disabled={!ready}
          className="inline-flex h-9 items-center rounded-lg bg-[#1B2B61] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#14214C] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Verificar
        </button>
      )}
    </div>
  );
}
