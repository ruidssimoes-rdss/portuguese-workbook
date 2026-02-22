import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";
import { ChangelogBanner } from "@/components/changelog-banner";
import { PronunciationButton } from "@/components/pronunciation-button";
import changelogData from "@/data/changelog.json";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import { dailyPrompts } from "@/data/daily-prompts";
import { CEFRBadge, VerbGroupBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { PageContainer } from "@/components/ui/page-container";
import { HomeGreeting } from "@/components/home-greeting";
import { LessonPreview } from "@/components/lesson-preview";
import type { VerbDataSet } from "@/types";
import type { SayingsData } from "@/types/saying";
import type { VocabData, VocabWord } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";

const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;
const grammar = grammarData as unknown as GrammarData;
const sayings = (sayingsData as unknown as SayingsData).sayings;

const totalGrammarTopics = Object.keys(grammar.topics).length;

const totalVerbs = verbs.order.length;
const totalConjugations = verbs.order.reduce(
  (sum, key) => sum + (verbs.verbs[key]?.conjugations?.length ?? 0),
  0
);
const totalVocabWords = vocab.categories.reduce(
  (sum, cat) => sum + (cat.words?.length ?? 0),
  0
);
const totalCategories = vocab.categories.length;

// Flatten all vocab words with category title for daily pick
const flatVocab: { word: VocabWord; categoryTitle: string }[] = [];
vocab.categories.forEach((cat) => {
  cat.words.forEach((word) => {
    flatVocab.push({ word, categoryTitle: cat.title });
  });
});

const latestChangelog = (changelogData as { entries: { date: string; version: string; title: string; summary?: string; changes: string[] }[] }).entries?.[0] ?? null;

const dayIndex = Math.floor(Date.now() / 86400000);

const wordOfDay =
  flatVocab.length > 0 ? flatVocab[dayIndex % flatVocab.length] : null;
const verbKey =
  totalVerbs > 0 ? verbs.order[dayIndex % totalVerbs] : null;
const verbOfDay = verbKey ? verbs.verbs[verbKey] : null;
const presentRows =
  verbOfDay?.conjugations?.filter((c) => c.Tense === "Present") ?? [];
const sayingOfDay =
  sayings.length > 0 ? sayings[dayIndex % sayings.length] : null;

// Daily prompt: time-appropriate + daily rotation
const hour = new Date().getHours();
const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
const eligible = dailyPrompts.filter(
  (p) => p.timeOfDay === timeOfDay || p.timeOfDay === "anytime"
);
const promptIndex = dayIndex % eligible.length;
const todayPrompt = eligible[promptIndex];

// Time-based Portuguese greeting
const ptGreeting =
  hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

function shortGroup(group: string): string {
  if (group.startsWith("Irregular")) return "Irregular";
  if (group.startsWith("Regular -AR")) return "-AR";
  if (group.startsWith("Regular -ER")) return "-ER";
  if (group.startsWith("Regular -IR")) return "-IR";
  return group;
}

function shortPerson(person: string): string {
  if (person.startsWith("eu")) return "eu";
  if (person.startsWith("tu")) return "tu";
  if (person.startsWith("ele")) return "ele";
  if (person.startsWith("nós")) return "nós";
  if (person.startsWith("eles")) return "eles";
  return person.split(" ")[0];
}

export default function Home() {
  return (
    <>
      <Topbar />
      <PageContainer>
        {latestChangelog && (
          <ChangelogBanner
            version={latestChangelog.version}
            title={latestChangelog.title}
            summary={latestChangelog.summary}
            firstChange={latestChangelog.changes?.[0] ?? ""}
          />
        )}

        {/* Greeting bar */}
        <div className="py-5">
          <h1 className="text-2xl font-bold text-[#111827]">
            {ptGreeting}
          </h1>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            {totalVocabWords.toLocaleString()} words · {totalVerbs} verbs · {totalGrammarTopics} grammar topics · {sayings.length} sayings
          </p>
        </div>

        {/* Daily prompt */}
        {todayPrompt && <HomeGreeting greeting={todayPrompt} />}

        {/* Lesson preview */}
        <LessonPreview />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <Card padding="md">
            <SectionHeader>
              Vocabulary
            </SectionHeader>
            <p className="text-[18px] font-semibold text-[#111827] mt-1">
              {totalVocabWords.toLocaleString()} words
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">{totalCategories} categories · A1–B1</p>
          </Card>
          <Card padding="md">
            <SectionHeader>
              Conjugations
            </SectionHeader>
            <p className="text-[18px] font-semibold text-[#111827] mt-1">
              {totalVerbs} verbs
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">{totalConjugations.toLocaleString()} conjugations · 6 tenses</p>
          </Card>
          <Card padding="md">
            <SectionHeader>
              Grammar
            </SectionHeader>
            <p className="text-[18px] font-semibold text-[#111827] mt-1">
              {totalGrammarTopics} topics
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">A1–B1 · Rules & examples</p>
          </Card>
        </div>

        {/* Today's Picks */}
        <div className="mt-8">
          <SectionHeader className="mb-3">
            Today&apos;s Picks
          </SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Word of the Day */}
            {wordOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Word of the Day</SectionHeader>
                  <CEFRBadge level={wordOfDay.word.cefr} />
                </div>
                <div className="flex items-center gap-2">
                  <PronunciationButton text={wordOfDay.word.portuguese} size="sm" variant="dark" className="shrink-0" />
                  <span className="text-[18px] font-semibold text-[#111827]">{wordOfDay.word.portuguese}</span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{wordOfDay.word.english}</p>
                {wordOfDay.word.pronunciation && (
                  <span className="text-[12px] font-mono text-[#9CA3AF]">/{wordOfDay.word.pronunciation}/</span>
                )}
                {wordOfDay.word.example && (
                  <div className="bg-[#F8F8FA] rounded-lg px-3 py-2">
                    <p className="text-[13px] italic text-[#374151]">&ldquo;{wordOfDay.word.example}&rdquo;</p>
                    {wordOfDay.word.exampleTranslation && (
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{wordOfDay.word.exampleTranslation}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                  {wordOfDay.word.gender && (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-[3px] rounded-full">
                      {wordOfDay.word.gender}
                    </span>
                  )}
                  <span className="text-[11px] font-medium text-text-secondary bg-border-light px-2.5 py-[3px] rounded-full">
                    {wordOfDay.categoryTitle}
                  </span>
                </div>
              </Card>
            )}

            {/* Verb of the Day */}
            {verbKey && verbOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Verb of the Day</SectionHeader>
                  <div className="flex items-center gap-1.5">
                    <CEFRBadge level={verbOfDay.meta.cefr} />
                    <VerbGroupBadge group={verbOfDay.meta.group} label={shortGroup(verbOfDay.meta.group)} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PronunciationButton text={verbKey.toLowerCase()} size="sm" variant="dark" className="shrink-0" />
                  <span className="text-[18px] font-semibold text-[#111827]">{verbKey.toLowerCase()}</span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{verbOfDay.meta.english}</p>
                <div className="space-y-0.5">
                  {presentRows.slice(0, 5).map((row) => (
                    <div key={row.Person} className="flex items-baseline gap-3 text-[13px]">
                      <span className="w-[36px] text-[#9CA3AF] shrink-0">{shortPerson(row.Person)}</span>
                      <span className="font-medium text-[#111827]">{row.Conjugation}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/conjugations/${verbKey.toLowerCase()}`}
                  className="text-[13px] font-medium text-[#111827] hover:text-[#374151] transition-colors mt-auto"
                >
                  View all tenses →
                </Link>
              </Card>
            )}

            {/* Saying of the Day */}
            {sayingOfDay && (
              <Card className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <SectionHeader>Saying of the Day</SectionHeader>
                  <CEFRBadge level={sayingOfDay.cefr ?? "A2"} />
                </div>
                <div className="flex items-start gap-2">
                  <PronunciationButton text={sayingOfDay.portuguese} size="sm" variant="dark" className="shrink-0 mt-0.5" />
                  <p className="text-[15px] font-semibold italic text-[#111827]">&ldquo;{sayingOfDay.portuguese}&rdquo;</p>
                </div>
                <p className="text-[13px] text-[#6B7280]">{sayingOfDay.meaning}</p>
                {sayingOfDay.pronunciation && (
                  <span className="text-[12px] font-mono text-[#9CA3AF]">/{sayingOfDay.pronunciation}/</span>
                )}
                <div className="flex flex-col gap-1 text-[12px]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] font-semibold shrink-0">Literal</span>
                    <span className="text-[#6B7280]">{sayingOfDay.literal}</span>
                  </div>
                </div>
                <Link
                  href="/culture"
                  className="text-[13px] font-medium text-[#111827] hover:text-[#374151] transition-colors mt-auto"
                >
                  Explore culture →
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Explore */}
        <div className="mt-8">
          <SectionHeader className="mb-3">
            Explore
          </SectionHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Conjugations", titlePt: "Conjugações", href: "/conjugations", stat: `${totalVerbs} verbs` },
              { title: "Vocabulary", titlePt: "Vocabulário", href: "/vocabulary", stat: `${totalVocabWords} words` },
              { title: "Grammar", titlePt: "Gramática", href: "/grammar", stat: `${totalGrammarTopics} topics` },
              { title: "Culture", titlePt: "Cultura", href: "/culture", stat: `${sayings.length} sayings` },
            ].map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="block group"
              >
                <Card interactive className="h-full flex flex-col">
                  <span className="text-[15px] font-semibold text-[#111827]">{s.title}</span>
                  <span className="text-[13px] text-[#9CA3AF] italic">{s.titlePt}</span>
                  <span className="text-[12px] text-text-secondary mt-auto pt-3">{s.stat}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12" />
      </PageContainer>
    </>
  );
}
