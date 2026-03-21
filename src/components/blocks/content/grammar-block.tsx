import type { GrammarBlockData, GrammarVariant } from "@/types/blocks";

interface GrammarBlockProps {
  data: GrammarBlockData;
  variant?: GrammarVariant;
  className?: string;
}

function ExpandedVariant({ data, className }: { data: GrammarBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white ${className ?? ""}`}>
      <h3 className="text-[20px] font-medium text-[#111111]">{data.topicTitle}</h3>
      <p className="text-[14px] font-normal text-[#9B9DA3] italic mt-0.5">{data.topicTitlePt}</p>

      <div className="mt-5 space-y-5">
        {data.rules.map((rule, i) => (
          <div key={i}>
            <p className="text-[14px] font-medium text-[#111111]">
              <span className="text-[#9B9DA3] mr-2">{i + 1}.</span>
              {rule.rule}
            </p>
            {rule.rulePt && (
              <p className="text-[13px] text-[#6C6B71] italic mt-0.5 ml-6">{rule.rulePt}</p>
            )}
            {rule.examples.length > 0 && (
              <div className="border-l-2 border-[rgba(0,0,0,0.06)] pl-4 ml-6 mt-2 space-y-1.5">
                {rule.examples.map((ex, j) => (
                  <div key={j}>
                    <p className="text-[13px] text-[#111111]">{ex.pt}</p>
                    <p className="text-[13px] text-[#6C6B71] italic">{ex.en}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.tips && data.tips.length > 0 && (
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FEF3C7] rounded-lg p-3 mt-5">
          <p className="text-[11px] font-medium uppercase text-[#854F0B] mb-1">Tip</p>
          {data.tips.map((tip, i) => (
            <p key={i} className="text-[13px] text-[#854F0B]">
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
      <p className="text-[14px] text-[#111111]">{firstRule.rule}</p>
      {firstExample && (
        <p className="text-[13px] text-[#6C6B71] italic mt-1">
          {firstExample.pt} — {firstExample.en}
        </p>
      )}
    </div>
  );
}

function SummaryVariant({ data, className }: { data: GrammarBlockData; className?: string }) {
  return (
    <div className={`border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 bg-white hover:border-[rgba(0,0,0,0.12)] transition-all duration-150 ease-out cursor-pointer ${className ?? ""}`}>
      <h3 className="text-[16px] font-medium text-[#111111]">{data.topicTitle}</h3>
      <p className="text-[14px] font-normal text-[#9B9DA3] italic mt-0.5">{data.topicTitlePt}</p>
      <p className="text-[13px] text-[#9B9DA3] mt-2">{data.rules.length} rules</p>
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
