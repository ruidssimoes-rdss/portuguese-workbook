import type { ReactNode } from "react";

// ── CEFR Levels ──────────────────────────────────────────

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// ── Badge color mapping ──────────────────────────────────

export const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: "#219171",
  A2: "#7795E8",
  B1: "#4B5563",
  B2: "#6366F1",
  C1: "#8B5CF6",
  C2: "#EC4899",
} as const;

// ── Example sentence ─────────────────────────────────────

export interface BlocoExample {
  portuguese: string;
  english: string;
}

// ── Actions ──────────────────────────────────────────────

export interface BlocoActions {
  hasTip?: boolean;
  hasCopy?: boolean;
  onTip?: () => void;
  onCopy?: () => void;
}

// ── Footer ───────────────────────────────────────────────

export interface BlocoFooter {
  relatedCount?: number;
  wordCount?: number;
  itemCount?: number;
  ruleCount?: number;
  questionCount?: number;
  label?: string;
}

// ── Progress ─────────────────────────────────────────────

export interface BlocoProgress {
  percent: number;
  isLocked?: boolean;
}

// ── Stat mode ────────────────────────────────────────────

export interface BlocoStat {
  value: string | number;
  label: string;
  delta?: string;
}

// ── Main SmartBloco Props ────────────────────────────────

export interface SmartBlocoProps {
  // Core content
  title: string;
  subtitle?: string;
  pronunciation?: string;
  translation?: string;
  description?: string;

  // Badges (top-right, all optional)
  hasAudio?: boolean;
  cefrLevel?: CEFRLevel;
  metaBadge?: string;

  // Example sentence block
  example?: BlocoExample;

  // Expandable content
  expandedContent?: ReactNode;

  // Actions
  actions?: BlocoActions;

  // Footer
  footer?: BlocoFooter;

  // Progress (lesson cards)
  progress?: BlocoProgress;

  // Stat mode (KPI cards)
  stat?: BlocoStat;

  // Interaction
  onClick?: () => void;
  href?: string;
  className?: string;
}
