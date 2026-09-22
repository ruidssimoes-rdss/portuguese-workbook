# Aula PT

A **European Portuguese** learning app built around a real CEFR curriculum (A1 → A2 → B1) and a browsable reference corpus, with an adaptive spaced-repetition engine underneath. Single-learner product. European Portuguese only — never Brazilian.

## What it does

**The core loop.** Read the learner's mastery state → generate a session from items that are weak, due for review, or new at the current CEFR level → play it as exercise sections → grade every answer → write mastery back with SM-2, so the next session is different.

**The reference library.** 1,377 words in 21 categories, 289 fully conjugated verbs, 42 CEFR-tagged grammar topics, and culture material (sayings, etiquette, false friends, regional usage).

**Around it.** Curriculum lessons, mock exams, notes, calendar, goals, streaks, and a progress view.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Supabase (auth, Postgres, RLS) · Vercel · Vitest

## Content

All learning content ships as static files in `src/data` — it is **not** in Postgres. Per-user state lives in Supabase and is joined to content by id/slug.

| File | Contents |
|---|---|
| `vocab.json` | 1,377 words, 21 categories |
| `verbs.json` | 289 verbs, full conjugation tables |
| `grammar.json` | 42 topics with rules, examples, questions |
| `curriculum.ts`, `curriculum-a2-b1.ts` | 50 curriculum lessons |
| `exams.ts` | mock exams |
| `sayings.json`, `etiquette.json`, `false-friends.json`, `regional.json` | culture |

## Learning engine

Lives in `src/lib/learning-engine/`, plus `src/lib/exercise-generator.ts`.

- **One source of truth.** `user_content_mastery` holds all learner state. There is no other mastery model.
- **SM-2 scheduling** (`sm2.ts`). Correct: interval 1 → 6 → `interval × ease`, ease +0.1. Wrong: repetitions reset, interval 1, ease −0.2. Ease clamped to [1.3, 3.0]; interval capped at 365 days.
- **Mastery level (0–5) is derived**, from repetitions and accuracy — never stored independently.
- **Real correctness.** Every question is attributed to the pool item it tests. Mastery is written from what the learner actually answered.
- **Review items are asked.** Review, spot-check and carry-forward items become exercises; they are never marked seen without being asked.
- **One review selector** (`review-selector.ts`) powers both the "due" count and the review session, so the promised number equals the delivered number.

## Data model

`profiles`, `user_settings`, `user_progress`, `user_content_mastery`, `user_lesson_progress`, `user_section_progress`, `user_notes`, `user_calendar_events`, `user_goals`, `tutor_sessions`. RLS on all user-owned rows. Migrations in `supabase/migrations/`.

## Development

```bash
pnpm install
pnpm dev       # http://localhost:3000
pnpm build
pnpm test      # vitest
pnpm lint
```

Environment (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Principles

- **100% free to run.** No runtime LLM calls. Explanations, example sentences and distractors are pre-generated offline, reviewed by hand, and committed to `src/data`.
- **European Portuguese only.** Where usage differs from Brazil, the app says so explicitly.
- **Light mode only.** It's a textbook.
- **Content is the asset.** `src/data` is the product; everything else is the shell around it.

## Design

Design direction, tokens and components live in Figma. Accent `#1B2B61`. Semantic tokens alias primitives; the codebase should consume token names, not hex values.

## Roadmap

- [x] **Phase 0** — remove dead subsystems (AI planner, unused block system, duplicate components, Storybook)
- [x] **Phase 1a** — single mastery model, SM-2, real correctness, review items asked, visible save failures
- [ ] **Phase 1b** — server-side generation, auth middleware, corpus out of the client bundle, one lesson player
- [ ] **Phase 2** — design tokens in code, new shell and screens
- [ ] **Phase 3** — exams, tutor, calendar, goals
