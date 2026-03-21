"use client";

import type { VerbBlockData, VerbVariant } from "@/types/blocks";

interface VerbBlockProps {
  data: VerbBlockData;
  variant?: VerbVariant;
  className?: string;
}

function CollapsedVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white flex items-center justify-between ${className ?? ""}`}>
      <div className="flex items-baseline gap-2">
        <span className="text-[15px] font-medium text-[#111111]">{data.verb}</span>
        <span className="text-[13px] text-[#6C6B71]">{data.verbTranslation}</span>
      </div>
      <span className="text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap bg-[#F7F7F5] text-[#6C6B71]">
        {data.tenseLabel || data.tense}
      </span>
    </div>
  );
}

function ExpandedVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`} data-slug={data.verbSlug}>
      <div className="mb-4">
        <p className="text-[18px] font-medium text-[#111111]">{data.verb}</p>
        <p className="text-[13px] text-[#6C6B71] mt-0.5">{data.verbTranslation}</p>
        <p className="text-[13px] text-[#9B9DA3] mt-0.5">{data.tenseLabel || data.tense}</p>
      </div>
      <div>
        {(data.conjugations ?? []).map((c, i) => (
          <div
            key={i}
            className={`flex items-center py-2.5 px-3 ${
              i > 0 ? "border-t border-[0.5px] border-[rgba(0,0,0,0.06)]" : ""
            }`}
          >
            <span className="text-[13px] text-[#6C6B71] w-24 shrink-0">{c.pronoun}</span>
            <span className="text-[13px] font-medium text-[#111111]">{c.form}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrillVariant({ data, className }: { data: VerbBlockData; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3]">
        {data.tenseLabel || data.tense}
      </p>
      <p className="text-[16px] font-medium text-[#111111] mt-1">{data.verb}</p>
      <p className="text-[13px] text-[#6C6B71] mt-0.5">{data.verbTranslation}</p>
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
