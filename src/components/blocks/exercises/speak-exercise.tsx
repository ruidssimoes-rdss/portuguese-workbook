"use client";

import { useState, useCallback } from "react";
import type { ExerciseProps, SpeakExerciseData, AnswerResult } from "@/types/blocks";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { scorePronunciation, type PronunciationScore } from "@/lib/pronunciation-scorer";
import { patterns } from "@/lib/design-tokens";

const FEEDBACK_COLORS: Record<string, string> = {
  excellent: "text-emerald-600",
  good: "text-blue-600",
  "needs-practice": "text-amber-600",
  "try-again": "text-red-500",
};

const FEEDBACK_TEXT: Record<string, string> = {
  excellent: "Excellent!",
  good: "Good pronunciation!",
  "needs-practice": "Keep practicing",
  "try-again": "Try again",
};

export function SpeakExercise({
  data,
  onAnswer,
  showEnglish,
  disabled,
  className,
}: ExerciseProps<SpeakExerciseData>) {
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [hasListened, setHasListened] = useState(false);

  const handleResult = useCallback(
    (transcript: string) => {
      const result = scorePronunciation(data.targetText, transcript, data.acceptedVariants);
      setScore(result);

      const answer: AnswerResult = {
        correct: result.overallScore >= 70,
        userAnswer: transcript,
        expectedAnswer: data.targetText,
        points: result.overallScore >= 70 ? 1 : 0,
        maxPoints: 1,
      };
      // Delay to let user see score before feedback
      setTimeout(() => onAnswer(answer), 800);
    },
    [data, onAnswer],
  );

  const speech = useSpeechRecognition({
    language: "pt-PT",
    onResult: handleResult,
  });

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(data.targetText);
    utterance.lang = "pt-PT";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    window.speechSynthesis.speak(utterance);
    setHasListened(true);
  }, [data.targetText]);

  // Self-assessment fallback for browsers without speech recognition
  const handleSelfAssess = useCallback(
    (correct: boolean) => {
      const answer: AnswerResult = {
        correct,
        userAnswer: "(self-assessed)",
        expectedAnswer: data.targetText,
        points: correct ? 1 : 0,
        maxPoints: 1,
      };
      onAnswer(answer);
    },
    [data.targetText, onAnswer],
  );

  return (
    <div className={`flex flex-col items-center py-6 fade-in ${className ?? ""}`}>
      <p className="text-[13px] text-[#6B7280] mb-4">Say this in Portuguese:</p>

      {/* Target text */}
      <p className="text-[24px] font-bold text-[#111827]">{data.targetText}</p>
      {showEnglish && (
        <p className="text-[13px] text-[#6B7280] mt-1">{data.targetTranslation}</p>
      )}
      <p className="text-[13px] text-[#9CA3AF] italic mt-1">{data.pronunciation}</p>

      {/* Listen button */}
      <button
        onClick={speak}
        className="mt-4 text-[13px] text-[#003399] hover:text-[#002277] transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 5.5v5l4.5-2.5L3 5.5z" />
          <path d="M9.5 4a4 4 0 010 8M11 2.5a6 6 0 010 11" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        {hasListened ? "Listen again" : "Listen first"}
      </button>

      {/* Score display */}
      {score && (
        <div className="mt-6 text-center fade-in">
          <p className={`text-[28px] font-bold ${FEEDBACK_COLORS[score.feedback]}`}>
            {score.overallScore}%
          </p>
          <p className={`text-[14px] font-medium ${FEEDBACK_COLORS[score.feedback]} mt-1`}>
            {FEEDBACK_TEXT[score.feedback]}
          </p>

          {/* Word-by-word breakdown */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {score.wordScores.map((ws, i) => (
              <span
                key={i}
                className={`text-[15px] font-medium ${
                  ws.correct ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {ws.expected}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mic button OR self-assessment fallback */}
      {!score && (
        <div className="mt-6">
          {speech.isSupported ? (
            <div className="flex flex-col items-center">
              <button
                onClick={speech.isListening ? speech.stopListening : speech.startListening}
                disabled={disabled}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
                  speech.isListening
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-[#003399] hover:bg-[#002277]"
                }`}
                style={speech.isListening ? { boxShadow: "0 0 0 4px rgba(239, 68, 68, 0.2)" } : undefined}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <p className="text-[13px] text-[#9CA3AF] mt-2">
                {speech.isListening ? "Listening..." : "Tap to speak"}
              </p>
              {speech.error && (
                <p className="text-[12px] text-red-500 mt-1">{speech.error}</p>
              )}
            </div>
          ) : (
            /* Fallback: self-assessment */
            <div className="flex flex-col items-center gap-3">
              <p className="text-[13px] text-[#9CA3AF]">
                Speech recognition not available. Listen and self-assess:
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSelfAssess(true)}
                  className={`${patterns.button.primary} h-10 px-5`}
                  disabled={disabled}
                >
                  I said it correctly
                </button>
                <button
                  onClick={() => handleSelfAssess(false)}
                  className={`${patterns.button.secondary} h-10 px-5`}
                  disabled={disabled}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
