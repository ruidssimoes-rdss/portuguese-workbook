import { Topbar } from "@/components/layout/topbar";
import Link from "next/link";
import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import type { VocabData } from "@/types/vocab";
import type { VerbDataSet } from "@/types";

const vocab = vocabData as unknown as VocabData;
const verbs = verbData as unknown as VerbDataSet;

const wordCount = vocab.categories.reduce((s, c) => s + (c.words?.length ?? 0), 0);
const categoryCount = vocab.categories.length;
const verbCount = verbs.order?.length ?? 0;
const tenseCount = 6;

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
    id: "verb-drills",
    title: "Verb Drills",
    portuguese: "Exercícios de Verbos",
    description: "Practice conjugating verbs across all tenses. Type or choose the correct form.",
    stats: `${verbCount} verbs · ${tenseCount} tenses`,
    cta: "Start drilling",
    href: "/practice/verb-drills",
    active: true,
  },
  {
    id: "vocab-quiz",
    title: "Vocabulary Quiz",
    portuguese: "Questionário de Vocabulário",
    description: "Test your vocabulary with multiple choice and typing challenges.",
    stats: `${wordCount} words · ${categoryCount} categories`,
    cta: "Start quiz",
    href: "/practice/vocab-quiz",
    active: true,
  },
  {
    id: "listening",
    title: "Listening Practice",
    portuguese: "Prática de Audição",
    description: "Listen and identify words and phrases. Train your ear for European Portuguese.",
    stats: "Words and conjugations",
    cta: "Start listening",
    href: "/practice/listening",
    active: true,
  },
];

export default function PracticePage() {
  return (
    <>
      <Topbar />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-10">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modes.map((mode) => (
              <Link
                key={mode.id}
                href={mode.href}
                className="rounded-2xl border border-gray-100 bg-white p-6 border-t-[3px] border-t-[#3C5E95] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(60,94,149,0.08)] block"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  {mode.title}
                </h2>
                <p className="text-sm text-[#3C5E95] mt-0.5">
                  {mode.portuguese}
                </p>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                  {mode.description}
                </p>
                <p className="text-xs text-gray-400 mt-4">{mode.stats}</p>
                <span className="text-sm text-[#3C5E95] font-medium hover:text-[#2E4A75] mt-3 inline-block transition-colors duration-200">
                  {mode.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
