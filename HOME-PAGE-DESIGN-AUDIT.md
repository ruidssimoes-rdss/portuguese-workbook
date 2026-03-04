# Home Page Design Audit — Structured Report

**Scope:** `src/app/page.tsx`, all components it directly imports and renders, `src/components/ui/card.tsx`, and home-specific components. No files were modified.

**Design token reference:** Tokens are defined in `src/app/globals.css` (`@theme`) and referenced in `src/lib/design-tokens.ts`. Tailwind v4 maps `--color-*` to classes like `text-text`, `bg-bg`, `border-border`, `text-text-muted`, `text-text-secondary`, `bg-surface`, `bg-border-light`, etc.

---

## 1. `src/app/page.tsx` (Home Page)

### A) Component structure

- **Renders:** Fragment → `Topbar` → `PageContainer` → optional `ChangelogBanner` → greeting bar (wrapper `div`) → optional `HomeGreeting` → `LessonPreview` → quick stats grid (3× `Card` + `SectionHeader` + copy) → “Today’s Picks” section (header + 3 conditional cards) → “Explore” section (header + 4 link cards) → bottom spacer `div`.
- **Props/data:** No props (server component). Uses: `latestChangelog` (changelog JSON), `ptGreeting` (time-based), `totalVocabWords`, `totalVerbs`, `totalGrammarTopics`, `sayings.length`, `totalConjugations`, `totalCategories`, `wordOfDay`, `verbKey`/`verbOfDay`, `sayingOfDay`, `todayPrompt`, `presentRows` (verb conjugations), plus helpers `shortGroup` / `shortPerson`.
- **Conditional rendering:**
  - `{latestChangelog && <ChangelogBanner ... />}`
  - `{todayPrompt && <HomeGreeting greeting={todayPrompt} />}`
  - `{wordOfDay && ( ... Word of the Day Card ... )}`
  - `{verbKey && verbOfDay && ( ... Verb of the Day Card ... )}`
  - `{sayingOfDay && ( ... Saying of the Day Card ... )}`

### B) Current styling

- **Tailwind in use:** `py-5`, `text-2xl font-bold`, `mt-1`, `text-[13px]`, `grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`, `mt-8`, `mb-3`, `flex flex-col gap-3`, `flex items-center justify-between gap-2`, `flex items-center gap-2`, `shrink-0`, `mt-1`, `mt-0.5`, `mt-auto`, `flex items-center gap-1.5 flex-wrap`, `space-y-0.5`, `flex items-baseline gap-3`, `w-[36px]`, `block group`, `h-full flex flex-col`, `pt-3`, `mb-12`, `grid grid-cols-2 md:grid-cols-4 gap-4`.
- **Design tokens used:** `text-text-secondary` (category pill, Explore card stat), `bg-border-light` (category pill in Word of the Day). `Card`, `SectionHeader`, `PageContainer` bring their own token/token-adjacent styling.
- **Hardcoded values:**
  - **Colors:** `text-[#111827]` (greeting h1, stats numbers, card titles, verb/saying text, Explore titles, link hover), `text-[#9CA3AF]` (subtitle, meta, pronunciation, Literal label, Explore subtitle), `text-[#6B7280]` (word English, example translation, verb English, saying meaning/literal), `text-[#374151]` (link hover), `bg-[#F8F8FA]` (word example box), `text-[#374151]` (example quote), `text-[11px]` + `text-blue-700 bg-blue-50` (gender pill — not from token set).
  - **Sizes:** `text-[13px]`, `text-[18px]`, `text-[12px]`, `text-[11px]`, `text-[15px]`.
- **Border radius / shadow / spacing:** No local radius or shadow; spacing is Tailwind (`py-5`, `gap-4`, `mt-6`, `mt-8`, `mb-3`, `pt-3`, `mb-12`). Cards and links use `transition-all duration-150 ease-out` for hover.

### C) Design gaps

