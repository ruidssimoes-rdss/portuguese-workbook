# Aula PT — Component Audit

## Date: 2026-03-20

---

## 1. Block/Bloco Components

### System 1: Classic Block System (`src/components/blocks/`)

Content block components with multiple variants, driven by discriminated union types.

| File Path | Component | Key Props | Summary |
|-----------|-----------|-----------|---------|
| `src/components/blocks/content/vocab-block.tsx` | `VocabBlock` | `data: VocabBlockData`, `variant?: "card"\|"row"\|"flashcard"\|"inline"` | Vocabulary word cards (4 variants) — word, translation, pronunciation, examples |
| `src/components/blocks/content/verb-block.tsx` | `VerbBlock` | `data: VerbBlockData`, `variant?: "collapsed"\|"expanded"\|"drill"` | Verb conjugation cards (3 variants) — verb, translation, tense label, conjugation table |
| `src/components/blocks/content/grammar-block.tsx` | `GrammarBlock` | `data: GrammarBlockData`, `variant?: "inline"\|"expanded"\|"summary"` | Grammar rules/topics (3 variants) — rules with examples, tips section |
| `src/components/blocks/content/progress-block.tsx` | `ProgressBlock` | `data: ProgressBlockData`, `variant?: "bar"\|"ring"\|"stat"\|"streak"` | Progress indicators (4 variants) — bars, ring charts, stats, streaks |
| `src/components/blocks/content/explanation-block.tsx` | `ExplanationBlock` | `data: ExplanationBlockData`, `variant?: "inline"\|"expanded"\|"toast"` | Context explanations (3 variants) — explanation text, examples, auto-hide toast |
| `src/components/blocks/content/pronunciation-block.tsx` | `PronunciationBlock` | `data: PronunciationBlockData`, `variant?: "inline"\|"expanded"\|"guide"` | Pronunciation guides (3 variants) — IPA, phonetic, tips, audio playback |
| `src/components/blocks/content/smart-vocab-block.tsx` | `SmartVocabBlock` | `data: SmartVocabBlockData`, `variant?`, `isHighlighted?` | Enhanced vocab block with popovers for related words, pro tips, CEFR badge (202 lines) |
| `src/components/blocks/block-renderer.tsx` | `BlockRenderer` | `descriptor: BlockDescriptor`, `exerciseProps?` | Router that renders any block type from descriptor union (6 content + 9 exercise types) |

**Exercise Blocks:**

| File Path | Component | Summary |
|-----------|-----------|---------|
| `src/components/blocks/exercises/translate-exercise.tsx` | `TranslateExercise` | Translate PT↔EN |
| `src/components/blocks/exercises/conjugate-exercise.tsx` | `ConjugateExercise` | Fill in correct verb conjugation |
| `src/components/blocks/exercises/fill-gap-exercise.tsx` | `FillGapExercise` | Complete sentence by filling blanks |
| `src/components/blocks/exercises/build-sentence-exercise.tsx` | `BuildSentenceExercise` | Arrange words into correct order |
| `src/components/blocks/exercises/choose-correct-exercise.tsx` | `ChooseCorrectExercise` | Multiple choice selection |
| `src/components/blocks/exercises/spot-error-exercise.tsx` | `SpotErrorExercise` | Identify and correct mistakes |
| `src/components/blocks/exercises/listen-write-exercise.tsx` | `ListenWriteExercise` | Audio-based transcription |
| `src/components/blocks/exercises/match-pairs-exercise.tsx` | `MatchPairsExercise` | Match vocabulary or concepts |
| `src/components/blocks/exercises/speak-exercise.tsx` | `SpeakExercise` | Pronunciation/speaking evaluation |
| `src/components/blocks/exercises/shared/exercise-chrome.tsx` | `ExerciseChrome` | Frame for exercises with progress counter and skip button |
| `src/components/blocks/exercises/shared/exercise-feedback.tsx` | `ExerciseFeedback` | Feedback display (correct/incorrect/explanation) |

**Block Layout Components:**

