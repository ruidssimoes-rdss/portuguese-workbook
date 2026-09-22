import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { VerbBrowser, type VerbSummary, type VerbGroupView } from "@/components/conjugations/verb-browser";
import verbData from "@/data/verbs.json";
import { getGroupedVerbs } from "@/data/verb-groups";
import type { VerbDataSet } from "@/types";

const verbs = verbData as unknown as VerbDataSet;

export default function ConjugationsPage() {
  const summaries: VerbSummary[] = verbs.order
    .filter((key) => verbs.verbs[key])
    .map((key) => {
      const meta = verbs.verbs[key].meta;
      return { key, english: meta.english, group: meta.group, cefr: meta.cefr };
    });

  const groups: VerbGroupView[] = getGroupedVerbs(verbs.order).map((g) => ({
    label: g.label,
    labelPt: g.labelPt,
    verbKeys: g.verbs,
  }));

  return (
    <PageShell>
      <PageHeader title="Conjugações" subtitle={`${summaries.length} verbs · 6 tenses`} />
      <VerbBrowser verbs={summaries} groups={groups} />
    </PageShell>
  );
}
