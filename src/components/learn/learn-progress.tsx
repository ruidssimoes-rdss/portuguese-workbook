interface LearnProgressProps {
  current: number;
  total: number;
  cefr: string;
  label?: string;
}

function CEFRPill({ level }: { level: string }) {
  const c =
    level === "A1" ? "text-[#1F7A68] bg-[#E1F2ED]" :
    level === "A2" ? "text-[#1B2B61] bg-[#E8ECF6]" :
    "text-[#5B45B8] bg-[#ECE8F8]";
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${c}`}>{level}</span>;
}

export function LearnProgress({ current, total, cefr, label }: LearnProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#98988F]">
          {label || `Secção ${current} de ${total}`}
        </span>
        {cefr && cefr !== "mixed" && <CEFRPill level={cefr} />}
      </div>
      <div className="h-1.5 bg-[#E6E6E4] rounded-full">
        <div
          className="h-1.5 bg-[#1B2B61] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
