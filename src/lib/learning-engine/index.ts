export {
  // Types
  type ContentType,
  type CEFRLevel,
  type MasteryLevel,
  type MasteryRecord,
  type MasteryUpdate,
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
