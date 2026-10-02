/**
 * Aula PT Design System Tokens
 *
 * Single source of truth for all design values.
 * Every primitive component imports from here.
 *
 * RULES:
 * - Never use raw color/spacing values in components — always reference tokens
 * - Never add font-weight 700 (bold) — only 400, 500, 600
 * - Never use shadows on flat layout elements
 * - Brand blue (#1B2B61) is used sparingly: focus rings, progress fills, active sidebar indicator
 */

// ─── Colors ─────────────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F7F7F6",
  bgSurface: "#F7F7F6",

  // Text
  textPrimary: "#1F1F1F",
  textSecondary: "#6B6B69",
  textTertiary: "#98988F",

  // Borders
  borderLight: "#E6E6E4",
  borderMid: "#CFCFCB",
  borderFocus: "#1B2B61",

  // Brand
  brand: "#1B2B61",
  brandSubtle: "rgba(0, 51, 153, 0.08)",

  // CEFR Level Colors
  cefr: {
    a1: { text: "#1F7A68", bg: "#E1F2ED" },
    a2: { text: "#1B2B61", bg: "#E8ECF6" },
    b1: { text: "#5B45B8", bg: "#ECE8F8" },
  },

  // Status
  status: {
    success: { text: "#1F7A68", bg: "#E1F2ED" },
    warning: { text: "#92400E", bg: "#FFFBEB", border: "#FEF3C7" },
    info: { text: "#1B2B61", bg: "#E8ECF6" },
  },
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const typography = {
  // Font family is set globally via Tailwind config / CSS — DM Sans
  // These are the only sizes and weights used in the app.

  pageTitle:    "text-[22px] font-medium tracking-[-0.02em]",     // Page titles
  sectionTitle: "text-[14px] font-medium",                         // Card titles, row titles
  body:         "text-[13px] font-normal",                         // Body text, descriptions
  bodySmall:    "text-[12px] font-normal",                         // Subtitles, secondary info
  meta:         "text-[11px] font-normal",                         // Timestamps, tertiary info
  badge:        "text-[10px] font-medium",                         // Badge text
  sectionLabel: "text-[10px] font-medium uppercase tracking-[0.05em]", // Section headers (LEARN, YOU)
  stat:         "text-[22px] font-medium tracking-[-0.02em]",     // Dashboard numbers
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  // Page-level
  pageX: "px-10",         // 40px horizontal padding on main content
  pageY: "pt-8",          // 32px top padding on main content
  pageXMobile: "px-4",    // 16px on mobile
  pageYMobile: "pt-6",    // 24px on mobile

  // Between sections
  sectionGap: "mb-8",     // 32px between major page sections
  subsectionGap: "mb-6",  // 24px between subsections (e.g., filters to content)

  // Within components
  cardPadding: "p-4",     // 16px inside cards
  rowPaddingX: "px-4",    // 16px horizontal in rows
  rowPaddingY: "py-3",    // 12px vertical in rows

  // Grid gaps
  cardGridGap: "gap-3",   // 12px between cards in a grid
  listGap: "gap-px",      // 1px between list rows (border simulation)
} as const;

// ─── Borders & Radius ───────────────────────────────────────────────────────

export const borders = {
  light: "border-[0.5px] border-[#E6E6E4]",
  mid: "border-[0.5px] border-[#CFCFCB]",
  radius: "rounded-lg",        // 8px — the ONE radius for everything
  radiusPill: "rounded-full",   // For badges only
} as const;

// ─── Sidebar ────────────────────────────────────────────────────────────────

export const sidebar = {
  width: "w-[220px] min-w-[220px]",
  bg: "bg-[#F7F7F6]",
  borderRight: "border-r-[0.5px] border-[#E6E6E4]",
} as const;

// ─── CEFR Helpers ───────────────────────────────────────────────────────────

export function cefrClasses(level: string): { text: string; bg: string } {
  const l = level.toUpperCase();
  if (l === "A1") return { text: "text-[#1F7A68]", bg: "bg-[#E1F2ED]" };
  if (l === "A2") return { text: "text-[#1B2B61]", bg: "bg-[#E8ECF6]" };
  if (l === "B1") return { text: "text-[#5B45B8]", bg: "bg-[#ECE8F8]" };
  return { text: "text-[#98988F]", bg: "bg-[#F7F7F6]" };
}