- Greeting bar uses only hardcoded hex (`text-[#111827]`, `text-[#9CA3AF]`); not using `text-text` / `text-text-muted` (or equivalent tokens).
- Quick stats cards are non-interactive and visually flat; no hover or elevation.
- Today’s Picks cards mix tokens (`text-text-secondary`, `bg-border-light`) with many hex colors; gender pill uses `blue-700`/`blue-50` instead of a semantic or token-based treatment.
- Explore link cards sit in a `block group` but the only hover is on the inner `Card`; no group-level hover treatment.
- No shared typography scale from `design-tokens.ts` (e.g. `typography.cardTitle`, `typography.cardBody`) on the page; font sizes and colors are ad hoc.
- Link underlines only on hover via `hover:text-[#374151]`; no focus ring or underline token.

### D) What’s already good

- Clear sectioning (greeting, prompt, lesson, stats, picks, explore) and consistent grid usage.
- Token use where it exists (`text-text-secondary`, `bg-border-light`) is correct.
- Explore section uses `text-text-secondary` for the stat line.
- Responsive grids (`sm:grid-cols-3`, `md:grid-cols-2`, `lg:grid-cols-3`, `md:grid-cols-4`) are consistent.

---

## 2. `src/components/ui/card.tsx`

### A) Component structure

- **Renders:** Single `div` wrapping `children`. No internal sections.
- **Props:** `children`, `variant?` (`"outline" | "surface" | "ghost" | "featured"`), `interactive?`, `padding?` (`"sm" | "md" | "lg"`), `className?`, `onClick?`. Client component with `pressed` state for active feedback when `interactive` is true.
- **Conditional:** Hover/active classes only when `interactive`; `cursor-pointer` when `onClick` is set; active scale when `pressed && interactive`.

### B) Current styling

- **Tailwind:** `rounded-xl`, `p-3` / `p-4` / `p-5` from `paddingClasses`, `transition-all duration-150 ease-out`, `scale-[0.995]` when active.
- **Design tokens:** `border-border`, `bg-bg` (outline); `bg-surface`, `border-border` (surface); `bg-transparent` (ghost).
- **Hardcoded:** `featured`: `border-[#E5E7EB]`, `bg-white`, `border-l-[3px]`, `border-l-[#3C5E95]`. Interactive hover: `hover:border-[#D1D5DB]`, `hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`, `hover:-translate-y-[1px]`. No token for the left accent (design-tokens has `border-l-[#003399]` for featured).
- **Border radius / shadow:** `rounded-xl`; shadow only on interactive hover (arbitrary value).

### C) Design gaps

- `featured` uses `#3C5E95` and `#E5E7EB` instead of theme accent and `border-border`; diverges from `design-tokens.patterns.card.featured` which uses `border-l-[#003399]` and `border-[#E5E7EB]`.
- Interactive hover uses hardcoded shadow and border color instead of tokens (e.g. `elevation.low`, border hover token if present).
- No focus-visible ring for interactive/clickable cards.

### D) What’s already good

- Outline and surface variants are token-aligned (`bg-bg`, `bg-surface`, `border-border`).
- Padding and radius are consistent; interactive state (hover + pressed) is implemented.
- `className` is merged correctly.

---

## 3. `src/components/ui/section-header.tsx`

### A) Component structure

- **Renders:** Single `h2` with `children`. No conditionals.
- **Props:** `children`, `className?`.

### B) Current styling

- **Tailwind:** `text-[11px]`, `font-semibold`, `uppercase`, `tracking-[0.08em]`.
- **Design tokens:** `text-text-muted` (matches `typography.sectionHeader` in design-tokens).
- **Hardcoded:** Only the pixel size `text-[11px]` and `tracking-[0.08em]` (design-tokens uses the same pattern).

### C) Design gaps

- None significant; this is a small, token-aligned component.

### D) What’s already good

- Correct use of `text-text-muted` and consistent with design-tokens section header pattern.

---

## 4. `src/components/ui/page-container.tsx`

### A) Component structure

- **Renders:** Single `main` wrapping `children`. No conditionals.
- **Props:** `children`, `width?` (`"default" | "narrow" | "xnarrow"`), `className?`.

