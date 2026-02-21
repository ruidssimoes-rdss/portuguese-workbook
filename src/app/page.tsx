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

// Daily prompt: time-appropriate + daily rotation
const hour = new Date().getHours();
const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
const eligible = dailyPrompts.filter(
  (p) => p.timeOfDay === timeOfDay || p.timeOfDay === "anytime"
);
const promptIndex = dayIndex % eligible.length;
const todayPrompt = eligible[promptIndex];

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
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-6">
        {latestChangelog && (
          <ChangelogBanner
            version={latestChangelog.version}
            title={latestChangelog.title}
            summary={latestChangelog.summary}
            firstChange={latestChangelog.changes?.[0] ?? ""}
          />
        )}
        {todayPrompt && <HomeGreeting greeting={todayPrompt} />}

        {/* Two-column main area */}
        <section className="pt-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
            {/* Left: Today's Picks */}
            <div className="space-y-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-2">
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
                      <span className="text-[11px] font-medium text-text-secondary bg-border-light px-2.5 py-[3px] rounded-full">
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
                  <p className="text-text-secondary text-[14px]">No vocabulary data.</p>
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
                          : "text-text-secondary bg-border-light"
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
                  <p className="text-text-secondary text-[14px]">No verb data.</p>
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

            {/* Right column */}
            <div className="space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted">
                Quick navigation
              </h2>

              <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[21px] flex flex-col gap-5">
                <p className="text-[14px] font-normal text-[#262626]">
                  Track your learning progress
                </p>
                <p className="text-[13px] font-normal text-[#A3AAB4] leading-5">
                  Take placement tests in conjugations, vocabulary, and grammar to see where you stand.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center h-[36px] px-5 bg-[#262626] border border-[#494949] rounded-[12px] text-[13px] font-medium text-white hover:bg-[#404040] transition-colors duration-200 self-start"
                >
                  Go to Dashboard →
                </Link>
              </div>

              <div className="bg-white border border-[#CFD3D9] rounded-[12px] p-[30px] flex flex-col gap-5">
                <p className="text-[14px] font-normal text-[#262626]">
                  Practice makes perfect
                </p>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: "Verb Drills", href: "/practice/verb-drills" },
                    { label: "Listening", href: "/practice/listening" },
                    { label: "Flashcards", href: "/practice/flashcards" },
                    { label: "Vocab Quiz", href: "/practice/vocab-quiz" },
                  ].map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-center h-[36px] bg-surface border border-[#CFD3D9] rounded-[12px] text-[12px] font-normal text-text-secondary hover:border-[#9AA2AD] hover:text-[#475569] transition-colors duration-200"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>

              <h2 className="text-[11px] font-semibold uppercase tracking-[0.88px] text-text-muted pt-2">
                Explore
              </h2>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { title: "Conjugations", href: "/conjugations", stats: `${totalVerbs} verbs\n${totalConjugations.toLocaleString()} conjugations` },
                  { title: "Vocabulary", href: "/vocabulary", stats: `${totalVocabWords} words\n${totalCategories} categories` },
                  { title: "Grammar", href: "/grammar", stats: `${totalGrammarTopics} topics\nA1–B1` },
                  { title: "Culture", href: "/culture", stats: `${sayings.length} sayings & proverbs\nA1–B1` },
                ].map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group bg-surface border border-[#CFD3D9] rounded-[12px] p-4 flex flex-col gap-2.5 hover:border-[#9AA2AD] transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[15px] font-bold tracking-[-0.375px] text-text">
                        {s.title}
                      </span>
                      <span className="text-[16px] text-[#CFD3D9] group-hover:text-[#9AA2AD] transition-colors">
                        →
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-text-secondary leading-4 whitespace-pre-line">
                      {s.stats}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
