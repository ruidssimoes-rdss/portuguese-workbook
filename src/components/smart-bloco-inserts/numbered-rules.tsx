"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, HelpCircle } from "lucide-react";

// ── Types ────────────────────────────────────────────────

interface RuleCallout {
  type: "tip" | "why";
  text: string;
}

interface RuleExample {
  pt: string;
  en: string;
}

interface Rule {
  number: number;
  text: string;
  textPt?: string;
  example?: RuleExample;
  callout?: RuleCallout;
}

interface NumberedRulesProps {
  rules: Rule[];
}

// ── Single Rule ──────────────────────────────────────────

function RuleItem({ rule }: { rule: Rule }) {
  const [calloutOpen, setCalloutOpen] = useState(false);
  const hasCallout = Boolean(rule.callout);

  return (
    <div
      className="flex items-start gap-[12px] min-h-[36px] py-[4px]"
      style={{ borderBottom: "1px solid var(--color-bloco-border-divider)" }}
    >
      {/* Number badge */}
      <span
        className="flex items-center justify-center w-[24px] h-[24px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[12px] font-normal shrink-0 mt-[2px]"
        style={{
          backgroundColor: "rgba(22, 62, 164, 0.1)",
          border: "0.8px solid var(--color-bloco-primary)",
          color: "var(--color-bloco-primary)",
        }}
      >
        {rule.number}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-[8px]">
        {/* Rule text */}
        <p className="font-[family-name:var(--font-content)] text-[12px] font-medium text-[var(--color-bloco-text)]">
          {rule.text}
        </p>

        {/* Portuguese translation */}
        {rule.textPt && (
          <p
            className="font-[family-name:var(--font-content)] text-[12px] font-medium italic"
            style={{ color: "var(--color-bloco-primary)" }}
          >
            ({rule.textPt})
          </p>
        )}

        {/* Example */}
        {rule.example && (
          <div
            className="rounded-[var(--bloco-radius-example)] p-[var(--bloco-example-padding)] border"
            style={{
              backgroundColor: "var(--color-bloco-surface-recessed)",
              borderColor: "var(--color-bloco-border-content)",
            }}
          >
            <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)]">
              {rule.example.pt}
            </p>
            <p
              className="font-[family-name:var(--font-content)] text-[12px] font-normal italic mt-[var(--bloco-example-gap)]"
              style={{ color: "var(--color-bloco-primary)" }}
            >
              {rule.example.en}
            </p>
          </div>
        )}

        {/* Callout (tip / why) */}
        {hasCallout && (
          <div>
            <button
              onClick={() => setCalloutOpen(!calloutOpen)}
              className="inline-flex items-center gap-[4px] font-[family-name:var(--font-sans)] text-[13px] font-normal cursor-pointer transition-colors duration-150 hover:opacity-80"
              style={{
                color:
                  rule.callout!.type === "tip"
                    ? "var(--color-bloco-tip)"
                    : "var(--color-bloco-tip)",
              }}
              type="button"
            >
              {rule.callout!.type === "tip" ? (
                <Lightbulb size={14} />
              ) : (
                <HelpCircle size={14} />
              )}
              {rule.callout!.type === "tip" ? "Dica" : "Porquê?"}
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${calloutOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${calloutOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p
                  className="font-[family-name:var(--font-sans)] text-[13px] font-normal mt-[8px]"
                  style={{ color: "var(--color-bloco-tip)" }}
                >
                  {rule.callout!.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── NumberedRules ─────────────────────────────────────────

export function NumberedRules({ rules }: NumberedRulesProps) {
  return (
    <div className="flex flex-col">
      {rules.map((rule) => (
        <RuleItem key={rule.number} rule={rule} />
      ))}
    </div>
  );
}
