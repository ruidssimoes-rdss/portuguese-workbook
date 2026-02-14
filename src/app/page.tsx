import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";
import { HomeProgressBanner } from "@/components/home-progress-banner";
import { ChangelogBanner } from "@/components/changelog-banner";
import { PronunciationButton } from "@/components/pronunciation-button";
import changelogData from "@/data/changelog.json";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import { greetings } from "@/data/greetings";
import { cefrPillClass } from "@/lib/cefr";
import { HomeGreeting } from "@/components/home-greeting";
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
const dayOfYear = Math.floor(
  (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
);

const wordOfDay =
  flatVocab.length > 0 ? flatVocab[dayIndex % flatVocab.length] : null;
const verbKey =
  totalVerbs > 0 ? verbs.order[dayIndex % totalVerbs] : null;
const verbOfDay = verbKey ? verbs.verbs[verbKey] : null;
const presentRows =
  verbOfDay?.conjugations?.filter((c) => c.Tense === "Present") ?? [];
const sayingOfDay =
  sayings.length > 0 ? sayings[dayIndex % sayings.length] : null;

// Greeting of the day: time-based + daily rotation
const hour = new Date().getHours();
const greetingTimeSlots: ("morning" | "afternoon" | "evening" | "anytime")[] =
  hour < 12 ? ["morning", "anytime"] : hour < 18 ? ["afternoon", "anytime"] : ["evening", "anytime"];
const filteredGreetings = greetings.filter((g) =>
  greetingTimeSlots.includes(g.timeOfDay)
);
const greetingOfDay =
  filteredGreetings.length > 0
    ? filteredGreetings[dayOfYear % filteredGreetings.length]
    : null;

function shortGroup(group: string): string {
  if (group.startsWith("Irregular")) return "text-amber-700 bg-amber-50";
  if (group.startsWith("Regular -AR")) return "text-emerald-700 bg-emerald-50";
  if (group.startsWith("Regular -ER")) return "text-blue-700 bg-blue-50";
  return "text-violet-700 bg-violet-50";
}

function shortPerson(person: string): string {
  if (person.startsWith("eu")) return "eu";
  if (person.startsWith("tu")) return "tu";
  if (person.startsWith("ele")) return "ele";
  if (person.startsWith("nós")) return "nós";
  if (person.startsWith("eles")) return "eles";
  return person.split(" ")[0];
}

const sections = [
  {
    title: "Conjugations",
    href: "/conjugations",
    stat: `${totalVerbs} verbs · ${totalConjugations.toLocaleString()} conjugations`,
    desc: "Explore all tenses with examples and notes",
    ready: true,
  },
  {
    title: "Vocabulary",
    href: "/vocabulary",
    stat: `${totalVocabWords} words · ${totalCategories} categories`,
    desc: "Words and phrases organized by theme",
    ready: true,
  },
  {
    title: "Grammar",
    href: "/grammar",
    stat: `${totalGrammarTopics} topics · A1–B1`,
    desc: "Tense explanations, rules, and tips",
    ready: true,
  },
  {
    title: "Practice",
    href: "/practice",
    stat: "4 practice modes",
    desc: "Quizzes, flashcards, and spaced repetition",
    ready: true,
  },
  {
    title: "Culture",
    href: "/culture",
    stat: `${sayings.length} sayings & proverbs · A1–B1`,
    desc: "Portuguese sayings, proverbs, and expressions",
    ready: true,
  },
];

const quickActions = [
  { label: "Verb Drills", href: "/practice/verb-drills" },
  { label: "Vocab Quiz", href: "/practice/vocab-quiz" },
  { label: "Flashcards", href: "/practice/flashcards" },
  { label: "Listening", href: "/practice/listening" },
];

export default function Home() {
  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-6">
        {latestChangelog && (
          <ChangelogBanner
            version={latestChangelog.version}
            title={latestChangelog.title}
            summary={latestChangelog.summary}
            firstChange={latestChangelog.changes?.[0] ?? ""}
          />
        )}
        {greetingOfDay && <HomeGreeting greeting={greetingOfDay} />}

        {/* Mobile: Quick Practice first */}
        <section className="lg:hidden pt-4 pb-4">
          <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
              Quick Practice
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-center px-3.5 py-3 rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] text-[13px] font-medium text-[#374151] hover:border-[#3C5E95] hover:text-[#3C5E95] hover:bg-white transition-all duration-200"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Two-column main area */}
        <section className="pt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Left: Today's Picks */}
            <div className="space-y-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                Today&apos;s Picks
              </h2>

              {/* Word of the Day */}
              <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                {wordOfDay ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                          Word of the Day
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(wordOfDay.word.cefr)}`}>
                          {wordOfDay.word.cefr}
                        </span>
                        <span className="text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2.5 py-[3px] rounded-full">
                          {wordOfDay.categoryTitle}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <PronunciationButton text={wordOfDay.word.portuguese} size="sm" variant="muted" />
                      <h3 className="text-[22px] font-bold text-[#111827] tracking-tight">
                        {wordOfDay.word.portuguese}
                        {wordOfDay.word.gender && (
                          <span className="text-[14px] font-normal text-[#9CA3AF] ml-1.5">
                            ({wordOfDay.word.gender === "m" ? "m." : "f."})
                          </span>
                        )}
                      </h3>
                    </div>
                    <p className="text-[15px] text-[#374151]">{wordOfDay.word.english}</p>
                    {wordOfDay.word.pronunciation && (
                      <p className="font-mono text-[13px] text-[#9CA3AF] mt-1">
                        /{wordOfDay.word.pronunciation}/
                      </p>
                    )}
                    {wordOfDay.word.example && (
                      <div className="mt-4 pt-4 border-t border-[#F0F0F0]">
                        <p className="text-[13px] text-[#6B7280] italic">
                          &ldquo;{wordOfDay.word.example}&rdquo;
                        </p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                          {wordOfDay.word.exampleTranslation}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[#6B7280] text-[14px]">No vocabulary data.</p>
                )}
              </div>

              {/* Verb of the Day */}
              <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                {verbKey && verbOfDay ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                        Verb of the Day
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(verbOfDay.meta.cefr)}`}>
                          {verbOfDay.meta.cefr}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${shortGroup(verbOfDay.meta.group)}`}>
                          {verbOfDay.meta.group.startsWith("Regular -AR") ? "‑AR" : verbOfDay.meta.group.startsWith("Regular -ER") ? "‑ER" : verbOfDay.meta.group.startsWith("Regular -IR") ? "‑IR" : "Irregular"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-1">
                      <PronunciationButton text={verbKey.toLowerCase()} size="sm" variant="muted" />
                      <h3 className="text-[22px] font-bold text-[#111827] tracking-tight">
                        {verbKey.toLowerCase()}
                      </h3>
                    </div>
                    <p className="text-[15px] text-[#374151]">{verbOfDay.meta.english}</p>
                    <div className="mt-4 pt-4 border-t border-[#F0F0F0] space-y-1.5">
                      {presentRows.map((row) => (
                        <div key={row.Person} className="flex items-baseline gap-3 text-[13px]">
                          <span className="w-[40px] text-[#9CA3AF] shrink-0">{shortPerson(row.Person)}</span>
                          <span className="font-semibold text-[#111827] font-mono">{row.Conjugation}</span>
                        </div>
                      })}
                    </div>
                    <Link
                      href={`/conjugations/${verbKey.toLowerCase()}`}
                      className="text-[13px] font-medium text-[#3C5E95] hover:text-[#2E4A75] mt-3 inline-block transition-colors"
                    >
                      View all tenses →
                    </Link>
                  </>
                ) : (
                  <p className="text-[#6B7280] text-[14px]">No verb data.</p>
                )}
              </div>

              {/* Saying of the Day */}
              <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                {sayingOfDay ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                        Saying of the Day
                      </p>
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(sayingOfDay.cefr ?? "A2")}`}>
                        {sayingOfDay.cefr ?? "A2"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <PronunciationButton text={sayingOfDay.portuguese} size="sm" variant="muted" />
                      <p className="text-[17px] font-semibold italic text-[#111827] leading-snug">
                        &ldquo;{sayingOfDay.portuguese}&rdquo;
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium">Literal</span>
                        <p className="text-[13px] text-[#6B7280] mt-0.5">{sayingOfDay.literal}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium">Meaning</span>
                        <p className="text-[13px] text-[#6B7280] mt-0.5">{sayingOfDay.meaning}</p>
                      </div>
                    </div>
                    <Link
                      href="/culture"
                      className="text-[13px] font-medium text-[#3C5E95] hover:text-[#2E4A75] mt-3 inline-block transition-colors"
                    >
                      Explore culture →
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right: Quick Practice (desktop only) → Journey → Stats */}
            <div className="space-y-4">
              <div className="hidden lg:block bg-white border border-[#E5E5E5] rounded-[14px] p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                  Quick Practice
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-center px-3.5 py-3 rounded-[10px] border border-[#E9E9E9] bg-[#FAFAFA] text-[13px] font-medium text-[#374151] hover:border-[#3C5E95] hover:text-[#3C5E95] hover:bg-white transition-all duration-200"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-[14px] p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">
                  Your Journey
                </h2>
                <HomeProgressBanner />
              </div>

              <div className="bg-[#FAFAFA] border border-[#E9E9E9] rounded-[14px] p-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[18px] font-bold text-[#111827]">{totalVerbs}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Verbs</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-[#111827]">{totalVocabWords}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Words</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-bold text-[#111827]">{totalGrammarTopics}</p>
                    <p className="text-[11px] text-[#9CA3AF]">Topics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore grid */}
        <section className="pt-2 pb-16">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-4">
            Explore
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {sections.map((s) =>
              s.ready ? (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-center justify-between border rounded-[14px] p-4 bg-white border-[#E5E5E5] transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                >
                  <div>
                    <h3 className="text-[15px] font-bold tracking-tight text-[#111827]">{s.title}</h3>
                    <p className="text-[12px] text-[#9CA3AF] mt-0.5">{s.stat}</p>
                  </div>
                  <span className="text-[#9CA3AF] text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
              ) : (
                <div
                  key={s.href}
                  className="border rounded-[14px] p-4 bg-[#FAFAFA] border-dashed border-[#E5E5E5] cursor-not-allowed"
                >
                  <h3 className="text-[15px] font-bold tracking-tight text-[#111827]">
                    {s.title}
                  </h3>
                  <p className="text-[12px] mt-1 text-[#9CA3AF] italic">{s.stat}</p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </>
  );
}
