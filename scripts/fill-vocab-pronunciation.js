#!/usr/bin/env node
/**
 * Fills the empty `pronunciation` values in src/data/vocab.json from the seed
 * files in scripts/pronunciation-seed/vocab-empty-<n>.json (exact `portuguese`
 * string -> pronunciation, in batches of about 100).
 *
 *   node scripts/fill-vocab-pronunciation.js --dry   # validate and report, change nothing
 *   node scripts/fill-vocab-pronunciation.js         # merge
 *
 * It only ever writes where the current value is empty. Each batch is
 * validated before anything is written: the value must be non-empty, use only
 * the respelling alphabet, give every word of two or more syllables a
 * capitalised stressed syllable, and contain no Brazilian-leaning value
 * (tch/dj, initial h for r, open final -ee). Any failure aborts the whole run.
 */
const fs = require("node:fs");
const path = require("node:path");
const { brazilianHits, stressed } = require("./pronunciation-rules");

const FILE = path.resolve(__dirname, "../src/data/vocab.json");
const SEEDS = path.resolve(__dirname, "pronunciation-seed");
const dry = process.argv.includes("--dry");

const raw = fs.readFileSync(FILE, "utf8");
const vocab = JSON.parse(raw);
const isEmpty = (v) => typeof v !== "string" || !v.trim(); // also true when the key is missing

const batches = fs
  .readdirSync(SEEDS)
  .filter((f) => /^vocab-empty-\d+\.json$/.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));

/** Entries that never had the field get it in the usual place, right after `gender`. */
function setPronunciation(w, pron) {
  if (Object.hasOwn(w, "pronunciation")) {
    w.pronunciation = pron;
    return;
  }
  const rest = Object.entries(w);
  for (const [k] of rest) delete w[k];
  const after = rest.some(([k]) => k === "gender") ? "gender" : "cefr";
  for (const [k, v] of rest) {
    w[k] = v;
    if (k === after) w.pronunciation = pron;
  }
  if (!Object.hasOwn(w, "pronunciation")) w.pronunciation = pron;
}

/** Problems with one pronunciation value, or an empty list. */
function validate(pt, pron) {
  const problems = [];
  if (isEmpty(pron)) return ["empty"];
  if (/[^A-Za-z\-\s\/?!,.]/.test(pron)) problems.push("character outside the respelling alphabet");
  for (const word of pron.split(/[\s\/]+/).filter(Boolean)) {
    const syl = word.replace(/[?!,.]+$/, "").split("-");
    if (syl.length >= 2 && !syl.some(stressed)) problems.push(`no capitalised syllable in «${word}»`);
    if (syl.some((s) => !s)) problems.push(`empty syllable in «${word}»`);
  }
  const parts = pt.split(" / ").length;
  if (pron.split(" / ").length !== parts) problems.push(`${pron.split(" / ").length} alternatives but the entry has ${parts}`);
  problems.push(...brazilianHits(pron, pt));
  return problems;
}

const known = new Set(); // every portuguese string in the file, filled or not
const empties = new Map(); // portuguese -> array of word objects (an entry can appear in two categories)
for (const cat of vocab.categories) {
  for (const w of cat.words) {
    known.add(w.portuguese);
    if (isEmpty(w.pronunciation)) {
      if (!empties.has(w.portuguese)) empties.set(w.portuguese, []);
      empties.get(w.portuguese).push(w);
    }
  }
}
const emptyBefore = [...empties.values()].reduce((n, l) => n + l.length, 0);

const seen = new Map(); // key -> value, to catch two batches disagreeing
let filled = 0;
let failed = false;
const unmatched = [];
for (const name of batches) {
  const seed = JSON.parse(fs.readFileSync(path.join(SEEDS, name), "utf8"));
  const bad = [];
  let batchFilled = 0;
  for (const [pt, pron] of Object.entries(seed)) {
    if (seen.has(pt) && seen.get(pt) !== pron) bad.push(`${pt}: conflicts with an earlier batch`);
    seen.set(pt, pron);
    const problems = validate(pt, pron);
    if (problems.length) bad.push(`${pt} → ${pron}: ${problems.join("; ")}`);
    const targets = empties.get(pt);
    if (!targets) {
      // Already filled by an earlier run is fine; a key that is not in the file at all is a typo.
      if (!known.has(pt)) unmatched.push(`${name}: «${pt}» is not in vocab.json`);
      continue;
    }
    if (!bad.some((b) => b.startsWith(pt + " →"))) {
      for (const w of targets) {
        if (isEmpty(w.pronunciation) && !w.__filled) {
          if (!dry) setPronunciation(w, pron);
          w.__filled = true;
          batchFilled++;
        }
      }
    }
  }
  console.log(`${name}: ${Object.keys(seed).length} values, ${batchFilled} entries ${dry ? "would be filled" : "filled"}${bad.length ? `, ${bad.length} PROBLEM(S)` : ""}`);
  for (const b of bad) console.log(`   ✗ ${b}`);
  if (bad.length) failed = true;
  filled += batchFilled;
}
for (const u of unmatched) console.log(`   ! ${u}`);

const stillEmpty = [];
for (const cat of vocab.categories) for (const w of cat.words) if (isEmpty(w.pronunciation) && !w.__filled) stillEmpty.push(`${w.portuguese} [${cat.id}]`);
for (const cat of vocab.categories) for (const w of cat.words) delete w.__filled;

console.log(`\nempty before: ${emptyBefore}, ${dry ? "would fill" : "filled"}: ${filled}, still empty: ${stillEmpty.length}`);
for (const s of stillEmpty) console.log(`   still empty: ${s}`);
if (failed) {
  console.error("\nValidation failed; nothing written.");
  process.exit(1);
}
if (unmatched.length) {
  console.error("\nSeed keys that match no entry (check the exact `portuguese` string); nothing written.");
  process.exit(1);
}
if (dry || filled === 0) process.exit(0);

const indent = [2, 4].find((n) => JSON.stringify(JSON.parse(raw), null, n) === raw || JSON.stringify(JSON.parse(raw), null, n) + "\n" === raw);
if (!indent) {
  console.error("vocab.json formatting is not a 2- or 4-space JSON.stringify round-trip; refusing to rewrite");
  process.exit(1);
}
fs.writeFileSync(FILE, JSON.stringify(vocab, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
console.log("Wrote src/data/vocab.json");
