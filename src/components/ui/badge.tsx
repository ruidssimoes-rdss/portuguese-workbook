import { type ReactNode } from "react";
import { cefrBadgeClasses, verbGroupBadgeClasses } from "@/lib/design-tokens";

interface BadgeProps {
  children: ReactNode;
  color?: string; // Tailwind color classes e.g. "text-blue-700 bg-blue-50"
  className?: string;
}

const baseClasses = "text-[11px] font-semibold px-2.5 py-[3px] rounded-full inline-flex items-center";

export function Badge({ children, color, className }: BadgeProps) {
  const c = color ?? "text-[#6B7280] bg-[#F3F4F6]";
  return (
    <span className={`${baseClasses} ${c}${className ? ` ${className}` : ""}`}>
      {children}
    </span>
  );
}

// ── Specialized CEFR badge ──────────────────────────────────

interface CEFRBadgeProps {
  level: string;
  className?: string;
}

export function CEFRBadge({ level, className }: CEFRBadgeProps) {
  return (
    <Badge color={cefrBadgeClasses(level)} className={className}>
      {level}
    </Badge>
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
