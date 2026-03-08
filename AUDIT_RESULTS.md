# Audit Results — Comprehensive Audit & Fix

## DARK MODE

- **Files updated:** 8
  - `src/app/globals.css` — added `--bg-hover`, `--bg-active`, `--shadow-sm` to `:root` and `[data-theme="dark"]`
  - `src/components/home/personalised-homepage.tsx` — cards, stats, banners, weak areas, greeting, milestone/goal suggestion text and borders
  - `src/components/ui/card.tsx` — variant backgrounds and borders use CSS variables
  - `src/components/ui/slide-drawer.tsx` — drawer panel background, title, close button, border
  - `src/app/notes/page.tsx` — login prompt card, filter pills, date filter label
  - `src/components/onboarding-gate.tsx` — loading text
  - Settings, progress, topbar already used variables (no change)
- **CSS variables added:** `--bg-hover`, `--bg-active`, `--shadow-sm`
- **Pages verified in dark mode:** Homepage (personalised), Settings, Progress, Notes (main surfaces), Card/SlideDrawer globally. Onboarding left light by design. CTA buttons remain `#003399`.

---

## DEAD CODE

- **Files deleted:** 5
  - `src/components/home-progress-banner.tsx` — never imported
  - `src/components/migration-banner.tsx` — never imported
  - `src/lib/progress-service.ts` — only used by deleted banners
  - `src/lib/progress.ts` — only used by progress-service
  - `src/types/section-progress.ts` — only used by deleted progress-service and progress.ts
- **Imports cleaned:** None (deleted files had no remaining importers)
- **Orphaned Supabase tables (for you to drop manually if desired):**
  - `user_progress` — level test progress; no reads/writes in codebase
  - `user_vocabulary` — old vocab tracking; no reads/writes in codebase
  - `user_verbs` — old verb tracking; no reads/writes in codebase
  - `user_section_progress` — old section progress; only used by deleted progress-service

  **Still in use:** `lesson_progress` (item-level completion), `user_lesson_progress` (scoring/unlock), `user_notes`, `user_calendar_events`, `user_goals`, `profiles`, `user_settings`.

---

## DATA INTEGRITY

- **user_settings upsert:** Fixed. Theme provider uses `.maybeSingle()` and inserts default row when missing. Settings page uses `.maybeSingle()` and inserts default row when missing so theme and preferences always have a row.
- **Onboarding gate race:** No change. Gate runs first; when onboarding is not complete, redirect happens before personalised content. HomePageSwitch only fetches when user exists; no flash of wrong content.
- **Streak timezone:** Fixed. `updateStreak()` now uses local date for `today` and `yesterday` instead of UTC (`toISOString().split("T")[0]`).
- **Empty state handling:** Homepage with no lessons returns empty weak areas and next lesson a1-01. Progress page with zero data shows 0/18, 0/16, 0/10 and timeline with only "Início da jornada" plus empty-state message. Goal suggestion returns null for `no-goal` (not in GOAL_SUGGESTIONS map).

---

## BUILD

- **TypeScript errors:** 0 (none introduced)
- **Unused imports removed:** 0 (deleted files removed their own imports)
- **Build passes:** yes

---

## NAVIGATION

- **Dead routes removed:** None (no dashboard or other orphan routes)
- **Missing nav links added:** None (Progress already in Revision dropdown)
- **Mobile nav synced:** Yes (revisionItems include Progress; mobile menu uses same list)

---

## PORTUGUESE TEXT

- **English strings replaced:** 0. Grep for "Loading", "Save", "Cancel", "Delete", "Error", "Success", "Back", "Next", "Submit", "Close" found no user-facing matches. Search modal and some content use English by design (e.g. "View all tenses", "Explore culture").

---

## NOTES DATE RANGE

- **Working correctly:** Yes
- **Fixes applied:** None. `updatedDateStart` and `updatedDateEnd` are read from URL, passed to `getUserNotes()`, which uses `.gte()` and `.lte()` on `updated_at`. Date filter label shows "A mostrar notas de X a Y de [mês]". Clear button (×) calls `clearDateFilter()` → `router.replace("/notes")`.

---

## AUTO_PRACTICE

- **Schema ready:** Yes. Migration 008 includes `event_type IN (..., 'auto_practice', 'goal')`.
- **Display ready:** Yes. Calendar page has `EVENT_STYLE.auto_practice`, `getEventStyle()` handles `auto_practice`, month stats and list view handle it. `logPracticeSession()` exists in calendar-service for when practice modes are wired.
