import type { ProgressBlockData, ProgressVariant } from "@/types/blocks";

interface ProgressBlockProps {
  data: ProgressBlockData;
  variant?: ProgressVariant;
  className?: string;
}

function BarVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  const pct = data.max > 0 ? Math.round((data.current / data.max) * 100) : 0;

  return (
    <div className={className}>
      <p className="text-[13px] font-medium text-[#111111]">{data.label}</p>
      <div className="h-2 rounded-full bg-[#F7F7F5] mt-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-[#185FA5] transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      {data.sublabel && (
        <p className="text-[11px] text-[#9B9DA3] text-right mt-1">{data.sublabel}</p>
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
          fill="none" stroke="#F7F7F5" strokeWidth="6"
        />
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke="#185FA5" strokeWidth="6"
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
          className="text-[18px] font-medium fill-[#111111]"
        >
          {pct}%
        </text>
      </svg>
      <p className="text-[13px] text-[#6C6B71] mt-2">{data.label}</p>
    </div>
  );
}

function StatVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  const trendIcon = data.trend === "up" ? "\u2191" : data.trend === "down" ? "\u2193" : "\u2192";
  const trendColor = data.trend === "up" ? "text-[#0F6E56]" : data.trend === "down" ? "text-[#dc2626]" : "text-[#9B9DA3]";

  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-medium text-[#111111]">{data.current}</span>
        {data.unit && <span className="text-[16px] text-[#9B9DA3]">{data.unit}</span>}
        {data.trend && <span className={`text-[14px] ${trendColor} ml-2`}>{trendIcon}</span>}
      </div>
      <p className="text-[13px] text-[#6C6B71] mt-1">{data.label}</p>
    </div>
  );
}

function StreakVariant({ data, className }: { data: ProgressBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <p className="text-[28px] font-medium text-[#185FA5]">{data.current}</p>
      <p className="text-[13px] text-[#6C6B71]">day streak</p>
      {data.sublabel && (
        <p className="text-[11px] text-[#9B9DA3] mt-1">{data.sublabel}</p>
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
