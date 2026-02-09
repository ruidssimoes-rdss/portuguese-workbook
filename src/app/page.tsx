import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";
import { HomeProgressBanner } from "@/components/home-progress-banner";
import { ChangelogBanner } from "@/components/changelog-banner";
import { PronunciationButton } from "@/components/pronunciation-button";
import changelogData from "@/data/changelog.json";
import { Badge, cefrVariant, groupVariant } from "@/components/ui/badge";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import type { VerbDataSet } from "@/types";
import type { VocabData, VocabWord } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";

const verbs = verbData as unknown as VerbDataSet;
const vocab = vocabData as unknown as VocabData;
const grammar = grammarData as unknown as GrammarData;

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
            {/* Word of the Day — Portuguese first */}
            <div className="border border-border rounded-lg p-4 md:p-6 bg-white flex flex-col min-h-0 overflow-hidden">
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider mb-3">
                Word of the Day
              </p>
              {wordOfDay ? (
                <>
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <p className="text-2xl md:text-3xl font-bold tracking-tight text-text break-words">
                      {wordOfDay.word.portuguese}
                    </p>
                    {wordOfDay.word.gender && (
                      <span className="text-base font-normal text-text-2">
                        ({wordOfDay.word.gender === "m" ? "m." : "f."})
                      </span>
                    )}
                    <PronunciationButton text={wordOfDay.word.portuguese} size="md" className="shrink-0" />
                  </div>
                  {wordOfDay.word.pronunciation && (
                    <p className="text-sm text-gray-400 font-mono mt-0.5 break-words">
                      {wordOfDay.word.pronunciation}
                    </p>
                  )}
                  <p className="text-base text-gray-600 mt-1 break-words">
                    {wordOfDay.word.english}
                  </p>
                  {wordOfDay.word.example && (
                    <>
                      <p className="text-[13px] text-text-2 italic mt-3 break-words">
                        {wordOfDay.word.example}
                      </p>
                      <p className="text-[13px] text-gray-500 mt-0.5 break-words">
                        {wordOfDay.word.exampleTranslation}
                      </p>
                    </>
                  )}
                  <div className="flex gap-1.5 mt-4 mt-auto">
                    <Badge variant={cefrVariant[wordOfDay.word.cefr] || "gray"}>
                      {wordOfDay.word.cefr}
                    </Badge>
                    <Badge variant="gray">
                      {wordOfDay.categoryTitle}
                    </Badge>
                  </div>
                </>
              ) : (
                <p className="text-text-2 text-[14px]">No vocabulary data.</p>
              )}
            </div>

            {/* Verb of the Day — Portuguese first */}
            <div className="border border-border rounded-lg p-4 md:p-6 bg-white flex flex-col min-h-0 overflow-hidden">
              <p className="text-[12px] text-text-3 font-medium uppercase tracking-wider mb-3">
                Verb of the Day
              </p>
              {verbKey && verbOfDay ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="text-2xl md:text-3xl font-bold tracking-tight text-text break-words uppercase">
                      {verbKey}
                    </p>
                    <PronunciationButton text={verbKey} size="md" className="shrink-0" />
                  </div>
                  <p className="text-base text-gray-600 mt-0.5 break-words">
                    {verbOfDay.meta.english}
                  </p>
                  {verbOfDay.meta.pronunciation && (
                    <p className="text-sm text-gray-400 font-mono mt-0.5 break-words">
                      {verbOfDay.meta.pronunciation}
                    </p>
                  )}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    <Badge variant={groupVariant[verbOfDay.meta.group] || "gray"}>
                      {verbOfDay.meta.group}
                    </Badge>
                    <Badge variant={cefrVariant[verbOfDay.meta.cefr] || "gray"}>
                      {verbOfDay.meta.cefr}
                    </Badge>
                  </div>
                  <div className="overflow-x-auto border border-border rounded-lg mt-3 min-w-0 flex-1">
                    <table className="w-full text-[12px] md:text-[13px] border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left text-[11px] font-semibold text-text-2 px-2.5 py-2 border-b border-border bg-bg-s">
                            Person
                          </th>
                          <th className="text-left text-[11px] font-semibold text-text-2 px-2.5 py-2 border-b border-border bg-bg-s">
                            Conjugation
                          </th>
                          <th className="hidden sm:table-cell text-left text-[11px] font-semibold text-text-2 px-2.5 py-2 border-b border-border bg-bg-s">
                            Example
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {presentRows.map((row, i) => {
                          const personPt = row.Person.split(" (")[0].trim();
                          const personShort =
                            /^ele\/ela(\/você)?$/i.test(personPt)
                              ? "ele/ela"
                              : /^eles\/elas(\/vocês)?$/i.test(personPt)
                                ? "eles/elas"
                                : personPt;
                          return (
                            <tr
                              key={i}
                              className="border-b border-border-l last:border-0"
                            >
                              <td className="px-2.5 py-1.5 text-text-2 whitespace-nowrap">
                                {personShort}
                              </td>
                              <td className="px-2.5 py-1.5 font-semibold whitespace-nowrap text-text">
                                {row.Conjugation}
                              </td>
                              <td className="hidden sm:table-cell px-2.5 py-1.5 text-text-2 italic max-w-[180px] truncate">
                                {row["Example Sentence"]}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <Link
                    href={`/conjugations/${verbKey.toLowerCase()}`}
                    className="inline-block mt-4 text-[13px] font-medium text-text-2 hover:text-text transition-colors"
                  >
                    View full conjugations →
                  </Link>
                </>
              ) : (
                <p className="text-text-2 text-[14px]">No verb data.</p>
              )}
            </div>
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
                  className="group flex items-center gap-4 border border-border rounded-lg p-4 md:p-6 bg-white h-full transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_4px_16px_rgba(91,79,160,0.08)] hover:-translate-y-px cursor-pointer"
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