### B) Current styling

- **Tailwind:** `max-w-[1280px]`, `max-w-[896px]`, `max-w-[640px]`, `mx-auto`, `px-4 md:px-6 lg:px-10`, `px-4 md:px-6` (xnarrow). No colors.
- **Design tokens:** Matches `spacing.page` / `pageNarrow` / `pageXNarrow` in concept (same max-widths and padding).
- **Hardcoded:** Arbitrary max-widths (`1280px`, `896px`, `640px`) and breakpoint padding; no CSS variables for these.

### C) Design gaps

- No design gaps for the home page; this is layout-only. Token alignment is conceptual (design-tokens documents same values).

### D) What’s already good

- Clear width variants and consistent horizontal padding; no color drift.

---

## 5. `src/components/ui/badge.tsx`

### A) Component structure

- **Renders:** `Badge` — `span` with `children`. `CEFRBadge` and `VerbGroupBadge` wrap `Badge` with `color` from design-token helpers.
- **Props:** `Badge`: `children`, `color?`, `className?`. `CEFRBadge`: `level`, `className?`. `VerbGroupBadge`: `group`, `label`, `className?`.
- **Conditional:** Only via `color` prop (default vs passed).

### B) Current styling

- **Tailwind:** `text-[11px]`, `font-medium`, `px-2.5`, `py-0.5`, `rounded-full`, `inline-flex`, `items-center`, `whitespace-nowrap`.
- **Design tokens:** `CEFRBadge` and `VerbGroupBadge` use `cefrBadgeClasses(level)` and `verbGroupBadgeClasses(group)` from `@/lib/design-tokens` (returns Tailwind classes like `text-emerald-700 bg-emerald-50`, etc.).
- **Hardcoded:** Default `Badge` color: `text-[#6B7280] bg-[#F3F4F6]` when `color` is not provided.

### C) Design gaps

- Base `Badge` default uses hex instead of tokens (e.g. `text-text-secondary` and a surface/border token for bg).
- Border not used; design-tokens badge pattern doesn’t require it, but some usages (e.g. ChangelogBanner) add borders elsewhere.

### D) What’s already good

- CEFR and Verb Group badges are fully token-driven via design-tokens helpers.
- Size and shape are consistent (`text-[11px]`, `rounded-full`, padding).

---

## 6. `src/components/home-greeting.tsx` (HomePromptCard-style)

### A) Component structure

- **Renders:** Outer `div` → row 1 (PT + divider + EN + CEFR pill), row 2 (pronunciation), row 3 (input + hint + submit when no feedback), hint block, optional “Learn about the structure” link, feedback block (success / correction / partial-or-unknown) with “Try another” button.
- **Props:** `greeting: DailyPrompt` (portuguese, english, pronunciation, level, hint, grammarLink, acceptedResponses, etc.).
- **Conditional:** `!feedback` for input row and hint; `!feedback && greeting.grammarLink` for grammar link; `feedback` for feedback UI; feedback branch by `feedback.type` (success / correction / partial|unknown).

### B) Current styling

