import Link from "next/link";
import { OnboardingGate } from "@/components/onboarding-gate";
import { HomePageSwitch } from "@/components/home/home-page-switch";

export const dynamic = "force-dynamic";
import { PronunciationButton } from "@/components/pronunciation-button";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import { dailyPrompts } from "@/data/daily-prompts";
import { CEFRBadge, VerbGroupBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { HomeGreeting } from "@/components/home-greeting";
import { LessonPreview } from "@/components/lesson-preview";
import { PageLayout, IntroBlock, ContentGrid } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";
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
      <HomePageSwitch staticData={staticData}>
      <PageLayout>
        <IntroBlock
          title={ptGreeting}
          pills={[
            { label: `${totalVocabWords.toLocaleString()} words` },
            { label: `${totalVerbs} verbs` },
            { label: `${totalGrammarTopics} grammar topics` },
            { label: `${sayings.length} sayings` },
          ]}
        />

        {/* Daily prompt */}
        {todayPrompt && <HomeGreeting greeting={todayPrompt} />}

        {/* Lesson preview */}
        <LessonPreview />

        {/* Quick stats */}
        <div className="flex flex-wrap gap-[20px]">
          <SmartBloco title="Vocabulary" stat={{ value: totalVocabWords.toLocaleString(), label: "Vocabulary" }} />
          <SmartBloco title="Conjugations" stat={{ value: String(totalVerbs), label: "Conjugations" }} />
          <SmartBloco title="Grammar Topics" stat={{ value: String(totalGrammarTopics), label: "Grammar Topics" }} />
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
          <p className="text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF] mb-4">Explore</p>
          <BlocoGrid>
            {[
              { title: "Conjugations", titlePt: "Conjugações", href: "/conjugations", stat: `${totalVerbs} verbs` },
              { title: "Vocabulary", titlePt: "Vocabulário", href: "/vocabulary", stat: `${totalVocabWords} words` },
              { title: "Grammar", titlePt: "Gramática", href: "/grammar", stat: `${totalGrammarTopics} topics` },
              { title: "Culture", titlePt: "Cultura", href: "/culture", stat: `${sayings.length} sayings` },
            ].map((s) => (
              <SmartBloco
                key={s.href}
                title={s.title}
                subtitle={s.titlePt}
                footer={{ label: s.stat }}
                href={s.href}
              />
            ))}
          </BlocoGrid>
        </div>
      </PageLayout>
      </HomePageSwitch>
    </OnboardingGate>
  );
}
