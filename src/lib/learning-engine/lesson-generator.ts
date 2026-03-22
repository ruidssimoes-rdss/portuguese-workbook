/**
 * Learning Engine — Lesson Generator
 *
 * Dynamically assembles lessons from the content pool based on what the user
 * needs to learn next. Adaptive sizing and composition ratios shift as
 * readiness increases.
 */

import {
  getUserMastery,
  getMasteryMap,
  type MasteryRecord,
  type CEFRLevel,
  type ContentType,
} from "./mastery-tracker";

import {
  getVocabPool,
  getVerbPool,
  getGrammarPool,
  isHighFrequency,
  type PoolVocabItem,
  type PoolVerbItem,
  type PoolGrammarItem,
} from "./content-pool";

// ─── Types ──────────────────────────────────────────────

export interface GeneratedLesson {
  id: string;
  cefr: CEFRLevel;
  generatedAt: string;

  /** LEARN phase — exposure to new content (not scored) */
  learn: {
    vocab: PoolVocabItem[];
    verbs: PoolVerbItem[];
    grammar: PoolGrammarItem[];
  };

  /** PRACTICE phase — scored exercises */
  practice: {
    newContentItems: PracticeItem[];
    reviewItems: PracticeItem[];
    spotCheckItems: PracticeItem[];
    carryForwardItems: PracticeItem[];
  };

  /** Metadata */
  totalItems: number;
  newCount: number;
  reviewCount: number;
  spotCheckCount: number;
  carryForwardCount: number;
}

export interface PracticeItem {
  contentType: ContentType;
  contentId: string;
  contentCefr: CEFRLevel;
  contentCategory?: string;
  isHighFrequency: boolean;
  data: PoolVocabItem | PoolVerbItem | PoolGrammarItem;
}

interface GeneratorConfig {
  baseSize: number;
  minSize: number;
  maxSize: number;
  newContentRatio: number;
  reviewRatio: number;
  spotCheckRatio: number;
  maxCarryForward: number;
  maxSameCategory: number;
  maxSameGroup: number;
  includeCulture: boolean;
}

// ─── Default Config ─────────────────────────────────────

const DEFAULT_CONFIG: GeneratorConfig = {
  baseSize: 22,
  minSize: 18,
  maxSize: 28,
  newContentRatio: 0.55,
  reviewRatio: 0.35,
  spotCheckRatio: 0.1,
  maxCarryForward: 3,
  maxSameCategory: 3,
  maxSameGroup: 2,
  includeCulture: false,
};

// ─── Core Generator ─────────────────────────────────────

/**
 * Generate a lesson for a user at a given CEFR level.
 * Pure output — returns a GeneratedLesson object.
 */
