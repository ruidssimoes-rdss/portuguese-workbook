# Aula PT — Codebase Audit

## 1. Project Structure

### Top-level folders

```
├── public/           Static assets
├── scripts/          Build/utility scripts
├── src/
│   ├── app/          Next.js App Router pages & routes
│   ├── components/   React components (ui/, home/, layout/, lessons/, calendar/, notes/)
│   ├── data/         Static data files (JSON + TS curriculum definitions)
│   ├── lib/          Services, utilities, Supabase client
│   ├── types/        TypeScript type definitions
│   └── proxy.ts      Auth proxy middleware
└── supabase/         Supabase config & migrations
```

### Routing — Next.js 16 App Router

All routes live under `src/app/`. No Pages Router.

**Layouts:**
- `src/app/layout.tsx` — root (DM Sans font, AuthProvider, Vercel Analytics)
- `src/app/culture/layout.tsx`
- `src/app/guide/layout.tsx`
- `src/app/vocabulary/layout.tsx`

**Pages (24):**

| Route | File |
|-------|------|
| `/` | `page.tsx` — home dashboard |
| `/lessons` | `lessons/page.tsx` — lesson browser |
| `/lessons/[id]` | `lessons/[id]/page.tsx` — lesson player |
| `/vocabulary` | `vocabulary/page.tsx` |
| `/vocabulary/[category]` | `vocabulary/[category]/page.tsx` |
| `/grammar` | `grammar/page.tsx` |
| `/grammar/[topic]` | `grammar/[topic]/page.tsx` |
| `/conjugations` | `conjugations/page.tsx` |
| `/conjugations/[verb]` | `conjugations/[verb]/page.tsx` |
| `/exams` | `exams/page.tsx` |
| `/exams/[id]` | `exams/[id]/page.tsx` |
| `/culture` | `culture/page.tsx` |
| `/guide` | `guide/page.tsx` |
| `/notes` | `notes/page.tsx` |
| `/calendar` | `calendar/page.tsx` |
| `/progress` | `progress/page.tsx` |
| `/settings` | `settings/page.tsx` |
| `/onboarding` | `onboarding/page.tsx` |
| `/changelog` | `changelog/page.tsx` |
| `/auth/login` | `auth/login/page.tsx` |
| `/auth/signup` | `auth/signup/page.tsx` |
| `/auth/reset-password` | `auth/reset-password/page.tsx` |
| `/auth/update-password` | `auth/update-password/page.tsx` |

**API routes:** Only `src/app/auth/callback/route.ts` (Supabase OAuth callback). **No `src/app/api/` directory exists.**

---

## 2. Database Schema & Types

### Supabase Tables (13 migrations)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| **profiles** | User account & learning metadata | `id`, `display_name`, `learning_motivation`, `self_assessed_level`, `study_days_per_week`, `target_goal`, `target_date`, `onboarding_completed`, `current_streak`, `longest_streak`, `last_active_date`, `goal_suggestion_dismissed`, `last_milestone_seen`, `last_progress_milestone_seen` |
| **user_progress** | Legacy level-based progress | `user_id`, `level_id`, `status`, `score`, `attempts`, `completed_at` |
| **user_section_progress** | Aggregated section progress | `user_id`, `section` (conjugations/vocabulary/grammar), `current_level`, `highest_passed`, `last_test_score`, `total_tests_taken`, `attempts` (JSONB) |
| **user_vocabulary** | Word learning + spaced repetition | `user_id`, `word_portuguese`, `category`, `familiarity` (0–4), `last_reviewed`, `next_review`, `times_correct`, `times_incorrect` |
| **user_verbs** | Verb practice + spaced repetition | `user_id`, `verb`, `familiarity` (0–4), `last_reviewed`, `next_review`, `times_correct`, `times_incorrect` |
| **user_settings** | User preferences | `user_id`, `pronunciation_speed`, `show_phonetics`, `daily_goal`, `theme`, `show_translations`, `preferred_study_time` |
| **user_lesson_progress** | Lesson attempt results | `user_id`, `lesson_id` (UNIQUE), `accuracy_score`, `completed`, `completed_at`, `attempts`, `best_score`, `wrong_items` (JSONB) |
| **user_notes** | Contextual notes | `user_id`, `title`, `content`, `context_type` (grammar/vocabulary/verb/lesson), `context_id`, `context_label`, `is_pinned`, `is_archived`, `color`, `tags` (TEXT[]) |
| **user_calendar_events** | Study activity calendar | `user_id`, `title`, `event_date`, `event_type` (planned/auto_lesson/auto_exam/auto_practice/goal), `linked_type` (lesson/exam/practice/verb/grammar), `linked_id`, `linked_label`, `linked_score`, `linked_passed`, `goal_id`, `color` |
| **user_goals** | User learning goals | `user_id`, `goal_type`, `target_date`, `study_days` (INT[]), `total_items`, `completed_items`, `is_active` |