- **Tailwind:** `flex`, `flex-col`, `gap-5`, `gap-3`, `min-w-0`, `flex-wrap`, `items-center`, `justify-between`, `hidden md:block`, `truncate`, `w-px`, `h-[34px]`, `mx-5`, `shrink-0`, `self-start md:self-center`, `leading-5`, `leading-[42px]`, `w-full md:flex-1`, `h-[36px]`, `px-3`, `px-5`, `rounded-[12px]`, `focus:outline-none`, `focus:ring-1`, `transition-colors duration-200`, `whitespace-nowrap`, `block`, `mt-1`, `mt-3`, `space-y-1`, `p-4`.
- **Design tokens:** None. No `text-text`, `bg-surface`, or border tokens.
- **Hardcoded:**
  - **Colors:** `bg-white`, `border-[#CFD3D9]`, `text-[#262626]`, `text-[#A3AAB4]`, `bg-[#9AA2AD]`, `bg-[#F3F4F6]`, `text-[#111827]`, `placeholder:text-[#CFD3D9]`, `focus:border-[#111827]`, `focus:ring-[#111827]`, `bg-[#F4F4F4]`, `text-[#A2A6AE]`, `hover:text-[#475569]`, `hover:border-[#A2A6AE]`, `bg-[#111827]`, `border-[#111827]`, `hover:bg-[#1F2937]`, `bg-[rgba(224,231,255,0.75)]`, `border-[rgba(79,70,229,0.75)]`, `text-[rgba(79,70,229,0.75)]`, `hover:bg-[rgba(224,231,255,1)]`, `bg-emerald-50`, `border-emerald-100`, `text-emerald-700`, `text-emerald-600`, `bg-amber-50`, `border-amber-100`, `text-amber-700`, `text-amber-600`, `bg-[#F3F4F6]`, `border-[#E5E7EB]`, `text-[#374151]`, `text-[#6B7280]`, `text-[#111827]`, `hover:text-[#1F2937]`.
  - **Sizes:** `rounded-[12px]`, `p-[30px]`, `text-2xl`, `text-[12px]`, `text-[13px]`, `text-[11px]`.
- **Border radius / shadow:** `rounded-[12px]` everywhere; no shadows. Grammar link and feedback blocks have borders.

### C) Design gaps

- Entire component is off-token: no `text-text`, `text-text-muted`, `bg-bg`, `bg-surface`, `border-border`, or accent tokens.
- Custom grays (`#CFD3D9`, `#262626`, `#A3AAB4`, `#F4F4F4`, etc.) don’t match globals.css or design-tokens.
- Grammar link uses custom indigo-style rgba instead of `--color-accent*` tokens.
- No hover on the container or secondary actions beyond buttons.
- Success/correction/neutral feedback styling is ad hoc (emerald/amber/hex) and not tied to a shared feedback token set.

### D) What’s already good

- Layout and responsive behavior (stack on mobile, row on desktop) are clear.
- Focus styles are present on the input and buttons.
- Feedback types are visually distinct.

---

## 7. `src/components/lesson-preview.tsx`

### A) Component structure

- **Renders:** Wrapper `div` → `Link` → `Card interactive` → label line (“All Lessons Complete” / “Continue Learning” / “Start Learning”), title, Portuguese title, meta line, `ProgressBar`. `CEFRBadge` in header.
- **Props:** None. Uses `useAuth()`, `getAllLessonProgress()`, `lessons`, `getLessonItemCount()` to compute `activeLesson` and progress.
- **Conditional:** Returns `null` when `authLoading || !loaded` or when `!activeLesson`.

### B) Current styling

- **Tailwind:** `mt-6`, `block group`, `mb-2`, `text-[11px]`, `font-semibold`, `uppercase`, `tracking-widest`, `mb-2`, `text-[18px]`, `font-semibold`, `text-[13px]`, `font-medium`, `italic`, `mt-0.5`, `shrink-0`, `mt-2`, `mt-3`.
- **Design tokens:** None for text or background; `Card` and `ProgressBar` supply token-based styling.
- **Hardcoded:** `text-[#9CA3AF]`, `text-[#111827]`, `text-[#6B7280]` for label, title, meta.

### C) Design gaps

- Label and body text use hex instead of `text-text-muted`, `text-text`, `text-text-secondary`.
- No token for “card title” (e.g. `typography.cardTitleLg` for the lesson title).
- “Continue Learning” card has no extra visual hierarchy beyond the progress bar (could use a token for emphasis).

### D) What’s already good

- Uses shared `Card` (interactive) and `ProgressBar`; link wraps the whole card for a large tap target.
- Progress bar is token-aligned (see ProgressBar section).

---

## 8. `src/components/changelog-banner.tsx`

### A) Component structure

