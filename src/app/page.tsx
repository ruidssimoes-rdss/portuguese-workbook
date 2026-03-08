import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { OnboardingGate } from "@/components/onboarding-gate";
import { HomePageSwitch } from "@/components/home/home-page-switch";

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

function buildHomeStaticData() {
  return {
    wordOfDay: wordOfDay
      ? {
          word: {
            portuguese: wordOfDay.word.portuguese,
            english: wordOfDay.word.english,
            pronunciation: wordOfDay.word.pronunciation,
            example: wordOfDay.word.example,
            exampleTranslation: wordOfDay.word.exampleTranslation,
            cefr: wordOfDay.word.cefr,
            gender: wordOfDay.word.gender ?? undefined,
          },
          categoryTitle: wordOfDay.categoryTitle,
        }
      : null,
    verbKey: verbKey ?? null,
    verbOfDay:
      verbKey && verbOfDay
        ? {
            meta: {
              english: verbOfDay.meta.english,
              cefr: verbOfDay.meta.cefr,
              group: verbOfDay.meta.group,
            },
            presentRows: presentRows.slice(0, 5).map((row) => ({
              person: shortPerson(row.Person),
              conjugation: row.Conjugation,
            })),
          }
        : null,
    sayingOfDay: sayingOfDay
      ? {
          portuguese: sayingOfDay.portuguese,
          meaning: sayingOfDay.meaning,
          literal: sayingOfDay.literal,
          pronunciation: sayingOfDay.pronunciation,
          cefr: sayingOfDay.cefr ?? "A2",
        }
      : null,
    totalVocabWords,
    totalVerbs,
    totalGrammarTopics,
    sayingsLength: sayings.length,
  };
}

export default function Home() {
  const staticData = buildHomeStaticData();

  return (
    <OnboardingGate>
      <Topbar />
      <HomePageSwitch staticData={staticData}>
        {/* Hero greeting section — full width (default homepage) */}
        <section className="w-full bg-bg">
        <div className="max-w-[1280px] mx-auto px-6 pt-14 pb-12">
          <h1 className="text-5xl font-bold tracking-tight text-text">
            {ptGreeting}
          </h1>
          <div className="mt-3 h-[2px] w-12 bg-[#003399] opacity-50 rounded-full" />
          <div className="flex flex-wrap gap-2 mt-5">
            {[
              { value: totalVocabWords.toLocaleString(), label: "words" },
              { value: totalVerbs, label: "verbs" },
              { value: totalGrammarTopics, label: "grammar topics" },
              { value: sayings.length, label: "sayings" },
            ].map(({ value, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface border border-border rounded-full px-3 py-1"
              >
                <span className="font-semibold text-text">{value}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>
      <PageContainer>
        {latestChangelog && (
          <ChangelogBanner
            version={latestChangelog.version}
            title={latestChangelog.title}
            summary={latestChangelog.summary}
            firstChange={latestChangelog.changes?.[0] ?? ""}
          />
        )}

        {/* Daily prompt */}
        {todayPrompt && <HomeGreeting greeting={todayPrompt} />}

        {/* Lesson preview */}
        <LessonPreview />

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="relative group bg-bg border border-border rounded-2xl p-6 hover:shadow-lg hover:border-[#003399]/20 transition-all duration-300 overflow-hidden cursor-default">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#003399] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: "rgba(0,51,153,0.07)" }}
            >
              📖
            </div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">Vocabulary</p>
            <p className="text-4xl font-bold text-text tracking-tight leading-none">
              {totalVocabWords.toLocaleString()}
            </p>
            <p className="text-sm text-text-muted mt-1">{totalCategories} categories · A1–B1</p>
          </div>
          <div className="relative group bg-bg border border-border rounded-2xl p-6 hover:shadow-lg hover:border-[#003399]/20 transition-all duration-300 overflow-hidden cursor-default">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#003399] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: "rgba(0,51,153,0.07)" }}
            >
              🔤
            </div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">Conjugations</p>
            <p className="text-4xl font-bold text-text tracking-tight leading-none">
              {totalVerbs}
            </p>
            <p className="text-sm text-text-muted mt-1">{totalConjugations.toLocaleString()} conjugations · 6 tenses</p>
          </div>
          <div className="relative group bg-bg border border-border rounded-2xl p-6 hover:shadow-lg hover:border-[#003399]/20 transition-all duration-300 overflow-hidden cursor-default">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#003399] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div
              className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: "rgba(0,51,153,0.07)" }}
            >
              📐
            </div>
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3">Grammar</p>
            <p className="text-4xl font-bold text-text tracking-tight leading-none">
              {totalGrammarTopics}
            </p>
            <p className="text-sm text-text-muted mt-1">A1–B1 · Rules & examples</p>
          </div>
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
                  <span className="text-[18px] font-semibold text-text">{wordOfDay.word.portuguese}</span>
                </div>
                <p className="text-[13px] text-text-secondary">{wordOfDay.word.english}</p>
                {wordOfDay.word.pronunciation && (
                  <span className="text-[12px] font-mono text-text-muted">/{wordOfDay.word.pronunciation}/</span>
                )}
                {wordOfDay.word.example && (
                  <div className="bg-surface rounded-lg px-3 py-2">
                    <p className="text-[13px] italic text-text">&ldquo;{wordOfDay.word.example}&rdquo;</p>
                    {wordOfDay.word.exampleTranslation && (
                      <p className="text-[11px] text-text-muted mt-0.5">{wordOfDay.word.exampleTranslation}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                  {wordOfDay.word.gender && (
                    <span className="text-xs font-medium text-[#003399] bg-[#003399]/10 rounded-full px-2 py-0.5">
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
                  <span className="text-[18px] font-semibold text-text">{verbKey.toLowerCase()}</span>
                </div>
                <p className="text-[13px] text-text-secondary">{verbOfDay.meta.english}</p>
                <div className="space-y-0.5">
                  {presentRows.slice(0, 5).map((row) => (
                    <div key={row.Person} className="flex items-baseline gap-3 text-[13px]">
                      <span className="w-[36px] text-text-muted shrink-0">{shortPerson(row.Person)}</span>
                      <span className="font-medium text-text">{row.Conjugation}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/conjugations/${verbKey.toLowerCase()}`}
                  className="text-[13px] font-medium text-text hover:text-text-secondary transition-all duration-150 ease-out mt-auto"
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
                  <p className="text-[15px] font-semibold italic text-text">&ldquo;{sayingOfDay.portuguese}&rdquo;</p>
                </div>
                <p className="text-[13px] text-text-secondary">{sayingOfDay.meaning}</p>
                {sayingOfDay.pronunciation && (
                  <span className="text-[12px] font-mono text-text-muted">/{sayingOfDay.pronunciation}/</span>
                )}
                <div className="flex flex-col gap-1 text-[12px]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] uppercase tracking-[0.08em] text-text-muted font-semibold shrink-0">Literal</span>
                    <span className="text-text-secondary">{sayingOfDay.literal}</span>
                  </div>
                </div>
                <Link
                  href="/culture"
                  className="text-[13px] font-medium text-text hover:text-text-secondary transition-all duration-150 ease-out mt-auto"
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
                  <span className="text-[15px] font-semibold text-text">{s.title}</span>
                  <span className="text-[13px] text-text-muted italic">{s.titlePt}</span>
                  <span className="text-[12px] text-text-secondary mt-auto pt-3">{s.stat}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12" />
      </PageContainer>
      </HomePageSwitch>
    </OnboardingGate>
  );
}
