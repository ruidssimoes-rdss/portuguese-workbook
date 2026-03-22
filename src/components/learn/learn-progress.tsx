interface LearnProgressProps {
  current: number;
  total: number;
  cefr: string;
  label?: string;
}

function CEFRPill({ level }: { level: string }) {
  const c =
    level === "A1" ? "text-[#0F6E56] bg-[#E1F5EE]" :
    level === "A2" ? "text-[#185FA5] bg-[#E6F1FB]" :
    "text-[#854F0B] bg-[#FAEEDA]";
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${c}`}>{level}</span>;
}

export function LearnProgress({ current, total, cefr, label }: LearnProgressProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#9B9DA3]">
          {label || `Secção ${current} de ${total}`}
        </span>
        {cefr && cefr !== "mixed" && <CEFRPill level={cefr} />}
      </div>
      <div className="h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full">
        <div
          className="h-1.5 bg-[#185FA5] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
