"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Lesson, VocabItem } from "@/data/lessons";
import type {
  GeneratedLesson,
  GeneratedSection,
  LearnItem,
  GrammarLearnData,
  VerbLearnData,
  CultureLearnData,
} from "@/lib/exercise-generator";
import type { SectionResult } from "@/lib/exercise-types";

import { LearnIntro } from "./learn-intro";
import { LearnProgress } from "./learn-progress";
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

  const totalSections = generated.sections.length;
  const totalPoints = generated.totalPoints;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReviewFirst() {
    setState("learn");
    setLearnIndex(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLearnNext() {
    if (learnIndex < learnTotal - 1) {
      setLearnIndex((i) => i + 1);
    } else {
      setState("sections");
      setCurrentSection(0);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLearnPrev() {
    if (learnIndex > 0) setLearnIndex((i) => i - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [sectionResults, currentSection, totalSections, onComplete]
  );

  function handleRetry() {
    setSectionResults([]);
    setCurrentSection(0);
    setState("sections");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ─── Progress ───────────────────────────────────────

  const sectionProgress =
    state === "learn"
      ? ((learnIndex + 1) / learnTotal) * 100
      : state === "sections"
        ? ((currentSection + 1) / totalSections) * 100
        : 0;

  const progressLabel =
    state === "learn"
      ? `${learnIndex + 1} / ${learnTotal}`
      : state === "sections"
        ? `Secção ${currentSection + 1} de ${totalSections}`
        : "";

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

  // Learn phase
  if (state === "learn" && learnItems[learnIndex]) {
    const item = learnItems[learnIndex];
    return (
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 mb-2">
          <Link href="/lessons" className="text-[13px] text-[#9B9DA3] hover:text-[#6C6B71] transition-colors">
            ← Lições
          </Link>
          <span className="text-[13px] text-[#6C6B71] font-medium">Learn</span>
        </div>

        <LearnProgress
          current={learnIndex + 1}
          total={learnTotal}
          cefr={lesson.cefr}
          label={`${learnIndex + 1} / ${learnTotal}`}
        />

        <div className="max-w-2xl mx-auto">
          <LearnItemRenderer item={item} />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t-[0.5px] border-[rgba(0,0,0,0.06)]">
            <button
              type="button"
              onClick={handleLearnPrev}
              disabled={learnIndex === 0}
              className={`text-[13px] font-medium transition-colors ${
                learnIndex === 0
                  ? "text-[#9B9DA3] cursor-not-allowed"
                  : "text-[#6C6B71] hover:text-[#111111] cursor-pointer"
              }`}
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={handleLearnNext}
              className="px-4 py-2.5 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
            >
              {learnIndex < learnTotal - 1 ? "Próximo →" : "Começar exercícios →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Sections
  if (state === "sections" && generated.sections[currentSection]) {
    const section = generated.sections[currentSection];
    const Component = SECTION_MAP[section.key];
    if (!Component) return null;

    const questionsSoFar = generated.sections
      .slice(0, currentSection)
      .reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalQuestions = generated.totalPoints;
    const pct = totalQuestions > 0 ? ((questionsSoFar + 1) / totalQuestions) * 100 : 0;

    return (
      <div className="max-w-[600px] mx-auto border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-[10px] border-b-[0.5px] border-[rgba(0,0,0,0.06)]">
          <Link href="/lessons" className="text-[13px] text-[#6C6B71] hover:text-[#111111] transition-colors">
            ← Lessons
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#6C6B71]">{questionsSoFar + 1} / {totalQuestions}</span>
            <span className={`text-[10px] font-medium px-2 py-px rounded-full ${
              lesson.cefr === "A1" ? "text-[#0F6E56] bg-[#E1F5EE]" :
              lesson.cefr === "A2" ? "text-[#185FA5] bg-[#E6F1FB]" :
              "text-[#854F0B] bg-[#FAEEDA]"
            }`}>{lesson.cefr}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-[rgba(0,0,0,0.06)] mx-4 rounded-[2px]">
          <div className="h-[3px] bg-[#185FA5] rounded-[2px] transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        {/* Section header */}
        <div className="flex items-center gap-2 px-4 pt-[10px] pb-[6px]">
          <span className="text-[13px] font-medium text-[#111111]">{section.namePt}</span>
          <span className="text-[11px] text-[#9B9DA3]">{section.totalQuestions} questions</span>
        </div>

        {/* Section body */}
        <div className="px-4 pb-4">
          <Component
            key={`section-${currentSection}`}
            sectionIndex={currentSection}
            totalSections={totalSections}
            showEnglish={lesson.cefr === "A1" || lesson.cefr === "A2"}
            onComplete={handleSectionComplete}
            {...(section.data as Record<string, unknown>)}
          />
        </div>
      </div>
    );
  }

  return null;
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
