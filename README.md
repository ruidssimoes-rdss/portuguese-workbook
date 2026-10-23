# Aula

Aula is a European Portuguese course for A1, A2, and B1. The language in it is from Portugal: vocabulary, conjugations, and grammar follow European usage (*autocarro*, *estou a fazer*, *tu* in everyday speech). Lessons and reference material live in the app, and progress is saved to the signed-in account. The interface is in European Portuguese.

## Features

**Today.** The home screen greets you, starts the day's session, and shows reviews that are due plus the current streak.

**Lessons.** There are 50 curriculum lessons: 20 at A1, 20 at A2, and 10 at B1. The next session is assembled from words, verbs, and grammar you still need to practise.

**Practice.** A session mixes new material with exercises: vocabulary, grammar, conjugations, multiple choice, typed answers, true or false, fill-in-the-blank, translation, sentence building, a word bank, and error correction.

**Library.** 2,203 vocabulary items, 48 grammar topics, and 289 verbs across nine tenses (present through the future subjunctive, plus the imperative). Culture covers sayings, false friends, etiquette, and regional expressions.

**Exams.** One CIPLE-style mock, with reading and writing, listening, and speaking. Further papers are listed as coming soon.

**Progress.** Each word, verb, and grammar topic has a mastery level and a spaced-repetition review date. There is also a study calendar, goals, personal notes, and a progress page. Search opens from the sidebar or with ⌘K.

**Professor Elísio.** The tutor plans a practice session from your recent work. With `ANTHROPIC_API_KEY` set, planning goes to the Claude API. Otherwise it tries a local Ollama model. If neither responds, a rule-based planner builds the session from the same content. Answer explanations follow the same order (Claude, then Ollama). When no model is available, the explanation is left out.

**Audio.** Pronunciation buttons play pre-generated European Portuguese clips from Supabase Storage. When a clip is missing, playback falls back to a browser voice whose language is exactly `pt-PT`.

**Accounts.** Email and password, or Google, through Supabase. A new account goes through a short onboarding (why you are learning, level, how often you want to study).

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Supabase Auth, Postgres, and Storage (`src/lib/supabase`)
- Zod, for tutor responses
- Playwright, for the tests in `e2e/`

## Local setup

You need Node.js and a Supabase project.

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `OLLAMA_BASE_URL` | Local Ollama server. The app defaults to `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model. The app defaults to `qwen2.5:7b-instruct` |
| `ANTHROPIC_API_KEY` | Optional. Enables Claude for session planning and explanations |
| `TEST_USER_EMAIL` | Used by the Playwright tests |
| `TEST_USER_PASSWORD` | Used by the Playwright tests |

Apply the SQL in `supabase/migrations/` to that project, in filename order: `001_initial_schema.sql` through `015_create_content_mastery.sql`, then `20261010120000_missing_tables_and_audio_bucket.sql`. Those files create the tables the app writes to (profiles, lesson progress, notes, calendar events, goals, tutor sessions, content mastery, and others) and the public `audio` storage bucket.

In the Supabase dashboard, enable email sign-up. Google sign-in also needs the Google provider configured on that project.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run audio:generate` | Generate missing pt-PT clips with Piper and upload them to the `audio` bucket |

`audio:generate` is a local tool. It expects a Piper virtualenv at `scripts/tts/.venv`, a voice model in `scripts/tts/voices/`, ffmpeg on your PATH, and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` alongside the public Supabase URL. The app runs without it; buttons simply have no clip until audio is uploaded.

Playwright lives in `e2e/`. Its config boots the app with `pnpm dev` and signs in with `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.

```bash
npx playwright test
```
