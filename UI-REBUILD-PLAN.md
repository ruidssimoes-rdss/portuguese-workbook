# UI Rebuild Plan

> Generated: 2026-03-21
> Phase 0 — Audit & Preparation

---

## Current State Audit

### Page Routes (24 total)

| Route | File | Lines | Key Component Imports |
|-------|------|------:|----------------------|
| `/` | `src/app/page.tsx` | 301 | PageLayout, IntroBlock, ContentGrid, SmartBloco, BlocoGrid, OnboardingGate, HomePageSwitch, HomeGreeting, LessonPreview, Card, SectionHeader, PronunciationButton, CEFRBadge, VerbGroupBadge |
| `/auth/login` | `src/app/auth/login/page.tsx` | 168 | GoogleSignInButton, BrandLogo |
| `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` | 132 | BrandLogo |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | 184 | GoogleSignInButton, BrandLogo |
| `/auth/update-password` | `src/app/auth/update-password/page.tsx` | 132 | BrandLogo |
| `/calendar` | `src/app/calendar/page.tsx` | 1549 | PageLayout, Divider, SlideDrawer |
| `/changelog` | `src/app/changelog/page.tsx` | 82 | Topbar, PageContainer |
| `/conjugations` | `src/app/conjugations/page.tsx` | 91 | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid |
| `/conjugations/[verb]` | `src/app/conjugations/[verb]/page.tsx` | 143 | PageLayout, IntroBlock, FilterBlock, SmartBloco, ConjugationTable |
| `/culture` | `src/app/culture/page.tsx` | 513 | PageLayout, IntroBlock, SmartBloco, Expression, Comparison, DoAvoid, Topbar, PronunciationButton, PageContainer, SectionHeader, FilterPill, SearchInput, Divider, Card, Badge, EmptyState |
| `/exams` | `src/app/exams/page.tsx` | 269 | Topbar, PageContainer, PageHeader, Card, Divider, SectionHeader |
| `/exams/[id]` | `src/app/exams/[id]/page.tsx` | 1433 | Topbar, ProtectedRoute, PronunciationButton |
| `/grammar` | `src/app/grammar/page.tsx` | 64 | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid |
| `/grammar/[topic]` | `src/app/grammar/[topic]/page.tsx` | 211 | PageLayout, IntroBlock, SmartBloco, BlocoGrid, NumberedRules |
| `/guide` | `src/app/guide/page.tsx` | 826 | PageLayout, Button |
| `/lessons` | `src/app/lessons/page.tsx` | 503 | PageLayout, IntroBlock, SectionHeader, Card, Divider, CEFRBadge, TutorTabV2 |
| `/lessons/[id]` | `src/app/lessons/[id]/page.tsx` | 627 | ProtectedRoute, LessonShell, ResultsScreen, VocabLearnCard, GrammarLearn, VerbLearn, CultureLearn, VocabSection, ConjugationSection, GrammarSection, FillBlankSection, TranslationSection, SentenceBuildSection, WordBankSection, ErrorCorrectionSection |
| `/notes` | `src/app/notes/page.tsx` | 730 | PageLayout, Divider, SlideDrawer |
| `/onboarding` | `src/app/onboarding/page.tsx` | 363 | (uses auth hooks only) |
| `/progress` | `src/app/progress/page.tsx` | 251 | ProtectedRoute, ProgressBlock |
| `/settings` | `src/app/settings/page.tsx` | 763 | ProtectedRoute, PageLayout, Button |
| `/smart-blocos` | `src/app/smart-blocos/page.tsx` | 306 | SmartBloco, BlocoGrid |
| `/vocabulary` | `src/app/vocabulary/page.tsx` | 130 | PageLayout, IntroBlock, FilterBlock, ContentGrid, SmartBloco, BlocoGrid |
| `/vocabulary/[category]` | `src/app/vocabulary/[category]/page.tsx` | 98 | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid |

### Design Tokens

- `src/lib/design-tokens.ts` (207 lines) — colors, typography, spacing, radii, elevation, transitions, component patterns, CEFR/verb-group badge helpers

### SmartBlock/Bloco System References

Files referencing SmartBlock/SmartBloco/IntroBlock/FilterBlock/BlocoGrid/CardShell:

