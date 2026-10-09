# Aula — completion audit (2026-10)

Audited tree: `origin/main` at `51b9afac` ("Exam runner redesign (#6)", 2026-10-03), which is exactly what production serves (Vercel deployment `dpl_AXmPC8hcp4NzRRDGjsdgrvzq4h2k`, READY, sha `51b9afac…`).
Deployed app: https://aula-pt.vercel.app. Supabase project: `aula-pt` (`qfgeawkcoveizjhrikva`, matches `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`). Figma file: `EHQnzg6iO8cI79XBCsc4lO` ("Aula").

> **Important: the local checkout has diverged from the repo.** `/Users/ruisimoes/Projects/aula-pt` is on a local `main` that is 8 commits ahead of and 6 behind `origin/main` (no remote branch contains it). The local line (phase 0/1a/1b refactor, parallel-route shell, Piper audio, 33 routes, vitest) was never pushed; the GitHub repo and production carry PRs #1–#6 (B1 content pack, Aula redesign, kit, Storybook). This audit scores **`origin/main`** because the brief names the GitHub repo and the deployed app, and every target in the brief (B1 pack, `learn/kit.tsx`, 47 Ecrãs, Storybook) only exists there. The report was written in a separate worktree on branch `audit/completion-2026-10`, so local `main` is untouched. Reconciling the two lines is the first decision to make, before any gap below.

## 1. Headline

| Area | Weight | % | One-line reason |
|---|---|---|---|
| A. Content | 25 | **64.1** | Vocab/grammar/verbs/culture at or near target; two lesson systems (0), only 1 of 2 mock exams, no shipped audio (0). |
| B. Features | 25 | **78.6** | 16 of 21 items fully evidenced; Elísio sessions and chat 0 (no model in prod, table missing), flashcards 0, audio and exams partial. |
| C. Screens | 15 | **77.9** | All 26 routes build on the Aula shell; hard-coded palette hex, thin empty/loading/error states and 4 files with lint errors pull it down. |
| D. Design (Figma) | 10 | **69.9** | 19/26 routes have a Figma screen; 6/9 kit components exist in Figma; Ecrãs page visible with 47 frames. |
| E. Components | 10 | **55.6** | 7/50 components have stories; 20/26 screens use shared kit; 12 components unreachable from the app. |
| F. Mobile & PWA | 10 | **50.0** | 26/26 routes usable at 390px (21 screenshot-tested, 5 code-only); PWA 0/5 (no manifest, icons, SW, install, offline). |
| G. Quality | 5 | **34.9** | Build passes on Vercel; 48 lint errors; no unit tests; Playwright 2/22; console errors on 3/26 routes. |

**Overall (weighted): 66.6%**
= 64.07×0.25 + 78.57×0.25 + 77.88×0.15 + 69.87×0.10 + 55.64×0.10 + 50.00×0.10 + 34.85×0.05 = 16.02 + 19.64 + 11.68 + 6.99 + 5.56 + 5.00 + 1.74. Weights sum to 100; no area was N/A.

## 2. Recon summary

