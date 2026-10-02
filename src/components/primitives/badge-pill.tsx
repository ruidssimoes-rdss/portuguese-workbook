/**
 * BadgePill — small rounded pill for CEFR levels, categories, etc.
 *
 * <BadgePill level="A1" />
 * <BadgePill label="Food" variant="neutral" />
 */

import { cefrClasses } from "@/lib/design-system/tokens";

interface BadgePillProps {
  level?: string;           // "A1" | "A2" | "B1" — uses CEFR colors
  label?: string;           // Custom label text (overrides level)
  variant?: "cefr" | "neutral"; // Default: "cefr" if level is set
}

export function BadgePill({ level, label, variant }: BadgePillProps) {
  const text = label || level || "";
  const isCefr = variant === "cefr" || (!variant && level);

  if (isCefr && level) {
    const c = cefrClasses(level);
    return (
      <span
        className={`text-[10.5px] font-medium px-1.5 py-[1px] rounded-[5px] ${c.text} ${c.bg}`}
      >
        {text}
      </span>
    );
  }

  return (
    <span className="text-[10.5px] text-aula-text-2 bg-aula-sunken px-1.5 py-[1px] rounded-[5px]">
      {text}
    </span>
  );
}
