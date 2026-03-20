import type { BlocoStat } from "../smart-bloco.types";

interface StatDisplayProps {
  stat: BlocoStat;
}

export function StatDisplay({ stat }: StatDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-[8px]">
      <p
        className="font-[family-name:var(--font-sans)] text-[13px] font-bold"
        style={{ color: "var(--color-bloco-primary)" }}
      >
        {stat.value}
      </p>
      <p className="font-[family-name:var(--font-content)] text-[12px] font-medium text-[var(--color-bloco-text-body)] mt-[4px]">
        {stat.label}
      </p>
      {stat.delta && (
        <p
          className="font-[family-name:var(--font-sans)] text-[13px] font-normal mt-[4px]"
          style={{ color: "var(--color-bloco-success)" }}
        >
          {stat.delta}
        </p>
      )}
    </div>
  );
}
