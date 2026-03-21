/**
 * StatCard — number + label + optional progress bar.
 * Used on the homepage dashboard.
 *
 * <StatCard label="Lessons completed" value="13" total="44" progress={30} />
 * <StatCard label="Current level" value="A2" subtitle="Elementary" />
 */

interface StatCardProps {
  label: string;
  value: string;
  total?: string;       // Renders as "value / total"
  subtitle?: string;    // Text below the value (alternative to progress)
  progress?: number;    // 0-100, renders a progress bar
}

export function StatCard({
  label,
  value,
  total,
  subtitle,
  progress,
}: StatCardProps) {
  return (
    <div className="bg-[#F7F7F5] rounded-lg p-4">
      <div className="text-[12px] text-[#9B9DA3] mb-2">{label}</div>
      <div className="text-[22px] font-medium text-[#111111] tracking-[-0.02em]">
        {value}
        {total && (
          <span className="text-[14px] font-normal text-[#9B9DA3]">
            {" "}/ {total}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="h-[3px] bg-[rgba(0,0,0,0.06)] rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-[#185FA5] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      )}
      {subtitle && (
        <div className="text-[12px] text-[#9B9DA3] mt-1.5">{subtitle}</div>
      )}
    </div>
  );
}