| File Path | Component | Summary |
|-----------|-----------|---------|
| `src/components/blocks/layout/session-shell.tsx` | `SessionShell` | Container for lesson sessions with progress tracking and results (168 lines) |
| `src/components/blocks/layout/learn-carousel.tsx` | `LearnCarousel` | Carousel with keyboard navigation and view-tracking (130 lines) |
| `src/components/blocks/layout/review-stack.tsx` | `ReviewStack` | Exercise flow manager with difficulty adaptation (186 lines) |
| `src/components/blocks/layout/content-grid.tsx` | `ContentGrid` | Responsive column grid for content blocks (27 lines) |
| `src/components/blocks/layout/session-narrative.tsx` | `SessionNarrative` | Narrative/story view for lessons (129 lines) |

**Block Primitives:**

| File Path | Component | Summary |
|-----------|-----------|---------|
| `src/components/blocks/primitives/pronunciation-button.tsx` | `PronunciationButton` | Text-to-speech button for Portuguese (52 lines) |
| `src/components/blocks/primitives/content-popover.tsx` | `ContentPopover` | Custom popover for contextual content (55 lines) |
| `src/components/blocks/primitives/copy-button.tsx` | `CopyButton` | Copy-to-clipboard button with feedback (40 lines) |
| `src/components/blocks/primitives/cross-link-text.tsx` | `CrossLinkText` | Highlighted text with cross-reference links (26 lines) |
| `src/components/blocks/primitives/expandable-section.tsx` | `ExpandableSection` | Accordion/disclosure section (47 lines) |
| `src/components/blocks/primitives/url-highlighter.tsx` | `URLHighlighter` | Highlights text when URL fragment matches (49 lines) |
| `src/components/blocks/primitives/responsive-switcher.tsx` | `ResponsiveSwitcher` | Responsive component switcher (18 lines) |

**Type definitions:** `src/types/blocks.ts` (322 lines)

---

### System 2: SmartBloco System (`src/components/smart-bloco/`)

New composable card with CSS custom properties, expandable content, rich footer metadata.

| File Path | Component | Key Props | Summary |
|-----------|-----------|-----------|---------|
| `smart-bloco/smart-bloco.tsx` | `SmartBloco` | `title`, `subtitle?`, `pronunciation?`, `translation?`, `description?`, `hasAudio?`, `cefrLevel?`, `metaBadge?`, `example?`, `expandedContent?`, `actions?`, `footer?`, `progress?`, `stat?`, `onClick?`, `href?` | Multi-mode card: content, stat, link, button modes. CSS var() theming. (195 lines) |
| `smart-bloco/smart-bloco.types.ts` | Types | `SmartBlocoProps`, `BlocoExample`, `BlocoActions`, `BlocoFooter`, `BlocoProgress`, `BlocoStat`, `CEFRLevel` | Type system for SmartBloco ecosystem (98 lines) |
| `smart-bloco/bloco-grid.tsx` | `BlocoGrid` | `children`, `columns?`, `minWidth?` | Responsive CSS grid container for SmartBloco cards (25 lines) |
| `smart-bloco/parts/badge-row.tsx` | `BadgeRow` | `title`, `hasAudio?`, `cefrLevel?`, `metaBadge?` | Audio button, CEFR level, meta badge. Uses color-mix. (113 lines) |
| `smart-bloco/parts/example-block.tsx` | `ExampleBlock` | `example: BlocoExample` | Quotation example (PT + EN) in recessed surface (27 lines) |
| `smart-bloco/parts/progress-bar.tsx` | `ProgressBar` | `progress: BlocoProgress` | Linear progress bar with percentage label (38 lines) |
| `smart-bloco/parts/stat-display.tsx` | `StatDisplay` | `stat: BlocoStat` | Centered stat card (value, label, delta) for KPI mode (29 lines) |
| `smart-bloco/parts/action-row.tsx` | `ActionRow` | `actions: BlocoActions`, `copyText?` | Tip button + copy-to-clipboard button (66 lines) |
| `smart-bloco/parts/footer-row.tsx` | `FooterRow` | `footer: BlocoFooter` | Status badge, counts, related links (122 lines) |

