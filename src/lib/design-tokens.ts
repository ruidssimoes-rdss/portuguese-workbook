// ============================================================
// Design Tokens — Single source of truth for the Aula PT design system
// ============================================================

// ── Colors ──────────────────────────────────────────────────

export const colors = {
  // Text hierarchy
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    muted: "#9CA3AF",
    disabled: "#D1D5DB",
    inverse: "#FFFFFF",
  },

  // Surfaces
  surface: {
    base: "#FFFFFF",
    subtle: "#FAFAFA",
    muted: "#F3F4F6",
    hover: "#F9FAFB",
  },

  // Borders
  border: {
    default: "#E5E7EB",
    light: "#F3F4F6",
    hover: "#D1D5DB",
    focus: "#111827",
  },

  // CEFR levels (used for badges)
  cefr: {
    A1: { text: "text-emerald-700", bg: "bg-emerald-50" },
    A2: { text: "text-blue-700", bg: "bg-blue-50" },
    B1: { text: "text-amber-700", bg: "bg-amber-50" },
    fallback: { text: "text-[#6B7280]", bg: "bg-[#F3F4F6]" },
  },

  // Verb group colors
  verbGroup: {
    irregular: { text: "text-amber-700", bg: "bg-amber-50" },
    ar: { text: "text-emerald-700", bg: "bg-emerald-50" },
    er: { text: "text-blue-700", bg: "bg-blue-50" },
    ir: { text: "text-violet-700", bg: "bg-violet-50" },
  },

  // Accent (brand blue)
  accent: "#3C5E95",
} as const;

// ── Typography ──────────────────────────────────────────────

export const typography = {
  pageTitle: "text-2xl font-bold text-[#111827]",
  pageTitlePt: "text-[13px] font-medium text-[#9CA3AF] italic",
  pageSubtitle: "text-sm text-[#9CA3AF]",

  sectionHeader: "text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted",

  cardTitle: "text-[15px] font-semibold text-text",
  cardTitleLg: "text-[18px] font-semibold text-[#111827]",
  cardBody: "text-[13px] text-[#6B7280]",
  cardMeta: "text-[12px] text-[#9CA3AF]",

  label: "text-sm font-medium text-[#374151]",
  caption: "text-[11px] font-semibold",
} as const;

// ── Spacing ─────────────────────────────────────────────────

export const spacing = {
  page: "max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10",
  pageNarrow: "max-w-[896px] mx-auto px-4 md:px-6 lg:px-10",
  pageXNarrow: "max-w-[640px] mx-auto px-4 md:px-6",
  section: "py-5",
  cardPadding: "p-5",
  gridGap: "gap-4",
} as const;

// ── Shadows & Radii ─────────────────────────────────────────

export const radii = {
  card: "rounded-xl",
  button: "rounded-lg",
  pill: "rounded-full",
  input: "rounded-full",
} as const;

// ── Elevation ───────────────────────────────────────────────

export const elevation = {
  low: "shadow-[0_4px_16px_rgba(0,0,0,0.06)]",
  medium: "shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
} as const;

// ── Transitions ─────────────────────────────────────────────

export const transitions = {
  fast: "transition-all duration-150 ease-out",
  default: "transition-all duration-200 ease-out",
} as const;

// ── Component class patterns ────────────────────────────────

export const patterns = {
  card: {
    base: "border border-[#E5E7EB] rounded-xl p-5 bg-white",
    interactive: "border border-[#E5E7EB] rounded-xl p-5 bg-white hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all duration-150 ease-out",
    surface: "bg-[#FAFAFA] rounded-xl p-5 border border-[#E5E7EB]",
    featured: "border border-[#E5E7EB] rounded-xl p-5 bg-white border-l-[3px] border-l-[#3C5E95]",
  },
  pill: {
    active: "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer transition-all duration-150 ease-out",
    inactive: "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-all duration-150 ease-out cursor-pointer bg-white",
  },
  badge: "text-[11px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap",
  searchInput: "w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2 transition-all duration-150 bg-white",
  divider: "border-t border-[#F3F4F6]",
  emptyState: "text-[13px] text-text-secondary py-8",
  button: {
    primary: "bg-[#111827] text-white text-sm font-medium rounded-lg hover:bg-[#1F2937] hover:-translate-y-[0.5px] transition-all duration-150 ease-out",
    secondary: "border border-[#E5E7EB] text-[#6B7280] text-sm font-medium rounded-lg hover:bg-[#F9FAFB] hover:border-[#D1D5DB] hover:text-[#111827] transition-all duration-150 ease-out bg-white",
    ghost: "text-sm font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] transition-all duration-150 ease-out",
  },
} as const;

// ── Helper: CEFR badge classes ──────────────────────────────

export function cefrBadgeClasses(cefr: string): string {
  const level = cefr.toUpperCase() as keyof typeof colors.cefr;
  const c = colors.cefr[level] ?? colors.cefr.fallback;
  return `${c.text} ${c.bg}`;
}

// ── Helper: Verb group badge classes ────────────────────────

export function verbGroupBadgeClasses(group: string): string {
  if (group.startsWith("Irregular")) return `${colors.verbGroup.irregular.text} ${colors.verbGroup.irregular.bg}`;
  if (group.startsWith("Regular -AR")) return `${colors.verbGroup.ar.text} ${colors.verbGroup.ar.bg}`;
  if (group.startsWith("Regular -ER")) return `${colors.verbGroup.er.text} ${colors.verbGroup.er.bg}`;
  return `${colors.verbGroup.ir.text} ${colors.verbGroup.ir.bg}`;
}
