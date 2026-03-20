// ── Types ────────────────────────────────────────────────

interface ComparisonSide {
  label: string;
  text: string;
}

interface ComparisonProps {
  positive: ComparisonSide;
  negative: ComparisonSide;
}

// ── Comparison ───────────────────────────────────────────

export function Comparison({ positive, negative }: ComparisonProps) {
  return (
    <div className="grid grid-cols-1 @[500px]:grid-cols-2 gap-[12px]">
      {/* Positive / Actually means */}
      <div
        className="rounded-[var(--bloco-radius-example)] p-[12px]"
        style={{
          backgroundColor: "rgba(33, 145, 113, 0.1)",
          border: "0.8px solid var(--color-bloco-cefr-a1)",
        }}
      >
        <p
          className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] mb-[4px]"
          style={{ color: "var(--color-bloco-cefr-a1)" }}
        >
          {positive.label}
        </p>
        <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)]">
          {positive.text}
        </p>
      </div>

      {/* Negative / Not */}
      <div
        className="rounded-[var(--bloco-radius-example)] p-[12px]"
        style={{
          backgroundColor: "rgba(187, 31, 31, 0.1)",
          border: "0.8px solid var(--color-bloco-warning)",
        }}
      >
        <p
          className="font-[family-name:var(--font-sans)] text-[12px] font-medium uppercase tracking-[0.6px] mb-[4px]"
          style={{ color: "var(--color-bloco-warning)" }}
        >
          {negative.label}
        </p>
        <p className="font-[family-name:var(--font-content)] text-[12px] font-normal text-[var(--color-bloco-text)]">
          {negative.text}
        </p>
      </div>
    </div>
  );
}
