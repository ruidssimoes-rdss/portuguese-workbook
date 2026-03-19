import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface IntroBlockProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: { label: string; level: "A1" | "A2" | "B1" };
  meta?: string;
  backLink?: { label: string; href: string };
  children?: React.ReactNode;
}

const cefrStyles: Record<string, string> = {
  A1: "text-emerald-700 bg-emerald-50",
  A2: "text-blue-700 bg-blue-50",
  B1: "text-amber-700 bg-amber-50",
};

export function IntroBlock({ title, subtitle, description, badge, meta, backLink, children }: IntroBlockProps) {
  return (
    <div className="pb-8">
      {/* Back link */}
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-1.5 text-[14px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 mb-4"
        >
          <ArrowLeft size={16} />
          <span>{backLink.label}</span>
        </Link>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[28px] font-semibold text-[#111827]">{title}</h1>
        {badge && (
          <span className={`text-[12px] font-normal px-2.5 py-1 rounded-full ${cefrStyles[badge.level] ?? "text-[#6B7280] bg-[#F3F4F6]"}`}>
            {badge.label}
          </span>
        )}
      </div>

      {/* PT subtitle */}
      {subtitle && (
        <p className="text-[14px] font-normal text-[#9CA3AF] italic mt-1">{subtitle}</p>
      )}

      {/* Description */}
      {description && (
        <p className="text-[14px] text-[#6B7280] leading-relaxed mt-3 max-w-[640px]">{description}</p>
      )}

      {/* Meta */}
      {meta && (
        <p className="text-[13px] text-[#9CA3AF] mt-3">{meta}</p>
      )}

      {/* Optional children (e.g. action buttons) */}
      {children}
    </div>
  );
}