- Routes: 26 `page.tsx` files under `src/app` (list in section C). API routes: `api/ai-v2/explain`, `api/ai-v2/session`, `api/ai-v2/session/complete`, `auth/callback`. Middleware `src/proxy.ts` only refreshes the session; it does not redirect, so unauthenticated users get HTML for every route and 5 routes gate client-side via `ProtectedRoute`.
- `src/data`: `vocab.json` 2,203 words / 26 categories (A1 482 · A2 809 · B1 912); `grammar.json` 48 topics (16/16/16); `verbs.json` 289 verbs × 9 conjugated tenses + `meta.participle`; `lessons.ts` 10 lessons; `curriculum.ts` + `curriculum-a2-b1.ts` 18 A1 + 16 A2 + 10 B1 + 6 extra = 50 resolved; `exams.ts` 1 real exam + 11 generated placeholders; culture: `sayings.json` 45, `etiquette.json` 15, `false-friends.json` 25, `regional.json` 30.
- Components: 50 files under `src/components` (48 `.tsx` + 2 `.ts`); kit at `src/components/learn/kit.tsx` exporting `Item, Prompt, AnswerInput, Choice, Chip, ConjRow, Feedback, AccentNote, SectionFooter` (+ helper `choiceResult`); 7 stories under `src/stories/**` (`.storybook/` present, deps not in the local install).
- Supabase (`list_tables`, read-only SQL only): `profiles` 3, `user_settings` 3, `lesson_progress` 0, `user_lesson_progress` 5, `user_notes` 0, `user_calendar_events` 5, `user_goals` 0, `user_content_mastery` 14 (vocab 8 · verb 4 · grammar 2), `auth.users` 3. **Tables referenced by the code but absent from the database:** `user_vocabulary`, `user_verbs`, `tutor_sessions`, `exam_results`, `user_section_progress`, `user_progress` (REST probe returns `PGRST205` for each). `storage.buckets` is empty (no `audio` bucket).
- Figma MCP: available (`whoami` = Rui Simoes, Pro). Pages: `Componentes` (80:342) and `Ecrãs` (85:503, 47 top-level 1920-wide frames).
- Vercel env (`vercel env ls`): only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Production. No `ANTHROPIC_API_KEY`, no `OLLAMA_*`.
- Toolchain state: `next build --webpack` compiles; the type-check step and `npx tsc --noEmit` fail only on 10 `TS2307` errors for `@storybook/react` / `@storybook/test`, which are declared in `package.json` but absent from the local `node_modules` (no installs allowed). Vercel built the same commit successfully. ESLint: 48 errors, 59 warnings. Unit tests: none (no runner in `package.json`). Playwright: 22 tests (11 × 2 projects), 2 passed.

## 3. Area detail

### A. Content — 64.1% (weight 25)

| Item | Target | Actual | Sub-score | Evidence |
|---|---|---|---|---|
| Vocabulary | 2,150 total · B1 ≥ 950 · 26 categories | 2,203 · B1 912 · 26 | (1 + 0.960 + 1)/3 = **0.987** | `src/data/vocab.json`; count script `scratchpad/q/count.mjs` (re-run at verification, identical) |
| Grammar topics | 48 (16/16/16) incl. 6 named slugs | 48 (16/16/16); all 6 present; 48/48 have rules and questions | **1.000** | `src/data/grammar.json` ids `future-subjunctive`, `imperfect-subjunctive`, `conditional-sentences`, `present-perfect-composto`, `indefinites`, `common-verb-phrases` |
| Verb tables | 289 × 10 tense groups | 289 verbs; 9 tenses in `conjugations` (1,445 rows each; Imperative 1,132 rows) + participle in `meta` for 289/289 = 2,884 of 2,890 verb×tense cells | **0.998** | `src/data/verbs.json`; the 6 verbs without an Imperative group: PODER, CHOVER, ACONTECER, PARECER, HAVER, NEVAR |
| Lessons | one lesson system covering A1, A2, B1 | two systems: `lessons.ts` (10: A1 6, A2 4) and `curriculum*.ts` (50 resolved: A1 20, A2 20, B1 10) | **0** (rule: 0 while both exist) | `src/data/lessons.ts`, `src/data/curriculum.ts`, `src/data/curriculum-a2-b1.ts`, `src/data/resolve-lessons.ts` |
| Culture | 4 sets present and populated | sayings 45 · etiquette 15 · false friends 25 · regional 30 (115 shown on `/culture`) | **1.000** | `src/data/{sayings,etiquette,false-friends,regional}.json` |
| Exams | ≥1 full CIPLE A2 mock + ≥1 DEPLE B1 mock | 1 full mock in CIPLE A2 format (`exam-01`: reading-writing 75 min, listening 30, speaking 15; 5 MC + 1 matching + 2 writing + listening + speaking items); `exam-02`…`exam-12` are generated placeholders (`available: false`, "Coming soon.", `placeholderSection`). DEPLE: 0 (string `DEPLE` appears nowhere in `src`) | **0.5** | `src/data/exams.ts:143` (exam01), `:808` (placeholderSection), `:858` (placeholderExams) |
| Audio | % vocab entries with playable pt-PT audio | 0 of 2,203 entries have an audio file (no files in `public/`, no Supabase `audio` bucket). Playback is browser `speechSynthesis`; `pronunciation-button.tsx:78-79` prefers `pt-PT` but falls back to any `pt` voice (can be pt-BR) | **0** | `src/components/primitives/audio-button.tsx`, `src/components/pronunciation-button.tsx`; `storage.buckets` count 0 |

