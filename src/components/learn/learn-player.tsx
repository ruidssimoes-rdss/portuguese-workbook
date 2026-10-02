"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Lesson, VocabItem } from "@/data/lessons";
import type {
  GeneratedLesson,
  LearnItem,
  GrammarLearnData,
  VerbLearnData,
  CultureLearnData,
} from "@/lib/exercise-generator";
import type { SectionResult } from "@/lib/exercise-types";

import { LearnIntro } from "./learn-intro";
import { LearnResults } from "./learn-results";

// New section components (built from scratch for /learn)
import { VocabSectionNew } from "./sections/vocab-section";
import { ConjugationSectionNew } from "./sections/conjugation-section";
import { GrammarSectionNew } from "./sections/grammar-section";
import { FillBlankSectionNew } from "./sections/fill-blank-section";
import { TranslationSectionNew } from "./sections/translation-section";
import { SentenceBuildSectionNew } from "./sections/sentence-build-section";
import { WordBankSectionNew } from "./sections/word-bank-section";
import { ErrorCorrectionSectionNew } from "./sections/error-correction-section";

// Learn phase components
import { VocabLearnCard } from "@/components/lessons/learn/vocab-learn-card";
import { GrammarLearn } from "@/components/lessons/learn/grammar-learn";
import { VerbLearn } from "@/components/lessons/learn/verb-learn";
import { CultureLearn } from "@/components/lessons/learn/culture-learn";

// ─── Section map ────────────────────────────────────────

const SECTION_MAP: Record<string, React.ComponentType<Record<string, unknown>>> = {
  vocab: VocabSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  conjugation: ConjugationSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  grammar: GrammarSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  "fill-blank": FillBlankSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  translation: TranslationSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  "sentence-build": SentenceBuildSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  "word-bank": WordBankSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
  "error-correction": ErrorCorrectionSectionNew as unknown as React.ComponentType<Record<string, unknown>>,
};

// ─── Types ──────────────────────────────────────────────

type PlayerState = "intro" | "learn" | "sections" | "results";

interface LearnPlayerProps {
  lesson: Lesson;
  generated: GeneratedLesson;
  isReview: boolean;
  onComplete: (sectionResults: SectionResult[]) => void;
}

// ─── Player ─────────────────────────────────────────────

