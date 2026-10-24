"use client";

import { useCallback, useEffect, useState } from "react";
import { AudioSpeedControl } from "@/components/audio-speed-control";
import { canPlayPt, speakPt } from "@/lib/audio/speak";

/**
 * Round play control from the book mockups. Plays the pt-PT clip,
 * and falls back to a pt-PT voice the same way AudioButton does.
 */
export function PlayButton({ text, size = "sm" }: { text: string; size?: "sm" | "lg" }) {
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

  const dim = size === "lg" ? "h-10 w-10" : "h-7 w-7";
  const icon = size === "lg" ? 11 : 8;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        speak();
      }}
      disabled={unavailable}
      aria-label={unavailable ? "Áudio indisponível" : `Ouvir ${text}`}
      title={unavailable ? "Áudio indisponível" : "Ouvir"}
      className={`tablet-target-sq inline-flex ${dim} shrink-0 items-center justify-center rounded-full border border-[#D3DAEB] bg-white text-aula-accent transition-colors hover:bg-[#E8ECF6] disabled:cursor-not-allowed disabled:opacity-30 ${
        speaking ? "bg-[#E8ECF6]" : ""
      }`}
    >
      <svg width={icon} height={icon} viewBox="0 0 10 10" aria-hidden="true" className="ml-[1px]">
        <path d="M1 0.5 9 5 1 9.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}

/** Speed plus listen. The clips and the pt-PT fallback voice are unchanged. */
export function ListenControls({ lines, label }: { lines: string[]; label: string }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-item">
      <AudioSpeedControl />
      <ListenButton lines={lines} label={label} />
    </div>
  );
}

/** Speaks a run of Portuguese lines, one after another. */
export function ListenButton({ lines, label }: { lines: string[]; label: string }) {
  const [on, setOn] = useState(false);
  const text = lines.map((line) => line.trim()).filter(Boolean).join(". ");

  return (
    <button
      type="button"
      disabled={!text}
      onClick={() => {
        if (on) return;
        setOn(true);
        speakPt(text)
          .catch(() => {})
          .finally(() => setOn(false));
      }}
      className="tablet-target inline-flex h-7 items-center gap-1.5 rounded-lg border border-aula-border bg-white px-2 text-[12px] font-medium text-aula-text transition-colors hover:bg-aula-sunken disabled:opacity-40"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M4 9h4l5-4v14l-5-4H4z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
      </svg>
      {on ? "A ouvir…" : label}
    </button>
  );
}