Area A = (0.987 + 1 + 0.998 + 0 + 1 + 0.5 + 0) / 7 = 0.6407.

### B. Features — 78.6% (weight 25)

| Item | Score | Evidence |
|---|---|---|
| Auth | 1 | `src/app/auth/{login,signup,reset-password,update-password}/page.tsx`, `auth/callback/route.ts`, `google-sign-in-button.tsx`; 3 users in `auth.users`; login/signup render on webkit e2e (the only 2 passing tests) |
| Onboarding | 1 | `src/app/onboarding/page.tsx` (364 lines), `src/lib/onboarding-service.ts` writes `profiles` (`onboarding_completed`, level, motivation); columns exist in DB |
| Hoje | 1 | `src/app/page.tsx` reads `profiles` + `getProgressStats`; unauthenticated variant renders (screenshot `home.png`) |
| Core loop | 1 | `src/app/learn/page.tsx`: generates via `@/lib/learning-engine`, plays 8 section components (`src/components/learn/sections/*` = conjugation, error-correction, fill-blank, grammar, sentence-build, translation, vocab, word-bank), grades, then `saveLessonAttempt` → `user_lesson_progress`, `batchUpdateMastery` → `user_content_mastery` (SM-2 columns `ease_factor, interval_days, repetitions, next_review_at`; 14 live rows), `updateStreak`. Not exercised end-to-end in this audit (no test credentials); scored from code + live rows |
| Vocabulary | 1 | `/vocabulary`, `/vocabulary/[category]`, `/vocabulary/[category]/[word]` on `vocab.json` + `use-mastery.ts` states; screenshots `vocabulary*.png` |
| Conjugations | 1 | `/conjugations`, `/conjugations/[verb]`: 9 tense tabs + participle (screenshot `conjugations-verb.png`) |
| Grammar | 1 | `/grammar`, `/grammar/[topic]`: 48 topics with rules, examples, questions |
| Culture | 1 | `/culture`: 115 notes in 4 tabs (screenshot `culture.png`) |
| Lessons | 0.5 | `/lessons` and `/lessons/[id]` work on curriculum data (`user_lesson_progress` 5 rows), but two lesson data systems coexist |
| Exams (incl. timer) | 0.5 | `exam-01` plays (`src/app/exams/[id]/page.tsx`, 1,273 lines); **no timer** (no `setInterval`/countdown in the exam route; `timeMinutes` only displayed at `:1026`); results write to `exam_results` (`src/lib/exam-progress.ts`), a table that does not exist; 11 of 12 exams are placeholders |
| Elísio sessions | 0 | `tutor-tab.tsx:86` POSTs `/api/ai-v2/session` → `generateTiered` → Claude only if `ANTHROPIC_API_KEY`, else Ollama; production has neither → `throw new Error("No AI model available")` (`src/lib/ai-v2/tiered-model.ts:42`). Also reads/writes `tutor_sessions`, which does not exist in the DB |
| Elísio chat backend | 0 | No chat endpoint. `api/ai-v2/explain` exists but has no caller in `src` and needs a model |
| Notes | 1 | `src/app/notes/page.tsx` + `notes-service.ts` (3 writes) on `user_notes` (table exists; 0 rows) |
| Calendar | 1 | `src/app/calendar/page.tsx` (1,497 lines) + `calendar-service.ts` (8 writes) on `user_calendar_events` (5 rows) |
| Goals | 1 | `goals-service.ts` (8 writes), `goal-suggestion-service.ts` on `user_goals` (table exists; 0 rows) |
| Streaks | 1 | `streak-service.ts` → `profiles.current_streak / longest_streak / last_active_date` (columns exist) |
| Progress | 1 | `src/app/progress/page.tsx` + `progress-stats-service.ts` read mastery, lesson progress, calendar, goals |
| Settings | 1 | `src/app/settings/page.tsx` ↔ `user_settings` (columns `pronunciation_speed, show_phonetics, daily_goal, theme, show_translations, preferred_study_time`) |
| Audio playback | 0.5 | Works via Web Speech API only; no shipped clips; non-pt-PT fallback voice possible |
| Flashcards | 0 | No English → reveal PT → Again/Hard/Good/Easy flow anywhere in `src/app`; the only "flashcard" is `FlashcardVariant` in `blocks/content/vocab-block.tsx`, reachable solely from a Storybook story |
| Free-to-run | 1 | Production env has only Supabase keys (verified with `vercel env ls`); the Anthropic call in `src/lib/ai-v2/claude-client.ts` runs only when `ANTHROPIC_API_KEY` is set. Flag: it is the Elísio path, so Elísio cannot work for free on Vercel (Ollama is local-only) |

