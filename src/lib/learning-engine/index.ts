export {
  // Types
  type ContentType,
  type CEFRLevel,
  type MasteryLevel,
  type MasteryRecord,
  type MasteryUpdate,
  type MasteryAnswer,
  type CEFRProgress,
  // Constants
  MASTERY_LABELS,
  // Core functions
  getUserMastery,
  getItemMastery,
  getMasteryLevel,
  getMasteryMap,
  // Calculation (pure)
  calculateMasteryUpdate,
  // Database operations
  updateItemMastery,
  batchUpdateMastery,
  // Aggregation
  getCEFRProgress,
  getDueForReview,
  getReviewCount,
} from "./mastery-tracker";

export {
  // Types
  type PoolVocabItem,
  type PoolVerbItem,
  type PoolGrammarItem,
  // Pool accessors
  getVocabPool,
  getVerbPool,
  getGrammarPool,
  getContentTotals,
  getAllContentTotals,
  // Frequency
  isHighFrequency,
} from "./content-pool";

export {
  // Types
  type GeneratedLesson,
  type PracticeItem,
  // Generator
  generateLesson,
} from "./lesson-generator";

export { buildMasteryAnswers } from "./mastery-answers";

export {
  applySm2,
  deriveMasteryLevel,
  type Sm2State,
  type Sm2Result,
} from "./sm2";

export {
  selectReviewCandidates,
  REVIEW_SESSION_MAX,
  type ReviewCandidate,
} from "./review-selector";

export {
  // Types
  type ReviewSession,
  type ReviewItem,
  type ReviewReason,
  // Generator
  generateReviewSession,
} from "./review-generator";

export {
  // Constants
  READINESS_THRESHOLD,
  // Functions
  isCEFRUnlocked,
  getFullProgression,
  getCurrentStudyLevel,
} from "./cefr-readiness";

export {
  // Adapters
  adaptGeneratedLesson,
  adaptReviewSession,
  type AdaptedLesson,
  type AdaptOptions,
} from "./lesson-adapter";