export function LearnPlayer({ lesson, generated, isReview, onComplete }: LearnPlayerProps) {
  const [state, setState] = useState<PlayerState>("intro");
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [learnIndex, setLearnIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);

  const totalSections = generated.sections.length;
  const learnItems = generated.learnItems ?? [];
  const learnTotal = learnItems.length;

  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);
  const accuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  const passed = accuracy >= 80;

  // ─── Handlers ───────────────────────────────────────

  function handleStartExercises() {
    setState("sections");
    setCurrentSection(0);
    (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReviewFirst() {
    setState("learn");
    setLearnIndex(0);
    (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLearnNext() {
    if (learnIndex < learnTotal - 1) {
      setLearnIndex((i) => i + 1);
    } else {
      setState("sections");
      setCurrentSection(0);
    }
    (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLearnPrev() {
    if (learnIndex > 0) setLearnIndex((i) => i - 1);
    (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleSectionComplete = useCallback(
    (result: SectionResult) => {
      const newResults = [...sectionResults, result];
      setSectionResults(newResults);

      const next = currentSection + 1;
      if (next >= totalSections) {
        onComplete(newResults);
        setState("results");
      } else {
        setCurrentSection(next);
      }
      (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
    },
    [sectionResults, currentSection, totalSections, onComplete]
  );

  function handleRetry() {
    setAttempt((a) => a + 1);
    setSectionResults([]);
    setCurrentSection(0);
    setState("sections");
    (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Render ─────────────────────────────────────────

  // Intro
  if (state === "intro") {
    return (
      <LearnIntro
        lessonTitle={lesson.title}
        lessonTitlePt={lesson.ptTitle}
        cefr={lesson.cefr}
        isReview={isReview}
        generated={generated}
        onStartExercises={handleStartExercises}
        onReviewFirst={handleReviewFirst}
      />
    );
  }

  // Results
  if (state === "results") {
    return (
      <LearnResults
        passed={passed}
        accuracy={accuracy}
        sectionResults={sectionResults}
        onRetry={handleRetry}
      />
    );
  }

  // Learn phase + sections share one frame: header, progress, body.
  const learnItem = state === "learn" ? learnItems[learnIndex] : undefined;
  const section = state === "sections" ? generated.sections[currentSection] : undefined;
  const Component = section ? SECTION_MAP[section.key] : undefined;
  if (!learnItem && !(section && Component)) return null;

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-4 flex items-center gap-2 text-[12px]">
        <Link href="/lessons" className="text-aula-text-3 transition-colors hover:text-aula-text">
          Lições
        </Link>
        <span className="text-aula-text-4">/</span>
        <span className="text-aula-text-2">{isReview ? "Revisão" : `Lição ${lesson.cefr}`}</span>
        <span className="flex-1" />
        <span className="text-aula-text-3">
          {learnItem ? `Matéria · ${learnIndex + 1} de ${learnTotal}` : `Secção ${currentSection + 1} de ${totalSections}`}
        </span>
      </div>

      {/* One segment per section; the learn phase fills the first track. */}
      <div className="mb-7 flex gap-1">
        {learnItem ? (
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-aula-line">
            <div className="h-full rounded-full bg-aula-accent transition-all duration-300" style={{ width: `${((learnIndex + 1) / learnTotal) * 100}%` }} />
          </div>
        ) : (
          generated.sections.map((s, i) => {
            const done = sectionResults[i];
            const pct = done && done.totalQuestions ? done.totalCorrect / done.totalQuestions : 0;
            return (
              <div
                key={i}
                title={s.namePt}
                className={`h-1 flex-1 rounded-full ${
                  done ? (pct >= 0.8 ? "bg-[#1F7A68]" : "bg-[#5B45B8]") : i === currentSection ? "bg-aula-accent" : "bg-aula-line"
                }`}
              />
            );
          })
        )}
      </div>

      {learnItem ? (
        <>
          <LearnItemRenderer item={learnItem} />
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLearnPrev}
              disabled={learnIndex === 0}
              className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={handleLearnNext}
              className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
            >
              {learnIndex < learnTotal - 1 ? "Seguinte →" : "Começar exercícios →"}
            </button>
          </div>
        </>
      ) : (
        section &&
        Component && (
          <>
            <div className="mb-3 flex items-baseline gap-2.5">
              <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-aula-text">{section.namePt}</h1>
              <span className="text-[12px] text-aula-text-3">
                {section.totalQuestions} {section.totalQuestions === 1 ? "pergunta" : "perguntas"}
              </span>
            </div>
            <div className="rounded-xl border border-aula-border bg-white px-6 pt-3">
              <Component
                key={`section-${currentSection}-${attempt}`}
                sectionIndex={currentSection}
                totalSections={totalSections}
                showEnglish={lesson.cefr === "A1" || lesson.cefr === "A2"}
                onComplete={handleSectionComplete}
                {...(section.data as Record<string, unknown>)}
              />
            </div>
          </>
        )
      )}
    </div>
  );
}

// ─── Learn item renderer ────────────────────────────────

function LearnItemRenderer({ item }: { item: LearnItem }) {
  switch (item.type) {
    case "vocab":
      const v = item.data as VocabItem;
      return <VocabLearnCard word={v.word} translation={v.translation} pronunciation={v.pronunciation} example={v.example} />;
    case "grammar":
      return <GrammarLearn data={item.data as GrammarLearnData} />;
    case "verb":
      return <VerbLearn data={item.data as VerbLearnData} />;
    case "culture":
      return <CultureLearn data={item.data as CultureLearnData} />;
    default:
      return null;
  }
}
