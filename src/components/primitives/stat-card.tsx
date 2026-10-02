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
    <div className="bg-aula-sunken rounded-[10px] px-3.5 py-3">
      <div className="text-[11px] text-aula-text-3 mb-1.5">{label}</div>
      <div className="text-[17px] font-semibold text-aula-text tracking-[-0.01em]">
        {value}
        {total && (
          <span className="text-[14px] font-normal text-[#98988F]">
            {" "}/ {total}
          </span>
        )}
      </div>
      {progress !== undefined && (
        <div className="h-[3px] bg-[#E6E6E4] rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-[#1B2B61] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>
      )}
      {subtitle && (
        <div className="text-[12px] text-[#98988F] mt-1.5">{subtitle}</div>
      )}
    </div>
  );
}
