#!/usr/bin/env node
/**
 * Fixes quiz distractors in src/data/grammar.json. Idempotent.
 *
 *   node scripts/fix-grammar-distractors.js            # apply
 *   node scripts/fix-grammar-distractors.js --dry-run  # report only
 *
 * 1. Article questions (correct answer is o/a/os/as/um/uma/uns/umas): every
 *    option becomes an article of the SAME definiteness as the answer, so the
 *    wrong-gender and wrong-number alternatives are there and "um" never sits
 *    next to "os". Options that already fit stay in place, so the correct
 *    answer keeps its position.
 *    Only questions about articles are touched: topics noun-gender and
 *    articles, or wording that mentions "article"/"artigo". An "o" or "a" that
 *    is a pronoun or a preposition (object-pronouns, common-verb-phrases) is
 *    not an article and is left alone.
 * 2. "neuter" is not a gender for Portuguese nouns: removed from option lists.
 * 3. correctIndex always points at correctAnswer (one question had drifted).
 * 4. Eight questions listed the same option twice (so two options were "the"
 *    correct one). The repeated option is swapped for a plausible wrong form,
 *    chosen by hand in DUPLICATE_FIXES below.
 *
 * Two question shapes exist in the file and both are handled without adding
 * fields: {questionText, correctAnswer, correctIndex} (743 questions) and the
 * older {question, correct} where `correct` is the index (20 questions).
 */
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.resolve(__dirname, "../src/data/grammar.json");
const dryRun = process.argv.includes("--dry-run");
const raw = fs.readFileSync(FILE, "utf8");
const grammar = JSON.parse(raw);

const DEFINITE = ["o", "a", "os", "as"];
const INDEFINITE = ["um", "uma", "uns", "umas"];
const ARTICLE_TOPICS = new Set(["noun-gender", "articles"]);
const ARTICLE_WORDING = /\barticle\b|\bartigo\b/i;

/** topic[index] → the full option list to use when the question has a repeated option. */
const DUPLICATE_FIXES = {
  "preterite-regular[0]": ["falo", "falei", "falava", "falou"],
  "preterite-regular[14]": ["comer", "começar", "comentar", "comprar"],
  "preterite-irregular[14]": ["fazem", "fizeram", "fiz", "fizemos"],
  "imperfect-formation[3]": ["vivemos", "vivíamos", "viveremos", "viveram"],
  "imperfect-formation[8]": ["ver", "vir", "ter", "viver"],
  "imperfect-formation[9]": ["jogaram", "jogavam", "jogam", "jogava"],
  "conditional-tense[10]": ["-emos", "-íamos", "-amos", "-aremos"],
  "present-subjunctive-formation[8]": ["falamos", "falemos", "falássemos", "falámos"],
};

const textOf = (q) => q.questionText ?? q.question ?? "";
const indexKey = (q) => ("correctIndex" in q ? "correctIndex" : "correct");
const answerOf = (q) => q.correctAnswer ?? q.options[q[indexKey(q)]];

const cap = (word) => word[0].toUpperCase() + word.slice(1);
const show = (opts) => `[${opts.join(", ")}]`;

const changed = [];
const skipped = [];

