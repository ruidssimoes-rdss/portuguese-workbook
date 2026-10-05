import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { TopicBrowser, type TopicSummary, type TopicGroup } from "@/components/grammar/topic-browser";
import grammarData from "@/data/grammar.json";
import { getGrammarGroups } from "@/data/grammar-groups";
import type { GrammarData } from "@/types/grammar";

const grammar = grammarData as unknown as GrammarData;

export default function GrammarPage() {
  const topics: TopicSummary[] = Object.values(grammar.topics).map((t) => ({
    id: t.id,
    title: t.title,
    titlePt: t.titlePt,
    cefr: t.cefr,
    summary: t.summary ?? "",
    rules: (t.rules ?? []).map((r) => ({
      rule: r.rule,
      haystack: [r.rule, r.rulePt, ...(r.examples ?? []).flatMap((ex) => [ex.pt, ex.en])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    })),
  }));

  const groups: TopicGroup[] = (getGrammarGroups(topics) ?? []).map((g) => ({
    label: g.label,
    labelPt: g.labelPt,
    topicIds: g.topics.map((t) => t.id),
  }));

  return (
    <PageShell>
      <PageHeader title="Gramática" subtitle={`${topics.length} topics across A1, A2, and B1`} />
      <TopicBrowser topics={topics} groups={groups} />
    </PageShell>
  );
}
