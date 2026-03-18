/**
 * Plan-to-Blocks Adapter — converts an AISessionPlan into a LessonBlockPlan
 * by resolving content IDs against actual JSON data.
 *
 * The AI never generates Portuguese text. It only selects content keys.
 * This adapter resolves those keys to real VocabItem, VerbItem, etc. objects
 * and generates exercises from the resolved content.
 */

import type { AISessionPlan } from "./types";
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
  ChooseCorrectExerciseData,
  MatchPairsExerciseData,
  SessionShellProps,
} from "@/types/blocks";
import type { VocabItem, VerbItem, GrammarItem, CultureItem } from "@/data/lessons";
import { getVocabItems, getVerbItems, getGrammarItems, getCultureItems, getGrammarTopicData } from "./content-index";

const TENSE_LABELS: Record<string, string> = {
  Present: "Presente",
  Preterite: "Pretérito Perfeito",
  Imperfect: "Pretérito Imperfeito",
  Future: "Futuro",
  Conditional: "Condicional",
  "Present Subjunctive": "Presente do Conjuntivo",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function levelFromDifficulty(d: string): "A1" | "A2" | "B1" {
  if (d === "foundation") return "A1";
  if (d === "developing") return "A2";
  return "B1";
}

// ── Learn blocks ──────────────────────────────────────────

function vocabToLearnBlock(item: VocabItem): BlockDescriptor {
  const data: VocabBlockData = { ...item };
  return { type: "vocab", data, variant: "card" };
}

function verbToLearnBlock(item: VerbItem): BlockDescriptor {
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

function grammarToLearnBlock(item: GrammarItem): BlockDescriptor {
  const topic = getGrammarTopicData(item.topicSlug);
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

function cultureToLearnBlock(item: CultureItem): BlockDescriptor {
  const data: VocabBlockData = {
    id: item.id,
    word: item.expression,
    translation: item.meaning,
    pronunciation: "",
    example: { pt: item.literal, en: item.tip },
  };
  return { type: "vocab", data, variant: "card" };
}

// ── Exercise generation from resolved content ─────────────

function generateExercisesFromContent(
  vocabItems: VocabItem[],
  verbItems: VerbItem[],
  grammarItems: GrammarItem[],
  difficulty: ExerciseDifficulty,
): Array<{ type: ExerciseBlockType; data: ExerciseData }> {
  const exercises: Array<{ type: ExerciseBlockType; data: ExerciseData }> = [];

  // Vocab → translate exercises
  for (const item of vocabItems) {
    const data: TranslateExerciseData = {
      exerciseType: "translate",
      word: item.word,
      correctAnswer: item.translation,
      acceptedAnswers: [item.translation],
      pronunciation: item.pronunciation,
      direction: "pt-to-en",
    };
    exercises.push({ type: "exercise-translate", data });
  }

  // Vocab → choose-correct (subset, use other vocab as distractors)
  if (vocabItems.length >= 3) {
    const mcItems = vocabItems.slice(0, Math.min(4, vocabItems.length));
    for (const item of mcItems) {
      const distractors = vocabItems
        .filter((v) => v.id !== item.id)
        .map((v) => v.translation)
        .slice(0, 3);
      if (distractors.length < 2) continue;
      const options = shuffle([item.translation, ...distractors]);
      const data: ChooseCorrectExerciseData = {
        exerciseType: "choose-correct",
        question: `What does "${item.word}" mean?`,
        options,
        correctIndex: options.indexOf(item.translation),
      };
      exercises.push({ type: "exercise-choose-correct", data });
    }
  }

  // Vocab → match pairs (if 4+ items)
  if (vocabItems.length >= 4) {
    const pairs = vocabItems.slice(0, Math.min(5, vocabItems.length)).map((v) => ({
      left: v.word,
      right: v.translation,
    }));
    const data: MatchPairsExerciseData = {
      exerciseType: "match-pairs",
      pairs,
    };
    exercises.push({ type: "exercise-match-pairs", data });
  }

  // Verbs → conjugate exercises (pick pronouns based on difficulty)
  for (const item of verbItems) {
    const pronounsToUse =
      difficulty === "foundation"
        ? ["eu", "ele/ela", "eles/elas"]
        : difficulty === "developing"
          ? ["eu", "tu", "ele/ela", "nós", "eles/elas"]
          : item.conjugations.map((c) => c.pronoun);

    for (const c of item.conjugations) {
      if (!pronounsToUse.includes(c.pronoun)) continue;
      const data: ConjugateExerciseData = {
        exerciseType: "conjugate",
        verb: item.verb,
        verbTranslation: item.verbTranslation,
        pronoun: c.pronoun,
        tense: item.tense,
        tenseLabel: TENSE_LABELS[item.tense] ?? item.tense,
        correctForm: c.form,
      };
      exercises.push({ type: "exercise-conjugate", data });
    }
  }

  // Grammar → choose-correct from topic questions
  for (const item of grammarItems) {
    const topic = getGrammarTopicData(item.topicSlug);
    if (!topic?.questions) continue;

    for (const q of topic.questions.slice(0, 3)) {
      const qObj = q as Record<string, unknown>;
      const question = (qObj.questionText ?? qObj.question ?? "") as string;
      const options = qObj.options as string[] | undefined;
      const correctIdx = (qObj.correctIndex ?? qObj.correct ?? 0) as number;

      if (!question || !options || options.length < 2) continue;

      const data: ChooseCorrectExerciseData = {
        exerciseType: "choose-correct",
        question,
        options,
        correctIndex: correctIdx,
        explanation: (qObj.explanation as string) ?? undefined,
      };
      exercises.push({ type: "exercise-choose-correct", data });
    }

    // Grammar → fill-gap from examples
    if (topic.rules) {
      for (const rule of topic.rules.slice(0, 2)) {
        for (const ex of (rule.examples ?? []).slice(0, 1)) {
          if (!ex.pt || ex.pt.split(/\s+/).length < 3) continue;
          const words = ex.pt.split(/\s+/);
          if (words.length < 3) continue;
          // Pick a word to blank out (not the first or last)
          const blankIdx = Math.min(1 + Math.floor(Math.random() * (words.length - 2)), words.length - 2);
          const answer = words[blankIdx];
          const sentence = words.map((w, i) => i === blankIdx ? "_____" : w).join(" ");

          const data: FillGapExerciseData = {
            exerciseType: "fill-gap",
            sentence,
            correctAnswer: answer,
            acceptedAnswers: [answer],
            fullSentence: ex.pt,
            translation: ex.en,
          };
          exercises.push({ type: "exercise-fill-gap", data });
        }
      }
    }
  }

  // Shuffle and cap at 20
  return shuffle(exercises).slice(0, 20);
}

// ── Main adapter ──────────────────────────────────────────

export function planToBlocks(plan: AISessionPlan): LessonBlockPlan {
  const difficulty: ExerciseDifficulty = plan.difficulty;
  const cefr = levelFromDifficulty(plan.difficulty);

  // Resolve content from focus areas
  const allVocab: VocabItem[] = [];
  const allVerbs: VerbItem[] = [];
  const allGrammar: GrammarItem[] = [];
  const allCulture: CultureItem[] = [];
  const learnBlocks: BlockDescriptor[] = [];

  for (const area of plan.focusAreas) {
    switch (area.type) {
      case "vocabulary": {
        const items = getVocabItems(
          area.vocabCategories ?? [],
          area.vocabCefr,
          area.vocabCount ?? 5,
        );
        allVocab.push(...items);
        learnBlocks.push(...items.map(vocabToLearnBlock));
        break;
      }
      case "verbs": {
        const items = getVerbItems(
          area.verbSlugs ?? [],
          area.verbTenses ?? ["Present"],
        );
        allVerbs.push(...items);
        learnBlocks.push(...items.map(verbToLearnBlock));
        break;
      }
      case "grammar": {
        const items = getGrammarItems(area.grammarTopicSlugs ?? []);
        allGrammar.push(...items);
        learnBlocks.push(...items.map(grammarToLearnBlock));
        break;
      }
      case "culture": {
        const items = getCultureItems(area.cultureCount ?? 3);
        allCulture.push(...items);
        learnBlocks.push(...items.map(cultureToLearnBlock));
        break;
      }
    }
  }

  // Generate exercises from resolved content
  const exerciseBlocks = generateExercisesFromContent(allVocab, allVerbs, allGrammar, difficulty);

  const stages: SessionShellProps["stages"] = [
    { id: "learn", label: "Learn", type: "learn" as const },
    { id: "practice", label: "Practice", type: "exercise" as const },
    { id: "results", label: "Results", type: "results" as const },
  ];

  return {
    meta: {
      id: `ai-${Date.now()}`,
      title: plan.sessionTitle,
      ptTitle: plan.sessionTitlePt,
      cefr,
      estimatedMinutes: plan.estimatedMinutes,
    },
    learnBlocks,
    exerciseBlocks,
    stages,
  };
}
