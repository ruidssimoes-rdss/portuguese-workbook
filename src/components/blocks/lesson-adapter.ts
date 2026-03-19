/**
 * Lesson Adapter — converts existing Lesson objects into LessonBlockPlan format.
 * Uses the existing exercise generator (Option A) to produce exercises.
 */

import type { Lesson, VocabItem, VerbItem, GrammarItem, CultureItem } from "@/data/lessons";
import type {
  LessonBlockPlan,
  BlockDescriptor,
  ExerciseBlockType,
  ExerciseData,
  ExerciseDifficulty,
  VocabBlockData,
  VerbBlockData,
  GrammarBlockData,
  TranslateExerciseData,
  ConjugateExerciseData,
  FillGapExerciseData,
  BuildSentenceExerciseData,
  ChooseCorrectExerciseData,
  SpotErrorExerciseData,
  SessionShellProps,
} from "@/types/blocks";
import { generateLessonExercises, type GeneratedSection } from "@/lib/exercise-generator";
import grammarData from "@/data/grammar.json";

const grammarDB = grammarData as { topics: Record<string, { titlePt?: string; rules?: Array<{ rule: string; rulePt: string; examples: Array<{ pt: string; en: string }> }>; tips?: string[]; tipsPt?: string[] }> };

const TENSE_LABELS: Record<string, string> = {
  Present: "Presente",
  Preterite: "Pretérito Perfeito",
  Imperfect: "Pretérito Imperfeito",
  Future: "Futuro",
  Conditional: "Condicional",
  "Present Subjunctive": "Presente do Conjuntivo",
};

function getDifficultyFromLesson(lesson: Lesson): ExerciseDifficulty {
  if (lesson.cefr === "A1" && lesson.order <= 6) return "foundation";
  if (lesson.cefr === "A1" || (lesson.cefr === "A2" && lesson.order <= 24)) return "developing";
  return "confident";
}

// ── Learn blocks ──────────────────────────────────────────

function vocabToBlock(item: VocabItem): BlockDescriptor {
  const data: VocabBlockData = { ...item };
  return { type: "vocab", data, variant: "card" };
}

function verbToBlock(item: VerbItem): BlockDescriptor {
  const data: VerbBlockData = {
    verb: item.verb,
    verbTranslation: item.verbTranslation,
    tense: item.tense,
    tenseLabel: TENSE_LABELS[item.tense] ?? item.tense,
    conjugations: item.conjugations,
    verbSlug: item.verbSlug,
  };
  return { type: "verb", data, variant: "expanded" };
}

function grammarToBlock(item: GrammarItem): BlockDescriptor {
  const topic = grammarDB.topics[item.topicSlug];
  const data: GrammarBlockData = {
    topicSlug: item.topicSlug,
    topicTitle: item.topicTitle,
    topicTitlePt: topic?.titlePt ?? item.topicTitle,
    rules: topic?.rules ?? [{ rule: item.rule, rulePt: item.rulePt, examples: item.examples }],
    tips: topic?.tips,
    tipsPt: topic?.tipsPt,
  };
  return { type: "grammar", data, variant: "expanded" };
}

function cultureToBlock(item: CultureItem): BlockDescriptor {
  // Temporary mapping: culture → vocab card shape
  const data: VocabBlockData = {
    id: item.id,
    word: item.expression,
    translation: item.meaning,
    pronunciation: "",
    example: { pt: item.literal, en: item.tip },
  };
  return { type: "vocab", data, variant: "card" };
}

function buildLearnBlocks(lesson: Lesson): BlockDescriptor[] {
  const blocks: BlockDescriptor[] = [];
  for (const stage of lesson.stages) {
    if (stage.type === "vocabulary" && stage.items) {
      blocks.push(...stage.items.map(vocabToBlock));
    } else if (stage.type === "verb" && stage.verbs) {
      blocks.push(...stage.verbs.map(verbToBlock));
    } else if (stage.type === "grammar" && stage.grammarItems) {
      blocks.push(...stage.grammarItems.map(grammarToBlock));
    } else if (stage.type === "culture" && stage.cultureItems) {
      blocks.push(...stage.cultureItems.map(cultureToBlock));
    }
  }
  return blocks;
}

// ── Exercise blocks ────────────────────────────────────────