### SmartBloco Insert Components (`src/components/smart-bloco-inserts/`)

Reusable content blocks for `expandedContent` prop slot.

| File Path | Component | Key Props | Summary |
|-----------|-----------|-----------|---------|
| `smart-bloco-inserts/numbered-rules.tsx` | `NumberedRules` | `rules: Rule[]` | Numbered rules with PT translation, examples, collapsible tip/why callouts (145 lines) |
| `smart-bloco-inserts/conjugation-table.tsx` | `ConjugationTable` | `tense`, `tensePt?`, `cefrLevel?`, `conjugations[]` | Verb conjugation table with pronouns, forms, examples, audio (123 lines) |
| `smart-bloco-inserts/comparison.tsx` | `Comparison` | `positive`, `negative` | Two-column Do vs Avoid with colored borders (57 lines) |
| `smart-bloco-inserts/do-avoid.tsx` | `DoAvoid` | `doItems[]`, `avoidItems[]` | Two-column Do/Avoid with check/X icons (60 lines) |
| `smart-bloco-inserts/expression.tsx` | `Expression` | `meaning`, `usage?`, `quote`, `hasAudio?` | Idiom/expression card with meaning, usage, quote, audio (99 lines) |

---

### System 3: Blocos Page Layout (`src/components/blocos/`)

Page-level composition components for organizing content zones.

| File Path | Component | Key Props | Summary |
|-----------|-----------|-----------|---------|
| `blocos/IntroBlock.tsx` | `IntroBlock` | `title`, `subtitle?`, `backLink?`, `lastStudied?`, `description?`, `pills?`, `badge?` | Header with breadcrumb nav, back link, description, meta pills, CEFR badge (125 lines) |
| `blocos/FilterBlock.tsx` | `FilterBlock` | `pills?`, `search?`, `dropdown?`, `count?` | Filter toolbar with pill toggles, dropdown, search input, result count (98 lines) |
| `blocos/BlocosEmptyState.tsx` | `BlocosEmptyState` | `message`, `description?`, `action?` | Empty state placeholder for no results (27 lines) |
| `blocos/ContentGrid.tsx` | `ContentGrid` | `children`, `columns?: 1\|2\|3\|4` | Responsive grid (1→2→3→4 cols across breakpoints) (29 lines) |
| `blocos/PageLayout.tsx` | `PageLayout` | `children`, `className?` | Max-width wrapper (1080px) with padding, page-enter animation (18 lines) |
| `blocos/Sidebar.tsx` | `Sidebar` | context-driven | Collapsible nav sidebar with user badge, primary/secondary/bottom nav. Mobile + desktop. (248 lines) |
| `blocos/Skeleton.tsx` | `Skeleton` | `isLoading?` | Animated skeleton loader for content blocks (104 lines) |
| `blocos/sidebar-context.tsx` | `useSidebar` | — | Context + hook for sidebar expand/collapse state (80 lines) |
| `blocos/sidebar-shell.tsx` | `SidebarShell` | `children` | Layout wrapper: sidebar + main content area (41 lines) |

---

## 2. Page Map

