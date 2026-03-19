"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import { SmartVerbBlock, type SmartVerbBlockData } from "@/components/blocks/content/smart-verb-block";
import { PageLayout, IntroBlock } from "@/components/blocos";

const data = verbData as unknown as VerbDataSet;

const PERSON_SHORT: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

function mapVerbToSmartData(slug: string, verb: (typeof data.verbs)[string]): SmartVerbBlockData {
  const m = verb.meta;
  const tenseMap = new Map<string, SmartVerbBlockData["tenses"][number]>();
  const conjugations = Array.isArray(verb.conjugations) ? verb.conjugations : [];
  for (const c of conjugations) {
    if (!tenseMap.has(c.Tense)) {
      tenseMap.set(c.Tense, { name: c.Tense, label: c.Tense, cefr: c["CEFR (Tense)"], conjugations: [] });
    }
    tenseMap.get(c.Tense)!.conjugations.push({
      pronoun: PERSON_SHORT[c.Person] ?? c.Person.split(" (")[0],
      form: c.Conjugation,
      example: c["Example Sentence"] || undefined,
      translation: c["English Translation"] || undefined,
      note: c.Notes || undefined,
      isException: c.Type === "Exception",
    });
  }
  return {
    verb: slug,
    verbTranslation: m.english,
    verbSlug: slug.toLowerCase(),
    pronunciation: m.pronunciation,
    verbGroup: m.group,
    cefr: m.cefr,
    priority: m.priority,
    tenses: Array.from(tenseMap.values()),
  };
}

export default function VerbPage() {
  const params = useParams();
  const slug = (params.verb as string).toUpperCase();
  const verb = data.verbs[slug];

  const smartData = useMemo(() => {
    if (!verb) return null;
    return mapVerbToSmartData(slug, verb);
  }, [verb, slug]);

  if (!verb || !smartData) {
    return (
      <PageLayout>
        <IntroBlock title="Verb not found" backLink={{ label: "Conjugations", href: "/conjugations" }} />
      </PageLayout>
    );
  }

  const m = verb.meta;

  return (
    <PageLayout>
      <IntroBlock
        title={slug}
        subtitle={`${m.english} · ${m.group}`}
        badge={{ label: m.cefr, level: m.cefr as "A1" | "A2" | "B1" }}
        backLink={{ label: "Conjugations", href: "/conjugations" }}
        meta={m.priority}
      />
      <SmartVerbBlock data={smartData} variant="expanded" />
    </PageLayout>
  );
}
