# Post-Fix Styling Audit V2 — Verify Design Consistency

Scoped to `src/app/**/*.tsx` **excluding** `src/app/auth/**`. No code was modified.

---

## Check 1: Banned Tokens

### ❌ border-border
- 0 occurrences (excluding auth)

### ❌ border-border-l
- **src/app/dashboard/page.tsx:193** — `className={\`flex flex-1 gap-[3px] min-w-0 rounded ${band < 2 ? "border-r border-border-l" : ""}\`}`
- (total: 1 occurrence)

### ❌ bg-bg-s
- 0 occurrences (excluding auth)

### ❌ text-gray-900
- 0 occurrences (excluding auth)

### ❌ text-gray-800
- **src/app/guide/page.tsx:302** — `<td className="px-4 py-2 font-semibold text-gray-800">A1</td>`
- **src/app/guide/page.tsx:309** — `<td className="px-4 py-2 font-semibold text-gray-800">A2</td>`
- **src/app/guide/page.tsx:316** — `<td className="px-4 py-2 font-semibold text-gray-800">B1</td>`
- **src/app/guide/page.tsx:369** — `<p className="text-sm font-semibold text-gray-800">`
- **src/app/guide/page.tsx:395** — `<p className="text-sm font-semibold text-gray-800">`
- **src/app/guide/page.tsx:432** — `<p className="text-sm font-semibold text-gray-800">`
- (total: 6 occurrences)

### ❌ text-gray-700
- 0 occurrences (excluding auth)

### ❌ text-gray-600
- 0 occurrences (excluding auth)

### ❌ text-gray-500
- **src/app/page.tsx:212** — `<p className="text-gray-500 text-[14px]">No vocabulary data.</p>`
- (total: 1 occurrence)

### ❌ text-gray-400
- **src/app/guide/page.tsx:775** — `<p className="text-sm text-gray-400 mt-1">{s.teaser}</p>`
- (total: 1 occurrence)

### ❌ border-gray-200
- 0 occurrences in non-auth files (all in `src/app/auth/**` — skipped)

### ❌ border-gray-100
- 0 occurrences in non-auth files

### ❌ border-gray-50 / bg-gray-50
- **src/app/guide/page.tsx:235** — `className="bg-gray-50 border border-[#E9E9E9] rounded-lg p-4"`
- **src/app/guide/page.tsx:287** — `<thead className="bg-gray-50">`
- **src/app/guide/page.tsx:308** — `className="border-t border-gray-50 bg-gray-50/40"`
- (total: 3 occurrences; not in original banned list but inconsistent with design system)

### ✅ hover:-translate-y
- 0 occurrences

### ✅ hover:border-blue-200
- 0 occurrences

### ✅ hover:border-blue-300
- 0 occurrences

### ❌ hover:border-[#3C5E95]/30
- **src/app/culture/page.tsx:69** — Copy button: `className="... hover:border-[#3C5E95]/30 transition-colors"`
- (total: 1 occurrence)

### hover:shadow-sm on cards
- Cards use full shadow `hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]` where audited; Culture Copy button is not a card. **Pass** for content cards.

### ✅ Gradient dividers
- 0 occurrences of `bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent` (already replaced with `h-px bg-[#F0F0F0]`)

---

## Check 2: Header Consistency

| Page | Title Size | Padding | Status |
|------|-----------|---------|--------|
| Vocabulary Index | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Culture | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Practice | `text-[22px] font-bold tracking-tight` | `py-5` (wrapper) | ✅ |
| Flashcards (setup/results/session) | `text-[22px] font-bold` | `py-5` (wrapper) | ✅ |
| Conjugations Index | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Grammar Index | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Dashboard | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Guide | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Changelog | `text-[22px] font-bold tracking-tight` | `py-5` | ✅ |
| Settings | `text-[22px] font-bold tracking-tight` | — (no section wrapper) | ✅ |
| **Practice Listening (setup)** | `text-2xl md:text-3xl font-bold text-[#111827] tracking-tight` (line 374) | `py-10` (line 372) | ❌ |
| **Practice Verb-drills (setup)** | `text-2xl md:text-3xl font-bold text-[#111827] tracking-tight` (line 500) | `py-10` (line 498) | ❌ |
| **Practice Vocab-quiz (setup)** | `text-2xl md:text-3xl font-bold text-[#111827] tracking-tight` (line 440) | `py-10` (line 438) | ❌ |

