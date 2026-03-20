"use client";

import { Volume2 } from "lucide-react";
import { type CEFRLevel, CEFR_COLORS } from "../smart-bloco.types";

// ── Badge wash helper ────────────────────────────────────
// Formula: bg rgba(color, 0.1), border 0.8px solid color, text color

function washStyle(color: string) {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 10%, transparent)`,
    border: `0.8px solid ${color}`,
    color,
  } as const;
}

// ── Audio Badge ──────────────────────────────────────────

interface AudioBadgeProps {
  title: string;
  onPlay?: () => void;
}

function AudioBadge({ title, onPlay }: AudioBadgeProps) {
  function handlePlay() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(title);
    utterance.lang = "pt-PT";
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const ptVoice =
      voices.find((v) => v.lang === "pt-PT") ??
      voices.find((v) => v.lang.startsWith("pt"));
    if (ptVoice) utterance.voice = ptVoice;
    window.speechSynthesis.speak(utterance);
    onPlay?.();
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handlePlay();
      }}
      className="flex items-center justify-center w-[40px] h-[24px] rounded-[var(--bloco-radius-badge)] cursor-pointer transition-colors duration-150 hover:opacity-80"
      style={washStyle("#163EA4")}
      aria-label={`Play pronunciation for ${title}`}
      type="button"
    >
      <Volume2 size={18} />
    </button>
  );
}

// ── CEFR Badge ───────────────────────────────────────────

interface CEFRBadgeProps {
  level: CEFRLevel;
}

function CEFRBadge({ level }: CEFRBadgeProps) {
  const color = CEFR_COLORS[level];
  return (
    <span
      className="inline-flex items-center justify-center min-w-[40px] h-[24px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[12px] font-normal px-[10px]"
      style={washStyle(color)}
      aria-label={`CEFR Level ${level}`}
    >
      {level}
    </span>
  );
}

// ── Meta Badge ───────────────────────────────────────────

interface MetaBadgeProps {
  label: string;
}

function MetaBadge({ label }: MetaBadgeProps) {
  return (
    <span
      className="inline-flex items-center justify-center h-[24px] rounded-[var(--bloco-radius-badge)] font-[family-name:var(--font-sans)] text-[12px] font-normal px-[10px] whitespace-nowrap"
      style={washStyle("#9CA3AF")}
    >
      {label}
    </span>
  );
}

// ── Badge Row ────────────────────────────────────────────

export interface BadgeRowProps {
  title: string;
  hasAudio?: boolean;
  cefrLevel?: CEFRLevel;
  metaBadge?: string;
}

export function BadgeRow({ title, hasAudio, cefrLevel, metaBadge }: BadgeRowProps) {
  const hasBadges = hasAudio || cefrLevel || metaBadge;
  if (!hasBadges) return null;

  return (
    <div className="flex items-center shrink-0 gap-[var(--bloco-badge-gap)]">
      {hasAudio && <AudioBadge title={title} />}
      {cefrLevel && <CEFRBadge level={cefrLevel} />}
      {metaBadge && <MetaBadge label={metaBadge} />}
    </div>
  );
}
