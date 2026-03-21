"use client";

import { useState, useCallback, useEffect } from "react";

interface PronunciationButtonProps {
  text: string;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

export function PronunciationButton({ text, size = "sm", label = "Listen", className }: PronunciationButtonProps) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!window.speechSynthesis);
  }, []);

  const speak = useCallback(() => {
    if (!window.speechSynthesis || playing) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-PT";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find((v) => v.lang === "pt-PT") ?? voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  }, [text, playing]);

  if (!supported) return null;

  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); speak(); }}
      disabled={playing}
      aria-label={label}
      className={`inline-flex items-center justify-center text-[#9B9DA3] hover:text-[#6C6B71] transition-colors duration-150 cursor-pointer shrink-0 ${playing ? "success-pulse" : ""} ${className ?? ""}`}
    >
      <svg className={sz} viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H3.667a.75.75 0 00-.7.48A6.985 6.985 0 002.5 9c0 .887.165 1.736.468 2.52.111.29.39.48.699.48h1.536l3.533 2.796A.75.75 0 0010 14.25V3.75z" />
        <path d="M13.26 7.2a3.5 3.5 0 010 5.6.75.75 0 11-.92-1.183 2 2 0 000-3.234.75.75 0 01.92-1.183z" />
      </svg>
    </button>
  );
}
