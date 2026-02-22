"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, CEFRBadge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { Divider } from "@/components/ui/divider";

/* ─────────────────────────── Section metadata ─────────────────────────── */

const sections = [
  {
    id: "how-aula-pt-works",
    number: 1,
    title: "How Aula PT Works",
    portuguese: "Como Funciona o Aula PT",
  },
  {
    id: "cefr-levels",
    number: 2,
    title: "Understanding CEFR Levels",
    portuguese: "Compreender os Niveis do QECR",
  },
  {
    id: "timelines",
    number: 3,
    title: "Realistic Timelines",
    portuguese: "Prazos Realistas",
  },
  {
    id: "daily-routine",
    number: 4,
    title: "Your Daily Routine",
    portuguese: "Estruturar a Tua Rotina Diaria",
  },
  {
    id: "science-of-learning",
    number: 5,
    title: "The Science of Learning",
    portuguese: "A Ciencia da Aprendizagem",
  },
  {
    id: "portuguese-tips",
    number: 6,
    title: "Tips for Portuguese",
    portuguese: "Dicas para o Portugues",
  },
];

/* ─────────────────────────── Feature link data ────────────────────────── */

const featureLinks = [
  {
    title: "Vocabulary",
    href: "/vocabulary",
    description: "776+ words across 15 categories",
  },
  {
    title: "Conjugations",
    href: "/conjugations",
    description: "Complete verb tables with examples",
  },
  {
    title: "Grammar",
    href: "/grammar",
    description: "Structured rules and practice",
  },
  {
    title: "Culture",
    href: "/culture",
    description: "Sayings, false friends, etiquette",
  },
  {
    title: "Lessons",
    href: "/lessons",
    description: "Guided revision sessions",
  },
];

/* ─────────────────────────── Scroll-spy hook ──────────────────────────── */

function useScrollSpy(ids: string[], offset = 120) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first entry that is intersecting from top
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, offset]);

  return activeId;
}

/* ─────────────────────────── Quick Nav ────────────────────────────────── */