---

## Check 3: Search Bar Consistency

Standard: `w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px]` (+ focus/placeholder).

| Location | Matches Standard? | Difference (if any) |
|----------|-------------------|---------------------|
| src/app/conjugations/page.tsx (Search verbs) | ✅ | — |
| src/app/vocabulary/page.tsx (Search categories) | ✅ | — |
| src/app/vocabulary/[category]/page.tsx (Search words) | ✅ | — |
| src/app/grammar/page.tsx (Search topics) | ✅ | — |
| src/app/culture/page.tsx (4 inputs: sayings, false friends, etiquette, regional) | ✅ | — |

All search inputs in scope use the standard className.

---

## Check 4: Filter Pill Consistency

| Location | Active Color | Inactive Border | Sizing | Status |
|----------|-------------|-----------------|--------|--------|
| Conjugations Index | `bg-[#262626]` | `border-[#E9E9E9]` | `text-[13px] font-medium px-4 py-2` | ✅ |
| Vocabulary Index | `bg-[#262626]` | `border-[#E9E9E9]` | `text-[13px] font-medium px-4 py-2` | ✅ |
| Vocabulary [category] | `bg-[#262626]` | `border-[#E9E9E9]` | `text-[13px] font-medium px-4 py-2` | ✅ |
| Conjugations [verb] (tenses) | `bg-[#262626]` | `border-[#E9E9E9]` | `text-[13px] font-medium px-4 py-2` | ✅ |
| Culture (CEFR, theme, etiquette, region) | `bg-[#262626]` | `border-[#E9E9E9]` | `text-[13px] font-medium px-4 py-2` | ✅ |

Practice pages (listening, verb-drills, vocab-quiz) use **dropdowns** and `bg-[#3C5E95]` for **primary/CTA buttons** and for **selected option styling** in setup — not filter pills. No change required for filter-pill rule.

---

## Check 5: Card Styling

| File | Card Type | Radius | Border | Hover | Status |
|------|-----------|--------|--------|-------|--------|
| page.tsx (home) | Daily cards, section links | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| conjugations/page.tsx | Verb card | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| conjugations/[verb]/page.tsx | Mobile conjugation card, table wrapper | `rounded-[14px]` | `border-[#E9E5E5]` / table | — | ✅ |
| vocabulary/page.tsx | Category card | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| vocabulary/[category]/page.tsx | WordCard | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| grammar/page.tsx | Topic card | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| grammar/[topic]/page.tsx | Intro/Rules/Tips blocks | `rounded-[14px]` | `border-[#E5E5E5]` | — | ✅ |
| practice/page.tsx | Mode card | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| practice/flashcards/page.tsx | Setup form, flashcard, results buttons | `rounded-[14px]` / `rounded-lg` (form/buttons) | `border-[#E9E9E9]` / `border-[#E5E5E5]` | — | ✅ (exceptions as specified) |
| culture/page.tsx | SayingCard, FalseFriendCard, EtiquetteCard, RegionalCard | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| dashboard/page.tsx | Section cards, quick stats | `rounded-[14px]` | style border / `border-[#E9E9E9]` | standard | ✅ |
| dashboard/test/[section]/page.tsx | Question card wrapper | `rounded-[14px]` | `border-[#E5E5E5]` | — | ✅ |
| guide/page.tsx | Accordion section | `rounded-[14px]` | `border-[#E5E5E5]` | standard | ✅ |
| settings/page.tsx | Form section cards | `rounded-[14px]` | `border-[#E9E9E9]` | — | ✅ |

