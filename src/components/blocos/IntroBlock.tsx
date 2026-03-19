import Link from "next/link";
import { ChevronLeft, Clock, FileText, BookOpen } from "lucide-react";

interface MetaPill {
  label: string;
}

interface IntroBlockProps {
  // Row 1 — Breadcrumb
  title: string;
  subtitle?: string;
  backLink?: { label: string; href: string };
  lastStudied?: string;

  // Row 2 — Description
  description?: string;

  // Row 3 — Meta pills + badge
  pills?: MetaPill[];
  badge?: { label: string; level: "A1" | "A2" | "B1" };

  // Slot
  children?: React.ReactNode;
}

const cefrStyles: Record<string, string> = {
  A1: "text-emerald-700 bg-emerald-50 border-emerald-200",
  A2: "text-blue-700 bg-blue-50 border-blue-200",
  B1: "text-amber-700 bg-amber-50 border-amber-200",
};

export function IntroBlock({
  title,
  subtitle,
  backLink,
  lastStudied,
  description,
  pills,
  badge,
  children,
}: IntroBlockProps) {
  const hasPills = pills && pills.length > 0;
  const hasRow3 = hasPills || badge;

  return (
    <div className="pb-8">
      {/* Row 1 — Breadcrumb + Last Studied */}
      <div className="flex items-baseline justify-between gap-16 flex-wrap">
        {/* Left side — breadcrumb */}
        <div className="flex items-baseline gap-0 min-w-0">
          {backLink ? (
            <>
              <Link
                href={backLink.href}
                className="inline-flex items-center gap-0 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-150 shrink-0"
              >
                <ChevronLeft size={18} className="shrink-0" />
              </Link>
              <Link
                href={backLink.href}
                className="text-[16px] font-medium text-[#111827] hover:text-[#6B7280] transition-colors duration-150 shrink-0"
              >
                {backLink.label}
              </Link>
              <span className="text-[16px] text-[#9CA3AF] mx-3 shrink-0">/</span>
              <span className="text-[16px] font-semibold text-[#111827]">{title}</span>
              {subtitle && (
                <span className="text-[16px] font-normal text-[#003399]">&nbsp;({subtitle})</span>
              )}
            </>
          ) : (
            <>
              <span className="text-[16px] font-semibold text-[#111827]">{title}</span>
              {subtitle && (
                <span className="text-[16px] font-normal text-[#003399]">&nbsp;({subtitle})</span>
              )}
            </>
          )}
        </div>

        {/* Right side — Last Studied */}
        {lastStudied && (
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <Clock size={15} className="text-[#9CA3AF]" />
            <span className="text-[13px] text-[#9CA3AF]">Last studied {lastStudied}</span>
          </div>
        )}
      </div>

      {/* Row 2 — Description */}
      {description && (
        <div className="flex items-start gap-2 mt-4">
          <FileText size={15} className="text-[#9CA3AF] shrink-0 mt-0.5" />
          <p className="text-[14px] text-[#9CA3AF] max-w-[640px] leading-relaxed">{description}</p>
        </div>
      )}

      {/* Row 3 — Meta pills + CEFR badge */}
      {hasRow3 && (
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {hasPills &&
            pills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 text-[13px] font-normal text-[#9CA3AF] border border-[#E5E7EB] rounded-full py-[5px] px-3.5 bg-white whitespace-nowrap"
              >
                <BookOpen size={14} className="text-[#9CA3AF] shrink-0" />
                {pill.label}
              </span>
            ))}
          {badge && (
            <span
              className={`inline-flex items-center text-[13px] font-medium py-[5px] px-3.5 rounded-full whitespace-nowrap border ${cefrStyles[badge.level] ?? "text-[#6B7280] bg-[#F3F4F6] border-[#E5E7EB]"}`}
            >
              {badge.label}
            </span>
          )}
        </div>
      )}

      {/* Slot */}
      {children}
    </div>
  );
}
