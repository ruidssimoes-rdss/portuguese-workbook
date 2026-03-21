"use client";

import type { BlockDescriptor, AnswerResult, ExerciseDifficulty } from "@/types/blocks";

import { VocabBlock, VerbBlock, GrammarBlock, ProgressBlock, ExplanationBlock, PronunciationBlock } from "./content";
import {
  TranslateExercise, ConjugateExercise, FillGapExercise,
  BuildSentenceExercise, ChooseCorrectExercise, SpotErrorExercise,
  ListenWriteExercise, MatchPairsExercise, SpeakExercise,
} from "./exercises";

interface BlockRendererProps {
  descriptor: BlockDescriptor;
  className?: string;
  exerciseProps?: {
    onAnswer: (result: AnswerResult) => void;
    difficulty: ExerciseDifficulty;
    showEnglish: boolean;
  };
}

export function BlockRenderer({ descriptor, className, exerciseProps }: BlockRendererProps) {
  switch (descriptor.type) {
    // Content blocks
    case "vocab":
      return <VocabBlock data={descriptor.data} variant={descriptor.variant} className={className} />;
    case "verb":
      return <VerbBlock data={descriptor.data} variant={descriptor.variant} className={className} />;
    case "grammar":
      return <GrammarBlock data={descriptor.data} variant={descriptor.variant} className={className} />;
    case "progress":
      return <ProgressBlock data={descriptor.data} variant={descriptor.variant} className={className} />;
    case "explanation":
      return <ExplanationBlock data={descriptor.data} variant={descriptor.variant} className={className} />;
    case "pronunciation":
      return <PronunciationBlock data={descriptor.data} variant={descriptor.variant} className={className} />;

    // Exercise blocks
    case "exercise-translate":
      return exerciseProps ? <TranslateExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-conjugate":
      return exerciseProps ? <ConjugateExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-fill-gap":
      return exerciseProps ? <FillGapExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-build-sentence":
      return exerciseProps ? <BuildSentenceExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-choose-correct":
      return exerciseProps ? <ChooseCorrectExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-spot-error":
      return exerciseProps ? <SpotErrorExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-listen-write":
      return exerciseProps ? <ListenWriteExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-match-pairs":
      return exerciseProps ? <MatchPairsExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;
    case "exercise-speak":
      return exerciseProps ? <SpeakExercise data={descriptor.data as never} {...exerciseProps} className={className} /> : null;

    default:
      console.warn(`Unknown block type: ${(descriptor as { type: string }).type}`);
      return (
        <div className="p-4 border border-dashed border-[rgba(0,0,0,0.06)] rounded-lg text-[13px] text-[#9B9DA3]">
          Unknown block: {(descriptor as { type: string }).type}
        </div>
      );
  }
}