No content cards use `hover:-translate-y-px` or `hover:-translate-y-0.5`. Colored callouts in guide/culture use `rounded-lg` (allowed).

---

## Check 6: Badge / CEFR Pill Consistency

| File | Implementation | Colors | Status |
|------|---------------|--------|--------|
| conjugations/[verb]/page.tsx | `<Badge>` from `@/components/ui/badge` (tenseVariant, cefrVariant, priorityVariant) | Component variants | ❌ (still uses Badge component; CEFR design system expects inline `text-[#3C5E95] bg-[#EBF2FA]`) |
| culture/page.tsx | Inline `<span>` | `text-[#3C5E95] bg-[#EBF2FA]` for CEFR | ✅ |
| vocabulary/page.tsx | Inline spans for CEFR on cards | N/A (no CEFR on index cards) | — |
| vocabulary/[category]/page.tsx | Inline CEFR pill | `text-[#3C5E95] bg-[#EBF2FA]` | ✅ |
| grammar/page.tsx, grammar/[topic]/page.tsx | Inline CEFR | `text-[#3C5E95] bg-[#EBF2FA]` | ✅ |

---

## Check 7: Section Label Consistency

| File | Label Text | Current Style | Status |
|------|-----------|---------------|--------|
| vocabulary/page.tsx | Section labels (e.g. Essentials) | `text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]` | ✅ |
| grammar/page.tsx | A1 — Beginner, etc. | `text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]` | ✅ |
| grammar/[topic]/page.tsx | Introduction, Rules, Examples, Exceptions | `text-[11px]` or `text-[10px]`, `tracking-[0.08em]`, `text-[#9CA3AF]` | ✅ |
| vocabulary/[category]/page.tsx | Related Words, Pro Tip | `text-[10px] uppercase tracking-[0.08em] text-[#9CA3AF]` / `text-amber-600` | ✅ (Pro Tip is intentional accent) |
| page.tsx (home) | Literal, Meaning | `text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF]` | ✅ |

No `text-xs tracking-wider text-gray-400` in scope. No inline `style={{ color: ... }}` for section labels (dashboard test uses `style={{ color: sectionColor }}` for one heading — different context).

---

## Check 8: Divider Consistency

- **Gradient dividers:** None in scope. ✅
- **Section dividers:** Use `border-[#E9E9E9]` or `border-b border-[#E9E9E9]` where audited. ✅
- **Inside cards:** Use `border-[#F0F0F0]` (e.g. culture, grammar [topic]). ✅
- **Remaining issues:**
  - **src/app/guide/page.tsx:308** — `border-t border-gray-50 bg-gray-50/40` (table row). ❌ Should use `border-[#E9E9E9]` or `border-[#F0F0F0]`.

---

## Check 9: Container Width Consistency

| File | Current max-w | Expected | Status |
|------|--------------|----------|--------|
| page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| conjugations/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| conjugations/[verb]/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| vocabulary/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| vocabulary/[category]/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| grammar/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| grammar/[topic]/page.tsx | `max-w-[800px]` | 800px (exception) | ✅ |
| practice/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| practice/flashcards/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| **practice/listening/page.tsx** | `max-w-[1200px]` (lines 227, 260, 372) | 1280px | ❌ |
| **practice/verb-drills/page.tsx** | `max-w-[1200px]` (lines 281, 314, 498) | 1280px | ❌ |
| **practice/vocab-quiz/page.tsx** | `max-w-[1200px]` (lines 251, 287, 438) | 1280px | ❌ |
| culture/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| dashboard/page.tsx | `max-w-[1280px]` | 1280px | ✅ |
| dashboard/test/[section]/page.tsx | `max-w-[640px]` | 640px (exception) | ✅ |
| guide/page.tsx | `max-w-[896px]` | 896px (exception) | ✅ |
| changelog/page.tsx | `max-w-[896px]` | 896px (exception) | ✅ |
| settings/page.tsx | `max-w-[640px]` | 640px (exception) | ✅ |

