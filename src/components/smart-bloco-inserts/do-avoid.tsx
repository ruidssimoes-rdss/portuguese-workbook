import { Check, X } from "lucide-react";

// ── Types ────────────────────────────────────────────────

interface DoAvoidProps {
  doItems: string[];
  avoidItems: string[];
}

// ── DoAvoid ──────────────────────────────────────────────

export function DoAvoid({ doItems, avoidItems }: DoAvoidProps) {
  return (
    <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-[12px]">
      {/* Do */}
      <div className="space-y-[8px]">
        <p
          className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px]"
          style={{ color: "var(--color-bloco-cefr-a1)" }}
        >
          Do
        </p>
        {doItems.map((item, i) => (
          <div key={i} className="flex items-start gap-[4px]">
            <Check
              size={14}
              className="shrink-0 mt-[2px]"
              style={{ color: "var(--color-bloco-cefr-a1)" }}
            />
            <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-secondary)]">
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* Avoid */}
      <div className="space-y-[8px]">
        <p
          className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px]"
          style={{ color: "var(--color-bloco-warning)" }}
        >
          Avoid
        </p>
        {avoidItems.map((item, i) => (
          <div key={i} className="flex items-start gap-[4px]">
            <X
              size={14}
              className="shrink-0 mt-[2px]"
              style={{ color: "var(--color-bloco-warning)" }}
            />
            <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text-secondary)]">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
