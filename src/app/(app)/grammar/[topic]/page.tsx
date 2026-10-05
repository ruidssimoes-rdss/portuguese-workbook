import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader, BadgePill, TipBox } from "@/components/primitives";
import { RulesAccordion, type RuleView } from "@/components/grammar/rules-accordion";
import grammarData from "@/data/grammar.json";
import type { GrammarData } from "@/types/grammar";

const grammar = grammarData as unknown as GrammarData;

export function generateStaticParams() {
  return Object.keys(grammar.topics).map((topic) => ({ topic }));
}

/** Highlight Portuguese text between single quotes */
function formatInlineContent(text: string): ReactNode {
  const parts = text.split(/('.*?')/g);
  return parts.map((part, i) => {
    if (part.startsWith("'") && part.endsWith("'")) {
      return (
        <span key={i} className="font-medium text-[#111111]">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

function FormatIntro({ text }: { text: string }) {
  if (!text) return null;
  const paragraphs = text.includes("\n") ? text.split("\n").filter((p) => p.trim()) : [text];
  return (
    <div className="space-y-3 text-[13px] text-[#6C6B71] leading-relaxed">
      {paragraphs.map((p, i) => (
        <p key={i}>{formatInlineContent(p.trim())}</p>
      ))}
    </div>
  );
}

export default async function GrammarDetailPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = grammar.topics[slug];

  if (!topic) {
    return (
      <PageShell>
        <PageHeader title="Topic not found" />
      </PageShell>
    );
  }

  const rules: RuleView[] = (topic.rules ?? []).map((r) => ({
    rule: r.rule,
    rulePt: r.rulePt,
    examples: r.examples ?? [],
    // Exceptions are stored as strings or {pt,en} pairs depending on the topic
    exceptions: ((r.exceptions ?? []) as Array<string | { pt: string; en: string }>).map((e) =>
      typeof e === "string" ? e : `${e.pt} — ${e.en}`
    ),
  }));

  return (
    <PageShell>
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link href="/grammar" className="hover:text-[#6C6B71] transition-colors">
          Grammar
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{topic.title}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em]">{topic.title}</h1>
        <div className="text-[13px] text-[#9B9DA3] mt-1 italic">{topic.titlePt}</div>
        <div className="mt-2">
          <BadgePill level={topic.cefr} />
        </div>
      </div>

      {topic.intro && (
        <div className="mb-8">
          <FormatIntro text={topic.intro} />
        </div>
      )}

      {rules.length > 0 && <RulesAccordion rules={rules} />}

      {topic.tips && topic.tips.length > 0 && (
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.05em] text-[#9B9DA3] mb-3">Tips</div>
          <div className="space-y-2">
            {topic.tips.map((tip, i) => (
              <TipBox key={i}>{tip}</TipBox>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
