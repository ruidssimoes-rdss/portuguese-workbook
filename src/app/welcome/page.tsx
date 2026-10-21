import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, GraduationCap, Globe, Library, Sparkles, Check } from "lucide-react";
import { getContentStats } from "@/lib/content-stats";

export const metadata: Metadata = {
  title: "Aula PT — Learn European Portuguese from A1 to CIPLE/DEPLE",
  description:
    "Master European Portuguese with real pt-PT audio, 2,200+ words, 48 grammar topics, 289 verbs, and a structured 50-lesson path from A1 to B1. Prepare for CIPLE and DEPLE exams.",
  openGraph: {
    title: "Aula PT — Learn European Portuguese from A1 to CIPLE/DEPLE",
    description:
      "Master European Portuguese with real pt-PT audio, 2,200+ words, 48 grammar topics, 289 verbs, and a structured 50-lesson path from A1 to B1.",
    images: [
      {
        url: "/Aula Logo.png",
        width: 512,
        height: 512,
        alt: "Aula PT Logo",
      },
    ],
  },
};

export default function WelcomePage() {
  const stats = getContentStats();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-aula-border bg-aula-panel">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <Image src="/Aula Logo.png" alt="Aula PT" width={80} height={80} priority />
            </div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] text-aula-text md:text-[44px]">
              Learn the Portuguese they actually speak in Portugal
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-aula-text-2 md:text-[17px]">
              From A1 to the CIPLE and DEPLE exams, with real European Portuguese audio, comprehensive reference
              materials, and a structured learning path that respects how the language is truly spoken in Portugal.
            </p>
            <div className="mt-10">
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-aula-accent px-8 text-[14px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
              >
                Start learning
              </Link>
            </div>
            <p className="mt-6 text-[13px] text-aula-text-2">
              Free to browse the reference library · Sign in to track your progress
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="border-b border-aula-border">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-20">
          <h2 className="mb-12 text-center text-[24px] font-semibold tracking-[-0.01em] text-aula-text md:text-[28px]">
            Why Aula is different
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Globe size={20} strokeWidth={1.5} />}
              title="European Portuguese only"
              description="Authentic pt-PT vocabulary, pronunciation, and usage. Learn comboio (not ônibus), autocarro (not ônibus para urbano), and estou a ver (not estou vendo). Every audio clip uses real European Portuguese voices."
            />
            <FeatureCard
              icon={<Library size={20} strokeWidth={1.5} />}
              title="A real reference library, free to browse"
              description={`${stats.words.toLocaleString("en-US")} words, ${stats.grammarTopics} grammar topics with 760+ quiz questions, and ${stats.verbs} verbs fully conjugated across 9 tenses—each form with an example sentence.`}
            />
            <FeatureCard
              icon={<GraduationCap size={20} strokeWidth={1.5} />}
              title="A structured path from A1 to B1"
              description={`${stats.lessons} sequenced lessons mapped to CIPLE (A2) and DEPLE (B1) exam preparation, with a timed mock exam to test your readiness.`}
            />
            <FeatureCard
              icon={<Sparkles size={20} strokeWidth={1.5} />}
              title="Culture you won't get in a drill app"
              description={`${stats.cultureItems} cultural insights: Portuguese sayings, regional expressions from Porto to the Algarve, false friends that trip up learners, and etiquette tips for real-world situations.`}
            />
            <FeatureCard
              icon={<BookOpen size={20} strokeWidth={1.5} />}
              title="9 verb tenses, fully conjugated"
              description="Master all the verb forms you need: Present, Preterite, Imperfect, Present Perfect, Pluperfect, Future, Conditional, Present Subjunctive, and Imperfect Subjunctive—plus the Imperative."
            />
            <FeatureCard
              icon={<Check size={20} strokeWidth={1.5} />}
              title="Adaptive spaced review"
              description="Built-in mastery tracking ensures you review at the right time. Items you know stay fresh; items you're learning come back when you need them."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-aula-border bg-aula-sunken">
        <div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
          <h2 className="mb-8 text-center text-[24px] font-semibold tracking-[-0.01em] text-aula-text md:text-[28px]">
            Como funciona
          </h2>
          <div className="space-y-8">
            <Step
              number={1}
              title="Start with your level"
              description="Begin at A1 or jump ahead. Each lesson introduces new vocabulary, grammar, and verb forms through examples and clear explanations."
            />
            <Step
              number={2}
              title="Practice with varied exercises"
              description="Reinforce what you learn through multiple question types: vocabulary matching, grammar multiple-choice, conjugation practice, fill-in-the-blank, translation, sentence building, and error correction."
            />
            <Step
              number={3}
              title="Review at the right time"
              description="Aula tracks your mastery of every word, verb, and grammar point. Items you're learning are scheduled for spaced review, so they stick."
            />
            <Step
              number={4}
              title="Prepare for the exams"
              description="Work toward CIPLE (A2) and DEPLE (B1) with exam-focused content and timed mock exams that mirror the real test format."
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-aula-border">
        <div className="mx-auto max-w-3xl px-6 py-16 md:px-8 md:py-20">
          <h2 className="mb-10 text-center text-[24px] font-semibold tracking-[-0.01em] text-aula-text md:text-[28px]">
            Perguntas frequentes
          </h2>
          <div className="space-y-6">
            <FAQ
              question="Is this Brazilian or European Portuguese?"
              answer="European Portuguese only. All vocabulary, audio, grammar examples, and cultural content reflect how Portuguese is spoken in Portugal—from Lisboa to Porto to the Algarve."
            />
            <FAQ
              question="Do I need to know any Portuguese to start?"
              answer="No. The A1 lessons start from zero, teaching you greetings, essential verbs (ser, estar, ter), and basic sentence structure. If you already know some Portuguese, you can jump to A2 or B1."
            />
            <FAQ
              question="Can I use Aula to prepare for the CIPLE or DEPLE exams?"
              answer="Yes. The curriculum is structured around the CEFR levels (A1, A2, B1) that map to CIPLE and DEPLE. The app includes exam-style practice and a timed mock exam."
            />
            <FAQ
              question="Is there an app for iOS or Android?"
              answer="Not yet. Aula currently runs in your browser on any device. Mobile apps are planned for the future."
            />
            <FAQ
              question="What features are coming soon?"
              answer="Speaking practice, conversation with an AI tutor (Professor Elísio), more mock exams, listening comprehension exercises embedded in lessons, and mobile apps."
            />
            <FAQ
              question="How much does it cost?"
              answer="Aula is currently in active development. Pricing details will be announced as the platform evolves."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-aula-accent text-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:px-8 md:py-20">
          <h2 className="text-[28px] font-semibold tracking-[-0.01em] md:text-[32px]">
            Ready to learn European Portuguese?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed opacity-90 md:text-[17px]">
            Start your journey from A1 to B1 with structured lessons, real pt-PT audio, and comprehensive reference materials.
          </p>
          <div className="mt-10">
            <Link
              href="/auth/login"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-[14px] font-medium text-aula-accent transition-opacity hover:opacity-90"
            >
              Começar
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-aula-border bg-aula-panel">
        <div className="mx-auto max-w-5xl px-6 py-12 md:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-6">
              <Link href="/vocabulary" className="text-[13px] text-aula-text-2 transition-colors hover:text-aula-text">
                Vocabulário
              </Link>
              <Link href="/grammar" className="text-[13px] text-aula-text-2 transition-colors hover:text-aula-text">
                Gramática
              </Link>
              <Link
                href="/conjugations"
                className="text-[13px] text-aula-text-2 transition-colors hover:text-aula-text"
              >
                Conjugações
              </Link>
              <Link href="/culture" className="text-[13px] text-aula-text-2 transition-colors hover:text-aula-text">
                Cultura
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-[13px] text-aula-text-2 transition-colors hover:text-aula-text">
                Privacy
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-[12px] text-aula-text-3">
            © {new Date().getFullYear()} Aula PT. European Portuguese learning platform.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[14px] border border-aula-border bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-aula-accent-faint text-aula-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-[15px] font-semibold text-aula-text">{title}</h3>
      <p className="text-[13.5px] leading-relaxed text-aula-text-2">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-aula-accent text-[15px] font-semibold text-white">
        {number}
      </div>
      <div>
        <h3 className="mb-1.5 text-[15px] font-semibold text-aula-text">{title}</h3>
        <p className="text-[13.5px] leading-relaxed text-aula-text-2">{description}</p>
      </div>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[12px] border border-aula-border bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <h3 className="mb-2 text-[14px] font-semibold text-aula-text">{question}</h3>
      <p className="text-[13.5px] leading-relaxed text-aula-text-2">{answer}</p>
    </div>
  );
}
