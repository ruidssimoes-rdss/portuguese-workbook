"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AudioButton } from "@/components/primitives";

export interface RuleView {
  rule: string;
  rulePt?: string;
  examples: Array<{ pt: string; en: string }>;
  exceptions: string[];
}

export function RulesAccordion({ rules }: { rules: RuleView[] }) {
  const [expandedRule, setExpandedRule] = useState<number | null>(rules.length <= 3 ? -1 : 0);

  function isExpanded(index: number) {
    if (expandedRule === -1) return true;
    return expandedRule === index;
  }

  function toggleRule(index: number) {
    if (expandedRule === -1) setExpandedRule(index);
    else if (expandedRule === index) setExpandedRule(null);
    else setExpandedRule(index);
  }

  return (
    <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden mb-8">
      {rules.map((rule, index) => (
        <div key={index} className={index > 0 ? "border-t-[0.5px] border-[rgba(0,0,0,0.06)]" : ""}>
          <div
            onClick={() => toggleRule(index)}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#F7F7F5] transition-colors"
          >
            <span className="text-[11px] font-medium text-[#185FA5] bg-[#E6F1FB] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <span className="text-[13px] font-medium text-[#111111] flex-1">{rule.rule}</span>
            <ChevronDown
              size={16}
              className={`text-[#9B9DA3] transition-transform duration-150 ${isExpanded(index) ? "rotate-180" : ""}`}
            />
          </div>

          {isExpanded(index) && (
            <div className="px-4 pb-4 border-t-[0.5px] border-[rgba(0,0,0,0.06)] mx-4 pt-3.5">
              {rule.rulePt && <div className="text-[12px] text-[#9B9DA3] italic mb-3">{rule.rulePt}</div>}

              {rule.examples.length > 0 && (
                <div className="space-y-2 mb-3">
                  {rule.examples.map((ex, i) => (
                    <div key={i} className="bg-[#F7F7F5] rounded-lg px-3.5 py-2.5 group">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] text-[#111111]">{ex.pt}</span>
                        <AudioButton text={ex.pt} />
                      </div>
                      <div className="text-[12px] text-[#9B9DA3] italic mt-0.5">{ex.en}</div>
                    </div>
                  ))}
                </div>
              )}

              {rule.exceptions.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {rule.exceptions.map((exc, i) => (
                    <div key={i} className="text-[12px] text-[#6C6B71] italic">
                      Note: {exc}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
