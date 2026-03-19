// ============================================================
// Design Tokens — Single source of truth for the Aula PT design system
// Notion-inspired: airy, minimal, typographically refined
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
    subtle: "#F9FAFB",
    muted: "#F3F4F6",
    hover: "#F9FAFB",
  },

  // Borders — one shade lighter everywhere
  border: {
    default: "#F3F4F6",
    light: "#F9FAFB",
    hover: "#E5E7EB",
    focus: "#003399",
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

  // Accent (brand blue — used sparingly)
  accent: "#003399",

  // Brand
  brand: { blue: "#003399" },

  // Backgrounds (aliases)
  page: "#FFFFFF",
  card: "#FFFFFF",

  // Tips / warnings
  tip: { bg: "#FFFBEB", border: "#FEF3C7", text: "#92400E" },

  // Filter pills
  filter: {
    active: { bg: "#111827", text: "#FFFFFF", border: "#111827" },
    inactive: { bg: "#FFFFFF", text: "#9CA3AF", border: "#F3F4F6" },
  },

  // Sidebar
  sidebar: {
    bg: "#FFFFFF",
    border: "#F3F4F6",
    item: {
      default: "#9CA3AF",
      hover: "#6B7280",
      hoverBg: "#F9FAFB",
      active: "#111827",
      activeBg: "#F3F4F6",
      activeAccent: "#003399",
    },
  },
} as const;

// ── Typography ──────────────────────────────────────────────
// Hierarchy through size, not weight. font-medium > font-semibold in body text.

export const typography = {
  pageTitle: "text-[28px] font-semibold text-[#111827]",
  pageTitlePt: "text-[14px] font-normal text-[#9CA3AF] italic",
  pageSubtitle: "text-[14px] text-[#9CA3AF]",

  sectionHeader: "text-[12px] font-medium uppercase tracking-wider text-[#9CA3AF]",

  cardTitle: "text-[16px] font-medium text-[#111827]",
  cardTitleLg: "text-[20px] font-semibold text-[#111827]",
  cardBody: "text-[14px] text-[#6B7280] leading-relaxed",
  cardMeta: "text-[13px] text-[#9CA3AF]",

  label: "text-[14px] font-medium text-[#374151]",
  caption: "text-[12px] font-medium",
} as const;

// ── Spacing ─────────────────────────────────────────────────
// Doubled air — p-6, gap-6, py-8 section gaps

export const spacing = {
  page: "max-w-[1080px] mx-auto px-6 md:px-10 lg:px-16",
  pageNarrow: "max-w-[800px] mx-auto px-6 md:px-10 lg:px-16",
  pageXNarrow: "max-w-[600px] mx-auto px-6",
  section: "py-8",
  cardPadding: "p-6",
  gridGap: "gap-6",
} as const;

// ── Shadows & Radii ─────────────────────────────────────────

export const radii = {
  card: "rounded-xl",
  button: "rounded-lg",
  pill: "rounded-full",
  input: "rounded-lg",
} as const;

// ── Elevation ───────────────────────────────────────────────

export const elevation = {
  low: "shadow-sm",
  medium: "shadow-md",
} as const;

// ── Transitions ─────────────────────────────────────────────

export const transitions = {
  fast: "transition-all duration-150 ease-out",
  default: "transition-all duration-200 ease-out",
} as const;

// ── Component class patterns ────────────────────────────────

export const patterns = {
  card: {
    // Barely-there borders — defined by whitespace, not chrome
    base: "border border-[#F3F4F6] rounded-xl p-6 bg-white",
    interactive: "border border-[#F3F4F6] rounded-xl p-6 bg-white hover:border-[#E5E7EB] hover:shadow-sm hover:-translate-y-[0.5px] transition-all duration-150 ease-out cursor-pointer",
    surface: "bg-[#F9FAFB] rounded-xl p-6",
  },

  pill: {
    active: "px-4 py-2 rounded-full text-[13px] font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer transition-all duration-150 ease-out",
    inactive: "px-4 py-2 rounded-full text-[13px] font-normal border border-[#F3F4F6] text-[#9CA3AF] hover:border-[#E5E7EB] hover:text-[#6B7280] transition-all duration-150 ease-out cursor-pointer bg-white",
  },

  badge: "text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap",

  searchInput: "w-full sm:w-[240px] px-4 py-2.5 rounded-lg text-[14px] border border-[#F3F4F6] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#E5E7EB] focus-visible:ring-1 focus-visible:ring-[#003399]/20 transition-all duration-150 bg-white",

  divider: "border-t border-[#F3F4F6]",

  emptyState: "text-[14px] text-[#6B7280] py-8",

  button: {
    primary: "bg-[#111827] text-white text-[14px] font-medium rounded-lg px-5 py-2.5 hover:bg-[#1F2937] hover:-translate-y-[0.5px] transition-all duration-150 ease-out",
    secondary: "border border-[#F3F4F6] text-[#6B7280] text-[14px] font-normal rounded-lg px-5 py-2.5 hover:bg-[#F9FAFB] hover:border-[#E5E7EB] transition-all duration-150 ease-out bg-white",
    ghost: "text-[14px] font-normal text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] transition-all duration-150 ease-out",
  },
} as const;

// ── Helper: CEFR badge classes ──────────────────────────────

export function cefrBadgeClasses(cefr: string): string {
  const level = cefr.toUpperCase() as keyof typeof colors.cefr;
  const c = colors.cefr[level] ?? colors.cefr.fallback;
  return `${c.text} ${c.bg}`;
}

// ── Helper: Verb group badge classes ────────────────────────

// ── Blocos: Responsive breakpoints ──────────────────────────

export const breakpoints = {
  mobile: "0px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "1280px",
} as const;

export const gridColumns = {
  mobile: 1,
  tablet: 2,
  laptop: 3,
  desktop: 4,
} as const;

export const shadows = {
  none: "none",
  hover: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
} as const;

// ── Helper: Verb group badge classes ────────────────────────

export function verbGroupBadgeClasses(group: string): string {
  if (group.startsWith("Irregular")) return `${colors.verbGroup.irregular.text} ${colors.verbGroup.irregular.bg}`;
  if (group.startsWith("Regular -AR")) return `${colors.verbGroup.ar.text} ${colors.verbGroup.ar.bg}`;
  if (group.startsWith("Regular -ER")) return `${colors.verbGroup.er.text} ${colors.verbGroup.er.bg}`;
  return `${colors.verbGroup.ir.text} ${colors.verbGroup.ir.bg}`;
}
