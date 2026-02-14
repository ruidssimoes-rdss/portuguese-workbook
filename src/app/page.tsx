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
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
                Today&apos;s Picks
              </h2>

              {/* Word of the Day */}
              {wordOfDay ? (
                <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px] flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-5 min-w-0">
                      <PronunciationButton
                        text={wordOfDay.word.portuguese}
                        size="sm"
                        variant="dark"
                        className="shrink-0"
                      />
                      <div className="flex items-center gap-5 min-w-0">
                        <span className="text-[22px] font-bold text-[#262626] leading-[42px] whitespace-nowrap">
                          {wordOfDay.word.portuguese}
                        </span>
                        <div className="hidden md:block w-px h-[28px] bg-[#9AA2AD] shrink-0" />
                        <span className="hidden md:block text-[22px] font-normal text-[#A3AAB4] leading-[42px] truncate">
                          {wordOfDay.word.english}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {wordOfDay.word.gender && (
                        <span className="text-[11px] font-semibold text-[#1447E6] bg-[#EFF6FF] px-2.5 py-[3px] rounded-full">
                          {wordOfDay.word.gender === "m" ? "masculino" : "feminino"}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(wordOfDay.word.cefr)}`}>
                        {wordOfDay.word.cefr}
                      </span>
                      <span className="text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] px-2.5 py-[3px] rounded-full">
                        {wordOfDay.categoryTitle}
                      </span>
                    </div>
                  </div>
                  <p className="md:hidden text-[15px] text-[#A3AAB4]">{wordOfDay.word.english}</p>
                  {wordOfDay.word.pronunciation && (
                    <span className="text-[12px] font-normal text-[#A3AAB4] leading-5">
                      /{wordOfDay.word.pronunciation}/
                    </span>
                  )}
                  {wordOfDay.word.example && (
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
                      <span className="text-[13px] italic font-normal text-[#475569] leading-5">
                        &ldquo;{wordOfDay.word.example}&rdquo;
                      </span>
                      <div className="hidden md:block w-px h-[22px] bg-[#CFD3D9] shrink-0" />
                      <span className="text-[12px] font-normal text-[#A3AAB4] leading-[18px]">
                        {wordOfDay.word.exampleTranslation}
                      </span>
                    </div>
                  )}
                  <Link
                    href="/vocabulary"
                    className="inline-flex items-center justify-center h-[36px] px-3 rounded-[12px] bg-[rgba(224,231,255,0.75)] border border-[rgba(79,70,229,0.75)] text-[13px] font-medium text-[rgba(79,70,229,0.75)] hover:bg-[rgba(224,231,255,1)] transition-colors duration-200 self-start"
                  >
                    Explore vocabulary →
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px]">
                  <p className="text-[#6B7280] text-[14px]">No vocabulary data.</p>
                </div>
              )}

              {/* Verb of the Day */}
              {verbKey && verbOfDay ? (
                <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px] flex flex-col gap-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-5 min-w-0">
                      <PronunciationButton
                        text={verbKey.toLowerCase()}
                        size="sm"
                        variant="dark"
                        className="shrink-0"
                      />
                      <div className="flex items-center gap-5 min-w-0">
                        <span className="text-[22px] font-bold text-[#262626] leading-[42px] whitespace-nowrap">
                          {verbKey.toLowerCase()}
                        </span>
                        <div className="hidden md:block w-px h-[28px] bg-[#9AA2AD] shrink-0" />
                        <span className="hidden md:block text-[22px] font-normal text-[#A3AAB4] leading-[42px] truncate">
                          {verbOfDay.meta.english}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(verbOfDay.meta.cefr)}`}>
                        {verbOfDay.meta.cefr}
                      </span>
                      <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                        verbOfDay.meta.group.startsWith("Irregular") ? "text-amber-700 bg-amber-50"
                          : verbOfDay.meta.group.startsWith("Regular -AR") ? "text-emerald-700 bg-emerald-50"
                          : verbOfDay.meta.group.startsWith("Regular -ER") ? "text-blue-700 bg-blue-50"
                          : verbOfDay.meta.group.startsWith("Regular -IR") ? "text-violet-700 bg-violet-50"
                          : "text-[#6B7280] bg-[#F3F4F6]"
                      }`}>
                        {shortGroup(verbOfDay.meta.group)}
                      </span>
                    </div>
                  </div>
                  <p className="md:hidden text-[15px] text-[#A3AAB4]">{verbOfDay.meta.english}</p>
                  {verbOfDay.meta.pronunciation && (
                    <span className="text-[12px] font-normal text-[#A3AAB4] leading-5">
                      /{verbOfDay.meta.pronunciation}/
                    </span>
                  )}
                  <div className="space-y-1">
                    {presentRows.map((row) => (
                      <div key={row.Person} className="flex items-baseline gap-5 text-[13px]">
                        <span className="w-[40px] text-[#A3AAB4] shrink-0">{shortPerson(row.Person)}</span>
                        <span className="font-semibold text-[#262626]">{row.Conjugation}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/conjugations/${verbKey.toLowerCase()}`}
                    className="inline-flex items-center justify-center h-[36px] px-3 rounded-[12px] bg-[rgba(224,231,255,0.75)] border border-[rgba(79,70,229,0.75)] text-[13px] font-medium text-[rgba(79,70,229,0.75)] hover:bg-[rgba(224,231,255,1)] transition-colors duration-200 self-start"
                  >
                    View all tenses →
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px]">
                  <p className="text-[#6B7280] text-[14px]">No verb data.</p>
                </div>
              )}

              {/* Saying of the Day */}
              {sayingOfDay ? (
                <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px] flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-5 min-w-0">
                      <PronunciationButton
                        text={sayingOfDay.portuguese}
                        size="sm"
                        variant="dark"
                        className="shrink-0 mt-1"
                      />
                      <span className="text-[22px] font-semibold italic text-[#262626] leading-[42px]">
                        &ldquo;{sayingOfDay.portuguese}&rdquo;
                      </span>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(sayingOfDay.cefr ?? "A2")}`}>
                      {sayingOfDay.cefr ?? "A2"}
                    </span>
                  </div>
                  {sayingOfDay.pronunciation && (
                    <span className="text-[12px] font-normal text-[#A3AAB4] leading-5">
                      /{sayingOfDay.pronunciation}/
                    </span>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-[#A3AAB4] font-semibold shrink-0">
                        Literal
                      </span>
                      <span className="text-[13px] text-[#475569]">{sayingOfDay.literal}</span>
                    </div>
                    <div className="hidden md:block w-px h-[22px] bg-[#CFD3D9] shrink-0" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-[#A3AAB4] font-semibold shrink-0">
                        Meaning
                      </span>
                      <span className="text-[13px] text-[#475569]">{sayingOfDay.meaning}</span>
                    </div>
                  </div>
                  <Link
                    href="/culture"
                    className="inline-flex items-center justify-center h-[36px] px-3 rounded-[12px] bg-[rgba(224,231,255,0.75)] border border-[rgba(79,70,229,0.75)] text-[13px] font-medium text-[rgba(79,70,229,0.75)] hover:bg-[rgba(224,231,255,1)] transition-colors duration-200 self-start"
                  >
                    Explore culture →
                  </Link>
                </div>
              ) : null}
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
