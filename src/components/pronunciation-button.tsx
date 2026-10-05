"use client";

import { useCallback, useEffect, useState } from "react";
import { canPlayPt, speakPt } from "@/lib/audio/speak";

export interface PronunciationButtonProps {
  text: string;
  className?: string;
  size?: "sm" | "md";
  /** Dark style for use on homepage cards (dark circle, white icon) */
  variant?: "default" | "dark" | "muted";
}

const UNAVAILABLE = "Áudio indisponível";

const GLOW_STYLES = `
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 6px 2px rgba(0,51,153,0.25), 0 0 0 0 rgba(0,51,153,0.15); }
    50% { box-shadow: 0 0 18px 6px rgba(0,51,153,0.45), 0 0 32px 8px rgba(0,51,153,0.15); }
  }
  @keyframes glow-pulse-dark {
    0%, 100% { box-shadow: 0 0 6px 2px rgba(255,255,255,0.1); }
    50% { box-shadow: 0 0 18px 6px rgba(255,255,255,0.25); }
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

/**
 * Plays the pre-generated pt-PT clip first, then a browser voice only if its lang is
 * exactly "pt-PT". With neither, the button is disabled with «Áudio indisponível».
 */
export function PronunciationButton({
  text,
  className = "",
  size = "sm",
  variant = "default",
}: PronunciationButtonProps) {
  const [playing, setPlaying] = useState(false);
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

  const handleClick = useCallback(() => {
    setPlaying(true);
    speakPt(text)
      .catch(() => setUnavailable(true))
      .finally(() => setPlaying(false));
  }, [text]);

  useEffect(() => {
    if (document.getElementById("pronunciation-glow-styles")) return;
    const style = document.createElement("style");
    style.id = "pronunciation-glow-styles";
    style.textContent = GLOW_STYLES;
    document.head.appendChild(style);
  }, []);

  const sizeClasses =
    size === "sm"
      ? "w-7 h-7 min-w-[28px] min-h-[28px]"
      : "w-9 h-9 min-w-[36px] min-h-[36px]";

  const baseTransition = "transition-all duration-300";

  const variantClasses =
    variant === "dark"
      ? `border-0 bg-text text-bg shadow-none focus:ring-border ${baseTransition} ${
          playing
            ? "[animation:glow-pulse-dark_1.2s_ease-in-out_infinite]"
            : "hover:opacity-90 hover:shadow-[0_0_12px_4px_rgba(255,255,255,0.12)]"
        }`
      : variant === "muted"
        ? `border-0 bg-surface text-text-muted shadow-none focus:ring-border ${baseTransition} ${
            playing
              ? "bg-[#1B2B61]/10 text-[#1B2B61] [animation:glow-pulse_1.2s_ease-in-out_infinite]"
              : "hover:bg-border hover:text-text-secondary"
          }`
        : `border-0 text-white shadow-none focus:ring-[#1B2B61]/30 ${baseTransition} ${
            playing
              ? "bg-[#1B2B61] [animation:glow-pulse_1.2s_ease-in-out_infinite]"
              : "bg-[#1B2B61] hover:bg-[#002277] hover:shadow-[0_0_0_4px_rgba(0,51,153,0.12),_0_4px_16px_rgba(0,51,153,0.25)]"
          }`;

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleClick}
        disabled={unavailable}
        title={unavailable ? UNAVAILABLE : "Ouvir (português europeu)"}
        className={`inline-flex items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`}
        aria-label={unavailable ? UNAVAILABLE : "Ouvir a pronúncia"}
      >
        <SpeakerIcon playing={playing} size={size} />
      </button>
    </span>
  );
}