Area B = 16.5 / 21 = 0.7857.

### C. Screens — 77.9% (weight 15)

Criteria per route: **(a)** Aula shell + tokens (1 = shell/kit imports and ≤5 hard-coded hex; 0.5 = shell but >5 hex literals; auth/onboarding judged on tokens only, shell not expected), **(b)** real data, **(c)** states (1 = loading, empty and error handling present in the file; 0.5 = some; 0 = none), **(d)** 0 ESLint errors in the file. Route score = mean. Hex counts are literal `#rrggbb` occurrences; across `src/app` + `src/components` all 610 literals are Aula-palette values (`#1B2B61` ×56, `#1F1F1F`, `#98988F`, `#1F7A68`, `#B94A32`…), none of the pre-Aula blue palette, so this is "palette hard-coded instead of tokens", not legacy tokens.

| Route | a | b | c | d | Score | Notes (lines / hex / loading-empty-error words / lint errors) |
|---|---|---|---|---|---|---|
| `/auth/login` | 1 | 1 | 1 | 0 | 0.75 | 164 / 2 / 8-1-17 / 1 (`set-state-in-effect`) |
| `/auth/reset-password` | 1 | 1 | 0.5 | 1 | 0.875 | 126 / 2 / 7-0-9 / 0 |
| `/auth/signup` | 1 | 1 | 0.5 | 1 | 0.875 | 178 / 2 / 7-0-11 / 0 |
| `/auth/update-password` | 1 | 1 | 0.5 | 1 | 0.875 | 128 / 2 / 7-0-12 / 0 |
| `/calendar` | 0.5 | 1 | 1 | 1 | 0.875 | 1,497 / 23 / 11-3-6 / 0 |
| `/changelog` | 0.5 | 1 | 0 | 1 | 0.625 | 80 / 7 / 0-0-0 / 0; data `changelog.json` |
| `/conjugations/[verb]` | 1 | 1 | 0 | 1 | 0.75 | 158 / 0 / 0-0-0 / 0 (static data, no notFound handling words) |
| `/conjugations` | 1 | 1 | 0.5 | 1 | 0.875 | 193 / 0 / 0-1-0 / 0 |
| `/culture` | 1 | 1 | 0 | 1 | 0.75 | 210 / 4 / 0-0-0 / 0 |
| `/exams/[id]` | 0.5 | 0.5 | 0.5 | 1 | 0.625 | 1,273 / 38 / 0-1-0 / 0; only exam-01 is real |
| `/exams` | 1 | 1 | 0.5 | 1 | 0.875 | 157 / 5 / 0-1-1 / 0 |
| `/grammar/[topic]` | 0.5 | 1 | 0 | 1 | 0.625 | 248 / 8 / 0-0-0 / 0 |
| `/grammar` | 1 | 1 | 0.5 | 1 | 0.875 | 183 / 0 / 0-2-0 / 0 |
| `/guide` | 1 | 1 | 0.5 | 1 | 0.875 | 193 / 0 / 0-1-0 / 0 (static) |
| `/learn` | 0.5 | 1 | 1 | 0 | 0.625 | 208 / 11 / 5-1-7 / 3 (`no-explicit-any`) |
| `/lessons/[id]` | 1 | 1 | 0.5 | 1 | 0.875 | 390 / 3 / 5-0-11 / 0 |
| `/lessons` | 1 | 1 | 0.5 | 1 | 0.875 | 212 / 2 / 6-0-0 / 0 |
| `/notes` | 1 | 1 | 0.5 | 0 | 0.625 | 649 / 3 / 8-2-0 / 3 (`set-state-in-effect`) |
| `/onboarding` | 1 | 1 | 0.5 | 1 | 0.875 | 364 / 0 / 5-0-7 / 0 |
| `/` (Hoje) | 1 | 1 | 0.5 | 1 | 0.875 | 199 / 0 / 8-0-0 / 0 |
| `/progress` | 0.5 | 1 | 0.5 | 0 | 0.5 | 508 / 41 / 8-0-0 / 1 (`set-state-in-effect`) |
| `/settings` | 0.5 | 1 | 1 | 1 | 0.875 | 556 / 9 / 4-1-9 / 0 |
| `/tutor` | 1 | 0 | 0 | 1 | 0.5 | 13 / 0 / 0-0-0 / 0; no working backend |
| `/vocabulary/[category]/[word]` | 1 | 1 | 0 | 1 | 0.75 | 189 / 2 / 0-0-0 / 0 |
| `/vocabulary/[category]` | 1 | 1 | 0.5 | 1 | 0.875 | 171 / 0 / 0-1-3 / 0 |
| `/vocabulary` | 1 | 1 | 0.5 | 1 | 0.875 | 243 / 3 / 0-1-0 / 0 |

