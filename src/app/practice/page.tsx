import { Topbar } from "@/components/layout/topbar";
import Link from "next/link";
import vocabData from "@/data/vocab.json";
import type { VocabData } from "@/types/vocab";

const vocab = vocabData as unknown as VocabData;
const wordCount = vocab.categories.reduce((s, c) => s + (c.words?.length ?? 0), 0);

const modes = [
  {
    id: "flashcards",
    title: "Flashcards",
    portuguese: "Cartões de Memória",
    description: "Review vocabulary with flip cards. Test your recall and build familiarity.",
    stats: `${wordCount} words available`,
    cta: "Start practicing",
    href: "/practice/flashcards",
    active: true,
  },
  {
    id: "verbs",
    title: "Verb Drills",
    portuguese: "Exercícios de Verbos",
    description: "Practice conjugating verbs across all tenses.",
    stats: "71 verbs · 6 tenses",
    comingSoon: true,
  },
  {
    id: "listening",
    title: "Listening Practice",
    portuguese: "Prática de Audição",
    description: "Listen and identify words and phrases.",
    comingSoon: true,
  },
];

export default function PracticePage() {
  return (
    <>
      <Topbar />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">
          <header className="mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Practice
            </h1>
            <p className="text-lg text-[#3C5E95]/70 font-medium mt-1">
              Prática
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Build your Portuguese through daily practice.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modes.map((mode) =>
              mode.active ? (
                <Link
                  key={mode.id}
                  href={mode.href!}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#3C5E95]/30 hover:shadow-sm transition-all cursor-pointer block"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    {mode.title}
                  </h2>
                  <p className="text-sm text-[#3C5E95]/60 font-medium mt-0.5">
                    {mode.portuguese}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    {mode.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-3">{mode.stats}</p>
                  <span className="text-sm text-[#3C5E95] font-medium mt-4 inline-block">
                    {mode.cta} →
                  </span>
                </Link>
              ) : (
                <div
                  key={mode.id}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-6 opacity-60 cursor-default"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    {mode.title}
                  </h2>
                  <p className="text-sm text-[#3C5E95]/60 font-medium mt-0.5">
                    {mode.portuguese}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    {mode.description}
                  </p>
                  {mode.stats && (
                    <p className="text-xs text-gray-400 mt-3">{mode.stats}</p>
                  )}
                  <span className="text-xs bg-gray-100 text-gray-400 rounded px-2 py-0.5 mt-4 inline-block">
                    Coming soon
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </>
  );
}