export async function generateLesson(
  userId: string,
  cefr: CEFRLevel,
  recentPerformance?: { avgAccuracy: number; lessonCount: number }
): Promise<GeneratedLesson> {
  // 1. Load user mastery data
  const masteryMap = await getMasteryMap(userId);

  // 2. Calculate adaptive config
  const config = getAdaptiveConfig(masteryMap, cefr, recentPerformance);

  // 3. Calculate session size
  const sessionSize = getAdaptiveSize(config, recentPerformance);

  // 4. Calculate slot counts
  const newSlots = Math.round(sessionSize * config.newContentRatio);
  const reviewSlots = Math.round(sessionSize * config.reviewRatio);
  const spotCheckSlots = Math.round(sessionSize * config.spotCheckRatio);

  // 5. Select NEW content (unseen items)
  const newVocab = selectNewVocab(
    masteryMap,
    cefr,
    Math.ceil(newSlots * 0.6),
    config
  );
  const newVerbs = selectNewVerbs(
    masteryMap,
    cefr,
    Math.ceil(newSlots * 0.25),
    config
  );
  const newGrammar = selectNewGrammar(
    masteryMap,
    cefr,
    Math.ceil(newSlots * 0.15)
  );

  // 6. Select REVIEW content (due for re-testing)
  const reviewItems = selectReviewItems(masteryMap, cefr, reviewSlots);

  // 7. Select SPOT-CHECK content (mastered items)
  const spotCheckItems = selectSpotCheckItems(masteryMap, cefr, spotCheckSlots);

  // 8. Select CARRY-FORWARD content (unmastered from previous levels)
  const carryForwardItems = selectCarryForward(
    masteryMap,
    cefr,
    config.maxCarryForward
  );

  // 9. Build the lesson
  const lessonId = `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const newContentItems = [
    ...newVocab.map((v) =>
      toPracticeItem("vocab", v.portuguese, cefr, v.category, v)
    ),
    ...newVerbs.map((v) => toPracticeItem("verb", v.key, cefr, v.group, v)),
    ...newGrammar.map((g) =>
      toPracticeItem("grammar", g.id, cefr, undefined, g)
    ),
  ];

  return {
    id: lessonId,
    cefr,
    generatedAt: new Date().toISOString(),

    learn: {
      vocab: newVocab,
      verbs: newVerbs,
      grammar: newGrammar,
    },

    practice: {
      newContentItems,
      reviewItems,
      spotCheckItems,
      carryForwardItems,
    },

    totalItems:
      newContentItems.length +
      reviewItems.length +
      spotCheckItems.length +
      carryForwardItems.length,
    newCount: newContentItems.length,
    reviewCount: reviewItems.length,
    spotCheckCount: spotCheckItems.length,
    carryForwardCount: carryForwardItems.length,
  };
}

// ─── Content Selection Functions ────────────────────────

/**
 * Select new (unseen) vocab words with diversity spread
 */
function selectNewVocab(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  count: number,
  config: GeneratorConfig
): PoolVocabItem[] {
  const pool = getVocabPool(cefr);

  const unseen = pool.filter((w) => {
    const record = masteryMap.get(`vocab:${w.portuguese}`);
    return !record || record.mastery_level === 0;
  });

  if (unseen.length === 0) return [];

  return pickWithDiversity(
    unseen,
    count,
    config.maxSameCategory,
    (w) => w.category
  );
}

/**
 * Select new (unseen) verbs with diversity spread
 */
function selectNewVerbs(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  count: number,
  config: GeneratorConfig
): PoolVerbItem[] {
  const pool = getVerbPool(cefr);

  const unseen = pool.filter((v) => {
    const record = masteryMap.get(`verb:${v.key}`);
    return !record || record.mastery_level === 0;
  });

  if (unseen.length === 0) return [];

  return pickWithDiversity(unseen, count, config.maxSameGroup, (v) => v.group);
}

/**
 * Select new (unseen) grammar topics
 */
function selectNewGrammar(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  count: number
): PoolGrammarItem[] {
  const pool = getGrammarPool(cefr);

  const unseen = pool.filter((g) => {
    const record = masteryMap.get(`grammar:${g.id}`);
    return !record || record.mastery_level === 0;
  });

  if (unseen.length === 0) return [];

  // Grammar has a natural learning order — take in sequence
  return unseen.slice(0, count);
}

/**
 * Select items due for review (mastery level 2-3, next_review_at in the past)
 */
function selectReviewItems(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  count: number
): PracticeItem[] {
  const now = new Date();
  const items: Array<{ record: MasteryRecord; urgency: number }> = [];

  masteryMap.forEach((record) => {
    if (record.content_cefr !== cefr) return;
    if (record.mastery_level < 2 || record.mastery_level > 3) return;
    if (!record.next_review_at) return;

    const reviewDate = new Date(record.next_review_at);
    if (reviewDate > now) return;

    const daysOverdue =
      (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
    items.push({ record, urgency: daysOverdue });
  });

  // Most overdue first
  items.sort((a, b) => b.urgency - a.urgency);

  return items.slice(0, count).map(({ record }) =>
    recordToPracticeItem(record)
  );
}

/**
 * Select mastered items for spot-checking (mastery level 4+)
 */
function selectSpotCheckItems(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  count: number
): PracticeItem[] {
  const candidates: MasteryRecord[] = [];

  masteryMap.forEach((record) => {
    if (record.content_cefr !== cefr) return;
    if (record.mastery_level < 4) return;
    candidates.push(record);
  });

  const shuffled = shuffleArray(candidates);
  return shuffled.slice(0, count).map(recordToPracticeItem);
}

/**
 * Select unmastered items from PREVIOUS CEFR levels (carry-forward).
 * Capped to prevent lesson bloat.
 */
function selectCarryForward(
  masteryMap: Map<string, MasteryRecord>,
  currentCefr: CEFRLevel,
  maxItems: number
): PracticeItem[] {
  if (currentCefr === "A1") return [];

  const prevLevels: CEFRLevel[] =
    currentCefr === "A2" ? ["A1"] : ["A1", "A2"];
  const candidates: MasteryRecord[] = [];

  masteryMap.forEach((record) => {
    if (!prevLevels.includes(record.content_cefr as CEFRLevel)) return;
    // Only carry items that were introduced but not yet learned
    if (record.mastery_level >= 3) return;
    if (record.mastery_level === 0) return;
    candidates.push(record);
  });

  // Lowest mastery + lowest accuracy first
  candidates.sort((a, b) => {
    if (a.mastery_level !== b.mastery_level)
      return a.mastery_level - b.mastery_level;
    const accA = a.times_seen > 0 ? a.times_correct / a.times_seen : 0;
    const accB = b.times_seen > 0 ? b.times_correct / b.times_seen : 0;
    return accA - accB;
  });

  return candidates.slice(0, maxItems).map(recordToPracticeItem);
}

// ─── Adaptive Config ────────────────────────────────────

function getAdaptiveConfig(
  masteryMap: Map<string, MasteryRecord>,
  cefr: CEFRLevel,
  recentPerformance?: { avgAccuracy: number; lessonCount: number }
): GeneratorConfig {
  const config = { ...DEFAULT_CONFIG };

  // Count mastered items at this level
  const totalAtLevel =
    getVocabPool(cefr).length +
    getVerbPool(cefr).length +
    getGrammarPool(cefr).length;

  let masteredAtLevel = 0;
  masteryMap.forEach((record) => {
    if (record.content_cefr === cefr && record.mastery_level >= 3) {
      masteredAtLevel++;
    }
  });

  const readiness = totalAtLevel > 0 ? masteredAtLevel / totalAtLevel : 0;

  // Shift ratios as readiness increases
  if (readiness < 0.3) {
    config.newContentRatio = 0.6;
    config.reviewRatio = 0.3;
    config.spotCheckRatio = 0.1;
  } else if (readiness < 0.6) {
    config.newContentRatio = 0.5;
    config.reviewRatio = 0.4;
    config.spotCheckRatio = 0.1;
  } else {
    config.newContentRatio = 0.35;
    config.reviewRatio = 0.5;
    config.spotCheckRatio = 0.15;
  }

  // Culture sprinkle every 3rd lesson
  if (recentPerformance && recentPerformance.lessonCount % 3 === 2) {
    config.includeCulture = true;
  }

  return config;
}

function getAdaptiveSize(
  config: GeneratorConfig,
  recentPerformance?: { avgAccuracy: number; lessonCount: number }
): number {
  if (!recentPerformance) return config.baseSize;

  if (recentPerformance.avgAccuracy >= 0.9) {
    return config.minSize;
  } else if (recentPerformance.avgAccuracy < 0.7) {
    return config.maxSize;
  }

  return config.baseSize;
}

// ─── Utility Functions ──────────────────────────────────

/**
 * Pick items with diversity constraint (max N from same group)
 */
function pickWithDiversity<T>(
  items: T[],
  count: number,
  maxPerGroup: number,
  getGroup: (item: T) => string
): T[] {
  const shuffled = shuffleArray([...items]);
  const picked: T[] = [];
  const groupCounts: Record<string, number> = {};

  for (const item of shuffled) {
    if (picked.length >= count) break;

    const group = getGroup(item);
    const currentCount = groupCounts[group] || 0;

    if (currentCount < maxPerGroup) {
      picked.push(item);
      groupCounts[group] = currentCount + 1;
    }
  }

  // Relax diversity constraint if we couldn't fill the count
  if (picked.length < count) {
    for (const item of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(item)) {
        picked.push(item);
      }
    }
  }

  return picked;
}

/**
 * Look up full content data by type and ID
 */
function lookupContent(
  contentType: ContentType,
  contentId: string
): PoolVocabItem | PoolVerbItem | PoolGrammarItem | null {
  if (contentType === "vocab") {
    return (
      getVocabPool().find((v) => v.portuguese === contentId) ?? null
    );
  }
  if (contentType === "verb") {
    return getVerbPool().find((v) => v.key === contentId) ?? null;
  }
  if (contentType === "grammar") {
    return getGrammarPool().find((g) => g.id === contentId) ?? null;
  }
  return null;
}

function toPracticeItem(
  contentType: ContentType,
  contentId: string,
  cefr: CEFRLevel,
  category: string | undefined,
  data: PoolVocabItem | PoolVerbItem | PoolGrammarItem
): PracticeItem {
  return {
    contentType,
    contentId,
    contentCefr: cefr,
    contentCategory: category,
    isHighFrequency: isHighFrequency(contentType, contentId),
    data,
  };
}

function recordToPracticeItem(record: MasteryRecord): PracticeItem {
  const data = lookupContent(
    record.content_type as ContentType,
    record.content_id
  );
  return {
    contentType: record.content_type as ContentType,
    contentId: record.content_id,
    contentCefr: record.content_cefr as CEFRLevel,
    contentCategory: record.content_category || undefined,
    isHighFrequency: isHighFrequency(record.content_type, record.content_id),
    // Fallback to a minimal object if lookup fails (shouldn't happen)
    data: data ?? ({ portuguese: record.content_id, english: "", cefr: record.content_cefr } as PoolVocabItem),
  };
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
