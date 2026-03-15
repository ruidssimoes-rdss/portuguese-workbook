# Exercise Generation Audit

Exact mapping of what the exercise generator produces per lesson.

---

## Report 1: Exercise Generator Logic

### Round 1 (Learn) — Display-only items

Items are generated in this order:
1. **Vocab cards**: 1 per word in the lesson's vocabulary stage — all words shown
2. **Grammar displays**: 1 per grammar topic slug — pulls full rules/examples from grammar.json
3. **Verb previews**: 1 per verb×tense combination — grouped by verb name, each tense shown separately
4. **Culture previews**: 1 per culture item (saying, etiquette tip, false friend)

**No cap applied** — all content is shown.

Formula: `learnItems = V + G + T + C` where V=vocab words, G=grammar topics, T=verb×tense items, C=culture items.

### Round 2 (Practice) — Scored exercises

Generated from lesson content, then shuffled and capped at **18**.

| Source | Exercise Type | Count Formula | Points Each |
|--------|-------------|---------------|-------------|
| Vocab | MC PT→EN | `ceil(V/2)` words, but skipped if <2 distractors available | 1 |
| Vocab | MC EN→PT | `ceil(V/2)` words, but skipped if <2 distractors available | 1 |
| Vocab | Match pairs | 1 exercise if V≥4 (uses min(6,V) pairs) | N pairs |
| Verbs | Conjugation drill | 1 per verb×tense | 5 (1 per person) |
| Verbs | MC verb form | 1 per verb×tense, skipped if <2 distractors | 1 |
| Grammar | True/false | 1 per grammar topic (if rule exists) | 1 |
| Grammar | MC from questions | min(2, available questions) per topic | 1 each |
| Culture | MC meaning | 1 per culture item | 1 |

**Cap**: `shuffle(all).slice(0, 18)` — max 18 exercises survive.

**Key detail**: The two vocab MC batches each independently pick `ceil(V/2)` words from a shuffled copy, so there's overlap — some words may appear in both PT→EN and EN→PT.

**Distractor guard**: MC exercises require `getDistractors()` to return ≥2 results. If the vocab pool is too small (e.g. only 2-3 words), some MCs won't be generated.

### Round 3 (Apply) — Scored exercises

Generated from practice sentences array `P`, capped at **7**.

| Exercise Type | Source | Count |
|-------------|--------|-------|
| Fill-in-blank | `practice[0..3]` | min(4, P) |
| Sentence build | `practice[0]` if P≥1 and sentence has ≥3 words | 0 or 1 |
| Translation input | `practice[1..2]` | min(2, max(0, P-1)) |
| Error correction | `practice[last]` if P≥2 and vocab exists | 0 or 1 |
| Fill-in-blank (overflow) | `practice[4..]` | max(0, P-4) |

**Cap**: `exercises.slice(0, 7)` — max 7 exercises.

**Note**: Sentence build uses `practice[0]`, which is also used for the first fill-in-blank. So the same sentence appears in two exercise types.

---

## Report 2: Concrete Example — Lesson a1-01

### Content

| Content Type | Count | Details |
|---|---|---|
| Vocab words | 15 | greetings, basic phrases |
| Verbs | 4 | SER [Present], ESTAR [Present], CHAMAR [Present], TER [Present] |
| Verb×tense items | 4 | 4 verbs × 1 tense each |
| Grammar topics | 1 | subject-pronouns (15 questions in grammar.json) |
| Culture items | 3 | etiquette/sayings |
| Practice sentences | 6 | fill-in-the-blank |

### Round 1: Learn Items

| Type | Count |
|---|---|
| Vocab cards | 15 |
| Grammar displays | 1 |
| Verb previews | 4 |
| Culture previews | 3 |
| **Total** | **23** |

### Round 2: Practice Exercises (before cap)

