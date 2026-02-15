export interface KeywordSet {
  keywords: string[];
  optional?: string[];
}

export interface PromptValidationConfig {
  sets: KeywordSet[];
  minMatches: number;
  minWords: number;
  negation?: string[];
  /** Global optional politeness/connector words that earn bonus across all sets */
  globalOptional?: string[];
}

export interface ValidationResult {
  type: "exact" | "keyword" | "mistake" | "partial" | "unknown";
  display?: string;
  feedback: string;
  correction?: string;
  explanation?: string;
  examples?: string[];
}

function normalizeInput(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Common English words that indicate the user is responding in English, not Portuguese
const GLOBAL_ENGLISH_NEGATION = [
  "hello", "good morning", "good afternoon", "good evening",
  "what", "why", "how", "the", "this", "that",
  "yes", "no", "my", "your", "is", "are", "am",
  "i am", "i like", "i want", "i have", "i live",
  "because", "think", "really", "very",
];

/**
 * Validate a user's response against a daily prompt.
 *
 * Priority order:
 * 1. Exact match against acceptedResponses (with fuzzy variants) → instant success with specific feedback
 * 2. Exact match against commonMistakes → correction with explanation
 * 3. Negation check → catch English / off-topic responses
 * 4. Keyword match → general success feedback (with bonus tiers for politeness)
 * 5. Partial keyword match → encouraging nudge (but guard against super-short answers)
 * 6. Unknown → show examples, never say "wrong"
 */
export function validateResponse(
  userInput: string,
  acceptedResponses: Array<{ text: string; display: string; feedback: string }>,
  commonMistakes: Array<{ text: string; correction: string; explanation: string }>,
  keywordConfig: PromptValidationConfig,
  fuzzyVariantsFn: (normalized: string) => string[]
): ValidationResult {
  const raw = userInput.trim();
  if (!raw) return { type: "unknown", feedback: "" };

  const normalized = normalizeInput(raw);
  const variants = fuzzyVariantsFn(normalized);
  const words = normalized.split(/\s+/);
  const wordCount = words.length;

  // 1. Check exact accepted responses (including fuzzy)
  for (const acc of acceptedResponses) {
    const accNorm = normalizeInput(acc.text);
    // Placeholder responses (contain "[")
    if (accNorm.includes("[")) {
      const prefix = accNorm.split("[")[0].trim();
      // Guard: prefix must be at least 4 chars to avoid false positives
      if (prefix && prefix.length >= 4 && (normalized.startsWith(prefix) || variants.some(v => v.startsWith(prefix)))) {
        return {
          type: "exact",
          display: acc.display,
          feedback: acc.feedback,
        };
      }
      continue;
    }
    if (normalized === accNorm || variants.some(v => v === accNorm)) {
      return {
        type: "exact",
        display: acc.display,
        feedback: acc.feedback,
      };
    }
  }

  // 2. Check common mistakes
  for (const mistake of commonMistakes) {
    const mistakeNorm = normalizeInput(mistake.text);
    if (normalized === mistakeNorm || variants.some(v => v === mistakeNorm)) {
      return {
        type: "mistake",
        correction: mistake.correction,
        explanation: mistake.explanation,
        feedback: mistake.correction
          ? `Almost! Try: ${mistake.correction}`
          : "Almost!",
      };
    }
  }

  // 3. Negation check — catch English or off-topic responses
  const allNegation = [
    ...GLOBAL_ENGLISH_NEGATION,
    ...(keywordConfig.negation || []),
  ];
  const englishWordCount = allNegation.filter(bad => {
    if (bad.includes(" ")) return normalized.includes(bad);
    return words.includes(bad);
  }).length;
  if (englishWordCount >= 2 || (wordCount <= 3 && englishWordCount >= 1)) {
    const examples = acceptedResponses
      .filter(a => !a.text.includes("["))
      .slice(0, 3)
      .map(a => a.display);
    return {
      type: "unknown",
      feedback: "Try responding in Portuguese! Here are some responses you could try:",
      examples,
    };
  }

  // 4. Keyword matching
  let matchCount = 0;
  let bonusCount = 0;

  for (const set of keywordConfig.sets) {
    const hasAll = set.keywords.every(kw => normalized.includes(kw));
    if (hasAll) {
      matchCount++;
      if (set.optional) {
        bonusCount += set.optional.filter(opt => normalized.includes(opt)).length;
      }
    }
  }

  // Global optional politeness/connector bonus
  const globalOpts = keywordConfig.globalOptional || [
    "por favor", "obrigado", "obrigada", "desculpe", "se faz favor",
    "e tu", "contigo", "muito", "tambem",
  ];
  const globalBonusCount = globalOpts.filter(opt => normalized.includes(opt)).length;
  bonusCount += globalBonusCount;

  // Keyword match success
  if (matchCount >= keywordConfig.minMatches && wordCount >= keywordConfig.minWords) {
    let feedback: string;
    if (bonusCount >= 3) {
      feedback = "Excelente! Super natural and polite — loved it!";
    } else if (bonusCount >= 1) {
      feedback = "Boa! That sounds natural, and you added some nice detail!";
    } else {
      feedback = "Boa! That sounds like a valid response.";
    }
    return {
      type: "keyword",
      display: raw,
      feedback,
    };
  }

  // 5. Partial match — keywords found but not enough, or too short
  if (matchCount > 0) {
    if (wordCount < 2 && matchCount < 2) {
      const examples = acceptedResponses
        .filter(a => !a.text.includes("["))
        .slice(0, 3)
        .map(a => a.display);
      return {
        type: "unknown",
        feedback: "Try a fuller response! Here are some ideas:",
        examples,
      };
    }
    const examples = acceptedResponses
      .filter(a => !a.text.includes("["))
      .slice(0, 2)
      .map(a => a.display);
    return {
      type: "partial",
      feedback: "You're on the right track! Here are some common ways to respond:",
      examples,
    };
  }

  // 6. Unknown — never say "wrong", show examples
  const examples = acceptedResponses
    .filter(a => !a.text.includes("["))
    .slice(0, 3)
    .map(a => a.display);
  return {
    type: "unknown",
    feedback: "I'm not sure about that one. Here are some responses you could try:",
    examples,
  };
}
