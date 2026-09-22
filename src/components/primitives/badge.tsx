import { type ReactNode } from "react";
import { verbGroupBadgeClasses } from "@/lib/design-tokens";

interface BadgeProps {
  children: ReactNode;
  color?: string; // Tailwind color classes e.g. "text-blue-700 bg-blue-50"
  className?: string;
}

const baseClasses = "text-[11px] font-medium px-2.5 py-0.5 rounded-full inline-flex items-center whitespace-nowrap";

export function Badge({ children, color, className }: BadgeProps) {
  const c = color ?? "text-text-muted bg-surface";
  return (
    <span className={`${baseClasses} ${c}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

// ── CEFR frosted glass colors (unique hue per level) ─────────

export const cefrColors: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: "#3B6FE818", text: "#3B6FE8", border: "#3B6FE835" },
  A2: { bg: "#0EA5C918", text: "#0EA5C9", border: "#0EA5C935" },
  B1: { bg: "#8B5CF618", text: "#8B5CF6", border: "#8B5CF635" },
  B2: { bg: "#EC489918", text: "#EC4899", border: "#EC489935" },
  C1: { bg: "#F9731618", text: "#F97316", border: "#F9731635" },
  C2: { bg: "#10B98118", text: "#10B981", border: "#10B98135" },
};

const cefrBadgeBaseClasses =
  "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide";

// ── Specialized CEFR badge (frosted glass) ──────────────────

interface CEFRBadgeProps {
  level: string;
  className?: string;
}

export function CEFRBadge({ level, className }: CEFRBadgeProps) {
  const band = level.toUpperCase().slice(0, 2);
  const colors = cefrColors[band] ?? cefrColors.A1;
  return (
    <span
      className={`${cefrBadgeBaseClasses}${className ? ` ${className}` : ""}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      {level}
    </span>
  );
}

// ── Specialized Verb Group badge ────────────────────────────

interface VerbGroupBadgeProps {
  group: string;
  label: string;
  className?: string;
}

export function VerbGroupBadge({ group, label, className }: VerbGroupBadgeProps) {
  return (
    <Badge color={verbGroupBadgeClasses(group)} className={className}>
      {label}
    </Badge>
  );
}
