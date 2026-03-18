"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ExerciseProps, ListenWriteExerciseData, AnswerResult } from "@/types/blocks";
import { checkAnswer } from "./shared/answer-validator";

export function ListenWriteExercise({
  data,
  onAnswer,
  disabled,
  className,
}: ExerciseProps<ListenWriteExerciseData>) {
  const [input, setInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setHasAudio(false);
    }
  }, []);

  useEffect(() => {
    if (hasPlayed) inputRef.current?.focus();
  }, [hasPlayed]);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || isPlaying) return;

    // Brief delay before speaking
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(data.audioText);
      utterance.lang = "pt-PT";
      utterance.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find((v) => v.lang === "pt-PT") ??
                      voices.find((v) => v.lang.startsWith("pt"));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => { setIsPlaying(false); setHasPlayed(true); };
      utterance.onerror = () => { setIsPlaying(false); setHasPlayed(true); };

      window.speechSynthesis.speak(utterance);
    }, 200);
  }, [data.audioText, isPlaying]);

  function handleSubmit() {
    if (!input.trim() || disabled) return;
    const result = checkAnswer(input, data.correctAnswer, data.acceptedAnswers);
    const answer: AnswerResult = {
      correct: result.correct,
      userAnswer: input.trim(),
      expectedAnswer: data.correctAnswer,
      acceptedAnswers: data.acceptedAnswers,
      points: result.correct ? 1 : 0,
      maxPoints: 1,
    };
    onAnswer(answer);
  }

  return (
    <div className={`flex flex-col items-center py-6 fade-in ${className ?? ""}`}>
      {hasAudio ? (
        <>
          <button
            onClick={speak}
            disabled={isPlaying}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer ${
              isPlaying
                ? "bg-[#003399]/80"
                : "bg-[#003399] hover:bg-[#002277]"
            } ${!hasPlayed ? "success-pulse" : ""}`}
            style={isPlaying ? { boxShadow: "0 0 0 4px rgba(0, 51, 153, 0.15)" } : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              {isPlaying ? (
                <>
                  <rect x="7" y="6" width="3" height="12" rx="1" />
                  <rect x="14" y="6" width="3" height="12" rx="1" />
                </>
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </button>
          <p className="text-[13px] text-[#6B7280] mt-3">
            {hasPlayed ? "Listen again and type what you hear" : "Listen and type what you hear"}
          </p>
          {hasPlayed && (
            <button
              onClick={speak}
              className="text-[13px] text-[#003399] hover:text-[#002277] transition-colors mt-1 cursor-pointer fade-in"
            >
              Replay
            </button>
          )}
        </>
      ) : (
        <div className="text-center">
          <p className="text-[14px] text-[#111827] font-medium">{data.audioText}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">Audio not available in this browser</p>
        </div>
      )}

      {(hasPlayed || !hasAudio) && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          disabled={disabled}
          placeholder="Type what you hear..."
          className="mt-5 w-full max-w-[400px] px-4 py-3 text-[16px] text-center border border-[#E5E7EB] rounded-full bg-white text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#003399] transition-all duration-150 fade-in"
        />
      )}
    </div>
  );
}