- `src/app/grammar/[topic]/page.tsx`
- `src/app/grammar/page.tsx`
- `src/app/conjugations/[verb]/page.tsx`
- `src/app/conjugations/page.tsx`
- `src/app/lessons/page.tsx`
- `src/app/page.tsx`
- `src/app/smart-blocos/page.tsx`
- `src/app/vocabulary/[category]/page.tsx`
- `src/app/vocabulary/page.tsx`
- `src/app/culture/page.tsx`
- `src/components/blocos/PageLayout.tsx`
- `src/components/blocos/FilterBlock.tsx`
- `src/components/blocos/IntroBlock.tsx`
- `src/components/blocos/Skeleton.tsx`
- `src/components/smart-bloco/smart-bloco.tsx`
- `src/components/smart-bloco/bloco-grid.tsx`
- `src/components/smart-bloco-inserts/conjugation-table.tsx`

---

## Files to DELETE (old UI system)

These files are part of the old SmartBlock/Bloco system and will be replaced by new primitives:

### SmartBloco components
- `src/components/smart-bloco/smart-bloco.tsx`
- `src/components/smart-bloco/bloco-grid.tsx`
- `src/components/smart-bloco/parts/action-row.tsx`
- `src/components/smart-bloco/parts/badge-row.tsx`
- `src/components/smart-bloco/parts/example-block.tsx`
- `src/components/smart-bloco/parts/footer-row.tsx`
- `src/components/smart-bloco/parts/progress-bar.tsx`
- `src/components/smart-bloco/parts/stat-display.tsx`

### SmartBloco inserts
- `src/components/smart-bloco-inserts/comparison.tsx`
- `src/components/smart-bloco-inserts/conjugation-table.tsx`
- `src/components/smart-bloco-inserts/do-avoid.tsx`
- `src/components/smart-bloco-inserts/expression.tsx`
- `src/components/smart-bloco-inserts/numbered-rules.tsx`

### Blocos layout system
- `src/components/blocos/BlocosEmptyState.tsx`
- `src/components/blocos/ContentGrid.tsx`
- `src/components/blocos/FilterBlock.tsx`
- `src/components/blocos/IntroBlock.tsx`
- `src/components/blocos/PageLayout.tsx`
- `src/components/blocos/Sidebar.tsx`
- `src/components/blocos/Skeleton.tsx`
- `src/components/blocos/sidebar-context.tsx`
- `src/components/blocos/sidebar-shell.tsx`

### Old design tokens (will be replaced by new design-system)
- `src/lib/design-tokens.ts`