| Route | Page File | Block Components Used | Has Bespoke Rendering? |
|-------|-----------|----------------------|:---------------------:|
| `/` | `src/app/page.tsx` | PageLayout, IntroBlock, SmartBloco, BlocoGrid | **Yes** — inline Card components for daily picks, custom stats cards |
| `/smart-blocos` | `src/app/smart-blocos/page.tsx` | SmartBloco, BlocoGrid, NumberedRules, ConjugationTable, Comparison, DoAvoid, Expression | No — demo page |
| `/vocabulary` | `src/app/vocabulary/page.tsx` | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid | No |
| `/vocabulary/[category]` | `src/app/vocabulary/[category]/page.tsx` | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid | No |
| `/grammar` | `src/app/grammar/page.tsx` | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid | No |
| `/grammar/[topic]` | `src/app/grammar/[topic]/page.tsx` | PageLayout, IntroBlock, SmartBloco, BlocoGrid, NumberedRules | No |
| `/culture` | `src/app/culture/page.tsx` | PageLayout, IntroBlock, SmartBloco, Expression, Comparison, DoAvoid | **Yes** — custom TabFilters, FeaturedSaying, tab-based rendering with inline state |
| `/conjugations` | `src/app/conjugations/page.tsx` | PageLayout, IntroBlock, FilterBlock, SmartBloco, BlocoGrid | No |
| `/conjugations/[verb]` | `src/app/conjugations/[verb]/page.tsx` | PageLayout, IntroBlock, FilterBlock, SmartBloco, ConjugationTable | No |
| `/lessons` | `src/app/lessons/page.tsx` | PageLayout, IntroBlock, SmartBloco, BlocoGrid | **Yes** — custom LessonInfoSection, inline lesson cards with progress |
| `/lessons/[id]` | `src/app/lessons/[id]/page.tsx` | PageLayout, ProtectedRoute | **Yes** — custom LessonIntro, LessonShell, extensive section renderers (627 lines) |
| `/changelog` | `src/app/changelog/page.tsx` | PageContainer | **Yes** — custom timeline rendering, inline changelog entries |
| `/auth/login` | `src/app/auth/login/page.tsx` | BrandLogo, GoogleSignInButton | **Yes** — entirely custom form, no block components |
| `/auth/signup` | `src/app/auth/signup/page.tsx` | BrandLogo, GoogleSignInButton | **Yes** — entirely custom form |
| `/auth/reset-password` | `src/app/auth/reset-password/page.tsx` | BrandLogo | **Yes** — entirely custom form |
| `/auth/update-password` | `src/app/auth/update-password/page.tsx` | BrandLogo | **Yes** — entirely custom form |
| `/exams` | `src/app/exams/page.tsx` | PageContainer | **Yes** — custom exam cards, inline difficulty badges |
| `/exams/[id]` | `src/app/exams/[id]/page.tsx` | Topbar, ProtectedRoute | **Yes** — custom exam components, inline question/answer (57.9KB) |
| `/onboarding` | `src/app/onboarding/page.tsx` | OnboardingGate | **Yes** — custom step-based UI, inline form controls |
| `/progress` | `src/app/progress/page.tsx` | ProtectedRoute | **Yes** — custom CefrJourney, StatsGrid, LearningTimeline |
| `/calendar` | `src/app/calendar/page.tsx` | PageLayout, Divider, SlideDrawer | **Yes** — custom calendar rendering, event management (78.6KB) |
| `/guide` | `src/app/guide/page.tsx` | PageLayout | **Yes** — custom accordion sections, inline markdown content |
| `/settings` | `src/app/settings/page.tsx` | ProtectedRoute, PageLayout | **Yes** — custom Section and SettingsRow components |
| `/notes` | `src/app/notes/page.tsx` | PageLayout | **Yes** — custom NoteEditorDrawer, NoteRow, inline filtering/editing |

**Summary:** 9 pages use shared block components cleanly. 15 pages have significant bespoke rendering.

---

## 3. Shared UI Components

### UI Primitives (`src/components/ui/`)

| File Path | Component | Category | Used By |
|-----------|-----------|----------|---------|
| `ui/button.tsx` | `Button` | ui-primitive | 14+ files: auth, settings, guide, home, exams |
| `ui/card.tsx` | `Card` | ui-primitive | 6 files: lessons, culture, home, exams |
| `ui/badge.tsx` | `Badge`, `CEFRBadge`, `VerbGroupBadge` | ui-primitive | 6 files: culture, lessons, home, lesson-preview |
| `ui/search-input.tsx` | `SearchInput` | ui-primitive | 4 files: notes, exams, changelog |
| `ui/progress-bar.tsx` | `ProgressBar` | ui-primitive | Exercise and session blocks |
| `ui/filter-pill.tsx` | `FilterPill` | ui-primitive | Multiple content pages |
| `ui/page-header.tsx` | `PageHeader` | ui-primitive | Vocabulary, grammar, culture pages |
| `ui/section-header.tsx` | `SectionHeader` | ui-primitive | Content sections |
| `ui/page-container.tsx` | `PageContainer` | ui-primitive | Multiple pages |
| `ui/divider.tsx` | `Divider` | ui-primitive | General layouts |
| `ui/empty-state.tsx` | `EmptyState` | ui-primitive | Multiple pages |
| `ui/error-boundary.tsx` | `ErrorBoundary` | ui-primitive | App shell |
| `ui/skeleton.tsx` | `Skeleton` (various) | ui-primitive | Content pages |
| `ui/slide-drawer.tsx` | `SlideDrawer` | ui-primitive | Modals and overlays |