**RLS:** All tables have row-level security via `auth.uid() = user_id`.

**Indexes:** On `user_id` for all tables, plus `next_review` for spaced repetition tables, `event_date` for calendar, composite indexes on notes context.

### TypeScript Types (`src/types/database.ts`)

```typescript
interface Profile {
  id: string;
  display_name: string | null;
  learning_motivation: string | null;
  self_assessed_level: string | null;
  study_days_per_week: number | null;
  target_goal: string | null;
  target_date: string | null;
  onboarding_completed: boolean;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  goal_suggestion_dismissed: boolean;
  goal_suggestion_dismissed_at: string | null;
  last_milestone_seen: number;
  last_progress_milestone_seen: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProgress {
  id: string;
  user_id: string;
  level_id: string;
  status: "not_started" | "in_progress" | "completed";
  score: number | null;
  attempts: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UserVocabulary {
  id: string;
  user_id: string;
  word_portuguese: string;
  category: string;
  familiarity: number; // 0=new, 1=seen, 2=learning, 3=known, 4=mastered
  last_reviewed: string | null;
  next_review: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

interface UserVerb {
  id: string;
  user_id: string;
  verb: string;
  familiarity: number; // 0–4
  last_reviewed: string | null;
  next_review: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  id: string;
  user_id: string;
  pronunciation_speed: number;
  show_phonetics: boolean;
  daily_goal: number;
  theme: string;
  show_translations: boolean;
  preferred_study_time: string;
  created_at: string;
  updated_at: string;
}
```

---

## 3. Current Lesson System

### How lessons are structured

Lessons are **defined in TypeScript curriculum files** and **resolved at runtime** from static JSON data.

**Pipeline:**
1. `src/data/curriculum.ts` — A1 lessons (18 lessons, abstract content references)
2. `src/data/curriculum-a2-b1.ts` — A2 (~16) + B1 (~16) lessons
3. `src/data/resolve-lessons.ts` — resolves references into full `Lesson` objects by looking up vocab, verbs, grammar, culture from JSON files
4. `src/data/lessons.ts` — type definitions

### Lesson shape

```typescript
interface Lesson {
  id: string;
  title: string;
  cefrLevel: string; // "A1", "A2", "B1"
  estimatedMinutes: number;
  order: number;
  stages: LessonStage[];
}

interface LessonStage {
  type: "vocabulary" | "verb" | "grammar" | "culture" | "practice" | "summary";
  items: VocabItem[] | VerbItem[] | GrammarItem[] | CultureItem[] | PracticeItem[];
}

interface VocabItem { id: string; word: string; translation: string; pronunciation: string; example: { pt: string; en: string } }
interface VerbItem { verb: string; verbTranslation: string; tense: string; conjugations: { pronoun: string; form: string }[]; verbSlug: string }
interface GrammarItem { rule: string; rulePt: string; examples: { pt: string; en: string }[]; topicSlug: string; topicTitle: string }
interface CultureItem { expression: string; meaning: string; literal: string; tip: string }
interface PracticeItem { sentence: string; answer: string; fullSentence: string; translation: string; acceptedAnswers: string[] }
```

### UI rendering

**Components involved:**
- `src/app/lessons/page.tsx` — lesson browser (sequential unlock, level grouping)
- `src/app/lessons/[id]/page.tsx` — lesson player (state machine: intro → learn → sections → results)
- `src/components/lessons/lesson-shell.tsx` — wrapper layout (header, progress bar, CEFR badge)
- `src/components/lessons/sections/` — 8 section components

**Learn components:** `VocabLearnCard`, `GrammarLearn`, `VerbLearn`, `CultureLearn`

**Section components:**
| Section | Component | Description |
|---------|-----------|-------------|
| Vocabulary | `VocabSection` | Type-answer or MC for vocab words |
| Conjugation | `ConjugationSection` | Fill-in verb forms |
| Grammar | `GrammarSection` | MC questions about rules |
| Fill-blank | `FillBlankSection` | Fill _____ in sentences |
| Translation | `TranslationSection` | EN→PT sentences |
| Sentence-build | `SentenceBuildSection` | Reorder words |
| Word-bank | `WordBankSection` | Pick correct words |
| Error-correction | `ErrorCorrectionSection` | Find and fix mistakes |

### Lesson flow

