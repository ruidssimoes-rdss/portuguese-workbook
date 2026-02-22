import { type ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  titlePt?: string;
  subtitle?: ReactNode;
  className?: string;
}

export function PageHeader({ title, titlePt, subtitle, className }: PageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-[#111827]">{title}</h1>
        {titlePt && (
          <span className="text-[13px] font-medium text-[#9CA3AF] italic">
            {titlePt}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-sm text-[#9CA3AF]">{subtitle}</p>
      )}
    </div>
  );
}
