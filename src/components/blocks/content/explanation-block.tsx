"use client";

import { useState, useEffect } from "react";
import type { ExplanationBlockData, ExplanationVariant } from "@/types/blocks";

interface ExplanationBlockProps {
  data: ExplanationBlockData;
  variant?: ExplanationVariant;
  className?: string;
}

function InlineVariant({ data, className }: { data: ExplanationBlockData; className?: string }) {
  const borderColor =
    data.severity === "correction"
      ? "border-t-2 border-t-[rgba(220,38,38,0.2)]"
      : data.severity === "tip"
        ? "border-t-2 border-t-[#FEF3C7]"
        : "";

  return (
    <div className={`bg-[#F7F7F5] rounded-lg p-3 border-[0.5px] border-[rgba(0,0,0,0.06)] ${borderColor} ${className ?? ""}`}>
      <p className="text-[13px] text-[#6C6B71]">{data.explanation}</p>
      {data.examples && data.examples.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.examples.map((ex, i) => (
            <div key={i}>
              <p className="text-[13px] text-[#111111]">{ex.pt}</p>
              <p className="text-[13px] text-[#6C6B71] italic">{ex.en}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExpandedVariant({ data, className }: { data: ExplanationBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <p className="text-[14px] font-medium text-[#111111]">Explanation</p>
      <p className="text-[14px] text-[#6C6B71] leading-relaxed mt-2">{data.explanation}</p>
      {data.examples && data.examples.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {data.examples.map((ex, i) => (
            <div key={i}>
              <p className="text-[13px] text-[#111111]">{ex.pt}</p>
              <p className="text-[13px] text-[#6C6B71] italic">{ex.en}</p>
            </div>
          ))}
        </div>
      )}
      {data.relatedRule && (
        <p className="text-[12px] text-[#9B9DA3] mt-3">
          See: {data.relatedRule.topicSlug} — Rule {data.relatedRule.ruleIndex + 1}
        </p>
      )}
    </div>
  );
}

function ToastVariant({ data, className }: { data: ExplanationBlockData; className?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] max-w-[400px] transition-all duration-200 ease-out ${className ?? ""}`}
      style={{ animation: "slideUp 200ms ease-out" }}
    >
      <p className="text-[13px] text-[#6C6B71]">{data.explanation}</p>
    </div>
  );
}

export function ExplanationBlock({ data, variant = "inline", className }: ExplanationBlockProps) {
  switch (variant) {
    case "inline": return <InlineVariant data={data} className={className} />;
    case "expanded": return <ExpandedVariant data={data} className={className} />;
    case "toast": return <ToastVariant data={data} className={className} />;
  }
}