Sum 20.25 / 26 routes = 0.7788. There are no `loading.tsx` or `error.tsx` files anywhere under `src/app`; every page is `"use client"`.

### D. Design (Figma) — 69.9% (weight 10)

- Ecrãs page (85:503): visible, **47 top-level frames** (Hoje, Hoje + painel, Hoje (recolhida), Atividade, Palavra, Lição, Gramática, Professor Elísio, Palavra · Notas, 10 Sessão frames, 3 Estado frames, Conjugações — fazer, Cultura — Pedir um café, Progresso, Exames, Notas — Lisboa vs Porto, Definições, Calendário, Procurar — ⌘K, Exame em curso, Entrar, 4 Começar frames, 5 índice frames, Atividade — tudo em dia, Vocabulário — sem resultados, Professor Elísio — desligado, Notas — vazio, Palavra · Notas — vazio, O teu percurso).
- Routes with a matching screen: **19 / 26 = 0.731**. Matched: `/`→Hoje, `/learn`→Sessão —…, `/lessons`→Lições — índice, `/lessons/[id]`→Lição, `/vocabulary`→Vocabulário — índice, `/vocabulary/[category]/[word]`→Palavra, `/conjugations/[verb]`→Conjugações — fazer, `/grammar`→Gramática — índice, `/grammar/[topic]`→Gramática, `/culture`→Cultura — índice, `/exams`→Exames, `/exams/[id]`→Exame em curso, `/tutor`→Professor Elísio, `/notes`→Notas — índice, `/calendar`→Calendário, `/progress`→Progresso, `/settings`→Definições, `/onboarding`→Começar —…, `/auth/login`→Entrar. Unmatched (7): `/vocabulary/[category]`, `/conjugations`, `/guide`, `/changelog`, `/auth/signup`, `/auth/reset-password`, `/auth/update-password`.
- Kit components in Figma (Componentes page, 35 component sets): **6 / 9 = 0.667**. `AnswerInput`→AnswerInput, `Choice`→ChoiceOption, `Chip`→WordChip, `ConjRow`→ConjugationRow, `Feedback`→Feedback, `AccentNote`→Feedback/Result=Accent. Missing: `Item`, `Prompt`, `SectionFooter` (CheckBlock is the closest composite but is not a 1:1 component).
- Area D = (0.731 + 0.667) / 2 = 0.699.

### E. Components — 55.6% (weight 10)