| Type | Count | Points |
|---|---|---|
| MC PT→EN | ceil(15/2)=8 | 8 |
| MC EN→PT | ceil(15/2)=8 | 8 |
| Match pairs | 1 (6 pairs) | 6 |
| Conjugation drill | 4 (1 per verb) | 20 (5 each) |
| MC verb form | 4 | 4 |
| True/false | 1 | 1 |
| MC grammar questions | 2 | 2 |
| MC culture meaning | 3 | 3 |
| **Total generated** | **31** | **52** |

After `shuffle().slice(0, 18)`: **18 exercises survive** from the 31 generated. The exact mix is random, but on average ~58% of generated exercises make it. Conjugation drills (worth 5 pts each) and match pairs (worth 6 pts) have the same chance of being cut as a 1-point MC.

**Expected points for R2**: Varies per run. If all 4 conjugation drills survive, that's 20 pts from drills alone + 14 from single-point exercises = ~34 pts. If only 2 drills survive, ~24 pts.

### Round 3: Apply Exercises

| Type | Count | Points |
|---|---|---|
| Fill-in-blank | 4 (sentences 0-3) | 4 |
| Sentence build | 1 (sentence 0) | 1 |
| Translation input | 2 (sentences 1-2) | 2 |
| Error correction | 1 (sentence 5, last) | 1 |
| **Total** | **8 → capped to 7** | **7** |

### Scoring

For a1-01 (assuming all exercises survive the R2 cap):
- R2: ~18 exercises, variable points depending on which survive the shuffle
- R3: 7 exercises, 7 points
- To pass at 80%: need ≥80% of total points

---

## Report 3: Edge Cases

### 1. Lesson with 0 culture items
**Result**: The culture MC section is simply skipped (for loop over empty array). No crash. Practice exercises are just fewer.

### 2. Lesson with only 1 verb
**Result**: 1 conjugation drill (5 points) + 1 MC verb form (if ≥2 distractor forms exist — with 5 persons typically 4 wrong forms available, so yes). Works fine.

### 3. Lesson with 0 grammar questions in grammar.json
**Result**: `topic?.questions ?? []` returns empty array. The `shuffle([]).slice(0,2)` produces nothing. Only the true/false from the rule text is generated. For `verb-types` topic which has 0 questions: only 1 true/false exercise from grammar.

### 4. Lesson with fewer than 4 vocab words
**Result**: Match pairs exercise is skipped (guard: `if (content.vocabItems.length >= 4)`). MC exercises require `getDistractors()` to return ≥2. With 3 vocab words, `getDistractors` can return at most 2 (pool minus correct = 2), which passes the `< 2` check. With 2 vocab words, only 1 distractor available → MC exercises skipped. With 1 word, no MCs generated at all.

### 5. Empty practice sentences array
**Result**: R3 generates 0 exercises (all loops iterate over empty slices). The `.slice(0, 7)` returns `[]`. The safety fallback in the lesson page auto-advances to results if no exercise is available.

### 6. Minimum exercises
A lesson with 0 vocab, 1 verb, 0 grammar, 0 culture, 0 practice:
- R2: 1 conjugation drill + 1 MC verb form = 2 exercises (6 pts)
- R3: 0 exercises (0 pts)
- Total: 6 pts, pass requires 5 correct (80%)

In practice, no A1 lesson has such minimal content. The lowest is a1-05 with 6 vocab + 4 verbs + 2 grammar + 3 culture + 7 practice.

### 7. Maximum exercises
A lesson with 19 vocab (a1-18), 8 verbs, 0 grammar, 3 culture, 8 practice:
- R2 before cap: ~10 MC vocab + 1 match + 8 drills + 8 MC verb + 0 TF + 0 grammar MC + 3 culture MC = ~30
- R2 after cap: 18
- R3: 7
- Total: 25 exercises

---

## Report 4: Scoring Math

### Points calculation for multi-answer exercises

| Exercise Type | Points |
|---|---|
| Multiple choice | 1 |
| Fill-in-blank | 1 |
| True/false | 1 |
| Translation input | 1 |
| Sentence build | 1 |
| Error correction | 1 |
| Conjugation drill | 5 (1 per person: eu, tu, ele/ela, nós, eles/elas) |
| Match pairs | N (1 per pair, typically 4-6) |
| Word bank | N (1 per blank) |

