"use client";

/**
 * AudioButton — small speaker icon that triggers TTS for Portuguese text.
 * Uses the Web Speech API with pt-PT voice selection.
 *
 * <AudioButton text="Bom dia" />
 */

import { Volume2 } from "lucide-react";
import { useState, useCallback, useEffect, useRef } from "react";

interface AudioButtonProps {
  text: string;
  className?: string;
}

export function AudioButton({ text, className = "" }: AudioButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const syn = window.speechSynthesis;
    const onVoicesChanged = () => setVoicesReady(true);
    if (syn.getVoices().length > 0) setVoicesReady(true);
    syn.addEventListener("voiceschanged", onVoicesChanged);
    return () => {
      syn.removeEventListener("voiceschanged", onVoicesChanged);
      syn.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim())
      return;

    const syn = window.speechSynthesis;
    syn.cancel();

    const voices = syn.getVoices();
    const voice =
      voices.find((v) => v.lang.startsWith("pt-PT")) ||
      voices.find((v) => v.lang.startsWith("pt")) ||
      null;

    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "pt-PT";
    u.rate = 0.9;
    u.pitch = 1;
    if (voice) u.voice = voice;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utteranceRef.current = u;
    syn.speak(u);
  }, [text]);

  if (typeof window !== "undefined" && !window.speechSynthesis) return null;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak();
      }}
      disabled={!voicesReady}
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