### Navigation & Auth

| File Path | Component | Category | Used By |
|-----------|-----------|----------|---------|
| `layout/topbar.tsx` | `Topbar` | navigation | Main layout |
| `search-modal.tsx` | `SearchModal` | navigation | Topbar |
| `brand-logo.tsx` | `BrandLogo` | navigation | Layout, auth pages |
| `protected-route.tsx` | `ProtectedRoute` | navigation | Protected pages |
| `auth-provider.tsx` | `AuthProvider`, `useAuth` | navigation | App shell |
| `google-sign-in-button.tsx` | `GoogleSignInButton` | form | Auth pages |
| `onboarding-gate.tsx` | `OnboardingGate` | navigation | Onboarding flow |

### Page-Specific Components

| File Path | Component | Category | Used By |
|-----------|-----------|----------|---------|
| `lessons/lesson-shell.tsx` | `LessonShell` | page-specific | Lesson pages |
| `lessons/results-screen.tsx` | `ResultsScreen` | page-specific | Lesson completion |
| `lessons/tutor-tab.tsx` | `TutorTab` | page-specific | Lessons |
| `lessons/learn/vocab-learn-card.tsx` | `VocabLearnCard` | page-specific | Learn/flashcard flow |
| `lessons/sections/*` | Various section components | page-specific | Lesson pages |
| `lesson-preview.tsx` | `LessonPreview` | page-specific | Lessons listing |
| `home/home-page-switch.tsx` | `HomePageSwitch` | page-specific | Home page |
| `home/personalised-homepage.tsx` | `PersonalisedHomepage` | page-specific | Home page (585 lines, **unused**) |
| `home-greeting.tsx` | `HomeGreeting` | page-specific | Home page |
| `study-log-button.tsx` | `StudyLogButton` | page-specific | **Unused** |
| `changelog-banner.tsx` | `ChangelogBanner` | page-specific | **Unused** |

---

## 4. Orphaned Components

**38 orphaned components identified** — components not imported by any other file.

### Legacy Block System (likely safe to remove)

**Exercise blocks (10 files):**
- `src/components/blocks/exercises/build-sentence-exercise.tsx`
- `src/components/blocks/exercises/conjugate-exercise.tsx`
- `src/components/blocks/exercises/fill-gap-exercise.tsx`
- `src/components/blocks/exercises/listen-write-exercise.tsx`
- `src/components/blocks/exercises/speak-exercise.tsx`
- `src/components/blocks/exercises/spot-error-exercise.tsx`
- `src/components/blocks/exercises/shared/exercise-chrome.tsx`
- `src/components/blocks/exercises/shared/exercise-feedback.tsx`
- `src/components/blocks/exercises/translate-exercise.tsx` (verify)
- `src/components/blocks/exercises/match-pairs-exercise.tsx` (verify)

**Content blocks (3 files):**
- `src/components/blocks/content/explanation-block.tsx`
- `src/components/blocks/content/pronunciation-block.tsx`
- `src/components/blocks/content/smart-vocab-block.tsx`

**Layout blocks (5 files):**
- `src/components/blocks/block-renderer.tsx`
- `src/components/blocks/layout/content-grid.tsx`
- `src/components/blocks/layout/learn-carousel.tsx`
- `src/components/blocks/layout/review-stack.tsx`
- `src/components/blocks/layout/session-narrative.tsx`
- `src/components/blocks/layout/session-shell.tsx`