### Example: a1-01 perfect score

Assuming a specific shuffle outcome where R2 keeps 2 conjugation drills, 1 match pairs, and 15 single-point exercises (capped to 18 total):

- R2: 2×5 (drills) + 6 (match) + 10×1 (singles) = 26 pts from 18 exercises
- R3: 7×1 = 7 pts from 7 exercises
- Total: 33 pts, 100% accuracy

To pass at 80%: need ≥27 correct points out of 33.

**The variance problem**: Because R2 is shuffled before capping, the total possible points change every run. A run that keeps all 4 conjugation drills has 20+6+8 = 34 pts from R2 alone. A run that drops all drills has only 18 pts from R2. This means the difficulty varies between runs.

---

## Report 5: A1 Lessons Summary Table

Content inputs per lesson:

| Lesson | Title | Vocab | Verbs | Tenses | Grammar | GQ | Culture | Practice |
|--------|-------|-------|-------|--------|---------|-------|---------|----------|
| a1-01 | First Words | 15 | 4 | 4×Pres | 1 | 15 | 3 | 6 |
| a1-02 | Please & Thank You | 9 | 4 | 4×Pres | 1 | 18 | 2 | 6 |
| a1-03 | Numbers & Basics | 14 | 4 | 4×Pres | 1 | 18 | 2 | 6 |
| a1-04 | Clocks & Days | 14 | 4 | 4×Pres | 1 | 19 | 2 | 6 |
| a1-05 | Months, Seasons & Age | 6 | 4 | 4×Pres | 2 | 32 | 3 | 7 |
| a1-06 | The Rainbow | 14 | 4 | 4×Pres | 1 | 17 | 2 | 6 |
| a1-07 | Sun, Rain & Wind | 9 | 4 | 4×Pres | 1 | 15 | 2 | 6 |
| a1-08 | Ordering Coffee | 14 | 4 | 4×Pres | 1 | 15 | 3 | 7 |
| a1-09 | Meals & Flavours | 14 | 4 | 4×Pres | 1 | 14 | 2 | 6 |
| a1-10 | At the Restaurant | 12 | 4 | 4×Pres | 1 | 0 | 3 | 7 |
| a1-11 | Getting Around | 14 | 4 | 4×Pres | 1 | 20 | 2 | 6 |
| a1-12 | Finding Your Way | 14 | 4 | 4×Pres | 1 | 21 | 3 | 7 |
| a1-13 | Around Town | 9 | 4 | 4×Pres | 1 | 20 | 2 | 6 |
| a1-14 | House & Rooms | 17 | 4 | 4×Pres | 0 | 0 | 3 | 7 |
| a1-15 | My Family | 9 | 4 | 4×Pres | 0 | 0 | 2 | 6 |
| a1-16 | Morning to Night | 10 | 4 | 4×Pres | 0 | 0 | 3 | 7 |
| a1-17 | Going Online | 7 | 4 | 4×Pres | 0 | 0 | 2 | 6 |
| a1-18 | Everything So Far | 19 | 8 | 8×Pres | 0 | 0 | 3 | 8 |

**Legend**: Vocab = vocabulary words, Verbs = verb count, Tenses = verb×tense combinations, Grammar = grammar topic count, GQ = grammar questions available in grammar.json (sum across topics), Culture = culture items, Practice = practice sentences.

### Exercise generation estimates per lesson

All R2 counts are **before** the cap of 18. Actual R2 = min(generated, 18).