1. **Selection** — `/lessons` page shows all lessons grouped by CEFR level, sequential unlock
2. **Intro** — title, description, CEFR badge
3. **Learn** (optional) — carousel of learn items for vocab/grammar/verbs/culture; can skip to exercises
4. **Sections** — 8 exercise sections generated by `exercise-generator.ts` (779 lines), rendered sequentially
5. **Results** — accuracy %, per-section breakdown, wrong answers review, unlock notification for next lesson
6. **Session persistence** — `sessionStorage` key `aula-pt-lesson-v4-{lessonId}` for resume on refresh

### Exercise generation (`src/lib/exercise-generator.ts`)

- `generateLessonExercises(lesson, showEnglish)` creates all 8 sections
- **PracticeTracker** limits each sentence to max 2 different section types
- Supplements with grammar examples or vocab when practice content is limited
- **Difficulty scaling** via `getDifficulty(lessonNumber, cefrLevel)`: foundation → building → consolidating
- Affects error generation complexity (word swaps, article swaps, character mutations)

---

## 4. Progress Tracking

### Database tables involved

- **`user_lesson_progress`** — one row per user per lesson: `accuracy_score`, `completed`, `completed_at`, `attempts`, `best_score`, `wrong_items` (JSONB)
- **`user_vocabulary`** — per-word familiarity (0–4) with spaced repetition fields (`next_review`, `last_reviewed`, `times_correct/incorrect`)
- **`user_verbs`** — per-verb familiarity with same spaced repetition fields
- **`user_section_progress`** — aggregated per section (conjugations/vocabulary/grammar): `current_level`, `highest_passed`, `last_test_score`, `total_tests_taken`
- **`user_progress`** — legacy level-based progress
- **`profiles`** — streak tracking (`current_streak`, `longest_streak`, `last_active_date`)
- **`user_calendar_events`** — auto-logged study activity with scores

### Data stored on completion

- Accuracy score (0–100), 80% passing threshold
- Best score tracked across attempts (unlimited retries)
- Wrong items array (JSONB): `{ type, verbKey, tense, pronoun, userAnswer, correctAnswer, sentencePt, sentenceEn }`
- Attempt count incremented on each try
- Completion timestamp

### Spaced repetition

Schema supports it (`next_review`, `last_reviewed` fields) but **not actively implemented**. Currently progression is purely sequential lesson completion.

### Service files

- `src/lib/lesson-progress.ts` — `saveLessonAttempt()`, `getLessonProgressMap()`, `resetLessonProgress()`
- `src/lib/progress-stats-service.ts` — dashboard stats (lessons completed, words encountered, streaks, accuracy, timeline)
- `src/lib/goals-service.ts` — goal CRUD, health tracking, calendar event generation
- `src/lib/exam-progress.ts` — exam results tracking

---

## 5. Content Database

### Rough content counts

| Content Type | File | Approximate Count |
|-------------|------|-------------------|
| Vocabulary | `src/data/vocab.json` (421 KB, ~13k lines) | ~500+ words across ~50 categories |
| Verbs | `src/data/verbs.json` (2.7 MB, ~60k lines) | 60+ verbs × 6+ tenses × 6 pronouns |
| Grammar | `src/data/grammar.json` (246 KB, ~1.5k lines) | ~30 topics |
| Sayings | `src/data/sayings.json` | Cultural expressions |
| Lessons | `src/data/curriculum.ts` + `curriculum-a2-b1.ts` | ~50 lessons (A1: 18, A2: ~16, B1: ~16) |

### Categorization

- **Vocabulary:** ~50 categories (greetings, numbers, family, food, clothing, body, health, school, work, sports, animals, nature, weather, tools, money, travel, etc.). Each word tagged with CEFR level (A1–B2).
- **Verbs:** Grouped by priority (Essential/Core/Useful), difficulty, CEFR level, conjugation group (-AR/-ER/-IR).
- **Grammar:** Categorized by topic (tenses, pronouns, articles, prepositions, syntax, etc.).

### Single entry shapes

**Vocab entry:**
```json
{
  "portuguese": "obrigado",
  "english": "thank you",
  "level": "A1",
  "gender": "m",
  "pronunciation": "oh-bree-GAH-doo",
  "example": { "pt": "Muito obrigado!", "en": "Thank you very much!" },
  "related": ["obrigada", "agradecer"]
}
```

**Verb entry:**
```json
{
  "meta": { "emoji": "🗣️", "english": "to speak", "group": "-AR", "priority": "Essential", "difficulty": "Easy", "cefr": "A1", "pronunciation": "fah-LAR" },
  "conjugations": {
    "Present": [
      { "Person": "eu", "Form": "falo", "Example": "Eu falo português.", "English": "I speak Portuguese.", "CEFR": "A1" }
    ]
  }
}
```

