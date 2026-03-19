"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { Divider } from "@/components/ui/divider";
import { CEFRBadge, Badge } from "@/components/ui/badge";
import { PronunciationButton } from "@/components/pronunciation-button";
import { StudyLogButton } from "@/components/study-log-button";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import { SmartVerbBlock, type SmartVerbBlockData } from "@/components/blocks/content/smart-verb-block";

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
      <>
        <Topbar />
        <PageContainer className="w-full py-16">
          <p className="text-[#6B7280]">Verb not found.</p>
          <Link href="/conjugations" className="text-[#6B7280] underline mt-2 block">← Back to all verbs</Link>
        </PageContainer>
      </>
    );
  }

  const m = verb.meta;

  return (
    <>
      <Topbar />
      <PageContainer className="w-full">
        <div className="py-5">
          <Link href="/conjugations" className="text-[#6B7280] hover:text-[#111827] text-[13px] transition-all duration-150 ease-out w-fit">← Conjugations</Link>
          <div className="flex items-start justify-between gap-4 mt-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#111827]">{slug}</h1>
                <PronunciationButton text={slug} size="md" variant="default" className="shrink-0" />
                {m.pronunciation && <span className="text-sm text-[#9CA3AF] font-mono">{m.pronunciation}</span>}
              </div>
              <p className="mt-1 text-sm text-[#9CA3AF]">{m.english} · {m.group}</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap shrink-0">
              <NoteContextActions contextType="verb" contextId={slug} contextLabel={`${slug} — ${m.english}`} />
              <ContentCalendarInfo contentType="verb" contentId={slug} />
              <StudyLogButton contextTitle={`${slug} — ${m.english}`} contextType="Verbs" />
              <Badge color={m.priority === "Essential" ? "text-red-700 bg-red-50" : m.priority === "Core" ? "text-blue-700 bg-blue-50" : "text-[#6B7280] bg-[#F3F4F6]"}>{m.priority}</Badge>
              <CEFRBadge level={m.cefr} />
            </div>
          </div>
          <Divider className="mt-6" />
        </div>

        <div className="mb-12">
          <SmartVerbBlock data={smartData} variant="expanded" />
        </div>
      </PageContainer>
    </>
  );
}