### Old UI primitives (will be replaced by new primitives)
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/divider.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/ui/filter-pill.tsx`
- `src/components/ui/page-container.tsx`
- `src/components/ui/page-header.tsx`
- `src/components/ui/progress-bar.tsx`
- `src/components/ui/search-input.tsx`
- `src/components/ui/section-header.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/slide-drawer.tsx`

### Old standalone components (replaced by new system)
- `src/components/home-greeting.tsx`
- `src/components/home/home-page-switch.tsx`
- `src/components/home/personalised-homepage.tsx`
- `src/components/lesson-preview.tsx`
- `src/components/search-modal.tsx`
- `src/components/study-log-button.tsx`
- `src/components/changelog-banner.tsx`
- `src/components/layout/topbar.tsx`

### Smart-blocos page (demo page, no longer needed)
- `src/app/smart-blocos/page.tsx`

---

## Files to REWRITE (page files)

Every page except `/lessons/[id]` will be completely rewritten with the new UI system:

- `src/app/page.tsx` (home)
- `src/app/calendar/page.tsx`
- `src/app/changelog/page.tsx`
- `src/app/conjugations/page.tsx`
- `src/app/conjugations/[verb]/page.tsx`
- `src/app/culture/page.tsx`
- `src/app/exams/page.tsx`
- `src/app/exams/[id]/page.tsx`
- `src/app/grammar/page.tsx`
- `src/app/grammar/[topic]/page.tsx`
- `src/app/guide/page.tsx`
- `src/app/lessons/page.tsx`
- `src/app/notes/page.tsx`
- `src/app/onboarding/page.tsx`
- `src/app/progress/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/vocabulary/page.tsx`
- `src/app/vocabulary/[category]/page.tsx`

### Auth pages (likely light touch, not full rewrite)
- `src/app/auth/login/page.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/auth/update-password/page.tsx`

### Layout files to rewrite
- `src/app/layout.tsx` (root — imports old sidebar-context, sidebar-shell)
- `src/app/culture/layout.tsx`
- `src/app/guide/layout.tsx`
- `src/app/vocabulary/layout.tsx`

---

## Files to KEEP (do not touch)

### Lesson player (sacred)
- `src/app/lessons/[id]/page.tsx`

### Lesson exercise components (used by lesson player)
- `src/components/blocks/exercises/build-sentence-exercise.tsx`
- `src/components/blocks/exercises/choose-correct-exercise.tsx`
- `src/components/blocks/exercises/conjugate-exercise.tsx`
- `src/components/blocks/exercises/fill-gap-exercise.tsx`
- `src/components/blocks/exercises/listen-write-exercise.tsx`
- `src/components/blocks/exercises/match-pairs-exercise.tsx`
- `src/components/blocks/exercises/speak-exercise.tsx`
- `src/components/blocks/exercises/spot-error-exercise.tsx`
- `src/components/blocks/exercises/translate-exercise.tsx`
- `src/components/blocks/exercises/shared/exercise-chrome.tsx`
- `src/components/blocks/exercises/shared/exercise-feedback.tsx`

### Lesson content blocks (used by lesson player)
- `src/components/blocks/block-renderer.tsx`
- `src/components/blocks/content/explanation-block.tsx`
- `src/components/blocks/content/grammar-block.tsx`
- `src/components/blocks/content/progress-block.tsx`
- `src/components/blocks/content/pronunciation-block.tsx`
- `src/components/blocks/content/smart-vocab-block.tsx`
- `src/components/blocks/content/verb-block.tsx`
- `src/components/blocks/content/vocab-block.tsx`

### Lesson layout blocks (used by lesson player)
- `src/components/blocks/layout/content-grid.tsx`
- `src/components/blocks/layout/learn-carousel.tsx`
- `src/components/blocks/layout/review-stack.tsx`
- `src/components/blocks/layout/session-narrative.tsx`
- `src/components/blocks/layout/session-shell.tsx`

### Lesson block primitives (used by lesson player)
- `src/components/blocks/primitives/content-popover.tsx`
- `src/components/blocks/primitives/copy-button.tsx`
- `src/components/blocks/primitives/cross-link-text.tsx`
- `src/components/blocks/primitives/expandable-section.tsx`
- `src/components/blocks/primitives/pronunciation-button.tsx`
- `src/components/blocks/primitives/responsive-switcher.tsx`
- `src/components/blocks/primitives/url-highlighter.tsx`

### Lesson shell and sections
- `src/components/lessons/lesson-shell.tsx`
- `src/components/lessons/results-screen.tsx`
- `src/components/lessons/learn/culture-learn.tsx`
- `src/components/lessons/learn/grammar-learn.tsx`
- `src/components/lessons/learn/verb-learn.tsx`
- `src/components/lessons/learn/vocab-learn-card.tsx`
- `src/components/lessons/sections/conjugation-section.tsx`
- `src/components/lessons/sections/error-correction-section.tsx`
- `src/components/lessons/sections/fill-blank-section.tsx`
- `src/components/lessons/sections/grammar-section.tsx`
- `src/components/lessons/sections/section-shell.tsx`
- `src/components/lessons/sections/sentence-build-section.tsx`
- `src/components/lessons/sections/translation-section.tsx`
- `src/components/lessons/sections/vocab-section.tsx`
- `src/components/lessons/sections/word-bank-section.tsx`
- `src/components/lessons/tutor-tab.tsx`

### Content data files (sacred)
- `src/data/changelog.json`
- `src/data/curriculum-a2-b1.ts`
- `src/data/curriculum-types.ts`
- `src/data/curriculum.ts`
- `src/data/daily-prompts.ts`
- `src/data/etiquette.json`
- `src/data/exams.ts`
- `src/data/false-friends.json`
- `src/data/grammar.json`
- `src/data/lessons.ts`
- `src/data/prompt-keywords.ts`
- `src/data/regional.json`
- `src/data/resolve-lessons.ts`
- `src/data/sayings.json`
- `src/data/verbs.json`
- `src/data/vocab.json`

### AI layer (sacred)
- `src/lib/ai-v2/claude-client.ts`
- `src/lib/ai-v2/content-index.ts`
- `src/lib/ai-v2/context-assembler.ts`
- `src/lib/ai-v2/cross-topic-generator.ts`
- `src/lib/ai-v2/index.ts`
- `src/lib/ai-v2/ollama-client.ts`
- `src/lib/ai-v2/plan-to-blocks.ts`
- `src/lib/ai-v2/prompts.ts`
- `src/lib/ai-v2/schemas.ts`
- `src/lib/ai-v2/sentence-generator.ts`
- `src/lib/ai-v2/session-planner.ts`
- `src/lib/ai-v2/tiered-model.ts`
- `src/lib/ai-v2/types.ts`

### Supabase/auth files
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/auth-utils.ts`
- `src/components/auth-provider.tsx`
- `src/components/protected-route.tsx`
- `src/components/onboarding-gate.tsx`
- `src/components/google-sign-in-button.tsx`
- `src/components/brand-logo.tsx`