**Grammar entry:**
```json
{
  "id": "subject-pronouns",
  "title": "Subject Pronouns",
  "titlePt": "Pronomes Pessoais",
  "intro": "...",
  "rules": [{ "rule": "...", "rulePt": "...", "examples": [{ "pt": "...", "en": "..." }] }],
  "tips": ["..."]
}
```

---

## 6. API Layer

### Existing API routes

**Only one:** `src/app/auth/callback/route.ts` — handles Supabase OAuth redirect.

**No `src/app/api/` directory.** All backend interaction goes through direct Supabase client calls from service files in `src/lib/`.

### Supabase interaction pattern

Services use browser or server Supabase client directly:
- `src/lib/supabase/client.ts` — `createBrowserClient()` for client components
- `src/lib/supabase/server.ts` — `createServerClient()` for server components
- `src/lib/supabase/middleware.ts` — session refresh middleware

### AI/LLM integration

**None.** No AI packages installed, no AI-related code found. All exercises are statically generated from JSON data.

---

## 7. Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | Framework (App Router) |
| `react` / `react-dom` | 19.2.3 | UI library |
| `@supabase/ssr` | ^0.8.0 | Supabase server-side client |
| `@supabase/supabase-js` | ^2.95.3 | Supabase JavaScript client |
| `tailwindcss` | ^4 | CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin |
| `@vercel/analytics` | ^1.6.1 | Usage analytics |
| `@vercel/speed-insights` | ^1.3.1 | Performance monitoring |
| `typescript` | ^5 | Type system |
| `eslint` / `eslint-config-next` | ^9 / 16.1.6 | Linting |

**No AI/ML libraries installed.**

---

## 8. Integration Notes

### Where a new `/api/ai/*` route would fit

Create `src/app/api/ai/` directory. Example structure:

```
src/app/api/
├── ai/
│   ├── generate/route.ts      — exercise/content generation via LLM
│   ├── explain/route.ts       — grammar/vocab explanations
│   ├── conversation/route.ts  — conversational practice
│   └── feedback/route.ts      — personalized feedback on wrong answers
```

This follows Next.js App Router conventions and sits alongside the existing `src/app/auth/callback/route.ts`.

### Reusable existing utilities

| Utility | Location | Reuse for AI |
|---------|----------|-------------|
| Supabase server client | `src/lib/supabase/server.ts` | Auth check in API routes |
| Supabase browser client | `src/lib/supabase/client.ts` | Client-side AI calls |
| Auth provider | `src/components/auth-provider.tsx` | `useAuth()` for gating AI features |
| Database types | `src/types/database.ts` | User profile/progress context for prompts |
| Vocab/grammar/verb data | `src/data/*.json` | RAG context or prompt augmentation |
| Exercise types | `src/lib/exercise-generator.ts` | Output format for AI-generated exercises |
| Answer validation | `src/lib/validate-response.ts` + `accent-utils.ts` | Validate AI-generated answers |
| Lesson types | `src/data/lessons.ts` | Shape AI-generated lessons to match existing interfaces |
| Progress service | `src/lib/lesson-progress.ts` | Feed user history into AI prompts |
| Design tokens | `src/lib/design-tokens.ts` | Consistent styling for AI UI |

### Considerations for adding Ollama API calls

1. **No existing API layer** — you'll need to create `src/app/api/` from scratch. First API routes in the project.
2. **Server-side only** — Ollama runs locally, so API routes must proxy calls. Don't expose Ollama URL to the client.
3. **Environment config** — add `OLLAMA_BASE_URL` (default `http://localhost:11434`) to `.env.local`.
4. **No streaming infrastructure** — if you want streaming responses, you'll need to set up `ReadableStream` in route handlers. No existing patterns to follow.
5. **Type safety** — define response types that match existing `Lesson`, `VocabItem`, `GrammarItem` interfaces so AI-generated content slots into the existing UI seamlessly.
6. **Auth gating** — use existing `createClient()` from `src/lib/supabase/server.ts` to verify user session in API routes before hitting Ollama.
7. **Content validation** — AI-generated Portuguese content should pass through existing `checkAnswer()` / accent normalization to ensure quality.
8. **Latency** — Ollama local inference can be slow. Consider adding loading states and potentially caching generated content in Supabase.
9. **No rate limiting** — no existing middleware for rate limiting. Consider adding for AI endpoints.
10. **JSON data files are large** — `verbs.json` is 2.7 MB. If using as RAG context, extract only relevant subsets per request.
