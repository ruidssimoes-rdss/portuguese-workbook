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

const GLOW_STYLES = `
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 6px 2px color-mix(in srgb, var(--color-accent) 25%, transparent), 0 0 0 0 color-mix(in srgb, var(--color-accent) 15%, transparent); }
    50% { box-shadow: 0 0 18px 6px color-mix(in srgb, var(--color-accent) 45%, transparent), 0 0 32px 8px color-mix(in srgb, var(--color-accent) 15%, transparent); }
  }
  @keyframes glow-pulse-dark {
    0%, 100% { box-shadow: 0 0 6px 2px color-mix(in srgb, var(--color-surface-raised) 10%, transparent); }
    50% { box-shadow: 0 0 18px 6px color-mix(in srgb, var(--color-surface-raised) 25%, transparent); }
  }
`;

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
      className=""
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

  useEffect(() => {
    if (document.getElementById("pronunciation-glow-styles")) return;
    const style = document.createElement("style");
    style.id = "pronunciation-glow-styles";
    style.textContent = GLOW_STYLES;
    document.head.appendChild(style);
  }, []);

  if (typeof window !== "undefined" && !window.speechSynthesis) return null;

  const sizeClasses =
    size === "sm"
      ? "w-7 h-7 min-w-[28px] min-h-[28px]"
      : "w-9 h-9 min-w-[36px] min-h-[36px]";

  const baseTransition = "transition-all duration-300";

  const variantClasses =
    variant === "dark"
      ? `border-0 bg-text-primary text-text-on-accent shadow-none focus:ring-border-default ${baseTransition} ${
          playing
            ? "[animation:glow-pulse-dark_1.2s_ease-in-out_infinite]"
            : "hover:opacity-90 hover:shadow-[0_0_12px_4px_color-mix(in_srgb,var(--color-surface-raised)_12%,transparent)]"
        }`
      : variant === "muted"
        ? `border-0 bg-surface-sunken text-text-quaternary shadow-none focus:ring-border-default ${baseTransition} ${
            playing
              ? "bg-accent/10 text-accent [animation:glow-pulse_1.2s_ease-in-out_infinite]"
              : "hover:bg-border-default hover:text-text-secondary"
          }`
        : `border-0 text-white shadow-none focus:ring-accent/30 ${baseTransition} ${
            playing
              ? "bg-accent [animation:glow-pulse_1.2s_ease-in-out_infinite]"
              : "bg-accent hover:bg-accent-hover hover:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_12%,transparent),_0_4px_16px_color-mix(in_srgb,var(--color-accent)_25%,transparent)]"
          }`;

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
        className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        aria-label="Play pronunciation"
      >
        <SpeakerIcon playing={playing} size={size} />
      </button>
      {voiceUnavailable && (
        <span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 rounded text-[11px] whitespace-nowrap bg-text-primary text-text-on-accent z-10"
          role="tooltip"
        >
          Portuguese voice not available
        </span>
      )}
    </span>
  );
}