- **Renders:** When not dismissed: wrapper `div` → `Link` (version badge + title + optional summary + “See all updates →”) → dismiss `button`. Uses `localStorage` and `version` to hide once dismissed.
- **Props:** `version`, `title`, `summary?`, `firstChange?`.
- **Conditional:** Early return `null` when `!show` (not mounted or dismissed). Optional `summary` vs `firstChange` in copy; `bannerText` truncation on small screens.

### B) Current styling

- **Tailwind:** `mt-6 mb-4`, `rounded-lg`, `border`, `px-4 py-3`, `flex items-center gap-3`, `flex-1 min-w-0`, `gap-2`, `shrink-0`, `text-[11px]`, `font-semibold`, `px-2 py-0.5`, `rounded`, `font-medium`, `truncate`, `hidden sm:inline`, `max-w-[40ch]`, `inline-block align-bottom`, `group-hover:underline`, `text-[13px]`, `p-1.5`, `rounded-md`, `min-h-[44px] min-w-[44px]`, `flex items-center justify-center`, `transition-colors duration-200`.
- **Design tokens:** `text-text` on the link; `text-text-3` and `hover:text-text` on the dismiss button.
- **Hardcoded:** Container: `border-blue-200`, `bg-sky-50`; inline style `borderLeftWidth: "3px", borderLeftColor: "#111827"`. Version pill: `bg-blue-100`, `text-blue-800`, `border border-blue-200`. “See all updates”: `text-blue-800`. Dismiss hover: `hover:bg-blue-100`.

### C) Design gaps

- Left border uses inline style and `#111827` instead of a token (e.g. accent or `--color-btn-primary`).
- Banner uses blue/sky palette instead of a single “info” or “accent” token set; not aligned with `design-tokens.patterns.card.featured` (accent left border).
- No focus ring on the dismiss button for keyboard users.

### D) What’s already good

- Link and dismiss use `text-text` and `text-text-3`/`hover:text-text` where appropriate.
- Accessible dismiss target size (`min-h-[44px] min-w-[44px]`).
- Truncation and responsive visibility of summary are handled.

---

## 9. `src/components/layout/topbar.tsx`

### A) Component structure

- **Renders:** `header` (sticky) with logo link, nav (Revision dropdown, How to Learn, Culture, Library dropdown), optional “What’s New” link, search button, auth (loading placeholder / user menu / login link). Then optional mobile overlay (backdrop + panel with nav links and auth). `SearchModal` controlled by state.
- **Props:** None. Uses `usePathname`, `useRouter`, `useAuth`, and many `useState`/`useEffect`/`useRef` for menus and shortcuts.
- **Conditional:** Auth UI (loading vs user vs login); “What’s New” only when not loading and no user; dropdown panels and mobile menu by state; MegaPanel items by `isCurrent`.

### B) Current styling

- **Tailwind:** Extensive: sticky, z-50, h-14, flex, gap-4/6/3/2/1, padding, rounded-full/rounded-lg/rounded-md, transition-colors/duration-200, text-[13px], text-sm, text-xs, w-[420px], max-w-[420px], p-6, grid, gap-3, p-4, min-h-[44px], etc.
- **Design tokens:** `text-text-2`, `hover:text-text`, `hover:bg-[#FAFAFA]` (mobile menu button, user menu links); `text-text` (user menu display name); `text-text-2` (menu links). Search and user avatar areas use gray/hex.
- **Hardcoded:** Header: `bg-white/80`, `backdrop-blur-xl`, `border-b border-[#F3F4F6]`, `shadow-[0_1px_3px_rgba(0,0,0,0.04)]`. Mega panel: `bg-white`, `border border-gray-200/80`, `rounded-xl`, `shadow-lg shadow-black/5`, `text-gray-400`, `border-gray-100`, `hover:border-[#111827]/30`, `hover:bg-[#111827]/[0.03]`, `hover:shadow-sm`, `hover:-translate-y-0.5`, `border-[#111827]/30`, `bg-[#111827]/5`, `text-gray-900`, `text-[#6B7280]`. Tab/direct link: `text-gray-900`, `text-gray-600`, `hover:text-gray-900`. Search: `bg-gray-100/80`, `hover:bg-gray-200/80`, `border-gray-200/50`, `text-gray-400`, `focus:ring-gray-300/50`, `bg-gray-200/60`. User button: `bg-[#111827]`, `text-white`. Dropdown: `border-gray-200`, `bg-white`, `shadow-lg`, `border-gray-100`, `text-text`, `text-gray-400`, `hover:bg-[#FAFAFA]`. Login link: `border-[#111827]`, `text-[#111827]`, `hover:bg-[#F3F4F6]`. Mobile: `bg-black/10`, `backdrop-blur-sm`, `bg-white/95`, `border-gray-200/60`, `text-[#111827]`, `border-l-2 border-[#111827]`, `bg-[#111827]/5`, `text-[#6B7280]`, `hover:bg-sky-50`, `text-[#003399]` (login link). Many gray-* and hex values throughout.

