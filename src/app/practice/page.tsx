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

function CardIcon({ id }: { id: string }) {
  const className = "w-10 h-10 text-[#111827]";
  switch (id) {
    case "flashcards":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="14" height="10" rx="2" />
          <rect x="6" y="6" width="14" height="10" rx="2" />
          <rect x="10" y="10" width="14" height="10" rx="2" />
        </svg>
      );
    case "verb-drills":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5h11v11h-11z" />
          <path d="M6.5 12h11" />
          <path d="M12 6.5v11" />
          <path d="M4 4l3 3" />
          <path d="M20 20l-3-3" />
          <path d="M20 4l-3 3" />
          <path d="M4 20l3-3" />
        </svg>
      );
    case "vocab-quiz":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "listening":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      );
    default:
      return null;
  }
}

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
      <main>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-5">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Practice
            </h1>
            <p className="text-[13px] text-[#111827] font-medium mt-1">
              Prática
            </p>
            <p className="text-[13px] text-text-3 mt-1">
              Build your Portuguese through daily practice.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              >
                <div className="h-[100px] bg-gradient-to-br from-[#EBF2FA] via-[#e0eaf4] to-[#d4dff0] flex items-center justify-center rounded-t-[14px]">
                  <CardIcon id={mode.id} />
                </div>
                <div className="p-5 flex flex-col gap-3">
                  <h3 className="text-[18px] font-semibold text-[#111827]">
                    {mode.title}
                  </h3>
                  <span className="text-[13px] text-[#111827] font-medium -mt-2">
                    {mode.portuguese}
                  </span>
                  <p className="text-[13px] text-[#6B7280] leading-relaxed">
                    {mode.description}
                  </p>
                  <span className="text-[12px] text-[#9CA3AF]">
                    {mode.stats}
                  </span>
                  <Link
                    href={mode.href}
                    className="inline-flex items-center justify-center self-start px-[13px] h-9 bg-[#111827] border border-[#111827] rounded-[10px] text-[13.5px] font-medium text-white shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#1F2937] transition-colors duration-200 mt-1"
                  >
                    {mode.cta} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
