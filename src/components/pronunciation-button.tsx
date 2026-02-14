"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface PronunciationButtonProps {
  text: string;
  speed?: number;
  className?: string;
  size?: "sm" | "md";
  /** Dark style for use on homepage cards (dark circle, white icon) */
  variant?: "default" | "dark" | "muted";
}

const RATE = { default: 0.85, slow: 0.6 };

function SpeakerIcon({ playing, size }: { playing: boolean; size: "sm" | "md" }) {
  const s = size === "sm" ? 14 : 18;
  const stroke = size === "sm" ? 2 : 2.25;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={playing ? "animate-pulse" : ""}
      aria-hidden
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {playing ? (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
    </svg>
  );
}

export function PronunciationButton({
  text,
  speed = RATE.default,
  className = "",
  size = "sm",
  variant = "default",
}: PronunciationButtonProps) {
  const [playing, setPlaying] = useState(false);
  const [voiceUnavailable, setVoiceUnavailable] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoices = useCallback((): SpeechSynthesisVoice[] => {
    if (typeof window === "undefined" || !window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices();
  }, []);

  const selectVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = getVoices();
    const ptPT = voices.find((v) => v.lang.startsWith("pt-PT"));
    const pt = voices.find((v) => v.lang.startsWith("pt"));
    return ptPT ?? pt ?? null;
  }, [getVoices]);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
    const syn = window.speechSynthesis;
    syn.cancel();
    const voice = selectVoice();
    if (!voice) {
      setVoiceUnavailable(true);
      setTimeout(() => setVoiceUnavailable(false), 3000);
      return;
    }
    const u = new SpeechSynthesisUtterance(text.trim());
    u.lang = "pt-PT";
    u.rate = speed;
    u.pitch = 1;
    u.voice = voice;
    u.onstart = () => setPlaying(true);
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    utteranceRef.current = u;
    syn.speak(u);
  }, [text, speed, selectVoice]);

  const handleClick = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      setTimeout(speak, 100);
    } else {
      speak();
    }
  }, [playing, speak]);

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

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (typeof window !== "undefined" && !window.speechSynthesis) return null;

  const sizeClasses =
    size === "sm"
      ? "w-7 h-7 min-w-[28px] min-h-[28px]"
      : "w-9 h-9 min-w-[36px] min-h-[36px]";

  const variantClasses =
    variant === "dark"
      ? "border-0 bg-[#262626] text-white hover:bg-[#404040] shadow-none focus:ring-gray-400"
      : variant === "muted"
        ? "border-0 bg-[#F0F0F0] text-[#6B7280] hover:bg-[#E5E5E5] hover:text-[#374151] shadow-none focus:ring-gray-300"
        : "border border-blue-200 bg-white text-[#3C5E95] hover:bg-sky-50 hover:border-blue-300 focus:ring-[#3C5E95]";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={!voicesReady}
        title={
          voiceUnavailable
            ? "Portuguese voice not available on this device"
            : "Listen (European Portuguese)"
        }
        className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        style={variant === "dark" || variant === "muted" ? undefined : size === "md" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" } : undefined}
        aria-label="Play pronunciation"
      >
        <SpeakerIcon playing={playing} size={size} />
      </button>
      {voiceUnavailable && (
        <span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded text-[11px] whitespace-nowrap bg-gray-800 text-white z-10"
          role="tooltip"
        >
          Portuguese voice not available
        </span>
      )}
    </span>
  );
}