### Service/utility files
- `src/lib/accent-utils.ts`
- `src/lib/calendar-service.ts`
- `src/lib/exam-progress.ts`
- `src/lib/exercise-generator.ts`
- `src/lib/exercise-types.ts`
- `src/lib/export-user-data.ts`
- `src/lib/familiarity-updater.ts`
- `src/lib/goal-suggestion-service.ts`
- `src/lib/goals-service.ts`
- `src/lib/goals.ts`
- `src/lib/homepage-service.ts`
- `src/lib/lesson-progress.ts`
- `src/lib/notes-service.ts`
- `src/lib/onboarding-service.ts`
- `src/lib/progress-stats-service.ts`
- `src/lib/pronunciation-scorer.ts`
- `src/lib/search.ts`
- `src/lib/spaced-repetition.ts`
- `src/lib/speak-pt.ts`
- `src/lib/streak-service.ts`
- `src/lib/validate-response.ts`

### Types
- `src/types/blocks.ts`
- `src/types/culture.ts`
- `src/types/database.ts`
- `src/types/grammar.ts`
- `src/types/index.ts`
- `src/types/saying.ts`
- `src/types/speech-recognition.d.ts`
- `src/types/vocab.ts`

### Hooks
- `src/hooks/use-speech-recognition.ts`

### Other
- `src/proxy.ts`
- `src/stories/**` (Storybook files)

### Config files (do not touch)
- `next.config.ts`
- `tailwind.config.ts` (or CSS-based config)
- `package.json`
- `tsconfig.json`
- `middleware.ts`

---

## Files UNSURE about

These components don't clearly fit into DELETE or KEEP — need manual review:

| File | Reason |
|------|--------|
| `src/components/pronunciation-button.tsx` | Standalone version separate from `blocks/primitives/pronunciation-button.tsx` — may be a duplicate or used by non-lesson pages |
| `src/components/notes/note-context-actions.tsx` | Used by notes page — keep if notes logic stays, delete if notes page gets new components |
| `src/components/calendar/content-calendar-info.tsx` | Used by calendar page — keep if calendar logic stays, delete if calendar page gets new components |
| `src/components/ui/error-boundary.tsx` | Generic error boundary — might be worth keeping and moving to new system |

---

## Pre-existing Build Errors

_(To be filled after build verification)_

---

## New Directory Structure Created

```
src/components/primitives/   (empty — new UI primitives go here in Phase 1)
src/components/layout/       (already existed — new layout components here)
src/lib/design-system/       (empty — new tokens.ts goes here in Phase 1)
```

---

## Summary Stats

- **Total pages:** 24
- **Total component files:** 105 (10,534 lines)
- **Files to DELETE:** ~40
- **Files to REWRITE:** ~26 (pages + layouts)
- **Files to KEEP:** ~90+
- **Files UNSURE:** 4