- Storybook stories: **7 / 50 = 0.14**. Stories exist only for `blocks/content/*` (4) and `blocks/exercises/*` (3); zero for the kit, primitives, layout, learn sections or `aula/index.tsx`. Storybook could not be run (packages not in the local install).
- Screen files using shared kit/primitives/shell: **20 / 26 = 0.769** (the 4 auth pages, `/learn` and `/onboarding` have no shell/kit import at file level; `/learn` delegates to `learn-player`, which uses the kit). Ad-hoc patterns in `src/app`: 82 raw `<button`, 32 raw `<input`, 25 `rounded-xl/2xl` card wrappers; there is no `Button`, `Input` or `Card` primitive in this tree.
- Dead components (not reachable from `src/app`): **12 / 50 → 1 − 12/50 = 0.76**. Unreferenced anywhere: `blocks/lesson-adapter.ts`. Story-only (7): `blocks/content/{grammar,progress,verb,vocab}-block.tsx`, `blocks/exercises/{choose-correct,match-pairs,translate}-exercise.tsx` (+ `shared/answer-validator.ts` used only by the latter). Barrel-only (exported from `primitives/index.ts`, never used): `filter-bar.tsx`, `list-container.tsx`, `list-row.tsx`, `tip-box.tsx`.
- Area E = (0.14 + 0.769 + 0.76) / 3 = 0.556.

### F. Mobile & PWA — 50.0% (weight 10)

- 390×844 webkit screenshots of all 26 routes on the deployed app: `docs/audit/screens-2026-10/<route>.png` plus `results.json` (status, final URL, `scrollWidth`, nav presence, console errors). Chromium is not installed locally, so webkit (Mobile Safari engine) was used.
- 21 routes rendered their own content: `scrollWidth` = 390 on every one (no horizontal scroll), hamburger nav present on every app route, panels not clipped (see `home.png`, `vocabulary-word.png`, `conjugations-verb.png`, `exams.png`).
- 5 routes redirected to `/auth/login` (client `ProtectedRoute`): `/learn`, `/lessons/[id]`, `/exams/[id]`, `/settings`, `/onboarding` — **code-only**. Their layout uses `max-w-[520…760px]` containers (no fixed page widths); the only fixed widths are ≤200px controls (`exams/[id]` 86/120px, `settings` 34/120/200px). The 340px right panel in `page-shell.tsx:96` is `hidden xl:block`. Judged usable.
- Usable at 390px: **26 / 26 = 1.0** (21 measured + 5 code-only).
- PWA: web manifest 0 (404 on `/manifest.json` and `/manifest.webmanifest`; no `manifest.ts`), icons 192/512 0 (`public/` has only logo PNG/SVG and favicon), service worker 0 (404 on `/sw.js`, no SW registration in `src`), installable 0, offline fallback 0 → **0 / 5**.
- Area F = (1.0 + 0) / 2 = 0.50.

### G. Quality — 34.9% (weight 5)

| Check | Score | Evidence |
|---|---|---|
| Build passes | 1 | Vercel production build of `51b9afac` is READY. Locally `next build --webpack` compiles; Turbopack build fails only because the audit worktree's `node_modules` is a symlink, and the type step fails only on missing Storybook packages |
| tsc clean | 0.5 | `npx tsc --noEmit`: 10 errors, all `TS2307 Cannot find module '@storybook/react' / '@storybook/test'` in `src/stories/**` (packages declared but not installed locally). 0 errors outside stories. Cannot confirm a fully clean run without installing |
| Lint | 0 | 48 errors / 59 warnings (baseline = this run, so 1 − 48/48). By rule: 32 × `no-require-imports` in `scripts/*.js`, 9 × `react-hooks/set-state-in-effect`, 6 × `no-explicit-any`, 1 × `preserve-manual-memoization` |
| Unit tests passing % | 0 | No unit test files and no test runner in `package.json` on `origin/main` |
| Playwright passing % | 0.091 | 22 tests (11 specs × Desktop Chrome + Mobile Safari): 2 passed (`auth.spec.ts` login/signup render on Mobile Safari). 11 Desktop Chrome failures: chromium 1208 not installed. 9 Mobile Safari failures: `loginAsTestUser` times out (no `TEST_USER_EMAIL/PASSWORD`) |
| No `console.error` on main routes | 0.5 | 23 / 26 routes clean. `/` and `/culture`: React #418 hydration mismatch (`pageerror`); `/exams`: `[LESSON PROGRESS] Auth error: AuthSessionMissingError` when logged out |

