import type { ProgressBlockData, ProgressVariant } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

interface ProgressBlockProps {
  data: ProgressBlockData;
  variant?: ProgressVariant;
  className?: string;
}

function BarVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  const pct = data.max > 0 ? Math.round((data.current / data.max) * 100) : 0;

  return (
    <div className={className}>
      <p className="text-[13px] font-medium text-[#111827]">{data.label}</p>
      <div className="h-2 rounded-full bg-[#F3F4F6] mt-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-[#003399] transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {data.sublabel && (
        <p className="text-[11px] text-[#9CA3AF] text-right mt-1">{data.sublabel}</p>
      )}
    </div>
  );
}

function RingVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  const pct = data.max > 0 ? Math.round((data.current / data.max) * 100) : 0;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className ?? ""}`}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke="#F3F4F6" strokeWidth="6"
        />
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke="#003399" strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          className="transition-all duration-300 ease-out"
        />
        <text
          x="40" y="40"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[18px] font-bold fill-[#111827]"
        >
          {pct}%
        </text>
      </svg>
      <p className="text-[13px] text-[#6B7280] mt-2">{data.label}</p>
    </div>
  );
}

function StatVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  const trendIcon = data.trend === "up" ? "\u2191" : data.trend === "down" ? "\u2193" : "\u2192";
  const trendColor = data.trend === "up" ? "text-emerald-600" : data.trend === "down" ? "text-red-500" : "text-[#9CA3AF]";

  return (
    <div className={`${patterns.card.base} ${className ?? ""}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-bold text-[#111827]">{data.current}</span>
        {data.unit && <span className="text-[16px] text-[#9CA3AF]">{data.unit}</span>}
        {data.trend && <span className={`text-[14px] ${trendColor} ml-2`}>{trendIcon}</span>}
      </div>
      <p className="text-[13px] text-[#6B7280] mt-1">{data.label}</p>
    </div>
  );
}

function StreakVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} ${className ?? ""}`}>
      <p className="text-[28px] font-bold text-[#003399]">{data.current}</p>
      <p className="text-[13px] text-[#6B7280]">day streak</p>
      {data.sublabel && (
        <p className="text-[11px] text-[#9CA3AF] mt-1">{data.sublabel}</p>
      )}
    </div>
  );
}

export function ProgressBlock({ data, variant = "bar", className }: ProgressBlockProps) {
  switch (variant) {
    case "bar": return <BarVariant data={data} className={className} />;
    case "ring": return <RingVariant data={data} className={className} />;
    case "stat": return <StatVariant data={data} className={className} />;
    case "streak": return <StreakVariant data={data} className={className} />;
  }
}