### C) Design gaps

- Most of the topbar uses raw gray and hex; only a few spots use `text-text` / `text-text-2`. No `bg-bg`, `border-border`, or `bg-surface` for panels.
- Mobile “Entrar” uses `text-[#003399]` and `hover:bg-sky-50` while desktop uses `#111827` and `#F3F4F6` — inconsistent primary vs secondary CTA.
- Dropdown and mobile panels don’t use a shared elevation or surface token.
- Fixed widths like `w-[420px]` and `w-56` are hardcoded.

### D) What’s already good

- Correct use of `text-text` and `text-text-2` in user menu and some links.
- Accessible patterns: aria attributes, keyboard (Escape, arrows), focus management, min touch targets.
- Animations (`animate-fade-in`, `animate-mega-open`) and transitions are consistent.

---

## 10. `src/components/pronunciation-button.tsx`

### A) Component structure

- **Renders:** `span` (relative) → `button` (SpeakerIcon) → optional tooltip when `voiceUnavailable`. Returns `null` if no `speechSynthesis`.
- **Props:** `text`, `speed?`, `className?`, `size?` (`"sm" | "md"`), `variant?` (`"default" | "dark" | "muted"`).
- **Conditional:** Tooltip only when `voiceUnavailable`; optional inline `style` for default+md boxShadow.

### B) Current styling

- **Tailwind:** `inline-flex`, `items-center justify-center`, `rounded-full`, `transition-colors duration-200`, `focus:outline-none focus:ring-2 focus:ring-offset-1`, `disabled:opacity-50 disabled:cursor-not-allowed`, size classes `w-7 h-7 min-w-[28px] min-h-[28px]` or `w-9 h-9 min-w-[36px] min-h-[36px]`.
- **Design tokens:** None. Variants are custom.
- **Hardcoded:** Dark: `border-0`, `bg-[#262626]`, `text-white`, `hover:bg-[#404040]`, `focus:ring-gray-400`. Muted: `bg-[#F0F0F0]`, `text-[#6B7280]`, `hover:bg-[#E5E5E5]`, `hover:text-[#374151]`, `focus:ring-gray-300`. Default: `border border-blue-200`, `bg-white`, `text-[#003399]`, `hover:bg-sky-50`, `hover:border-blue-300`, `focus:ring-[#003399]`. Optional `style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}` for default+md. Tooltip: `bg-gray-800`, `text-white`, `text-[11px]`.

### C) Design gaps

- No use of `--color-accent`, `--color-btn-primary`, or `text-text` / `bg-bg`; all variant colors are hex or Tailwind grays.
- Dark variant (`#262626`, `#404040`) doesn’t map to a token (e.g. `--color-btn-primary` / hover).
- Tooltip uses `bg-gray-800` instead of a semantic token.

### D) What’s already good

- Size and focus/disabled behavior are clear; `variant` supports home vs other contexts.
- Accessible: `aria-label`, `title`, disabled when voices not ready.

---

## 11. `src/components/ui/progress-bar.tsx`

### A) Component structure

