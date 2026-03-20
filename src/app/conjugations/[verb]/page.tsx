"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import { PageLayout, IntroBlock, FilterBlock } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { ConjugationTable } from "@/components/smart-bloco-inserts";
import type { CEFRLevel } from "@/components/smart-bloco";

const data = verbData as unknown as VerbDataSet;

const PERSON_SHORT: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

const ALL_TENSES = ["All", "Present", "Preterite", "Imperfect", "Future", "Conditional", "Present Subjunctive"];

interface TenseData {
  name: string;
  label: string;
  cefr: string;
  conjugations: Array<{
    pronoun: string;
    form: string;
    example?: string;
    translation?: string;
    note?: string;
    isException?: boolean;
  }>;
}

function mapVerbToTenses(verb: (typeof data.verbs)[string]): TenseData[] {
  const tenseMap = new Map<string, TenseData>();
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
  return Array.from(tenseMap.values());
}

function TenseFilterAndCards({ tenses }: { tenses: TenseData[] }) {
  const searchParams = useSearchParams();
  const initialTense = searchParams.get("tense");

  const [tenseFilter, setTenseFilter] = useState(initialTense || "All");

  useEffect(() => {
    if (initialTense && ALL_TENSES.includes(initialTense)) setTenseFilter(initialTense);
  }, [initialTense]);

  const filteredTenses = tenseFilter === "All"
    ? tenses
    : tenses.filter((t) => t.name === tenseFilter);

  return (
    <>
      {/* Tense filter pills */}
      <FilterBlock
        pills={{
          options: ALL_TENSES
            .filter((t) => t === "All" || tenses.some((dt) => dt.name === t))
            .map((t) => ({ label: t, value: t })),
          value: tenseFilter,
          onChange: setTenseFilter,
        }}
      />

      {/* Tense cards */}
      <div className="space-y-[24px]">
        {filteredTenses.map((tense) => (
          <SmartBloco
            key={tense.name}
            title={tense.name}
            subtitle={tense.label !== tense.name ? tense.label : undefined}
            cefrLevel={tense.cefr as CEFRLevel}
            expandedContent={
              <ConjugationTable
                tense={tense.name}
                cefrLevel={tense.cefr as CEFRLevel}
                conjugations={tense.conjugations.map((c) => ({
                  pronoun: c.pronoun,
                  form: c.form,
                  example: c.example,
                  hasAudio: true,
                }))}
              />
            }
          />
        ))}
      </div>
    </>
  );
}

export default function VerbPage() {
  const params = useParams();
  const slug = (params.verb as string).toUpperCase();
  const verb = data.verbs[slug];

  const tenses = useMemo(() => {
    if (!verb) return [];
    return mapVerbToTenses(verb);
  }, [verb]);

  if (!verb) {
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
        pills={[{ label: m.priority }]}
      />
      <TenseFilterAndCards tenses={tenses} />
    </PageLayout>
  );
}