Area G = (1 + 0.5 + 0 + 0 + 0.091 + 0.5) / 6 = 0.3485.

## 4. Top 10 gaps, ranked by overall % gained if closed

| # | Gap | Area moved | Overall gain | Size |
|---|---|---|---|---|
| 1 | Make it a PWA: manifest, 192/512 icons, service worker, install criteria, offline fallback | F 50 → 100 | **+5.0** | M |
| 2 | Ship pre-generated pt-PT audio for all 2,203 vocab entries (the local unpushed branch already has a Piper pipeline and `speak.ts` keyed to a Supabase `audio` bucket) and drop the pt-BR fallback | A audio 0 → 1, B audio 0.5 → 1 | **+4.2** | M |
| 3 | Collapse to one lesson system (retire `lessons.ts` or fold it into the curriculum) | A lessons 0 → 1, B lessons 0.5 → 1 | **+4.2** | L |
| 4 | Storybook stories for the kit, primitives, layout and learn sections (43 components) | E stories 0.14 → 1 | **+2.9** | M |
| 5 | A working Elísio: session generator + chat endpoint that runs without a paid key (rule-based or on-device), plus the missing `tutor_sessions` table | B 2 items 0 → 1 | **+2.4** | L |
| 6 | Screens: replace the 610 hard-coded palette hex with tokens, add empty/loading/error handling to the 10 content routes, fix lint in `learn`, `notes`, `progress`, `login` | C 77.9 → ~95 | **+2.6** | M |
| 7 | A DEPLE B1 mock exam, plus an exam timer and the `exam_results` table | A exams 0.5 → 1, B exams 0.5 → 1 | **+2.4** | L |
| 8 | Figma screens for the 7 unmatched routes and components for `Item`, `Prompt`, `SectionFooter` | D 69.9 → 100 | **+3.0** | M |
| 9 | Flashcard mode (English → reveal → Again/Hard/Good/Easy → SM-2 schedule) | B 0 → 1 | **+1.2** | M |
| 10 | Quality floor: lint to 0 (mostly `scripts/` and `set-state-in-effect`), seed a test user + install chromium so Playwright runs, bring back unit tests | G 34.9 → ~85 | **+2.5** | S/M |

Ranked by gain the order is 1, 2/3, 8, 4, 6, 10, 5/7, 9; sizes are rough. Not listed because it is a prerequisite rather than a gap: reconcile the diverged local `main` (8 unpushed commits) with `origin/main`, and sync the Supabase schema with `supabase/migrations` (6 referenced tables are missing; `exam_results` has no migration at all).

## 5. Not measured, and why

- **Core loop end-to-end on the deployed app**: no test credentials; scored from code paths and the 14 live `user_content_mastery` rows.
- **tsc fully clean / Storybook running**: `@storybook/*` packages are not in the local `node_modules` and installs were off-limits; Vercel's successful build of the same commit is the only evidence the type step passes.
- **Turbopack production build locally**: the audit worktree uses a symlinked `node_modules`, which Turbopack rejects; measured with `--webpack` instead.
- **Playwright on Desktop Chrome**: chromium 1208 not installed; all 11 Chrome-project tests failed for that reason, counted as failures.
- **Whether `ANTHROPIC_API_KEY` is set for Preview/Development**: only Production matters for free-to-run; `vercel env ls` shows no AI keys in any environment.
- **Figma visual parity** (does each screen look like its frame): only presence of a matching frame was counted.
- **`npx tsx`** was fetched once by `npx` to run the lesson/exam count; it was not added to the project. No dependencies were changed.

## 6. Verification

- Content counts re-run from `src/data` at the end of the audit: vocab 2,203 / 26 categories / B1 912; grammar 48; verbs 289 × 9 tenses + participle; lessons 10 + 50; exams 1 + 11 — identical to section A.
- Route count in section C = 26 = `find src/app -name page.tsx | wc -l`.
- Screenshots: 26 PNGs + `results.json` in `docs/audit/screens-2026-10/`, one per route in section F.
- `git status` on branch `audit/completion-2026-10`: only `docs/audit/**`.