function mapSectionToExercises(
  section: GeneratedSection,
): Array<{ type: ExerciseBlockType; data: ExerciseData }> {
  const results: Array<{ type: ExerciseBlockType; data: ExerciseData }> = [];
  const d = section.data;

  switch (section.key) {
    case "vocab": {
      const questions = d.questions as Array<{
        type: "mc" | "type-answer";
        portugueseWord: string;
        englishWord: string;
        pronunciation?: string;
        options?: string[];
        correctIndex?: number;
        acceptedAnswers?: string[];
      }>;
      for (const q of questions ?? []) {
        if (q.type === "mc" && q.options && q.correctIndex !== undefined) {
          const data: ChooseCorrectExerciseData = {
            exerciseType: "choose-correct",
            question: `What does "${q.portugueseWord}" mean?`,
            options: q.options,
            correctIndex: q.correctIndex,
          };
          results.push({ type: "exercise-choose-correct", data });
        } else {
          const data: TranslateExerciseData = {
            exerciseType: "translate",
            word: q.portugueseWord,
            correctAnswer: q.englishWord,
            acceptedAnswers: q.acceptedAnswers ?? [q.englishWord],
            pronunciation: q.pronunciation,
            direction: "pt-to-en",
          };
          results.push({ type: "exercise-translate", data });
        }
      }
      break;
    }

    case "conjugation": {
      const verbs = d.verbs as Array<{
        verb: string;
        verbTranslation: string;
        tense: string;
        conjugations: Array<{ pronoun: string; form: string }>;
      }>;
      for (const v of verbs ?? []) {
        for (const c of (v.conjugations ?? [])) {
          const data: ConjugateExerciseData = {
            exerciseType: "conjugate",
            verb: v.verb,
            verbTranslation: v.verbTranslation,
            pronoun: c.pronoun,
            tense: v.tense,
            tenseLabel: TENSE_LABELS[v.tense] ?? v.tense,
            correctForm: c.form,
          };
          results.push({ type: "exercise-conjugate", data });
        }
      }
      break;
    }

    case "fill-blank": {
      const sentences = d.sentences as Array<{
        sentence: string;
        answer: string;
        fullSentence: string;
        translation: string;
        acceptedAnswers: string[];
      }>;
      for (const s of sentences ?? []) {
        const data: FillGapExerciseData = {
          exerciseType: "fill-gap",
          sentence: s.sentence,
          correctAnswer: s.answer,
          acceptedAnswers: s.acceptedAnswers ?? [s.answer],
          fullSentence: s.fullSentence,
          translation: s.translation,
        };
        results.push({ type: "exercise-fill-gap", data });
      }
      break;
    }

    case "sentence-build": {
      const sentences = d.sentences as Array<{
        correctOrder: string[];
        scrambled: string[];
        translation: string;
      }>;
      for (const s of sentences ?? []) {
        const data: BuildSentenceExerciseData = {
          exerciseType: "build-sentence",
          correctOrder: s.correctOrder,
          scrambledWords: s.scrambled,
          translation: s.translation,
        };
        results.push({ type: "exercise-build-sentence", data });
      }
      break;
    }

    case "grammar": {
      const questions = d.questions as Array<{
        type: string;
        question?: string;
        statement?: string;
        options?: string[];
        correctIndex?: number;
        correctAnswer?: string | boolean;
      }>;
      for (const q of questions ?? []) {
        if (q.options && q.correctIndex !== undefined) {
          const data: ChooseCorrectExerciseData = {
            exerciseType: "choose-correct",
            question: q.question ?? q.statement ?? "",
            options: q.options,
            correctIndex: q.correctIndex,
          };
          results.push({ type: "exercise-choose-correct", data });
        }
      }
      break;
    }

    case "translation": {
      const items = d.items as Array<{
        source: string;
        target: string;
        direction: string;
        acceptedAnswers: string[];
        pronunciation?: string;
      }>;
      for (const item of items ?? []) {
        const data: TranslateExerciseData = {
          exerciseType: "translate",
          word: item.source,
          correctAnswer: item.target,
          acceptedAnswers: item.acceptedAnswers ?? [item.target],
          pronunciation: item.pronunciation,
          direction: item.direction === "en-to-pt" ? "en-to-pt" : "pt-to-en",
        };
        results.push({ type: "exercise-translate", data });
      }
      break;
    }

    case "error-correction": {
      const sentences = d.sentences as Array<{
        errorSentence: string;
        errorWord: string;
        correctWord: string;
        correctedSentence: string;
      }>;
      for (const s of sentences ?? []) {
        const data: SpotErrorExerciseData = {
          exerciseType: "spot-error",
          sentence: s.errorSentence,
          errorWord: s.errorWord,
          correctWord: s.correctWord,
          correctedSentence: s.correctedSentence,
        };
        results.push({ type: "exercise-spot-error", data });
      }
      break;
    }

    // word-bank → choose-correct as fallback
    case "word-bank": {
      const sentences = d.sentences as Array<{
        sentence: string;
        blanks: Array<{ answer: string; options: string[] }>;
      }>;
      for (const s of sentences ?? []) {
        for (const blank of s.blanks ?? []) {
          const options = blank.options ?? [blank.answer];
          const correctIdx = options.indexOf(blank.answer);
          const data: ChooseCorrectExerciseData = {
            exerciseType: "choose-correct",
            question: `Fill in: "${s.sentence}"`,
            options,
            correctIndex: correctIdx >= 0 ? correctIdx : 0,
          };
          results.push({ type: "exercise-choose-correct", data });
        }
      }
      break;
    }
  }

  return results;
}

// ── Main adapter ──────────────────────────────────────────

export function adaptLessonToBlocks(lesson: Lesson): LessonBlockPlan {
  const showEnglish = lesson.cefr === "A1" || lesson.cefr === "A2";
  const generated = generateLessonExercises(lesson, showEnglish);

  const learnBlocks = buildLearnBlocks(lesson);

  const exerciseBlocks: Array<{ type: ExerciseBlockType; data: ExerciseData }> = [];
  for (const section of generated.sections) {
    exerciseBlocks.push(...mapSectionToExercises(section));
  }

  const stages: SessionShellProps["stages"] = [
    { id: "learn", label: "Learn", type: "learn" },
    { id: "practice", label: "Practice", type: "exercise" },
    { id: "results", label: "Results", type: "results" },
  ];

  return {
    meta: {
      id: lesson.id,
      title: lesson.title,
      ptTitle: lesson.ptTitle,
      cefr: lesson.cefr,
      estimatedMinutes: lesson.estimatedMinutes,
    },
    learnBlocks,
    exerciseBlocks,
    stages,
  };
}

export { getDifficultyFromLesson };