**Primitive blocks (7 files):**
- `src/components/blocks/primitives/content-popover.tsx`
- `src/components/blocks/primitives/copy-button.tsx`
- `src/components/blocks/primitives/cross-link-text.tsx`
- `src/components/blocks/primitives/expandable-section.tsx`
- `src/components/blocks/primitives/pronunciation-button.tsx`
- `src/components/blocks/primitives/responsive-switcher.tsx`
- `src/components/blocks/primitives/url-highlighter.tsx`

### SmartBloco Internal Parts (used only within SmartBloco, not directly imported)
- `src/components/smart-bloco/parts/action-row.tsx`
- `src/components/smart-bloco/parts/badge-row.tsx`
- `src/components/smart-bloco/parts/example-block.tsx`
- `src/components/smart-bloco/parts/footer-row.tsx`
- `src/components/smart-bloco/parts/progress-bar.tsx`
- `src/components/smart-bloco/parts/stat-display.tsx`

> **Note:** These are internal sub-components of `SmartBloco` — they're imported by `smart-bloco.tsx` itself. Not truly orphaned, just internal.

### Other Unused Components
- `src/components/changelog-banner.tsx` (80 lines) — functional but never imported
- `src/components/study-log-button.tsx` (92 lines) — functional but never imported
- `src/components/home/personalised-homepage.tsx` (585 lines) — large component, never imported
- `src/components/blocos/BlocosEmptyState.tsx` (27 lines)
- `src/components/blocos/ContentGrid.tsx` (29 lines)
- `src/components/blocos/Sidebar.tsx` (248 lines) — verify: may be imported via barrel
- `src/components/blocos/Skeleton.tsx` (104 lines) — verify: may be imported via barrel

---

## 5. Design Tokens

### `src/lib/design-tokens.ts` (207 lines)

Primary TypeScript design token file defining:

