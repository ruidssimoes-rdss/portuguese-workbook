/**
 * Stable option shuffling for multiple-choice questions.
 * 
 * Shuffles options based on a seed derived from the question ID and a session key,
 * ensuring the same question shows the same shuffled order during a session but
 * doesn't reshuffle on re-render.
 */

/**
 * Simple seeded random number generator (mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Fisher-Yates shuffle with seeded random
 */
function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get or create a session key for option shuffling.
 * This persists in sessionStorage so shuffles are stable during a browser session.
 */
function getSessionKey(): string {
  if (typeof window === 'undefined') return 'server';
  
  const key = 'aula-shuffle-session';
  let sessionKey = sessionStorage.getItem(key);
  
  if (!sessionKey) {
    sessionKey = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sessionKey);
  }
  
  return sessionKey;
}

/**
 * Shuffles question options in a stable way based on question ID and session.
 * 
 * @param options - The array of option strings
 * @param correctIndex - The index of the correct answer in the original array
 * @param questionId - A unique identifier for this question
 * @returns Object with shuffled options and new correctIndex
 * 
 * @example
 * const { options: shuffledOpts, correctIndex: newIndex } = 
 *   shuffleOptions(['A', 'B', 'C', 'D'], 1, 'question-123');
 */
export function shuffleOptions(
  options: string[],
  correctIndex: number,
  questionId: string
): { options: string[]; correctIndex: number } {
  // Don't shuffle true/false questions or questions with < 2 options
  if (options.length < 2) {
    return { options, correctIndex };
  }
  
  // Create a seed from the question ID and session key
  const sessionKey = getSessionKey();
  const seed = hashString(questionId + sessionKey);
  const rng = seededRandom(seed);
  
  // Track which option is correct
  const correctOption = options[correctIndex];
  
  // Shuffle the options
  const shuffled = shuffleArray(options, rng);
  
  // Find where the correct option ended up
  const newCorrectIndex = shuffled.indexOf(correctOption);
  
  return {
    options: shuffled,
    correctIndex: newCorrectIndex,
  };
}

/**
 * Hook for using shuffled options in React components.
 * Memoizes the shuffle result to prevent reshuffling on re-render.
 */
import { useMemo } from 'react';

export function useShuffledOptions(
  options: string[] | undefined,
  correctIndex: number | undefined,
  questionId: string
): { options: string[]; correctIndex: number } {
  return useMemo(() => {
    if (!options || correctIndex === undefined) {
      return { options: [], correctIndex: 0 };
    }
    return shuffleOptions(options, correctIndex, questionId);
  }, [options, correctIndex, questionId]);
}