- **Renders:** Flex container → track `div` → fill `div` (width from `completed/total`) → optional label `span` when `showLabel`.
- **Props:** `completed`, `total`, `showLabel?`, `size?` (`"sm" | "md"`), `className?`.
- **Conditional:** Label only when `showLabel`; fill width is `0%` when `total === 0`.

### B) Current styling

- **Tailwind:** `flex items-center gap-3`, `flex-1`, `h-1.5` or `h-2`, `rounded-full`, `overflow-hidden`, `h-full`, `transition-all duration-300`, `text-[13px]`, `font-medium`, `shrink-0`. Fill width via inline `style={{ width: \`${pct}%\` }}`.
- **Design tokens:** `bg-border-light` (track), `bg-text` (fill), `text-text-muted` (label).
- **Hardcoded:** Only height and font size (`h-1.5`/`h-2`, `text-[13px]`).

### C) Design gaps

- None for token alignment; track, fill, and label use tokens correctly.

### D) What’s already good

- Fully aligned with theme: `bg-border-light`, `bg-text`, `text-text-muted`.
- Simple API and smooth width transition.

---

## 12. `src/components/home-progress-banner.tsx` (home-specific, not used on home page)

### A) Component structure

- **Renders:** Either (1) progress summary: `div` with sections (Conjugations, Vocabulary, Grammar) each showing label + level, then “View full progress →” link; or (2) CTA: two paragraphs + “Go to Level Tests →” button. Returns `null` if `progress === null` or if no `hasAnyTest` and no CTA block (both branches return content; CTA is the else branch).
- **Props:** None. Uses `useAuth()`, `getProgress(user?.id)`.
- **Conditional:** `progress === null` → null; `hasAnyTest` → progress summary; else → CTA.

### B) Current styling

- **Tailwind:** `space-y-2`, `flex items-center justify-between`, `text-[13px]`, `font-medium`, `capitalize`, `mt-3`, `inline-block`, `transition-colors`, `mb-1`, `mb-4`, `inline-flex items-center justify-center`, `px-4 py-2.5`, `text-[13px]`, `rounded-[10px]`, `duration-200`.
- **Design tokens:** Only link uses `text-[#003399]`, `hover:text-[#002277]` (accent-like).
- **Hardcoded:** `text-[#374151]`, `text-[#9CA3AF]`, `bg-[#111827]`, `text-white`, `hover:bg-[#1F2937]`, `rounded-[10px]`.

### C) Design gaps

- Not used on the home page (audit scope). If used elsewhere: no `text-text`, `text-text-secondary`, or `bg-btn-primary`; uses hex and custom radius.

### D) What’s already good

- Clear two states (progress summary vs CTA); link points to level tests.

---

## Summary table (token vs hardcoded)

| File | Token use | Hardcoded / off-token |
|------|-----------|------------------------|
| `page.tsx` | Minimal (`text-text-secondary`, `bg-border-light`) | Greeting, stats, Today’s Picks, Explore: most text and surfaces hex |
| `card.tsx` | `border-border`, `bg-bg`, `bg-surface` for outline/surface | `featured` and interactive hover (shadow, border, accent) |
| `section-header.tsx` | `text-text-muted` | Only numeric size/tracking |
| `page-container.tsx` | N/A (layout) | Max-widths/padding not from theme vars |
| `badge.tsx` | CEFR/VerbGroup from design-tokens | Base Badge default hex |
| `home-greeting.tsx` | None | Entire component (borders, text, buttons, feedback) |
| `lesson-preview.tsx` | Via Card + ProgressBar | All local text colors hex |
| `changelog-banner.tsx` | `text-text`, `text-text-3` | Container and pill blue/sky + inline left border |
| `topbar.tsx` | `text-text`, `text-text-2` in places | Most colors gray/hex |
| `pronunciation-button.tsx` | None | All variant colors and tooltip |
| `progress-bar.tsx` | `bg-border-light`, `bg-text`, `text-text-muted` | None |
| `home-progress-banner.tsx` | Accent-like link only | Body text and button hex |

---

*End of audit. No files were modified.*
