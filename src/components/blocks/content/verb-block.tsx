"use client";

import type { VerbBlockData, VerbVariant } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

interface VerbBlockProps {
  data: VerbBlockData;
  variant?: VerbVariant;
  className?: string;
}

function CollapsedVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} flex items-center justify-between ${className ?? ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-semibold text-[#111827]">{data.verb}</span>
        <span className="text-[13px] text-[#6B7280]">{data.verbTranslation}</span>
      </div>
      <span className={`${patterns.badge} bg-[#F3F4F6] text-[#6B7280]`}>
        {data.tenseLabel || data.tense}
      </span>
    </div>
  );
}

function ExpandedVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={`${patterns.card.base} ${className ?? ""}`} data-slug={data.verbSlug}>
      <div className="mb-4">
        <p className="text-[18px] font-semibold text-[#111827]">{data.verb}</p>
        <p className="text-[13px] text-[#6B7280] mt-0.5">{data.verbTranslation}</p>
        <p className="text-[13px] text-[#9CA3AF] mt-0.5">{data.tenseLabel || data.tense}</p>
      </div>
      <div>
        {(data.conjugations ?? []).map((c, i) => (
          <div
            key={i}
            className={`flex items-center py-2.5 px-3 ${
              i > 0 ? "border-t border-[#F3F4F6]" : ""
            }`}
          >
            <span className="text-[13px] text-[#6B7280] w-24 shrink-0">{c.pronoun}</span>
            <span className="text-[13px] font-medium text-[#111827]">{c.form}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrillVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
        {data.tenseLabel || data.tense}
      </p>
      <p className="text-[16px] font-bold text-[#111827] mt-1">{data.verb}</p>
      <p className="text-[13px] text-[#6B7280] mt-0.5">{data.verbTranslation}</p>
    </div>
  );
}

export function VerbBlock({ data, variant = "collapsed", className }: VerbBlockProps) {
  switch (variant) {
    case "collapsed": return <CollapsedVariant data={data} className={className} />;
    case "expanded": return <ExpandedVariant data={data} className={className} />;
    case "drill": return <DrillVariant data={data} className={className} />;
  }
}
