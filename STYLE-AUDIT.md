# Full Styling Audit — UI Patterns Across the Codebase

This document extracts every UI styling pattern from `src/app/` and `src/components/` (`.tsx` files). No code was modified; this is a read-only report.

---

## 1. Page Headers

For every page (`src/app/**/page.tsx`): title element, subtitle/count, section padding, back navigation, max-width container.

| Page | Title Size | Title Weight | Subtitle / Count | Section Padding | Container | Back Nav |
|------|------------|--------------|-----------------|-----------------|----------|---------|
| Home (`page.tsx`) | — (no single h1) | — | — | `pt-8 md:pt-12 pb-16 md:pb-20` (Daily Focus); `pb-12 pt-2` (sections); `pb-16 pt-2` (stats) | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-6` on `<main>` | — |
| Conjugations | `text-[22px]` | `font-bold tracking-tight` | `text-[13px] text-text-3` | — (wrapper `flex flex-col gap-2 py-5`) | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | — |
| Conjugations Detail (`[verb]`) | `text-[22px]` (span for slug) | `font-bold tracking-tight` | `text-[13px] text-text-3` | `py-5` on header div | `w-full px-4 md:px-6 lg:px-10` (no max-w on main) | `text-text-3 hover:text-text transition-colors` (Link) |
| Vocabulary Index | `text-3xl md:text-[36px]` | `font-bold tracking-tight text-gray-900` | `text-lg text-[#3C5E95]/70` (PT); `text-[14px] text-gray-500` (count) | `py-12 md:py-16` | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | — |
| Vocabulary Detail (`[category]`) | `text-[22px]` | `font-bold tracking-tight` | `text-[13px] text-text-3` | `py-5` (header div) | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | `text-text-2 hover:text-text text-[14px] transition-colors w-fit` (← category) |
| Grammar Index | `text-[22px]` | `font-bold tracking-tight text-text` | `text-[13px] text-text-3 mt-0.5` | `py-5` | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | — |
| Grammar Detail (`[topic]`) | `text-[22px]` | `font-bold tracking-tight` | `text-[14px] text-[#3C5E95] font-medium` (titlePt); `text-[13px] text-text-3 mt-1` (summary) | `py-5` (header) | `max-w-[800px] mx-auto px-4 md:px-6 lg:px-10` | `text-text-2 hover:text-text text-[14px] transition-colors w-fit` (← Grammar) |
| Practice | `text-2xl md:text-3xl` | `font-bold text-gray-900 tracking-tight` | `text-lg text-[#3C5E95]/70 font-medium`; `text-sm text-gray-500 mt-2` | — (header `mb-10`) | Inner: `max-w-[1200px] mx-auto px-4 md:px-6 lg:px-10 py-10`; main `min-h-screen bg-[#fafafa]` | — |
| Practice Flashcards | `text-2xl md:text-3xl` | `font-bold text-gray-900 tracking-tight` | `text-lg text-[#3C5E95]/70 font-medium`; `text-sm text-gray-500 mt-2` | — (header `mb-8` setup; session/results vary) | `max-w-[1200px] mx-auto px-6 md:px-10 py-10` (setup); session `py-6` | — |
| Culture | `text-3xl md:text-[36px]` | `font-bold tracking-tight text-gray-900` | `text-lg text-[#3C5E95]/70 font-medium`; `text-[14px] text-gray-500 mt-1`; `text-sm text-gray-400 mt-2` | `py-10 md:py-14` | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | — |
| Dashboard | `text-3xl md:text-4xl` | `font-bold tracking-tight text-text` | `text-text-2 mt-1 text-[15px]` | `pt-12 pb-8` (header) | `max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10` | — |
| Changelog | `text-2xl md:text-[28px]` | `font-bold tracking-tight text-text` | `text-text-2 text-[15px] mt-1` | `pt-10 pb-8` (header) | `max-w-[896px] mx-auto px-4 md:px-6 lg:px-10 pb-16` | — |
| Guide | `text-3xl` | `font-bold text-gray-900` | `text-xl text-[#3C5E95]/70 font-medium mt-1`; `text-base text-gray-500 mt-3` | — (header `mb-8`) | `max-w-3xl mx-auto px-6 py-12` | — |
| Settings | `text-2xl` | `font-bold tracking-tight text-text` | — | — | `max-w-[640px] mx-auto px-4 md:px-6 py-12` | — |

**⚠️ Inconsistency:** Title sizes vary: `text-[22px]` (Conjugations, Vocabulary detail, Grammar), `text-2xl`/`text-3xl` (Practice, Guide, Culture, Dashboard), `text-3xl md:text-[36px]` (Vocabulary, Culture). Main container max-widths: `1280px`, `1200px`, `896px`, `800px`, `640px`, `3xl`. Conjugations detail uses `w-full` (no max-w) on `<main>`.

---

## 2. Search Bars

Every `<input>` used as a search bar: location, full className, width, height, border-radius, border color, focus styles.

| Location | Full className (verbatim) | Width | Height | Radius | Border | Focus Style |
|----------|---------------------------|-------|--------|--------|--------|-------------|
| Conjugations Index | `w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200` | w-full md:w-[280px] | h-10 | rounded-[12px] | border-[#E9E9E9] | focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] |
| Vocabulary Index | `w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200` | w-full md:w-[280px] | h-10 | rounded-[12px] | border-[#E9E9E9] | focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] |
| Vocabulary [category] | `w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200` | w-full md:w-[280px] | h-10 | rounded-[12px] | border-[#E9E9E9] | focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] |
| Grammar Index | `w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200` | w-full md:w-[280px] | h-10 | rounded-[12px] | border-[#E9E9E9] | focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] |
| Culture (sayings) | `px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#3C5E95]/50 w-[200px] transition-colors` | w-[200px] | py-1.5 (implicit) | rounded-lg | border-gray-200 | focus:border-[#3C5E95]/50 |
| Culture (false friends) | `px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#3C5E95]/50 w-[220px] transition-colors` | w-[220px] | — | rounded-lg | border-gray-200 | focus:border-[#3C5E95]/50 |
| Culture (etiquette) | `px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#3C5E95]/50 w-[220px] transition-colors` | w-[220px] | — | rounded-lg | border-gray-200 | focus:border-[#3C5E95]/50 |
| Culture (regional) | `px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#3C5E95]/50 w-[220px] transition-colors` | w-[220px] | — | rounded-lg | border-gray-200 | focus:border-[#3C5E95]/50 |
| Home Greeting (`home-greeting.tsx`) | `flex-1 h-11 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[15px] text-[#111827] placeholder:text-[#C9CDD3] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200` | flex-1 | h-11 | rounded-[12px] | border-[#E9E9E9] | focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] |
| Search Modal | `flex-1 min-w-0 py-2.5 text-lg bg-transparent border-none outline-none placeholder:text-gray-400 text-gray-900 transition-opacity duration-200` (+ placeholder fade) | flex-1 min-w-0 | py-2.5 | — (no border) | none | outline-none (no ring) |

**⚠️ Inconsistency:** Culture search inputs use `rounded-lg`, `border-gray-200`, `focus:border-[#3C5E95]/50`, and fixed widths (200px/220px); Conjugations/Vocabulary/Grammar use `rounded-[12px]`, `border-[#E9E9E9]`, full focus ring, and `md:w-[280px]`. Search modal input has no border/radius (minimal style).

---

## 3. Filter Pills / Tab Buttons

Filter buttons and tab navigation: page/component, active/inactive/container classNames, separators.

| Location | Active Style | Inactive Style | Container |
|----------|--------------|----------------|-----------|
| Conjugations Index | `bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full` | `bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200` | `flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]`; separators: `w-px h-5 bg-[#E9E9E9] mx-1 shrink-0` for "\|" |
| Vocabulary Index | `bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full` | `bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200` | `flex items-center gap-2 flex-wrap pb-6 border-t border-gray-200 pt-5` |
| Vocabulary [category] | `bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full` | `bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200` | `flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]` |
| Conjugations [verb] (tenses) | `bg-[#3C5E95] text-white border-[#3C5E95]` (with `px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors duration-200`) | `bg-white text-text-2 border-border hover:bg-bg-s hover:border-gray-300` | `flex gap-1.5 flex-wrap mb-4 pb-3 border-b border-border-l` |
| Culture (tabs) | `text-[#3C5E95] border-b-2 border-[#3C5E95] -mb-px` (with `pb-3 px-1 text-sm font-medium ... min-h-[44px] flex flex-col items-center sm:items-start`) | `text-gray-400 hover:text-gray-600` | `border-b border-gray-200 mb-6 mt-8 overflow-x-auto whitespace-nowrap`; inner `flex gap-1 min-w-max pb-px` |
| Culture (CEFR pills) | `bg-[#3C5E95] text-white` (with `px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200`) | `bg-white text-gray-600 border border-gray-200 hover:bg-gray-50` | `flex items-center gap-2 flex-wrap` (inside `flex flex-col gap-4 pb-6 border-t border-gray-200 pt-5`) |
| Culture (theme/etiquette/region pills) | `bg-[#3C5E95] text-white` (with `px-3 py-1 rounded-full text-xs font-medium` or `px-4 py-1.5` for CEFR) | `bg-white text-gray-600 border border-gray-200 hover:bg-gray-50` | same as above, `gap-2 flex-wrap` |

**⚠️ Inconsistency:** Conjugations/Vocabulary use black active pill (`bg-[#262626]`) and gray border inactive; Conjugations detail and Culture use blue active (`bg-[#3C5E95]`) and different borders. Culture tabs use underline style, not pill.

---

## 4. Cards

Card-like elements (links or divs): page/component, what it represents, wrapper classNames, hover, grid.

| Location | Card Type | Border | Radius | BG | Padding | Hover | Grid Gap |
|----------|-----------|--------|--------|-----|---------|--------|----------|
| Home | Word/Verb/Saying of the Day | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | `p-5 md:p-7` (body); hero area has image | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200` | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` |
| Home | Section cards (Conjugations, Vocabulary, etc.) | `border border-border` (ready); `border border-dashed border-border` (disabled) | `rounded-lg` | `bg-white` (ready); `bg-bg-s` (disabled) | `p-4 md:p-6` | `hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(60,94,149,0.08)] hover:-translate-y-px` (ready) | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` |
| Conjugations Index | Verb card | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | `p-5` | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200` | `grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3` |
| Vocabulary Index | Category card | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | inner `p-5` | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200` | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` |
| Vocabulary [category] | Word card (WordCard) | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | `p-5` | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]`; highlight `ring-2 ring-[#3C5E95] ring-offset-2` | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` |
| Grammar Index | Topic card | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | `p-5` | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200` | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4` |
| Grammar [topic] | Intro/Rules/Tips blocks | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white` | `p-5` | — | `space-y-6` (rules) |
| Practice | Practice mode card | `border border-[#E5E5E5]` | `rounded-[14px]` | `bg-white`; header strip `bg-gradient-to-br from-[#EBF2FA]...` | `p-5` (body); icon area `h-[100px]` | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200` | `grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4` |
| Flashcards (setup) | Setup form container | `border border-gray-200` | `rounded-xl` | `bg-white` | `p-6` | — | — |
| Flashcards (session) | Flashcard | `border border-gray-200` | `rounded-xl` | `bg-white` | `p-6` (front/back) | — | — |
| Culture | SayingCard | `border rounded-lg`; default `border-gray-200`; highlighted `ring-2 ring-[#3C5E95]/40 border-[#3C5E95]/30` | `rounded-lg` | `bg-white` | `p-6` | `hover:border-[#3C5E95]/30 hover:shadow-sm transition-all duration-200` | — (stacked `mb-4`) |
| Culture | FalseFriendCard | `border border-gray-200` | `rounded-lg` | `bg-white` | `p-6` | `hover:border-[#3C5E95]/30 hover:shadow-sm transition-all duration-200` | — |
| Culture | EtiquetteCard | `border border-gray-200` | `rounded-lg` | `bg-white` | `p-6` | `hover:border-[#3C5E95]/30 hover:shadow-sm transition-all duration-200` | — |
| Culture | RegionalCard | `border border-gray-200` + `border-l-[3px]` (dynamic color) | `rounded-lg` | `bg-white` | `p-6` | `hover:border-[#3C5E95]/30 hover:shadow-sm transition-all duration-200` | — |
| Dashboard | Section progress card | `border` (style borderColor from SECTION_COLORS) | `rounded-lg` | colors.bg | `p-4 md:p-5` | `hover:shadow-[0_4px_16px_rgba(60,94,149,0.08)] hover:-translate-y-px transition-all duration-200` | `grid-cols-1 md:grid-cols-3 gap-4` |
| Topbar | Learn menu item | `border` (current: `border-[#3C5E95]/30`; guide: `border-dashed border-gray-200`; else `border-gray-100`) | `rounded-lg` | current `bg-[#3C5E95]/5` | `p-4` | `hover:border-[#3C5E95]/30 hover:bg-[#3C5E95]/[0.03] hover:shadow-sm hover:-translate-y-0.5` | `grid grid-cols-3 gap-3` |
| Guide | Accordion section | `border rounded-lg`; open `border-[#3C5E95]/30`; else `border-gray-200` | `rounded-lg` | `bg-white` | button `p-6`; content `pt-6 px-6 pb-6` | `hover:border-[#3C5E95]/30 hover:shadow-sm` | `space-y-3` |
| Home Progress Banner | Progress CTA | `border border-border` | `rounded-xl` | `bg-white` | `p-4` | `hover:border-[#ccc] transition-all duration-150` | — |
| Changelog Banner | Banner | `border border-blue-200` + 3px left `#3C5E95` | `rounded-lg` | `bg-sky-50` | `px-4 py-3` | — | — |
| Practice (question card) | PracticeQuestionCard | `border border-gray-100` | `rounded-2xl` | `bg-white` | `p-8` | — | — |

**⚠️ Inconsistency:** Most content cards use `rounded-[14px]` and `border-[#E5E5E5]`; Culture and Guide use `rounded-lg` and `border-gray-200`. Hover shadow is either `0_4px_16px_rgba(0,0,0,0.06)` or `hover:shadow-sm` and sometimes `hover:-translate-y-px`.

---

## 5. Badges / Pills

Badge or pill elements: location, what they label, implementation (Badge vs span), className/variant, colors.

| Location | Label Type | Implementation | Text Color | BG Color | Border |
|----------|------------|----------------|------------|---------|--------|
| `ui/badge.tsx` | Generic (tense, CEFR, priority, etc.) | `<Badge>` component | Via variant (e.g. green `#15803d`, blue `#1d4ed8`, gray `#52525b`) | Via variant (e.g. `#f0fdf4`, `#eff6ff`, `#f4f4f5`) | Via variant (e.g. `#bbf7d0`, `#93c5fd`, `#d4d4d8`) |
| Conjugations [verb] | Priority, CEFR | `<Badge variant={priorityVariant}>, <Badge variant={cefrVariant}>` | — | — | — |
| Conjugations [verb] | Tense, CEFR (tense), Type (Reg./Irreg.) | `<Badge variant={tenseVariant}>`, etc. | — | — | — |
| Conjugations Index | Verb group, CEFR | Inline `<span>` | Conditional: amber-700 / emerald-700 / blue-700 / violet-700; CEFR `text-[#3C5E95]` | amber-50 / emerald-50 / blue-50 / violet-50; CEFR `bg-[#EBF2FA]` | — (rounded-full) |
| Home (daily cards) | CEFR, category, verb group | Inline `<span>` | `text-[#3C5E95]` (CEFR); `text-amber-700` / `text-emerald-700` (group); white on dark bg | `bg-[rgba(232,240,249,0.75)]`, `bg-white`, `bg-amber-50`-style, `bg-emerald-50`-style | — |
| Vocabulary [category] WordCard | CEFR, gender, Related, Pro Tip | Inline `<span>` | CEFR `text-[#3C5E95]`; gender blue-700/pink-700; Related `text-[#6B7280]`; Pro Tip `text-amber-600` | CEFR `bg-[#EBF2FA]`; gender blue-50/pink-50; Related `bg-[#F3F4F6]`; Pro Tip `bg-[#FFFBEB] border-[#FEF3C7]` | Pro Tip has `border border-[#FEF3C7]` |
| Grammar Index (topic card) | CEFR | Inline `<span>` | `text-[#3C5E95]` | `bg-[#EBF2FA]` | — |
| Grammar [topic] header | CEFR | Inline `<span>` | `text-[#3C5E95]` | `bg-[#EBF2FA]` | — |
| Culture SayingCard/FalseFriendCard | CEFR | Inline `<span>` | `text-gray-700` | `bg-gray-100` | `border border-gray-200` |
| Culture RegionalCard | Region, CEFR | Inline `<span>`; region uses `regionBadgeClass()` | e.g. yellow-700, blue-700, gray-700 | e.g. yellow-50, blue-50, gray-100 | e.g. border-yellow-200, border-gray-200 |
| Home Greeting | Level | Inline `<span>` | `text-[#3C5E95]` | `bg-[#EBF2FA]` | — |
| Search Modal (result type) | Type badge | Inline `<span>` | e.g. blue-800, purple-800, amber-800 | e.g. bg-blue-100, bg-amber-100 | e.g. border-blue-200, border-amber-200 |
| Changelog (version) | Version | Inline `<span>` | `text-blue-800` | `bg-blue-100` | `border border-blue-200` |

**⚠️ Inconsistency:** CEFR is sometimes `#3C5E95` + `#EBF2FA`, sometimes gray-100/gray-700 + border. Badge component uses `rounded-xl` and 11px font; many inline pills use `rounded-full` and `text-[11px] font-semibold`.

---

## 6. Section Labels / Subheadings

Section labels and subheadings: location, example text, font size, weight, tracking, color, case.

| Location | Example Text | Font Size | Weight | Tracking | Color | Case |
|----------|--------------|-----------|--------|----------|--------|------|
| Vocabulary Index | "ESSENTIALS", "O Essencial" | `text-xs` | `font-semibold` | `uppercase tracking-wider` (label); `text-xs font-normal normal-case tracking-normal` (PT) | `text-gray-400`; PT `text-[#3C5E95]/60` | Uppercase (label) |
| Grammar Index | "A1 — Beginner", "A2 — Elementary", "B1 — Intermediate" | `text-[11px]` | `font-semibold` | `uppercase tracking-[0.08em]` | `text-[#9CA3AF]` | Uppercase |
| Grammar [topic] | "Introduction", "Rules", "Tips & Tricks" | `text-[11px]` | `font-semibold` | `uppercase tracking-[0.08em]` | `text-[#9CA3AF]` | Uppercase |
| Grammar [topic] (Examples/Exceptions) | "Examples", "Exceptions" | `text-[10px]` | `font-medium` | `uppercase tracking-[0.08em]` | `text-[#9CA3AF]` | Uppercase |
| Vocabulary section description | e.g. "The building blocks of everyday Portuguese..." | `text-sm` | — | — | `text-gray-500` | — |
| Topbar Learn panel | "LEARN · Aprende" | `text-xs` | `font-semibold` | `uppercase tracking-wider` | `text-gray-400` | Uppercase |
| Search Modal | "Ask me anything"; group labels "Vocabulário", etc. | `text-xs` | `font-semibold` | `uppercase tracking-wider` | `text-gray-400` | Uppercase |
| Vocab [category] Popover | "Related Words", "Pro Tip" | `text-[10px]` | `font-medium` | `uppercase tracking-[0.08em]` | `text-[#9CA3AF]` / `text-amber-600` | Uppercase |
| Dashboard | "Current Focus", "Levels Passed", "Last Tested" | `text-xs` | `font-medium` | `uppercase tracking-wide` | `text-text-3` | Uppercase |
| Mobile nav (topbar) | "LEARN · Aprende" | `text-xs` | `font-semibold` | `uppercase tracking-wider` | `text-gray-400` | Uppercase |

**⚠️ Inconsistency:** Section labels use either `text-xs` or `text-[11px]`/`text-[10px]`; tracking is either `tracking-wider` or `tracking-[0.08em]`. Color alternates between `gray-400`, `text-[#9CA3AF]`, and `text-text-3`.

---

## 7. Typography — Body Text

Key text in cards and content: location, role, font size, weight, color, leading.

| Location | Role | Font Size | Weight | Color | Leading |
|----------|------|-----------|--------|--------|---------|
| Home (daily card) | Card label ("Word of the Day") | `text-[16px] md:text-[20px]` | `font-semibold` | `text-white` | `leading-[26px]` |
| Home (daily card) | Portuguese title (word/verb/saying) | `text-[26px] md:text-[32px]` | `font-bold` | `text-[#111827]` | `leading-[35px]` |
| Home (daily card) | English translation | `text-[18px]` / `text-[16px]` | `font-medium` | `text-[#374151]` | — / break-words |
| Home (daily card) | Pronunciation (font-mono) | `text-[14px]` | — | `text-[#9CA3AF]` | `leading-[18px]` |
| Home (section card) | Section title | `text-lg` | `font-bold` | `text-text` | `tracking-tight` |
| Home (section card) | Stat / description | `text-[13px]` / `text-[12px]` | — | `text-text-2` / `text-text-3` | — |
| Conjugations Index (verb card) | Verb name | `text-[17px]` | `font-bold` | `text-[#111827]` | `tracking-[-0.34px] leading-[27px]` |
| Conjugations Index (verb card) | English | `text-[13px]` | — | `text-[#6B7280]` | `leading-relaxed` |
| Vocabulary Index (category card) | Category title | `text-[18px]` | `font-bold` | `text-[#111827]` | — |
| Vocabulary Index (category card) | PT title | `text-[13px]` | `font-medium` | `text-[#3C5E95]` | — |
| Vocabulary Index (category card) | Description | `text-[13px]` | — | `text-[#9CA3AF]` | `leading-relaxed italic` |
| Vocabulary [category] (WordCard) | Word (Portuguese) | `text-[20px]` | `font-bold` | `text-[#111827]` | `leading-tight` |
| Vocabulary [category] (WordCard) | English | `text-[15px]` | `font-medium` | `text-[#374151]` | — |
| Vocabulary [category] (WordCard) | Example sentence | `text-[13px]` | italic | `text-[#1F2937]` | `leading-snug` |
| Grammar Index (topic card) | Topic title | `text-[17px]` | `font-bold` | `text-[#111827]` | `tracking-tight` |
| Grammar Index (topic card) | Summary | `text-[13px]` | — | `text-[#9CA3AF]` | `leading-relaxed line-clamp-2` |
| Grammar [topic] | Intro body | `text-[14px]` | — | `text-[#374151]` | `leading-relaxed` |
| Grammar [topic] | Rule title | `text-[15px]` | `font-semibold` | `text-[#111827]` | — |
| Grammar [topic] | Rule PT / examples | `text-[13px]` | italic / — | `text-[#6B7280]` / `text-[#9CA3AF]` | — |
| Practice mode card | Mode title | `text-[20px]` | `font-bold` | `text-[#111827]` | — |
| Practice mode card | Portuguese / description | `text-[14px]` | `font-medium` / — | `text-[#3C5E95]` / `text-[#6B7280]` | `leading-relaxed` |
| Culture SayingCard | Saying quote | `text-lg` | `font-semibold` | `text-gray-900` | italic |
| Culture SayingCard | Literal/Meaning/When to use | `text-sm` | `font-semibold` / — | `text-gray-500` / `text-gray-700` | — |
| Dashboard section card | Section name | `text-[17px]` | `font-normal` | style color (colors.title) | capitalize |
| Dashboard section card | Level/description | `text-[15px]` / `text-[14px]` | — | style opacity 0.5 | — |
| Changelog | Entry title | `text-lg` | `font-semibold` | `text-text` | — |
| Changelog | Summary / list | `text-base` / `text-sm` | — | `text-gray-600` / `text-gray-700` | `leading-snug` / — |
| Guide (section content) | Body | `text-base` | — | `text-gray-700` | `leading-relaxed` |
| Guide (section content) | Subheading | — | `font-semibold` | `text-gray-900` | — |
| Home Greeting | Greeting phrase | `text-[28px] md:text-[34px]` | `font-bold` | `text-[#111827]` | `leading-tight` |
| Home Greeting | English / pronunciation | `text-[16px]` / `font-mono text-[13px]` | — | `text-[#9CA3AF]` | — |

**⚠️ Inconsistency:** Primary content uses both semantic tokens (`text-text`, `text-text-2`, `text-text-3`) and raw grays (`text-gray-900`, `text-[#111827]`, `text-[#6B7280]`). Font sizes for “title” in cards vary: 17px, 18px, 20px, 26–32px.

---

## 8. Pronunciation Buttons

Every `<PronunciationButton>` usage: location, context, size, variant, extra classes.

| Location | Context | Size | Variant | Extra Classes |
|----------|---------|------|---------|----------------|
| Home (Word of the Day) | Main word | md | dark | `w-8 h-8 min-w-[32px] min-h-[32px] shrink-0` |
| Home (Verb of the Day) | Main verb | md | dark | `w-8 h-8 min-w-[32px] min-h-[32px] shrink-0` |
| Home (Saying of the Day) | Main saying | md | dark | `w-8 h-8 min-w-[32px] min-h-[32px] shrink-0` |
| Conjugations [verb] (header) | Verb slug | md | default (not specified) | `shrink-0` |
| Conjugations [verb] (mobile card) | Conjugation row | sm | muted | — |
| Conjugations [verb] (desktop table) | Conjugation cell | sm | muted | — |
| Vocabulary [category] (WordCard) | Main word | md | dark | `shrink-0` |
| Vocabulary [category] (WordCard) | Example sentence | sm | muted | `shrink-0 mt-0.5` |
| Grammar [topic] | Rule example (pt) | sm | muted | `shrink-0` |
| Flashcards (front, PT) | Word on front | sm | default | `shrink-0` |
| Flashcards (back) | Word on back | sm | default | `shrink-0` |
| Culture SayingCard | Saying | sm | default | — |
| Culture FalseFriendCard | Word | sm | default | — |
| Culture RegionalCard | Expression | sm | default | — |
| Home Greeting | Greeting phrase | default (sm) | dark | `mt-3` |
| Search Modal (result row) | Vocabulary result | sm | default | — |

**⚠️ Inconsistency:** When size is omitted, component defaults to `sm`. No single convention for when to use `dark` vs `muted` vs default (dark used on dark/hero contexts, muted in tables/cards).

---

## 9. Dividers / Separators

Dividers: implementation and full className.

| Location | Implementation | Full className / notes |
|----------|-----------------|--------------------------|
| Home (daily card, between title and translation) | Gradient h-px | `h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent` (aria-hidden) |
| Conjugations Index (below filters) | border-b | `border-b border-[#E9E9E9]` on filter container |
| Vocabulary Index (above filters) | border-t | `border-t border-gray-200 pt-5` |
| Vocabulary [category] (below filters) | border-b | `border-b border-[#E9E9E9]` |
| Conjugations [verb] (below tense filters) | border-b | `border-b border-border-l` |
| Grammar [topic] (rule examples/exceptions) | border-t | `border-t border-[#F0F0F0]` |
| Culture SayingCard (sections) | border-t | `border-t border-gray-100 pt-3 mt-3` |
| Culture (below tabs) | border-b | `border-b border-gray-200 mb-6 mt-8` |
| Culture (filter area) | border-t | `border-t border-gray-200 pt-5` |
| Dashboard (quick stats) | border-t | `border-t border-border-l pt-8 pb-16` |
| Dashboard (section card footer) | border-t | `border-t border-border-l` |
| Topbar (user menu) | border | `border-b border-gray-100` (below user info); `my-1 border-t border-gray-100` (above Sair) |
| Topbar (mobile nav) | border | `border-t border-gray-100 my-2 mx-4`; `my-1 border-t border-gray-200 mx-4` |
| Guide (accordion content) | border-t | `border-t border-gray-100 mt-4 pt-6 px-6 pb-6` |
| Changelog (timeline) | Left border | `borderLeftWidth: 2px`, `borderColor: ACCENT` (#3C5E95) on wrapper |
| Home (conjugation rows in verb card) | border-b on rows | `border-b border-[#F9FAFB] last:border-0` |

**⚠️ Inconsistency:** Divider color varies: `border-[#E9E9E9]`, `border-gray-200`, `border-border-l`, `border-gray-100`, `border-[#F0F0F0]`. Some sections use gradient h-px, most use border-t/border-b.

---

## 10. Hover / Transition Effects

Elements with hover or transition: page/component, element type, hover className, transition className.

| Location | Element Type | Hover ClassName | Transition ClassName |
|----------|--------------|-----------------|----------------------|
| Home (daily cards) | Card | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Home (section Link cards) | Link (card) | `hover:border-blue-200 hover:shadow-[0_4px_16px_rgba(60,94,149,0.08)] hover:-translate-y-px` | `transition-all duration-200` |
| Home (section card arrow) | Span | `group-hover:translate-x-0.5` | `transition-transform duration-200` |
| Home (CTA button) | Link (button style) | `hover:bg-[#404040]` | `transition-colors duration-200` |
| Home (stats link) | Link | `hover:text-text` | `transition-colors` |
| Conjugations Index (verb card) | Link | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Conjugations Index (filter inactive) | Button | `hover:border-[#3C5E95] hover:text-[#3C5E95]` | `transition-colors duration-200` |
| Conjugations [verb] (back link) | Link | `hover:text-text` | `transition-colors` |
| Conjugations [verb] (tense inactive) | Button | `hover:bg-bg-s hover:border-gray-300` | `transition-colors duration-200` |
| Conjugations [verb] (conjugation row) | Div (row) | `hover:bg-[#F8FAFC]` | `transition-colors duration-150` |
| Vocabulary Index (category card) | Link | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Vocabulary Index (Explore button) | Span (button style) | `hover:bg-[#404040]` | `transition-colors duration-200` |
| Vocabulary [category] (back link) | Link | `hover:text-text` | `transition-colors` |
| Vocabulary [category] (WordCard) | Card div | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Vocabulary [category] (Related pill) | Span | `hover:bg-[#E5E7EB]` | `transition-colors duration-150` |
| Vocabulary [category] (Pro Tip pill) | Span | `hover:bg-[#FEF3C7]` | `transition-colors duration-150` |
| Grammar Index (topic card) | Link | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Grammar [topic] (back link) | Link | `hover:text-text` | `transition-colors` |
| Practice (mode card) | Div | `hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` | `transition-all duration-200` |
| Practice (CTA link) | Link | `hover:bg-[#404040]` | `transition-colors duration-200` |
| Flashcards (nav buttons) | Button | `hover:bg-gray-200` | `transition-colors` |
| Flashcards (result buttons) | Button | `hover:bg-emerald-100` / `hover:bg-gray-50` / `hover:bg-gray-200` | `transition-colors` |
| Culture (SayingCard etc.) | Article | `hover:border-[#3C5E95]/30 hover:shadow-sm` | `transition-all duration-200` |
| Culture (tab inactive) | Button | `hover:text-gray-600` | `transition-colors` |
| Culture (filter inactive) | Button | `hover:bg-gray-50` | `transition-all duration-200` |
| Culture (example toggle) | Button | `hover:text-[#3C5E95]` | — |
| Dashboard (section card) | Div | `hover:shadow-[0_4px_16px_rgba(60,94,149,0.08)] hover:-translate-y-px` | `transition-all duration-200` |
| Dashboard (Start Level Test link) | Link | `hover:opacity-90` | `transition-all duration-150` |
| Topbar (header) | Header | (when scrolled) border + shadow | `transition-all duration-300 ease-out` |
| Topbar (Learn trigger) | Button | `hover:text-gray-900` (when not active) | `transition-colors duration-200` |
| Topbar (Learn panel item) | Link | `hover:border-[#3C5E95]/30 hover:bg-[#3C5E95]/[0.03] hover:shadow-sm hover:-translate-y-0.5` | `transition-all duration-200` |
| Topbar (search button) | Button | `hover:bg-gray-200/80` | `transition-all duration-200` |
| Topbar (user avatar) | Button | `hover:opacity-90` | `transition-opacity` |
| Topbar (mobile menu link) | Link | `hover:bg-bg-s hover:text-text` | `transition-colors` |
| Topbar (Login link) | Link | `hover:bg-sky-50` | `transition-colors` |
| Search Modal (suggestion) | Button | `hover:bg-[#3C5E95]/10 hover:text-[#3C5E95]` | `transition-colors` |
| Search Modal (result row) | Button | `hover:bg-gray-50` (when not highlighted) | `transition-colors` |
| Search Modal (smart card) | Button | `hover:border-[#3C5E95]/40`; highlighted `ring-2 ring-[#3C5E95]/30` | `transition-all duration-200` |
| PronunciationButton | Button | variant-based (e.g. `hover:bg-[#404040]`, `hover:bg-sky-50`) | `transition-colors duration-200` |
| Guide (accordion) | Article | `hover:border-[#3C5E95]/30 hover:shadow-sm` | `transition-all` |
| Guide (CTA primary) | Link | `hover:bg-[#2E4A75]` | `transition-colors` |
| Guide (CTA secondary) | Link | `hover:bg-sky-50` | `transition-colors` |
| Home Greeting (hint / try again) | Button | `hover:text-[#2E4A75]` | `transition-colors duration-200` |
| Home Progress Banner | Link | `hover:border-[#ccc]` | `transition-all duration-150` |
| Settings (primary button) | Button | `hover:bg-[#2E4A75]` | — |
| Settings (sign out button) | Button | `hover:bg-bg-s` | — |

**⚠️ Inconsistency:** Transition duration is sometimes `duration-200`, sometimes `duration-150` or `duration-300`. Card hover either uses the standard shadow + border change or Culture’s lighter `hover:shadow-sm` + blue tint. Translate on hover is used on some cards (`-translate-y-px`, `-translate-y-0.5`) but not others.