| Lesson | Learn | R2 Gen | R2 Cap | R3 | R2 Point Range | R3 Pts | Total Pt Range |
|--------|-------|--------|--------|-----|----------------|--------|----------------|
| a1-01 | 23 | 31 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-02 | 18 | 24 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-03 | 23 | 29 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-04 | 23 | 29 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-05 | 18 | 23 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-06 | 23 | 29 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-07 | 18 | 24 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-08 | 24 | 30 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-09 | 23 | 27 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-10 | 22 | 24 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-11 | 23 | 29 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-12 | 24 | 30 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-13 | 18 | 24 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-14 | 24 | 25 | 18 | 7 | 18-38 | 7 | 25-45 |
| a1-15 | 15 | 19 | 18 | 7 | 18-33 | 7 | 25-40 |
| a1-16 | 17 | 21 | 18 | 7 | 18-36 | 7 | 25-43 |
| a1-17 | 13 | 17 | 17 | 7 | 17-33 | 7 | 24-40 |
| a1-18 | 30 | 33 | 18 | 7 | 18-58 | 7 | 25-65 |

### R2 generation breakdown (detailed formula)

For a lesson with V vocab, T verb×tense items, G grammar topics, Gq grammar questions available, C culture items:

```
MC PT→EN:     ceil(V/2)     (skipped if V < 3)
MC EN→PT:     ceil(V/2)     (skipped if V < 3)
Match pairs:  1 if V ≥ 4, else 0
Conj. drill:  T
MC verb form: T             (skipped if verb has < 3 unique forms)
True/false:   G
MC grammar:   min(2, Gq) × G
MC culture:   C
─────────────────────────────────
Total:        ceil(V/2)*2 + (V≥4?1:0) + 2T + G + min(2,Gq)*G + C
```

### R2 point range explanation

The point range depends on which exercises survive the shuffle:
- **Minimum** (all single-point exercises survive): 18 pts (if 18 exercises, all 1-pt)
- **Maximum** (all conjugation drills + match pairs survive + singles fill rest):
  - 4 drills × 5 = 20, 1 match × 6 = 6, remaining 13 singles = 13 → 39 pts
  - For a1-18 with 8 drills: 8×5 = 40, 1 match × 6 = 6, remaining 9 = 9 → 55 pts

### R3 breakdown (deterministic, not random)

For a lesson with P practice sentences and V vocab words:

```
Fill-in-blank (first batch):  min(4, P)
Sentence build:               1 if P ≥ 1 and sentence[0] has ≥ 3 words
Translation input:            min(2, max(0, P-1))
Error correction:             1 if P ≥ 2 and V > 0
Fill-in-blank (overflow):     max(0, P-4)
─────────────────────────────────
Total before cap:             varies
Cap:                          slice(0, 7)
```

For P=6 (most A1 lessons): 4 + 1 + 2 + 1 + 2 = 10 → capped to 7. All exercises worth 1 pt each = 7 pts.
For P=7: 4 + 1 + 2 + 1 + 3 = 11 → capped to 7. Same 7 pts.
For P=8 (a1-18): 4 + 1 + 2 + 1 + 4 = 12 → capped to 7. Same 7 pts.

**R3 is always 7 exercises and 7 points for all A1 lessons** (all have P ≥ 6).

### Observations

1. **R2 variance is high**: The shuffle+cap means every attempt has a different exercise mix and different total points. A learner might face 38 total points one run and 25 the next.

2. **Conjugation drills dominate scoring**: Each drill is worth 5 points but counts as 1 of 18 exercise slots. If all 4 survive, they represent 20/38 = 53% of points but only 4/18 = 22% of exercises.

3. **R3 is stable**: Always 7 exercises, 7 points, deterministic content (no shuffle).

4. **a1-17 is the lightest**: Only 17 R2 exercises generated (below cap), so all survive. This is the only A1 lesson where R2 isn't capped.

5. **a1-18 is the heaviest**: 8 verbs generate 8 conjugation drills (40 pts) + 8 MC verb form + reduced vocab MC + 3 culture = 33 exercises. After capping to 18, the point range is extreme: 18-58 depending on how many drills survive.

6. **Lessons 14-18 have no grammar exercises**: No grammar topics means no true/false and no grammar MC. These lessons rely entirely on vocab MC, conjugation drills, MC verb forms, and culture MC for R2.

7. **Match pairs scoring quirk**: The match pairs exercise is worth 4-6 points (1 per pair) but takes 1 of 18 exercise slots. If it survives the shuffle, it's efficient for points.