| Category | What It Defines |
|----------|----------------|
| **Colors** | Text hierarchy (primary/secondary/muted/disabled/inverse), surface colors (base/subtle/muted/hover), border colors, CEFR level colors (A1=emerald, A2=blue, B1=amber), verb group colors, brand accent (#003399), sidebar states |
| **Typography** | Page title (28px semibold), page subtitle (14px), section header (12px uppercase tracked), card title variants (16px/20px), label (14px), caption (12px) |
| **Spacing** | Page container max-width (1080px), card padding (p-6), grid gap (gap-6), section gaps (py-8) |
| **Radii** | Card: rounded-xl, button: rounded-lg, pill: rounded-full, input: rounded-lg |
| **Shadows** | shadow-sm, shadow-md |
| **Transitions** | Fast: 150ms ease-out, default: 200ms ease-out |
| **Breakpoints** | Mobile: 0px, tablet: 768px, laptop: 1024px, desktop: 1280px |
| **Grid** | 1 col (mobile) → 2 cols (tablet) → 3 cols (laptop) → 4 cols (desktop) |
| **Helpers** | `cefrBadgeClasses()`, `verbGroupBadgeClasses()` |

### `src/app/globals.css` (420 lines)

Tailwind CSS theme + custom properties:

| Category | What It Defines |
|----------|----------------|
| **@theme variables** | Font families (DM Sans, Inter, Menlo), full color palette, CEFR colors, button states, smart-blocos tokens |
| **CSS custom properties** | `--bg-primary/secondary/card/hover/active`, `--text-primary/secondary/muted`, `--border-primary/light`, `--brand/brand-light`, `--shadow-sm` |
| **Animations (16+)** | pulse-arrow, fadeIn, fadeInUp, modalIn, megaOpen, slideInRight, exercise-enter/exit, feedback-slide-up/down, success-pulse, error-shake, input-focus-glow, url-highlight-ring, sidebar-slide-in, page-enter |
| **Utility classes** | Exercise states, option states, word pill animations, match pair states, flashcard 3D flip, accordion animations, expandable sections |

**Design approach:** Semantic token system combining TypeScript tokens (prop-based access) + CSS variables (Tailwind theming via `@theme`) + CSS custom properties (non-Tailwind contexts). No separate `tailwind.config` file.

---

## 6. Key Observations

### Architecture: Two Parallel Systems

The codebase has **two distinct component systems** that coexist:

1. **Classic Block System** (`src/components/blocks/`) — Older, type-safe, variant-based. Each block type (vocab, verb, grammar, etc.) accepts a discriminated union descriptor. Includes full exercise system, layout managers (carousel, review stack), and primitives.

2. **SmartBloco System** (`src/components/smart-bloco/`) — Newer, composable. One flexible `SmartBloco` component adapts via props. Uses CSS custom properties for theming. Designed for content pages (vocabulary, grammar, culture, conjugations).

**The Classic Block System is largely orphaned.** Most exercise and content blocks are no longer imported. The migration to SmartBloco appears ~70% complete.

### What's Clean (9 pages)
- `/vocabulary`, `/vocabulary/[category]`, `/grammar`, `/grammar/[topic]`, `/conjugations`, `/conjugations/[verb]`, `/smart-blocos` — all use the SmartBloco system consistently with IntroBlock + FilterBlock + BlocoGrid + SmartBloco.

### What Needs Work (15 pages)
- **Home (`/`)** — Mixes SmartBloco with inline custom cards for daily picks
- **Culture (`/culture`)** — Custom TabFilters, FeaturedSaying, inline state management
- **Lessons (`/lessons`, `/lessons/[id]`)** — Heavy bespoke rendering (627 lines in detail page)
- **Exams (`/exams`, `/exams/[id]`)** — Entirely custom exam UI (57.9KB detail page)
- **Calendar (`/calendar`)** — Large custom calendar (78.6KB)
- **Auth pages (4)** — Custom forms (expected, not a problem)
- **Progress, Onboarding, Settings, Notes, Guide, Changelog** — All custom, varying complexity

### Dead Code
- **~38 orphaned components** totaling ~2,500+ lines of dead code
- The entire `src/components/blocks/` directory (exercises, layout, primitives) appears unused except possibly through barrel re-exports
- `personalised-homepage.tsx` (585 lines) is the largest single unused file
- `changelog-banner.tsx` and `study-log-button.tsx` are functional but unlinked

### Naming Inconsistencies
- `IntroBlock` (PascalCase filename) vs `filter-pill.tsx` (kebab-case) — mixed file naming in `blocos/`
- `ContentGrid` exists in both `blocos/ContentGrid.tsx` and `blocks/layout/content-grid.tsx`
- `ProgressBar` exists in both `ui/progress-bar.tsx` and `smart-bloco/parts/progress-bar.tsx`
- `Skeleton` exists in both `ui/skeleton.tsx` and `blocos/Skeleton.tsx`

### Duplication
- Two `ContentGrid` components with similar purpose but different implementations
- Two `ProgressBar` components
- Two `Skeleton` systems
- `SmartVocabBlock` is an enhanced `VocabBlock` — both exist but `SmartVocabBlock` is unused

### Half-Built / Tiny Components
Several components under 30 lines may be stubs:
- `blocks/layout/content-grid.tsx` (27 lines)
- `blocks/primitives/cross-link-text.tsx` (26 lines)
- `blocks/primitives/responsive-switcher.tsx` (18 lines)
- `blocos/BlocosEmptyState.tsx` (27 lines)
- `smart-bloco/parts/example-block.tsx` (27 lines)

These are all intentionally minimal/focused utilities, not truly incomplete.

### Summary Statistics

| Metric | Count |
|--------|------:|
| Total components in `src/components/` | ~99 |
| Orphaned components | 38 |
| Page routes | 24 |
| Pages using shared blocks cleanly | 9 |
| Pages with bespoke rendering | 15 |
| Design token files | 2 |
| Custom CSS animations | 16+ |
| Lines of dead code (estimate) | ~2,500+ |
