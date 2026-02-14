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
const TOTAL_GRADIENTS = 11;
const gradientExt = (n: number) => ([4, 5, 6, 7, 11].includes(n) ? "jpeg" : "jpg");
const gradientPath = (offset: number) => {
  const n = (dayOfYear + offset) % TOTAL_GRADIENTS + 1;
  return `/gradients/mesh-${n}.${gradientExt(n)}`;
};
const wordGradient = gradientPath(0);
const verbGradient = gradientPath(3);
const sayingGradient = gradientPath(7);

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
    stat: "Coming soon",
    desc: "Quizzes, flashcards, and spaced repetition",
    ready: false,
  },
  {
    title: "Culture",
    href: "/culture",
    stat: `${sayings.length} sayings & proverbs · A1–B1`,
    desc: "Portuguese sayings, proverbs, and expressions",
    ready: true,
  },
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
        {/* Daily Focus — hero */}
        <section className="pt-8 md:pt-12 pb-16 md:pb-20 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
            {/* Word of the Day */}
            <div className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden flex flex-col min-h-0 h-full transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              {wordOfDay ? (
                <>
                  <div
                    className="relative h-[160px] md:h-[200px] bg-cover bg-center rounded-t-[14px] flex flex-col justify-between p-5 md:p-7"
                      style={{ backgroundImage: `url(${wordGradient})` }}
                    >
                      <div className="flex flex-col">
                        <span className="text-[16px] md:text-[20px] font-semibold uppercase tracking-[1.32px] text-white leading-[26px]">
                          Word of the Day
                        </span>
                        <span className="text-[16px] md:text-[20px] font-medium italic text-white leading-[26px]">
                          Palavra do Dia
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold text-[#3C5E95] bg-[rgba(232,240,249,0.75)] px-2.5 py-[3px] rounded-full leading-[14px]">
                          {wordOfDay.word.cefr}
                        </span>
                        <span className="text-[11px] font-semibold text-[#3C5E95] bg-white px-2.5 py-[3px] rounded-full leading-[14px]">
                          {wordOfDay.categoryTitle}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 md:p-7 flex flex-col gap-5 flex-1 min-h-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 min-w-0">
                          <span className="text-[26px] md:text-[32px] font-bold text-[#111827] leading-[35px] break-words">
                            {wordOfDay.word.portuguese}
                            {wordOfDay.word.gender && (
                              <span className="text-base font-normal text-[#6B7280] ml-1">
                                ({wordOfDay.word.gender === "m" ? "m." : "f."})
                              </span>
                            )}
                          </span>
                          {wordOfDay.word.pronunciation && (
                            <span className="font-mono text-[14px] text-[#9CA3AF] leading-[18px] whitespace-nowrap">
                              /{wordOfDay.word.pronunciation}/
                            </span>
                          )}
                        </div>
                        <PronunciationButton
                          text={wordOfDay.word.portuguese}
                          size="md"
                          variant="dark"
                          className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0"
                        />
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" aria-hidden />
                      <span className="text-[18px] font-medium text-[#374151] leading-[23px] break-words">
                        {wordOfDay.word.english}
                      </span>
                      {wordOfDay.word.example && (
                        <div className="bg-[#FCFCFC] border-[0.5px] border-[#E9E9E9] rounded-[10px] p-4 flex flex-col gap-1">
                          <span className="text-[15px] italic text-[#1F2937] leading-[20px] break-words">
                            &ldquo;{wordOfDay.word.example}&rdquo;
                          </span>
                          <span className="text-[13px] text-[#9CA3AF] leading-[17px] break-words">
                            {wordOfDay.word.exampleTranslation}
                          </span>
                        </div>
                      )}
                      <Link
                        href="/vocabulary"
                        className="inline-flex items-center justify-center self-start px-[13px] h-9 bg-[#262626] border border-[#262626] rounded-[10px] text-[13.5px] font-medium text-[#FAFAFA] shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#404040] transition-colors duration-200"
                      >
                        Practice this word →
                      </Link>
                  </div>
                </>
              ) : (
                <div className="p-5 md:p-7">
                  <p className="text-gray-500 text-[14px]">No vocabulary data.</p>
                </div>
              )}
            </div>

            {/* Verb of the Day */}
            <div className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden flex flex-col min-h-0 h-full transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
              {verbKey && verbOfDay ? (
                <>
                  <div
                    className="relative h-[160px] md:h-[200px] bg-cover bg-center rounded-t-[14px] flex flex-col justify-between p-5 md:p-7"
                      style={{ backgroundImage: `url(${verbGradient})` }}
                    >
                      <div className="flex flex-col">
                        <span className="text-[16px] md:text-[20px] font-semibold uppercase tracking-[1.32px] text-white leading-[26px]">
                          Verb of the Day
                        </span>
                        <span className="text-[16px] md:text-[20px] font-medium italic text-white leading-[26px]">
                          Verbo do Dia
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {verbOfDay.meta.group === "Irregular" ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-[rgba(255,251,235,0.85)] px-2.5 py-[3px] rounded-full leading-[14px]">
                            {verbOfDay.meta.group}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-[rgba(236,253,245,0.85)] px-2.5 py-[3px] rounded-full leading-[14px]">
                            {verbOfDay.meta.group}
                          </span>
                        )}
                        <span className="text-[11px] font-semibold text-[#3C5E95] bg-[rgba(232,240,249,0.75)] px-2.5 py-[3px] rounded-full leading-[14px]">
                          {verbOfDay.meta.cefr}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 md:p-7 flex flex-col gap-5 flex-1 min-h-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3 min-w-0">
                          <span className="text-[26px] md:text-[32px] font-bold text-[#111827] leading-[35px] uppercase tracking-[0.02em] break-words">
                            {verbKey}
                          </span>
                          {verbOfDay.meta.pronunciation && (
                            <span className="font-mono text-[14px] text-[#9CA3AF] leading-[18px] whitespace-nowrap">
                              /{verbOfDay.meta.pronunciation}/
                            </span>
                          )}
                        </div>
                        <PronunciationButton
                          text={verbKey}
                          size="md"
                          variant="dark"
                          className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0"
                        />
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" aria-hidden />
                      <span className="text-[16px] font-medium text-[#374151] break-words">
                        {verbOfDay.meta.english}
                      </span>
                      <span className="text-[11px] tracking-[0.1em] uppercase text-[#9CA3AF] font-medium">
                        Presente do Indicativo
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        {presentRows.map((row, i) => {
                          const personPt = row.Person.split(" (")[0].trim();
                          const personShort =
                            /^ele\/ela(\/você)?$/i.test(personPt)
                              ? "ele/ela"
                              : /^eles\/elas(\/vocês)?$/i.test(personPt)
                                ? "eles/elas"
                                : personPt;
                          return (
                            <div
                              key={i}
                              className="flex items-center py-2 px-2 rounded-lg border-b border-[#F9FAFB] last:border-0 hover:bg-[#F8FAFC] transition-colors duration-150"
                            >
                              <span className="w-[70px] text-[14px] text-[#9CA3AF] shrink-0">{personShort}</span>
                              <span className="w-[110px] text-[14px] font-semibold text-[#111827] shrink-0 break-all">
                                {row.Conjugation}
                              </span>
                              <span className="text-[14px] text-[#9CA3AF] italic truncate min-w-0">
                                {row["Example Sentence"]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <Link
                        href={`/conjugations/${verbKey.toLowerCase()}`}
                        className="inline-flex items-center justify-center self-start px-[13px] h-9 bg-[#262626] border border-[#262626] rounded-[10px] text-[13.5px] font-medium text-[#FAFAFA] shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#404040] transition-colors duration-200"
                      >
                        View all tenses →
                      </Link>
                  </div>
                </>
              ) : (
                <div className="p-5 md:p-7">
                  <p className="text-gray-500 text-[14px]">No verb data.</p>
                </div>
              )}
            </div>

            {/* Saying of the Day */}
            {sayingOfDay ? (
              <div className="md:col-span-2 xl:col-span-1 h-full">
                <div className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden flex flex-col min-h-0 h-full transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                  <div
                    className="relative h-[160px] md:h-[200px] bg-cover bg-center rounded-t-[14px] flex flex-col justify-between p-5 md:p-7"
                    style={{ backgroundImage: `url(${sayingGradient})` }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[16px] md:text-[20px] font-semibold uppercase tracking-[1.32px] text-white leading-[26px]">
                        Saying of the Day
                      </span>
                      <span className="text-[16px] md:text-[20px] font-medium italic text-white leading-[26px]">
                        Provérbio do Dia
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] font-semibold text-[#3C5E95] bg-[rgba(232,240,249,0.75)] px-2.5 py-[3px] rounded-full leading-[14px]">
                        {sayingOfDay.cefr ?? "A2"}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 md:p-7 flex flex-col gap-5 flex-1 min-h-0">
                    <div className="py-2">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[19px] md:text-[22px] font-semibold italic text-[#111827] leading-[1.35] break-words">
                            &ldquo;{sayingOfDay.portuguese}&rdquo;
                          </span>
                          <PronunciationButton
                            text={sayingOfDay.portuguese}
                            size="md"
                            variant="dark"
                            className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0"
                          />
                        </div>
                        {sayingOfDay.pronunciation && (
                          <span className="font-mono text-[14px] text-[#9CA3AF] leading-[18px]">
                            /{sayingOfDay.pronunciation}/
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium">
                        Literal
                      </span>
                      <p className="text-[14px] text-[#6B7280] mt-1 break-words">{sayingOfDay.literal}</p>
                    </div>
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium">
                        Meaning
                      </span>
                      <p className="text-[14px] text-[#4B5563] leading-relaxed mt-1 break-words">
                        {sayingOfDay.meaning}
                      </p>
                    </div>
                    <Link
                      href="/culture"
                      className="inline-flex items-center justify-center self-start px-[13px] h-9 bg-[#262626] border border-[#262626] rounded-[10px] text-[13.5px] font-medium text-[#FAFAFA] shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#404040] transition-colors duration-200"
                    >
                      View all sayings →
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <HomeProgressBanner />

        {/* Section cards — 4-col desktop, 2x2 tablet, stacked mobile */}
        <section className="pb-12 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {sections.map((s) => {
              const cardContent = (
                <>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-text">
                      {s.title}
                    </h2>
                    <p
                      className={`text-[13px] mt-1 ${
                        s.ready ? "text-text-2" : "text-text-3"
                      }`}
                    >
                      {s.stat}
                    </p>
                    <p className="text-[12px] text-text-3 mt-1">{s.desc}</p>
                  </div>
                  {s.ready && (
                    <span
                      className="shrink-0 text-text-3 text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    >
                      →
                    </span>
                  )}
                </>
              );
              return s.ready ? (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-center gap-4 border border-border rounded-lg p-4 md:p-6 bg-white h-full transition-all duration-200 hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(60,94,149,0.08)] hover:-translate-y-px cursor-pointer"
                >
                  {cardContent}
                </Link>
              ) : (
                <div
                  key={s.href}
                  className="flex items-center gap-4 border border-dashed border-border rounded-lg p-4 md:p-6 bg-bg-s h-full cursor-not-allowed"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold tracking-tight text-text-2">
                      {s.title}
                    </h2>
                    <p className="text-text-3 text-[12px] italic mt-1">
                      Coming soon
                    </p>
                    <p className="text-[12px] text-text-3 mt-1">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Platform stats bar + dashboard link */}
        <section className="pb-16 pt-2 text-center">
          <p className="text-[13px] text-text-2">
            {totalVerbs} verbs · {totalConjugations.toLocaleString()}{" "}
            conjugations · {totalVocabWords.toLocaleString()} words · {totalCategories} categories · {totalGrammarTopics} grammar topics
          </p>
          <Link
            href="/dashboard"
            className="text-[13px] text-text-2 hover:text-text font-medium transition-colors mt-2 inline-block"
          >
            Track your progress →
          </Link>
        </section>
      </main>
    </>
  );
}