---

## Check 10: Remaining `<Badge>` Component Usage

- **src/app/conjugations/[verb]/page.tsx** — Imports `Badge`, `tenseVariant`, `cefrVariant`, `priorityVariant` from `@/components/ui/badge`. Uses `<Badge>` for priority, CEFR, tense, and type (Reg./Irreg.) in mobile cards and desktop table.

No other files under `src/app/` (excluding auth) import from `@/components/ui/badge`.

---

## Summary

1. **Total pass count / Total fail count**
   - **Check 1 (Banned tokens):** 1 border-border-l, 6 text-gray-800, 1 text-gray-500, 1 text-gray-400, 3 gray-50 (guide), 1 hover:border-[#3C5E95]/30 → **13 fail** items across 4 files.
   - **Check 2 (Headers):** 3 pages fail (listening, verb-drills, vocab-quiz setup headers).
   - **Check 3 (Search bars):** All pass.
   - **Check 4 (Filter pills):** All pass.
   - **Check 5 (Cards):** All pass.
   - **Check 6 (Badges):** 1 file still uses Badge component (conjugations [verb]).
   - **Check 7 (Section labels):** All pass.
   - **Check 8 (Dividers):** 1 fail (guide table row).
   - **Check 9 (Containers):** 3 practice pages use max-w-[1200px].
   - **Check 10 (Badge usage):** 1 file uses Badge.

2. **Files with zero issues (fully consistent)**  
   - src/app/page.tsx (except 1 text-gray-500)  
   - src/app/conjugations/page.tsx  
   - src/app/vocabulary/page.tsx  
   - src/app/vocabulary/[category]/page.tsx  
   - src/app/grammar/page.tsx  
   - src/app/grammar/[topic]/page.tsx  
   - src/app/practice/page.tsx  
   - src/app/practice/flashcards/page.tsx  
   - src/app/culture/page.tsx (except 1 hover:border)  
   - src/app/changelog/page.tsx  
   - src/app/settings/page.tsx  
   - src/app/dashboard/page.tsx (except 1 border-border-l)  
   - src/app/dashboard/test/[section]/page.tsx  

   **Strictly zero issues:** conjugations/page, vocabulary/page, vocabulary/[category]/page, grammar/page, grammar/[topic]/page, practice/page, practice/flashcards/page, changelog/page, settings/page, dashboard/test/[section]/page.

3. **Files with most issues (ranked by fail count)**  
   - **src/app/guide/page.tsx** — text-gray-800 (6), text-gray-400 (1), bg-gray-50 / border-gray-50 (3), divider (1) → **11**  
   - **src/app/practice/listening/page.tsx** — header (1), container (3) → **4**  
   - **src/app/practice/verb-drills/page.tsx** — header (1), container (3) → **4**  
   - **src/app/practice/vocab-quiz/page.tsx** — header (1), container (3) → **4**  
   - **src/app/dashboard/page.tsx** — border-border-l (1) → **1**  
   - **src/app/page.tsx** — text-gray-500 (1) → **1**  
   - **src/app/culture/page.tsx** — hover:border-[#3C5E95]/30 (1) → **1**  
   - **src/app/conjugations/[verb]/page.tsx** — Badge usage (1) → **1**

4. **Top 5 most common remaining issues**  
   - **text-gray-800** — 6 times (guide)  
   - **max-w-[1200px]** — 9 occurrences across 3 practice pages (listening, verb-drills, vocab-quiz)  
   - **bg-gray-50 / border-gray-50** — 3 times (guide)  
   - **Header not text-[22px] + py-5** — 3 setup pages (listening, verb-drills, vocab-quiz)  
   - **border-border-l** — 1 time (dashboard); **text-gray-500** — 1 (home); **text-gray-400** — 1 (guide); **hover:border-[#3C5E95]/30** — 1 (culture); **Badge component** — 1 file (conjugations [verb]); **divider border-gray-50** — 1 (guide)
