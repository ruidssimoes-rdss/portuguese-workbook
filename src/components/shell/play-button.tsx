"use client";

import { Volume2 } from "lucide-react";
import { speakPt } from "@/lib/audio/speak";

/** Plays Portuguese text. `variant="pill"` wraps a label (the respelling). */
export function PlayButton({
  text,
  label,
  variant = "icon",
}: {
  text: string;
  label?: string;
  variant?: "icon" | "pill";
}) {
  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={() => speakPt(text).catch(() => {})}
        aria-label={`Ouvir «${text}»`}
        className="inline-flex h-6 items-center gap-1.5 rounded-pill border border-navy-200 bg-accent-faint px-2.5 text-small text-accent transition-colors hover:border-accent/40 hover:bg-accent-subtle"
      >
        <Volume2 aria-hidden className="size-3" strokeWidth={1.75} />
        {label && <span>{label}</span>}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => speakPt(text).catch(() => {})}
      aria-label={`Ouvir «${text}»`}
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-text-quaternary transition-colors hover:bg-surface-hover hover:text-accent"
    >
      <Volume2 aria-hidden className="size-3" strokeWidth={1.75} />
    </button>
  );
}
