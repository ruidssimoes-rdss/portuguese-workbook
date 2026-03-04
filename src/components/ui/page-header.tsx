import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  titlePt?: string;
  subtitle?: ReactNode;
  className?: string;
  // E1 editorial props
  section?: string;
  sectionPt?: string;
  tagline?: string;
  stats?: { value: string; label: string }[];
}

export function PageHeader({
  title,
  titlePt,
  subtitle,
  className,
  section,
  sectionPt,
  tagline,
  stats,
}: PageHeaderProps) {
  // E1 editorial style — rendered when section or tagline is provided
  if (section || tagline) {
    return (
      <div className={`pb-10 pt-10 border-b border-border ${className ?? ""}`}>
        <div className="max-w-[640px]">
          {section && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#003399]">
                {section}
              </span>
              {sectionPt && (
                <>
                  <span className="text-[10px] text-border">·</span>
                  <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-text-muted">
                    {sectionPt}
                  </span>
                </>
              )}
            </div>
          )}
          <h1 className="text-[42px] font-black text-text tracking-[-0.04em] leading-[1.05] mb-3">
            {title}
          </h1>
          {titlePt && (
            <p className="text-base text-text-muted italic mb-4">{titlePt}</p>
          )}
          {tagline && (
            <p className="text-[16px] text-text-secondary leading-[1.65] mb-6 font-normal">
              {tagline}
            </p>
          )}
          {stats && stats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stats.map((s) => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 text-[12px]
                    text-text-secondary bg-surface border border-border
                    rounded-full px-3 py-1"
                >
                  <strong className="text-text font-semibold">{s.value}</strong>
                  {s.label}
                </span>
              ))}
            </div>
          )}
          {subtitle && !tagline && (
            <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  // Legacy fallback — existing usages without new props are unaffected
  return (
    <div className={className}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {titlePt && (
          <span className="text-[13px] font-medium text-text-muted italic">
            {titlePt}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
