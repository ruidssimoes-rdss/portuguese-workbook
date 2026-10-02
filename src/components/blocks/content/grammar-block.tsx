import type { GrammarBlockData, GrammarVariant } from "@/types/blocks";

interface GrammarBlockProps {
  data: GrammarBlockData;
  variant?: GrammarVariant;
  className?: string;
}

function ExpandedVariant({ data, className }: { data: GrammarBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <h3 className="text-[20px] font-medium text-[#1F1F1F]">{data.topicTitle}</h3>
      <p className="text-[14px] font-normal text-[#98988F] italic mt-0.5">{data.topicTitlePt}</p>

      <div className="mt-5 space-y-5">
        {data.rules.map((rule, i) => (
          <div key={i}>
            <p className="text-[14px] font-medium text-[#1F1F1F]">
              <span className="text-[#98988F] mr-2">{i + 1}.</span>
              {rule.rule}
            </p>
            {rule.rulePt && (
              <p className="text-[13px] text-[#6B6B69] italic mt-0.5 ml-6">{rule.rulePt}</p>
            )}
            {rule.examples.length > 0 && (
              <div className="ml-6 mt-2 space-y-1.5 rounded-lg bg-[#F7F7F6] px-4 py-2">
                {rule.examples.map((ex, j) => (
                  <div key={j}>
                    <p className="text-[13px] text-[#1F1F1F]">{ex.pt}</p>
                    <p className="text-[13px] text-[#6B6B69] italic">{ex.en}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.tips && data.tips.length > 0 && (
        <div className="bg-[#ECE8F8] border-[0.5px] border-[#E6E6E4] rounded-lg p-3 mt-5">
          <p className="text-[11px] font-medium uppercase text-[#5B45B8] mb-1">Tip</p>
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#5B45B8]">
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineVariant({ data, className }: { data: GrammarBlockData; className?: string }) {
  const firstRule = data.rules[0];
  if (!firstRule) return null;
  const firstExample = firstRule.examples[0];

  return (
    <div className={className}>
      <p className="text-[14px] text-[#1F1F1F]">{firstRule.rule}</p>
      {firstExample && (
        <p className="text-[13px] text-[#6B6B69] italic mt-1">
          {firstExample.pt} — {firstExample.en}
        </p>
      )}
    </div>
  );
}

function SummaryVariant({ data, className }: { data: GrammarBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[#E6E6E4] rounded-lg p-6 bg-white hover:border-[#CFCFCB] transition-all duration-150 ease-out cursor-pointer ${className ?? ""}`}>
      <h3 className="text-[16px] font-medium text-[#1F1F1F]">{data.topicTitle}</h3>
      <p className="text-[14px] font-normal text-[#98988F] italic mt-0.5">{data.topicTitlePt}</p>
      <p className="text-[13px] text-[#98988F] mt-2">{data.rules.length} rules</p>
    </div>
  );
}

export function GrammarBlock({ data, variant = "expanded", className }: GrammarBlockProps) {
  switch (variant) {
    case "expanded": return <ExpandedVariant data={data} className={className} />;
    case "inline": return <InlineVariant data={data} className={className} />;
    case "summary": return <SummaryVariant data={data} className={className} />;
  }
}
