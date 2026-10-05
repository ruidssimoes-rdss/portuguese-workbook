/**
 * BadgePill — small rounded pill for CEFR levels, categories, etc.
 *
 * <BadgePill level="A1" />
 * <BadgePill label="Food" variant="neutral" />
 */

import { cefrTone } from "@/lib/ui/cefr-tone";

interface BadgePillProps {
  level?: string;           // "A1" | "A2" | "B1" — uses CEFR colors
  label?: string;           // Custom label text (overrides level)
  variant?: "cefr" | "neutral"; // Default: "cefr" if level is set
}

export function BadgePill({ level, label, variant }: BadgePillProps) {
  const text = label || level || "";
  const isCefr = variant === "cefr" || (!variant && level);

  if (isCefr && level) {
    return (
      <span
        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cefrTone(level)}`}
      >
        {text}
      </span>
    );
  }

  return (
    <span className="text-[10px] text-text-quaternary bg-surface-sunken px-2 py-0.5 rounded-full">
      {text}
    </span>
  );
}
