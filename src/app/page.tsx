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
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10 pt-6">
        {latestChangelog && (
          <ChangelogBanner
            version={latestChangelog.version}
            title={latestChangelog.title}
            summary={latestChangelog.summary}
            firstChange={latestChangelog.changes?.[0] ?? ""}
          />
        )}
        {/* Daily Focus — hero */}
        <section className="pt-8 md:pt-12 pb-16 md:pb-20 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
            {/* Word of the Day */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(60,94,149,0.08)] flex flex-col min-h-0 overflow-hidden">
              {wordOfDay ? (
                <>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF2FA] text-[#3C5E95]">
                      {wordOfDay.word.cefr}
                    </span>
                    <div>
                      <p className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                        Word of the Day
                      </p>
                      <p className="text-[11px] text-gray-300 italic">Palavra do Dia</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 mt-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-3xl md:text-4xl font-bold text-gray-900 break-words">
                        {wordOfDay.word.portuguese}
                        {wordOfDay.word.gender && (
                          <span className="text-base font-normal text-gray-500 ml-1">
                            ({wordOfDay.word.gender === "m" ? "m." : "f."})
                          </span>
                        )}
                      </p>
                      {wordOfDay.word.pronunciation && (
                        <p className="text-sm text-gray-400 font-mono mt-1 break-words">
                          /{wordOfDay.word.pronunciation}/
                        </p>
                      )}
                    </div>
                    <PronunciationButton
                      text={wordOfDay.word.portuguese}
                      size="md"
                      className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border-0 bg-[#EBF2FA] hover:bg-[#dce8f5] flex items-center justify-center shrink-0 text-[#3C5E95] shadow-none"
                    />
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-5" aria-hidden />
                  <p className="text-lg text-gray-700 font-medium break-words">
                    {wordOfDay.word.english}
                  </p>
                  {wordOfDay.word.example && (
                    <div className="bg-[#F8FAFC] rounded-xl p-4 mt-4 relative">
                      <svg className="absolute top-3 left-3 w-4 h-4 text-[#3C5E95] opacity-30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                      <p className="text-[15px] text-gray-800 italic font-medium pl-6 break-words">
                        &ldquo;{wordOfDay.word.example}&rdquo;
                      </p>
                      <p className="text-sm text-gray-500 mt-1 pl-6 break-words">
                        {wordOfDay.word.exampleTranslation}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 font-medium mt-4">
                    {wordOfDay.categoryTitle}
                  </p>
                  <Link
                    href="/vocabulary"
                    className="mt-4 text-sm font-medium text-[#3C5E95] hover:text-[#2E4A75] transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    Practice this word →
                  </Link>
                </>
              ) : (
                <p className="text-gray-500 text-[14px]">No vocabulary data.</p>
              )}
            </div>

            {/* Verb of the Day */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 md:p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(60,94,149,0.08)] flex flex-col min-h-0 overflow-hidden">
              {verbKey && verbOfDay ? (
                <>
                  <div className="flex items-start gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        verbOfDay.meta.group === "Irregular"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {verbOfDay.meta.group}
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EBF2FA] text-[#3C5E95]">
                      {verbOfDay.meta.cefr}
                    </span>
                    <div>
                      <p className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                        Verb of the Day
                      </p>
                      <p className="text-[11px] text-gray-300 italic">Verbo do Dia</p>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 mt-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide break-words">
                        {verbKey}
                      </p>
                      {verbOfDay.meta.pronunciation && (
                        <p className="text-sm text-gray-400 font-mono mt-1 break-words">
                          /{verbOfDay.meta.pronunciation}/
                        </p>
                      )}
                    </div>
                    <PronunciationButton
                      text={verbKey}
                      size="md"
                      className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border-0 bg-[#EBF2FA] hover:bg-[#dce8f5] flex items-center justify-center shrink-0 text-[#3C5E95] shadow-none"
                    />
                  </div>
                  <p className="text-base text-gray-600 mt-2 break-words">
                    {verbOfDay.meta.english}
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-5" aria-hidden />
                  <p className="text-[11px] tracking-widest uppercase text-gray-400 font-medium mb-3">
                    Presente do Indicativo
                  </p>
                  <div className="min-w-0 flex-1 space-y-0">
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
                          className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 transition-colors duration-150 hover:bg-[#F8FAFC] hover:rounded-lg -mx-1 px-1"
                        >
                          <span className="text-sm text-gray-400 w-16 shrink-0">{personShort}</span>
                          <span className="text-sm font-semibold text-gray-900 w-28 shrink-0 break-all">
                            {row.Conjugation}
                          </span>
                          <span className="text-sm text-gray-400 italic truncate min-w-0">
                            {row["Example Sentence"]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    href={`/conjugations/${verbKey.toLowerCase()}`}
                    className="mt-4 text-sm font-medium text-[#3C5E95] hover:text-[#2E4A75] transition-colors duration-200 inline-flex items-center gap-1"
                  >
                    View all tenses →
                  </Link>
                </>
              ) : (
                <p className="text-gray-500 text-[14px]">No verb data.</p>
              )}
            </div>
          </div>

          {/* Saying of the Day — full width */}
          {sayingOfDay && (
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 md:p-8 transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(60,94,149,0.08)]">
              <p className="text-[11px] tracking-widest uppercase text-gray-400 font-medium">
                Saying of the Day · Provérbio do Dia
              </p>
              <div className="border-l-[3px] border-[#3C5E95] pl-5 py-3 my-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-xl md:text-2xl font-semibold text-gray-900 italic break-words">
                    &ldquo;{sayingOfDay.portuguese}&rdquo;
                  </p>
                  <PronunciationButton
                    text={sayingOfDay.portuguese}
                    size="md"
                    className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full border-0 bg-[#EBF2FA] hover:bg-[#dce8f5] flex items-center justify-center shrink-0 text-[#3C5E95] shadow-none"
                  />
                </div>
              </div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mt-2">
                Literal
              </p>
              <p className="text-sm text-gray-500 mt-1 break-words">{sayingOfDay.literal}</p>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mt-3">
                Meaning
              </p>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed break-words">
                {sayingOfDay.meaning}
              </p>
              <Link
                href="/culture"
                className="mt-4 text-sm font-medium text-[#3C5E95] hover:text-[#2E4A75] transition-colors duration-200 inline-flex items-center gap-1"
              >
                View all sayings →
              </Link>
            </div>
          )}
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
