"use client";

/**
 * AudioButton — small speaker icon that triggers TTS for Portuguese text.
 * Plays the pre-generated pt-PT clip, falling back to a pt-PT browser voice.
 *
 * <AudioButton text="Bom dia" />
 */

import { Volume2 } from "lucide-react";
import { useState, useCallback } from "react";
import { speakPt } from "@/lib/audio/speak";

interface AudioButtonProps {
  text: string;
  className?: string;
}

export function AudioButton({ text, className = "" }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    setSpeaking(true);
    speakPt(text)
      .catch(() => {})
      .finally(() => setSpeaking(false));
  }, [text]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak();
      }}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors disabled:opacity-30 ${
        speaking
          ? "text-[#185FA5] bg-[#E6F1FB]"
          : "text-[#9B9DA3] hover:text-[#6C6B71] hover:bg-[#F7F7F5]"
      } ${className}`}
      aria-label={`Listen to "${text}"`}
      title="Listen"
    >
      <Volume2 size={14} strokeWidth={1.5} className={speaking ? "animate-pulse" : ""} />
    </button>
  );
}
