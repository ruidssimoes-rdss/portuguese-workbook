/**
 * Pronunciation Scorer — compares speech recognition transcript to expected text.
 * Word-level accuracy (not phoneme-level — that's v2).
 */

import { removeAccents } from "./accent-utils";

export interface PronunciationScore {
  overallScore: number;
  wordScores: Array<{
    expected: string;
    heard: string | null;
    correct: boolean;
  }>;
  feedback: "excellent" | "good" | "needs-practice" | "try-again";
}

export function scorePronunciation(
  expected: string,
  transcript: string,
  acceptedVariants?: string[],
): PronunciationScore {
  const normalize = (s: string) => removeAccents(s.trim().toLowerCase());

  const expectedNorm = normalize(expected);
  const transcriptNorm = normalize(transcript);

  // Exact match
  if (expectedNorm === transcriptNorm) {
    return {
      overallScore: 100,
      wordScores: expected.split(/\s+/).map((w) => ({ expected: w, heard: w, correct: true })),
      feedback: "excellent",
    };
  }

  // Check accepted variants
  if (acceptedVariants?.some((v) => normalize(v) === transcriptNorm)) {
    return {
      overallScore: 95,
      wordScores: expected.split(/\s+/).map((w) => ({ expected: w, heard: w, correct: true })),
      feedback: "excellent",
    };
  }

  // Word-by-word comparison
  const expectedWords = expected.split(/\s+/);
  const transcriptWords = transcript.split(/\s+/);

  const wordScores = expectedWords.map((exp, i) => {
    const heard = transcriptWords[i] || null;
    const correct = heard ? normalize(heard) === normalize(exp) : false;
    return { expected: exp, heard, correct };
  });

  const correctCount = wordScores.filter((w) => w.correct).length;
  const overallScore = Math.round((correctCount / expectedWords.length) * 100);

  let feedback: PronunciationScore["feedback"];
  if (overallScore >= 90) feedback = "excellent";
  else if (overallScore >= 70) feedback = "good";
  else if (overallScore >= 40) feedback = "needs-practice";
  else feedback = "try-again";

  return { overallScore, wordScores, feedback };
}
