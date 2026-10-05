import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader, BadgePill } from "@/components/primitives";
import { ConjugationTables, type ConjugationRow } from "@/components/conjugations/conjugation-tables";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";

const verbs = verbData as unknown as VerbDataSet;

export function generateStaticParams() {
  return verbs.order.map((key) => ({ verb: key.toLowerCase() }));
}

export default async function ConjugationDetailPage({
  params,
}: {
  params: Promise<{ verb: string }>;
}) {
  const { verb: slug } = await params;
  const verbKey = decodeURIComponent(slug).toUpperCase();
  const verb = verbs.verbs[verbKey];

  if (!verb) {
    return (
      <PageShell>
        <PageHeader title="Verb not found" />
      </PageShell>
    );
  }

  const meta = verb.meta as { english: string; cefr: string; group: string; priority?: string };
  // Only this verb's rows reach the client — never the whole corpus
  const rows: ConjugationRow[] = (verb.conjugations ?? []).map((c) => ({
    person: c.Person.split(" (")[0],
    form: c.Conjugation,
    tense: c.Tense,
    example: (c as unknown as Record<string, string>)["Example Sentence"],
  }));
  const tenses = [...new Set(rows.map((r) => r.tense))];

  return (
    <PageShell>
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link href="/conjugations" className="hover:text-[#6C6B71] transition-colors">
          Conjugations
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{verbKey.toLowerCase()}</span>
      </div>

      <div className="mb-6">
        <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em]">{verbKey.toLowerCase()}</h1>
        <div className="text-[13px] text-[#6C6B71] mt-1">{meta.english}</div>
        <div className="flex gap-1.5 mt-3">
          <BadgePill level={meta.cefr} />
          <BadgePill label={meta.group} variant="neutral" />
          {meta.priority && <BadgePill label={meta.priority} variant="neutral" />}
        </div>
      </div>

      <ConjugationTables rows={rows} tenses={tenses} />
    </PageShell>
  );
}