function QuickNav({ activeId }: { activeId: string }) {
  return (
    <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur-sm border-b border-[#F3F4F6] -mx-4 md:-mx-6 lg:-mx-10 px-4 md:px-6 lg:px-10">
      <nav
        className="flex items-center gap-1 py-2.5 overflow-x-auto scrollbar-hide"
        aria-label="Guide sections"
      >
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#111827] text-white"
                  : "text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}
              >
                {s.number}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}

/* ─────────────────────────── Section wrapper ──────────────────────────── */

function GuideSection({
  id,
  number,
  title,
  portuguese,
  children,
}: {
  id: string;
  number: number;
  title: string;
  portuguese: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[120px]">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-[13px] font-semibold text-[#D1D5DB]">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-[20px] font-bold text-[#111827]">{title}</h2>
      </div>
      <p className="text-[13px] text-[#3C5E95]/70 font-medium mb-5 ml-[2.1rem]">
        {portuguese}
      </p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/* ═══════════════════════════ Page component ═══════════════════════════════ */

export default function GuidePage() {
  const sectionIds = sections.map((s) => s.id);
  const activeId = useScrollSpy(sectionIds);

  /* On mount, scroll to hash if present */
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    }
  }, []);

  return (
    <>
      <Topbar />
      <PageContainer width="narrow" className="py-5">
        {/* ── Page header ─────────────────────────────────────────── */}
        <PageHeader
          title="How to Learn Portuguese"
          titlePt="Como Aprender Portugues"
          subtitle="Your complete guide to learning European Portuguese — from your first words to real conversations, using Aula PT as your main companion."
          className="mb-4"
        />

        {/* ── Quick navigation ────────────────────────────────────── */}
        <QuickNav activeId={activeId} />

        {/* ── Sections ────────────────────────────────────────────── */}
        <div className="space-y-16 mt-8">
          {/* ━━━━━━━━━━━━━━━ Section 1: How Aula PT Works ━━━━━━━━━━━━━━━ */}
          <GuideSection
            id="how-aula-pt-works"
            number={1}
            title="How Aula PT Works"
            portuguese="Como Funciona o Aula PT"
          >
            <Card padding="md" variant="surface">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                Aula PT is designed as a learning companion, not a game. There are
                no streaks, no leaderboards, and no pressure to keep up with
                anyone else. You learn at your own pace, and the platform is there
                whenever you have time and energy to invest in your Portuguese.
              </p>
            </Card>

            <SectionHeader className="mt-6 mb-2">
              Your Daily Starting Point
            </SectionHeader>
            <Card padding="md">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                The homepage greets you with three simple anchors for your day: a
                Word of the Day, a Verb of the Day, and a Saying of the Day. These
                rotate every 24 hours and exist for one purpose — to make it easy
                to open Aula PT, learn something small, and keep your contact with
                Portuguese alive even on busy days.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151] mt-3">
                If you only have thirty seconds, reading those three items and
                listening to their pronunciation is enough to keep the habit
                going. On days when you have more time, they become a natural
                jumping-off point into vocabulary, grammar, culture, or practice.
              </p>
            </Card>

            <SectionHeader className="mt-6 mb-2">
              Learning Content
            </SectionHeader>
            <p className="text-[15px] leading-relaxed text-[#374151] mb-4">
              Aula PT organises European Portuguese into four main areas, all
              accessible from the Library. Each one plays a different role in
              your progress, and the magic comes from combining them rather than
              living in just one.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureLinks.map((f) => (
                <Link key={f.href} href={f.href} className="block group">
                  <Card padding="md" interactive>
                    <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#3C5E95] transition-colors">
                      {f.title}
                    </p>
                    <p className="text-[13px] text-[#6B7280] mt-0.5">
                      {f.description}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="space-y-4 mt-5">
              <Card padding="md">
                <p className="text-[14px] font-semibold text-[#111827] mb-2">
                  Vocabulary
                </p>
                <p className="text-[15px] leading-relaxed text-[#374151]">
                  The Vocabulary section contains 776+ words and phrases organised
                  into 15 real-world categories such as Food &amp; Drink, Travel
                  &amp; Directions, Health &amp; Body, and Home &amp; Rooms. Every
                  entry has pronunciation, gender, an example sentence, and a CEFR
                  level so you know whether it is beginner, elementary, or
                  intermediate material.
                </p>
              </Card>

              <Card padding="md">
                <p className="text-[14px] font-semibold text-[#111827] mb-2">
                  Conjugations
                </p>
                <p className="text-[15px] leading-relaxed text-[#374151]">
                  In Conjugations you will find every verb laid out clearly across
                  six key tenses. Each form is accompanied by a pronunciation guide
                  and a natural example sentence, so you are never looking at dry
                  tables in isolation. When verbs feel overwhelming, this is the
                  calm, structured place to come back to.
                </p>
              </Card>

              <Card padding="md">
                <p className="text-[14px] font-semibold text-[#111827] mb-2">
                  Grammar
                </p>
                <p className="text-[15px] leading-relaxed text-[#374151]">
                  In the Grammar section you will find structured explanations of
                  the rules that hold Portuguese together: articles and gender,
                  pronouns, verb tenses, prepositions, and more. Each topic
                  includes clear notes, examples, and short test questions so you
                  can immediately check whether you have really understood the
                  pattern.
                </p>
              </Card>

              <Card padding="md">
                <p className="text-[14px] font-semibold text-[#111827] mb-2">
                  Culture
                </p>
                <p className="text-[15px] leading-relaxed text-[#374151]">
                  The Culture section focuses on what textbooks usually ignore:
                  sayings and proverbs, false friends, etiquette, and regional
                  slang. This is where you meet the language as it is actually used
                  by Portuguese people, with nuance and humour, rather than as a
                  list of artificially simple dialogues.
                </p>
              </Card>
            </div>

            <SectionHeader className="mt-6 mb-2">Lessons</SectionHeader>
            <Card padding="md">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                Lessons in Aula PT are structured, guided revision sessions. Each
                lesson walks you through vocabulary, verb conjugation, grammar
                rules, and cultural notes in stages. Along the way you work
                through flip cards, fill-in-the-blank exercises, and verb drills
                — all within a single focused session.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151] mt-3">
                At the end of each lesson you see a completion summary showing
                how many items you got right. Lessons are designed to be repeated
                as often as you like, so you can revisit them whenever you want to
                reinforce what you have learned.
              </p>
            </Card>

            <SectionHeader className="mt-6 mb-2">
              Progress, Tests, and Search
            </SectionHeader>
            <Card padding="md">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                As you work through conjugations, vocabulary, and grammar topics,
                progress tests help you see where you are on the A1–B1 scale. When
                you complete a section, you do not see the word &quot;Failed&quot;
                — you see &quot;Not yet&quot;. The difference is small on the
                screen but huge in your mindset: you are not bad at Portuguese,
                you are just not there yet.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151] mt-3">
                Whenever you are unsure where to go next, press{" "}
                <span className="font-mono text-xs text-[#6B7280]">{"\u2318"}K</span>{" "}
                (or{" "}
                <span className="font-mono text-xs text-[#6B7280]">Ctrl+K</span>){" "}
                to open the smart search. You can ask natural questions like
                &quot;How do you say kitchen?&quot;, &quot;Conjugate ir&quot;,
                &quot;Past tense of fazer&quot;, or &quot;What does saudade
                mean?&quot; and jump straight to the relevant entry in vocabulary,
                conjugations, grammar, or culture.
              </p>
            </Card>
          </GuideSection>

          <Divider />

          {/* ━━━━━━━━━━━━━━━ Section 2: CEFR Levels ━━━━━━━━━━━━━━━━━━━━━ */}
          <GuideSection
            id="cefr-levels"
            number={2}
            title="Understanding CEFR Levels"
            portuguese="Compreender os Niveis do QECR"
          >
            <p className="text-[15px] leading-relaxed text-[#374151]">
              CEFR (Common European Framework of Reference) is the international
              standard for describing language ability. Aula PT focuses on A1, A2,
              and B1 — the range that takes you from zero Portuguese to being able
              to live, work, and socialise in Portugal with real confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* A1 */}
              <Card padding="md" className="!bg-emerald-50 !border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <CEFRBadge level="A1" />
                  <span className="text-[14px] font-semibold text-[#111827]">
                    Beginner / Iniciante
                  </span>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed">
                  At A1 you can handle basic survival situations. You can
                  introduce yourself, ask very simple questions, order food and
                  drinks, ask for directions, recognise common words on signs and
                  menus, and take part in tiny exchanges as long as the other
                  person speaks slowly and helps you.
                </p>
                <Divider className="my-3" />
                <p className="text-[12px] text-[#6B7280] leading-relaxed">
                  <span className="font-semibold">You need:</span> roughly five
                  hundred words, present tense, articles, basic prepositions, and
                  the essentials of{" "}
                  <span className="font-semibold">ser</span> vs{" "}
                  <span className="font-semibold">estar</span>.
                </p>
              </Card>

              {/* A2 */}
              <Card padding="md" className="!bg-blue-50 !border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <CEFRBadge level="A2" />
                  <span className="text-[14px] font-semibold text-[#111827]">
                    Elementary / Elementar
                  </span>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed">
                  At A2 you can navigate daily life with growing confidence. You
                  can describe your routine, family, and work, handle shopping and
                  simple transactions, understand the main point of short texts
                  and announcements, and talk about past events in straightforward
                  sentences.
                </p>
                <Divider className="my-3" />
                <p className="text-[12px] text-[#6B7280] leading-relaxed">
                  <span className="font-semibold">You need:</span> around a
                  thousand words, past tenses (
                  <span className="font-semibold">preterito perfeito</span> and{" "}
                  <span className="font-semibold">imperfeito</span>), future
                  forms, object pronouns, and comparatives.
                </p>
              </Card>

              {/* B1 */}
              <Card padding="md" className="!bg-amber-50 !border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                  <CEFRBadge level="B1" />
                  <span className="text-[14px] font-semibold text-[#111827]">
                    Intermediate / Intermedio
                  </span>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed">
                  At B1 you can handle most situations that arise while travelling
                  or living in Portugal. You follow and participate in
                  conversations on familiar topics, understand the main points of
                  TV programmes and news, write messages and short texts with some
                  complexity, and express and justify your opinions.
                </p>
                <Divider className="my-3" />
                <p className="text-[12px] text-[#6B7280] leading-relaxed">
                  <span className="font-semibold">You need:</span> roughly two
                  thousand words, basic subjunctive, conditional, relative
                  pronouns, and more complex sentence patterns.
                </p>
              </Card>
            </div>

            <p className="text-sm text-[#6B7280] mt-4 leading-relaxed">
              Aula PT currently covers A1 through B1 content. That is enough to
              understand most everyday Portuguese, talk to neighbours and
              colleagues, handle bureaucracy with some patience, and feel at home
              in the language rather than lost in it.
            </p>
          </GuideSection>

          <Divider />

          {/* ━━━━━━━━━━━━━━━ Section 3: Timelines ━━━━━━━━━━━━━━━━━━━━━━━ */}
          <GuideSection
            id="timelines"
            number={3}
            title="Realistic Timelines"
            portuguese="Prazos Realistas"
          >
            <p className="text-[15px] leading-relaxed text-[#374151]">
              Be honest with yourself about how long this takes. Language
              learning is a marathon, not a sprint. Portuguese is classified as
              a Category I language for English speakers — relatively close to
              English — but that still means hundreds of hours of exposure and
              practice.
            </p>
            <p className="text-[15px] leading-relaxed text-[#374151]">
              The numbers below are based on a mix of FSI estimates and
              experience from teachers and learners. They assume roughly thirty
              minutes of focused study per day plus some light immersion through
              listening and reading.
            </p>

            <Card padding="md" className="mt-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0F0F0]">
                      <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] text-[12px] uppercase tracking-wide">
                        Level
                      </th>
                      <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] text-[12px] uppercase tracking-wide">
                        Hours of Study
                      </th>
                      <th className="text-left px-3 py-2.5 font-semibold text-[#6B7280] text-[12px] uppercase tracking-wide">
                        Realistic Calendar Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#F0F0F0]">
                      <td className="px-3 py-2.5">
                        <CEFRBadge level="A1" />
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        60–100 hours
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        2–3 months (about 30 min/day)
                      </td>
                    </tr>
                    <tr className="border-b border-[#F0F0F0]">
                      <td className="px-3 py-2.5">
                        <CEFRBadge level="A2" />
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        150–200 hours
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        4–6 months (about 30 min/day)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5">
                        <CEFRBadge level="B1" />
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        300–400 hours
                      </td>
                      <td className="px-3 py-2.5 text-[#374151]">
                        8–14 months (about 30 min/day)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Card padding="md" variant="surface">
                <p className="text-[13px] font-semibold text-[#111827] mb-1">
                  At 3 months...
                </p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">
                  You handle basic greetings, order food, ask for directions,
                  and survive simple daily exchanges.
                </p>
              </Card>
              <Card padding="md" variant="surface">
                <p className="text-[13px] font-semibold text-[#111827] mb-1">
                  At 6 months...
                </p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">
                  You describe your routine, talk about the past, handle
                  shopping, and understand short texts and announcements.
                </p>
              </Card>
              <Card padding="md" variant="surface">
                <p className="text-[13px] font-semibold text-[#111827] mb-1">
                  At 12 months...
                </p>
                <p className="text-[13px] text-[#6B7280] leading-relaxed">
                  You follow conversations, watch TV, express opinions, and
                  feel genuinely at home in the language.
                </p>
              </Card>
            </div>

            <div className="space-y-3 mt-5">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                These estimates assume fairly consistent daily practice. They may
                be shorter if you already speak another Romance language or have
                experience learning foreign languages. They may be longer if
                Portuguese is your first serious language or if your schedule is
                chaotic.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151]">
                The most important factor is not talent — it is consistency.
                Fifteen minutes every single day beats two hours once a week.
                Brains learn through regular, repeated exposure. Your job is not
                to be perfect; your job is to keep showing up.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151]">
                Do not compare yourself to other learners you see online. Some
                have more free time, easier access to native speakers, or years of
                prior language study. Your only benchmark is whether you know more
                Portuguese this month than you did last month.
              </p>
            </div>
          </GuideSection>

          <Divider />

          {/* ━━━━━━━━━━━━━━━ Section 4: Daily Routine ━━━━━━━━━━━━━━━━━━━ */}
          <GuideSection
            id="daily-routine"
            number={4}
            title="Structuring Your Daily Routine"
            portuguese="Estruturar a Tua Rotina Diaria"
          >
            <p className="text-[15px] leading-relaxed text-[#374151]">
              A good routine does not need to be complicated. The goal is to
              attach Portuguese to things you already do — your morning coffee,
              your commute, the moment before you go to sleep. Once the habit is
              there, increasing the time is much easier.
            </p>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* 15-minute plan */}
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  <Badge color="text-[#6B7280] bg-[#F3F4F6]">15 min</Badge>
                  <p className="text-[15px] font-semibold text-[#1F2937]">
                    Minimum Effective Dose
                  </p>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
                  For busy days when you are tempted to skip entirely. Fifteen
                  minutes is enough to keep the connection to Portuguese alive.
                </p>
                <div className="space-y-1.5 text-sm text-[#374151]">
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Open Aula PT and read the Word, Verb, and Saying of the Day.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Review a vocabulary category, focusing on words you find
                    difficult.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Read one grammar topic or one culture entry and say the
                    example sentences out loud.
                  </p>
                </div>
              </Card>

              {/* 30-minute plan — featured */}
              <Card padding="lg" variant="featured">
                <div className="flex items-center gap-3 mb-3">
                  <Badge color="text-[#3C5E95] bg-blue-50">30 min</Badge>
                  <p className="text-[15px] font-semibold text-[#1F2937]">
                    Sweet Spot
                  </p>
                  <Badge color="text-emerald-700 bg-emerald-50" className="ml-auto">
                    Recommended
                  </Badge>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
                  This is the most sustainable routine for steady progress. It is
                  long enough to make real gains but short enough to fit around a
                  normal life.
                </p>
                <div className="space-y-1.5 text-sm text-[#374151]">
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Check the daily word, verb, and saying.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">10 min</span>{" "}
                    Work through a lesson or review a vocabulary category.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Study one grammar topic and answer the test questions at the
                    end.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Read a few false friends or etiquette tips to deepen your
                    cultural understanding.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Listen to a short piece of Portuguese audio: a song, podcast
                    clip, or news headline.
                  </p>
                </div>
              </Card>

              {/* 60-minute plan */}
              <Card padding="lg">
                <div className="flex items-center gap-3 mb-3">
                  <Badge color="text-[#6B7280] bg-[#F3F4F6]">60 min</Badge>
                  <p className="text-[15px] font-semibold text-[#1F2937]">
                    Accelerated
                  </p>
                </div>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
                  Use this when you are motivated or have more free time. It is a
                  powerful way to move through levels faster without burning out.
                </p>
                <div className="space-y-1.5 text-sm text-[#374151]">
                  <p>
                    <span className="font-semibold text-[#111827]">5 min</span>{" "}
                    Daily words and saying.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">15 min</span>{" "}
                    Work through a lesson, focusing on areas that challenge you.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">10 min</span>{" "}
                    Study a grammar topic in depth and redo the questions until
                    you are confident.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">10 min</span>{" "}
                    Explore a vocabulary category you have not studied yet.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">10 min</span>{" "}
                    Write five original sentences using today&apos;s new words.
                  </p>
                  <p>
                    <span className="font-semibold text-[#111827]">10 min</span>{" "}
                    Watch or listen to native content — a YouTube video, series
                    episode, or podcast segment.
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-3 mt-5">
              <p className="text-[15px] leading-relaxed text-[#374151]">
                Choose the routine that fits your current season of life. The
                fifteen-minute version is not a &quot;failure day&quot;; it is the
                foundation that keeps your Portuguese alive until you can do
                more. As the language becomes more familiar and rewarding, you
                will naturally find yourself stretching into the longer versions.
              </p>
              <p className="text-[15px] leading-relaxed text-[#374151]">
                Over a week, you can keep things simple: from Monday to Friday,
                follow one of the daily plans above. On Saturday, spend a short
                session going back over the words you find most difficult. On
                Sunday, give yourself an immersion day: watch a Portuguese film,
                cook a Portuguese recipe, or walk around town listening to
                Portuguese music.
              </p>
            </div>
          </GuideSection>

          <Divider />

          {/* ━━━━━━━━━━━━━━━ Section 5: Science of Learning ━━━━━━━━━━━━━ */}
          <GuideSection
            id="science-of-learning"
            number={5}
            title="The Science of Learning"
            portuguese="A Ciencia da Aprendizagem"
          >
            <p className="text-[15px] leading-relaxed text-[#374151]">
              Understanding how your brain stores new information will make you
              far more efficient. Most learners spend a lot of time on
              activities that feel productive — reading lists, highlighting
              texts, re-watching videos — but do very little to build strong,
              usable memories.
            </p>
            <p className="text-[15px] leading-relaxed text-[#374151]">
              When you simply read a vocabulary list again and again, your brain
              recognises the words. Recognition feels familiar and safe, so you
              assume you are learning. But being able to recognise
              &quot;cozinha&quot; on a page is very different from being able to
              answer &quot;How do you say kitchen?&quot; in real time.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card
                padding="lg"
                className="!bg-emerald-50 !border-emerald-100"
              >
                <p className="text-[14px] font-semibold text-emerald-800 mb-2">
                  Active Recall
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  Active recall means deliberately trying to remember something
                  before you look at the answer. Each time you do this, you
                  strengthen the pathways in your brain that store that piece of
                  information. Even when you fail, the act of trying makes the
                  next exposure more effective.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  The same principle applies when you pause a video and try to
                  repeat what you heard, or when you cover the translation of
                  the Word of the Day and see if you can recall it first.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  In Aula PT, say the answer out loud before revealing it, and
                  take grammar tests before you feel &quot;ready&quot;. Struggle
                  is not a sign that you are failing — it is the engine that
                  drives learning.
                </p>
              </Card>

              <Card padding="lg" className="!bg-blue-50 !border-blue-100">
                <p className="text-[14px] font-semibold text-blue-800 mb-2">
                  Spaced Repetition
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  Your memory follows a forgetting curve: new material fades
                  quickly at first, then more slowly over time. The most efficient
                  moment to review something is right before you would forget it,
                  not immediately afterwards and not months later.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  In practice, this means revisiting new words the same day you
                  learn them, again the next day, then after a few days, then a
                  week, then a month. Each well-timed review flattens the
                  forgetting curve.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  Aula PT already nudges you in this direction: lessons are
                  designed to be repeated, and revisiting weak areas over time
                  gives you a simple, practical form of spaced repetition.
                </p>
              </Card>
            </div>

            <Card
              padding="lg"
              className="!bg-red-50 !border-red-100 mt-4"
            >
              <p className="text-[14px] font-semibold text-red-700 mb-2">
                What to Avoid
              </p>
              <p className="text-sm text-[#374151] leading-relaxed">
                Purely passive activities feel comfortable but do not move you
                forward very quickly. Reading vocabulary lists without ever
                testing yourself, watching TV in Portuguese while scrolling on
                your phone, or re-reading grammar explanations without applying
                them in sentences all create a pleasant illusion of progress.
              </p>
              <p className="text-sm text-[#374151] leading-relaxed mt-2">
                A simple rule of thumb is this: if it feels completely easy, you
                are probably not learning very much. Lean gently into tasks that
                make you think and that you occasionally get wrong. That is where
                the real growth happens.
              </p>
            </Card>
          </GuideSection>

          <Divider />

          {/* ━━━━━━━━━━━━━━━ Section 6: Portuguese Tips ━━━━━━━━━━━━━━━━━ */}
          <GuideSection
            id="portuguese-tips"
            number={6}
            title="Tips for Portuguese Specifically"
            portuguese="Dicas para o Portugues"
          >
            <div className="space-y-4">
              {/* Pronunciation */}
              <Card padding="lg">
                <p className="text-[15px] font-semibold text-[#111827] mb-2">
                  Pronunciation is Your Biggest Challenge
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  European Portuguese has a reputation for being &quot;the mumbled
                  cousin&quot; of the Romance languages. That reputation comes
                  from its pronunciation: reduced vowels, nasal sounds, and
                  consonant clusters that do not match how the words look on the
                  page.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  The good news is that this is a physical skill as much as a
                  mental one. Your mouth, tongue, and jaw need new movements, and
                  those are trained through repetition, not through reading rules.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  Pay particular attention to unstressed vowels:{" "}
                  <span className="font-semibold">o</span> often sounds like
                  &quot;oo&quot;, and{" "}
                  <span className="font-semibold">e</span> can almost disappear.
                  Word-final <span className="font-semibold">s</span> often
                  sounds like &quot;sh&quot; ({"\u201C"}portugues{"\u201D"}{" "}
                  {"\u2192"} poor-too-GESH),{" "}
                  <span className="font-semibold">lh</span> sounds like the
                  &quot;lli&quot; in &quot;million&quot; ({"\u201C"}trabalho
                  {"\u201D"} {"\u2192"} truh-BAH-lyoo), and{" "}
                  <span className="font-semibold">nh</span> is the &quot;ny&quot;
                  sound in &quot;canyon&quot; ({"\u201C"}amanha{"\u201D"}{" "}
                  {"\u2192"} uh-mah-NYAH).
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  Use the pronunciation buttons throughout Aula PT. Say the word
                  out loud, not just in your head, and do not be afraid to
                  exaggerate the sounds at first. You are teaching your muscles a
                  new pattern.
                </p>
              </Card>

              {/* Verbs */}
              <Card padding="lg">
                <p className="text-[15px] font-semibold text-[#111827] mb-2">
                  The Verb Problem
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  Portuguese verbs can feel intimidating: six persons multiplied
                  by several tenses means dozens of forms per verb. The key is to
                  accept that you do not need all of them immediately.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  Start by mastering{" "}
                  <span className="font-semibold">Presente</span> and{" "}
                  <span className="font-semibold">Preterito Perfeito</span>.
                  Those two tenses let you talk about what you do and what you did
                  — a huge percentage of everyday conversation. Once they feel
                  solid, you can layer in the{" "}
                  <span className="font-semibold">Preterito Imperfeito</span> for
                  background descriptions, then future forms and conditionals, and
                  finally the subjunctive at B1.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  When looking at conjugation tables in Aula PT, resist the urge
                  to memorise everything at once. Focus instead on accuracy with
                  the most common persons (eu, tu, ele/ela, nos) in the most
                  common tenses, and let the rest grow over time.
                </p>
              </Card>

              {/* Confusing pairs */}
              <Card padding="lg">
                <p className="text-[15px] font-semibold text-[#111827] mb-2">
                  Confusing Pairs to Watch
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  Every language has traps, and Portuguese is no exception. The
                  classic one is <span className="font-semibold">ser</span> vs{" "}
                  <span className="font-semibold">estar</span>. A simple rule:
                  things that define you or are unlikely to change soon use{" "}
                  <span className="font-semibold">ser</span> (sou portugues, sou
                  engenheiro). Temporary states and locations use{" "}
                  <span className="font-semibold">estar</span> (estou cansado,
                  estou em casa).
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  Other pairs to keep an eye on are{" "}
                  <span className="font-semibold">saber</span> vs{" "}
                  <span className="font-semibold">conhecer</span> (to know facts
                  vs to be familiar with people or places),{" "}
                  <span className="font-semibold">por</span> vs{" "}
                  <span className="font-semibold">para</span>, and{" "}
                  <span className="font-semibold">ir</span> vs{" "}
                  <span className="font-semibold">vir</span>. The grammar section
                  in Aula PT has dedicated topics for these — use them, then
                  notice the same patterns appearing in vocabulary examples and
                  culture entries.
                </p>
              </Card>

              {/* Immersion */}
              <Card padding="lg">
                <p className="text-[15px] font-semibold text-[#111827] mb-2">
                  Building Immersion from Home
                </p>
                <p className="text-sm text-[#374151] leading-relaxed">
                  You do not need to live in Lisbon or Porto to surround yourself
                  with Portuguese. You can change your phone&apos;s language,
                  follow Portuguese creators on social media, listen to local
                  radio stations, and watch series with Portuguese subtitles.
                </p>
                <p className="text-sm text-[#374151] leading-relaxed mt-2">
                  The goal is not to understand every word from day one. The goal
                  is to make the sound and rhythm of Portuguese feel normal in
                  your brain. First you catch isolated words, then short phrases,
                  then whole sentences, and one day you realise you just
                  understood a full conversation without translating it in your
                  head.
                </p>
              </Card>
            </div>
          </GuideSection>
        </div>

        {/* ── Closing CTA ─────────────────────────────────────────── */}
        <Divider className="mt-16" />
        <section className="pb-8 mb-4 text-center mt-10">
          <p className="text-[15px] font-medium text-[#111827]">
            You&apos;re ready.
          </p>
          <p className="text-[15px] text-[#6B7280] mt-2 max-w-md mx-auto">
            The best time to start was yesterday. The second best time is now.
            Open any section in the Library and begin.
          </p>
          <p className="text-[15px] text-[#3C5E95] italic mt-4">
            A lingua portuguesa esta a tua espera.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="/vocabulary" size="lg" className="min-w-[190px]">
              Start with Vocabulary {"\u2192"}
            </Button>
            <Button
              href="/lessons"
              size="lg"
              variant="secondary"
              className="min-w-[190px]"
            >
              Start Lessons {"\u2192"}
            </Button>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