for (const [topicId, topic] of Object.entries(grammar.topics)) {
  (topic.questions ?? []).forEach((q, i) => {
    const key = indexKey(q);
    const before = { options: [...q.options], index: q[key] };
    const answer = String(answerOf(q));
    const notes = [];

    // 1. article questions
    const set = DEFINITE.includes(answer.toLowerCase()) ? DEFINITE : INDEFINITE.includes(answer.toLowerCase()) ? INDEFINITE : null;
    if (set) {
      const aboutArticles =
        ARTICLE_TOPICS.has(topicId) || ARTICLE_WORDING.test(textOf(q)) || ARTICLE_WORDING.test(q.questionTextPt ?? "");
      if (!aboutArticles) {
        skipped.push(`${topicId}[${i}] «${textOf(q)}» (${answer} is not an article here)`);
      } else {
        const upper = answer[0] === answer[0].toUpperCase();
        const style = (w) => (upper ? cap(w) : w);
        const inSet = (o) => set.includes(String(o).toLowerCase());
        const present = new Set(q.options.filter(inSet).map((o) => o.toLowerCase()));
        const missing = set.filter((w) => !present.has(w));
        q.options = q.options.map((o) => (inSet(o) ? o : style(missing.shift())));
        // Top up if a question ever has fewer than four options.
        while (q.options.length < 4 && missing.length) q.options.push(style(missing.shift()));
        if (JSON.stringify(q.options) !== JSON.stringify(before.options)) notes.push("article distractors");
      }
    }

    // 2. no "neuter" gender in Portuguese
    if (q.options.some((o) => String(o).toLowerCase() === "neuter")) {
      q.options = q.options.filter((o) => String(o).toLowerCase() !== "neuter");
      notes.push('removed "neuter"');
    }

    // 4. repeated options
    if (new Set(q.options).size !== q.options.length) {
      const fix = DUPLICATE_FIXES[`${topicId}[${i}]`];
      if (!fix) throw new Error(`${topicId}[${i}]: repeated option with no fix listed: ${show(q.options)}`);
      if (!fix.includes(answer)) throw new Error(`${topicId}[${i}]: fix drops the answer «${answer}»`);
      q.options = [...fix];
      notes.push("repeated option replaced");
    }

    // 3. the index must point at the answer
    const idx = q.options.indexOf(answer);
    if (idx === -1) throw new Error(`${topicId}[${i}]: answer «${answer}» is not among the options`);
    if (q[key] !== idx) {
      q[key] = idx;
      notes.push(`${key} ${before.index} → ${idx}`);
    }

    if (JSON.stringify(q.options) !== JSON.stringify(before.options) || q[key] !== before.index) {
      changed.push(`${topicId}[${i}] «${textOf(q)}»\n    ${show(before.options)} → ${show(q.options)}  (${notes.join(", ")})`);
    }
  });
}

// Invariants over the whole file.
let questions = 0;
const problems = [];
for (const [topicId, topic] of Object.entries(grammar.topics)) {
  (topic.questions ?? []).forEach((q, i) => {
    questions++;
    if (q.correctAnswer !== undefined && q.options[q.correctIndex] !== q.correctAnswer) problems.push(`${topicId}[${i}]: correctAnswer !== options[correctIndex]`);
    if (q.options[q[indexKey(q)]] === undefined) problems.push(`${topicId}[${i}]: index points outside the options`);
    if (q.options.some((o) => String(o).toLowerCase() === "neuter")) problems.push(`${topicId}[${i}]: still has "neuter"`);
    if (new Set(q.options).size !== q.options.length) problems.push(`${topicId}[${i}]: duplicate options`);
  });
}

if (changed.length) {
  console.log(`${changed.length} question(s) ${dryRun ? "would change" : "changed"}:`);
  for (const c of changed) console.log(`  ${c}`);
} else {
  console.log("No distractors to fix");
}
if (skipped.length) {
  console.log(`\nLeft alone (article-looking answer, but not an article):`);
  for (const s of skipped) console.log(`  ${s}`);
}
console.log(`\n${questions} questions checked, ${problems.length} problem(s)`);
for (const p of problems) console.log(`  ${p}`);
if (problems.length) process.exit(1);

if (!dryRun && changed.length) {
  if (JSON.stringify(JSON.parse(raw), null, 2) + "\n" !== raw) {
    console.error("grammar.json formatting is not a 2-space JSON.stringify round-trip; refusing to rewrite");
    process.exit(1);
  }
  fs.writeFileSync(FILE, JSON.stringify(grammar, null, 2) + "\n");
  console.log("Wrote src/data/grammar.json");
}
