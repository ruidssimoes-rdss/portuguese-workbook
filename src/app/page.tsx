import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";

const sections = [
  {
    title: "Conjugations",
    desc: "20 essential verbs across 6 tenses with examples and grammar notes.",
    href: "/conjugations",
    count: "600 conjugations",
    ready: true,
  },
  {
    title: "Vocabulary",
    desc: "Essential words and phrases organized by theme and CEFR level.",
    href: "/vocabulary",
    count: "238 words",
    ready: true,
  },
  {
    title: "Grammar",
    desc: "Tense explanations, rules, and tips for European Portuguese.",
    href: "/grammar",
    count: "Coming soon",
    ready: false,
  },
  {
    title: "Practice",
    desc: "Quizzes, fill-in-the-blank, flashcards, and spaced repetition.",
    href: "/practice",
    count: "Coming soon",
    ready: false,
  },
];

export default function Home() {
  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10">
        <section className="py-16 md:py-24">
          <h1 className="text-4xl md:text-[44px] font-bold tracking-tight leading-[1.15] max-w-[600px]">
            Learn European Portuguese
          </h1>
          <p className="text-base text-text-2 mt-3 max-w-[500px] leading-relaxed">
            A comprehensive reference and practice platform. Conjugations,
            vocabulary, grammar, and exercises — all in one place.
          </p>
        </section>

        <section className="pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.ready ? s.href : "#"}
                className={`group border border-border rounded-xl p-6 transition-all ${
                  s.ready
                    ? "hover:border-[#ccc] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">
                      {s.title}
                    </h2>
                    <p className="text-[13px] text-text-2 mt-1">{s.desc}</p>
                  </div>
                  <span className="text-[12px] text-text-3 font-medium whitespace-nowrap mt-1">
                    {s.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
