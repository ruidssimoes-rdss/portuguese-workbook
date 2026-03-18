// Content blocks
export { VocabBlock, VerbBlock, GrammarBlock, ProgressBlock, ExplanationBlock } from "./content";

// Exercise blocks
export {
  TranslateExercise, ConjugateExercise, FillGapExercise,
  BuildSentenceExercise, ChooseCorrectExercise, SpotErrorExercise,
  ListenWriteExercise, MatchPairsExercise,
  ExerciseChrome, ExerciseFeedback, checkAnswer,
} from "./exercises";

// Layout blocks
export { SessionShell, ContentGrid, LearnCarousel, ReviewStack } from "./layout";

// Renderer + Adapter
export { BlockRenderer } from "./block-renderer";
export { adaptLessonToBlocks } from "./lesson-adapter";
