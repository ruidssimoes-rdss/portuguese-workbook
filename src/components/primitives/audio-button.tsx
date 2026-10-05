"use client";

/**
 * AudioButton — small speaker icon that plays Portuguese text.
 * Plays the pre-generated pt-PT clip first; falls back to a browser voice only when
 * its lang is exactly "pt-PT". With neither, the button is disabled («Áudio indisponível»).
 *
 * <AudioButton text="Bom dia" />
 */

import { Volume2 } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { canPlayPt, speakPt } from "@/lib/audio/speak";

interface AudioButtonProps {
  text: string;
  className?: string;
}

const UNAVAILABLE = "Áudio indisponível";

export function AudioButton({ text, className = "" }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    canPlayPt(text).then((ok) => {
      if (!cancelled) setUnavailable(!ok);
    });
    return () => {
      cancelled = true;
    };
  }, [text]);

  const speak = useCallback(() => {
    setSpeaking(true);
    speakPt(text)
      .catch(() => setUnavailable(true))
      .finally(() => setSpeaking(false));
  }, [text]);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak();
      }}
      disabled={unavailable}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        speaking
          ? "text-[#1B2B61] bg-[#E8ECF6]"
          : "text-[#98988F] hover:text-[#6B6B69] hover:bg-[#F7F7F6]"
      } ${className}`}
      aria-label={unavailable ? UNAVAILABLE : `Ouvir "${text}"`}
      title={unavailable ? UNAVAILABLE : "Ouvir"}
    >
      <Volume2 size={14} strokeWidth={1.5} className={speaking ? "animate-pulse" : ""} />
    </button>
  );
}
