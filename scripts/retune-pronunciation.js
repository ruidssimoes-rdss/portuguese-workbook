#!/usr/bin/env node
/**
 * Retunes the `pronunciation` respelling in src/data/vocab.json for European
 * Portuguese. Same field, same respelling style, same schema.
 *
 *   node scripts/retune-pronunciation.js --dry   # write scripts/pronunciation-sample.md, change nothing
 *   node scripts/retune-pronunciation.js         # apply
 *
 * The respelling marks the stressed syllable in capitals. These rules only
 * touch UNSTRESSED syllables (no capital letter) and never a capitalised one:
 *
 *   A. unstressed «a» is reduced: ...ah -> ...uh, also before a coda
 *      r/l/sh/s/z/d/b/p/t/k (falar -> fuh-LAHR, casa -> KAH-zuh).
 *      Nasals (ahn, ahm, ahng) are left as they are. A lone «ah» word is the
 *      article «a» (-> uh) unless the Portuguese word is «à» / «às».
 *   B. unstressed «e» before a consonant or at the start of a word: ...eh /
 *      ...ehr -> ...uh / ...uhr (pequeno -> puh-KAY-noo). Final syllables
 *      (-vehl) are left alone.
 *   C. unstressed «o» after a consonant: ...oh -> ...oo (noventa -> noo-VEN-tuh).
 *      A word-initial «oh» (olá, obrigado, hotel) is left alone.
 *   D. final plural/verb -s after a reduced vowel: ...uhs -> ...uhsh.
 *
 * Rules work per word (never across a space) and per whole syllable, so a
 * second run changes nothing. A word of two or more syllables with no capital
 * has no marked stress and is skipped. scripts/pronunciation-overrides.json
 * (Portuguese entry -> exact pronunciation) is applied last for the words the
 * rules get wrong. Entries whose pronunciation is empty stay empty.
 */
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.resolve(__dirname, "../src/data/vocab.json");
const OVERRIDES = path.resolve(__dirname, "pronunciation-overrides.json");
const SAMPLE = path.resolve(__dirname, "pronunciation-sample.md");
const dry = process.argv.includes("--dry");

const raw = fs.readFileSync(FILE, "utf8");
const vocab = JSON.parse(raw);
const overrides = Object.fromEntries(
  Object.entries(JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))).filter(([k]) => !k.startsWith("_")),
);

const stressed = (syl) => /[A-Z]/.test(syl);
const stats = { A: 0, B: 0, C: 0, D: 0, override: 0 };
const noStress = new Set();

// Rule patterns, matched against a whole syllable. Onsets may contain y (lyah, yah).
const RE_A = /^([^aeiou]*)ah(sh|r|l|s|z|d|b|p|t|k)?$/;
const RE_B = /^([^aeiou]*)eh(r)?$/;
const RE_C = /^([^aeiou]+)oh$/;

function retuneWord(word, orthWord, entry) {
  const tail = word.match(/[?!,.…]+$/)?.[0] ?? "";
  const core = tail ? word.slice(0, -tail.length) : word;
  const syl = core.split("-");

  // A lone «ah» is the article a (-> uh) or à (stays ah).
  if (syl.length === 1) {
    if (core === "ah" && orthWord && orthWord.toLowerCase() === "a") {
      stats.A++;
      return "uh" + tail;
    }
    return word;
  }
  if (!syl.some(stressed)) {
    noStress.add(`${entry}  →  ${word}`);
    return word;
  }

  const last = syl.length - 1;
  const out = syl.map((s, i) => {
    if (stressed(s)) return s;
    let m = s.match(RE_A);
    if (m) {
      stats.A++;
      return `${m[1]}uh${m[2] ?? ""}`;
    }
    if (i < last && (m = s.match(RE_B))) {
      stats.B++;
      return `${m[1]}uh${m[2] ?? ""}`;
    }
    if (i < last && (m = s.match(RE_C))) {
      stats.C++;
      return `${m[1]}oo`;
    }
    return s;
  });

  // D: calças -> KAHL-suhsh
  const lastSyl = out[last];
  if (!stressed(lastSyl) && /uhs$/.test(lastSyl) && !/sh$/.test(lastSyl)) {
    out[last] = lastSyl.replace(/uhs$/, "uhsh");
    stats.D++;
  }
  return out.join("-") + tail;
}

function retune(portuguese, pronunciation) {
  if (Object.hasOwn(overrides, portuguese)) {
    if (overrides[portuguese] !== pronunciation) stats.override++;
    return overrides[portuguese];
  }
  const orthParts = portuguese.split(" / ");
  return pronunciation
    .split(" / ")
    .map((part, pi) => {
      const orthWords = (orthParts[pi] ?? "").split(" ");
      const words = part.split(" ");
      const aligned = orthWords.length === words.length;
      return words.map((w, wi) => retuneWord(w, aligned ? orthWords[wi] : null, portuguese)).join(" ");
    })
    .join(" / ");
}

/* Walk the file, apply, and collect before/after pairs. */
const pairs = [];
let entries = 0;
let empty = 0;
let changed = 0;
for (const cat of vocab.categories) {
  for (const w of cat.words) {
    entries++;
    if (typeof w.pronunciation !== "string" || !w.pronunciation.trim()) {
      empty++;
      continue;
    }
    const before = w.pronunciation;
    const after = retune(w.portuguese, before);
    pairs.push({ pt: w.portuguese, cefr: w.cefr, before, after });
    if (after !== before) {
      changed++;
      if (!dry) w.pronunciation = after;
    }
  }
}

/* The 60-entry review sample (picked by position, so it is the same before and after a run). */
function sample() {
  const pick = (arr, n) => {
    const step = Math.max(1, Math.floor(arr.length / n));
    const out = [];
    for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i]);
    return out;
  };
  const s = [];
  for (const lvl of ["A1", "A2", "B1"]) s.push(...pick(pairs.filter((x) => x.cefr === lvl), 14));
  const need = (re, n) => pick(pairs.filter((x) => re.test(x.pt) && !s.includes(x)), n);
  s.push(
    ...need(/ção$|ções$/, 3), ...need(/lh/, 2), ...need(/nh/, 2), ...need(/[ãõ]/, 2),
    ...need(/s$/, 2), ...need(/ /, 3), ...need(/ar$/, 2), ...need(/e$/, 2), ...need(/o$/, 2),
  );
  const seen = new Set();
  return s.filter((x) => !seen.has(x.pt) && seen.add(x.pt)).slice(0, 60);
}

console.log(`${entries} entries, ${empty} with no pronunciation (left empty), ${pairs.length} retuned candidates`);
console.log(`${changed} ${dry ? "would change" : "changed"}`);
console.log(`rules fired: A(a→uh) ${stats.A}, B(e→uh) ${stats.B}, C(o→oo) ${stats.C}, D(-s→-sh) ${stats.D}, overrides ${stats.override}`);
if (noStress.size) console.log(`${noStress.size} multi-syllable word(s) with no marked stress were skipped:\n  ${[...noStress].join("\n  ")}`);

if (dry) {
  const rows = sample().map((x, i) => `| ${i + 1} | ${x.cefr} | ${x.pt} | \`${x.before}\` | \`${x.after}\`${x.before === x.after ? " (same)" : ""} |`);
  const changedPairs = pairs.filter((x) => x.before !== x.after);
  const md = [
    "# Pronunciation retune: review sample",
    "",
    `Generated by \`node scripts/retune-pronunciation.js --dry\`. ${changed} of ${pairs.length} entries change.`,
    "",
    "## The 60 reviewed entries",
    "",
    "| # | CEFR | Portuguese | Before | After |",
    "|---|------|------------|--------|-------|",
    ...rows,
    "",
    `## Every override applied (${Object.keys(overrides).length})`,
    "",
    "| Portuguese | Before | After |",
    "|------------|--------|-------|",
    ...pairs.filter((x) => Object.hasOwn(overrides, x.pt)).map((x) => `| ${x.pt} | \`${x.before}\` | \`${x.after}\` |`),
    "",
    `## First 40 changed entries beyond the sample`,
    "",
    "| Portuguese | Before | After |",
    "|------------|--------|-------|",
    ...changedPairs.slice(0, 40).map((x) => `| ${x.pt} | \`${x.before}\` | \`${x.after}\` |`),
    "",
  ].join("\n");
  fs.writeFileSync(SAMPLE, md);
  console.log(`Wrote ${path.relative(process.cwd(), SAMPLE)}`);
  process.exit(0);
}

// vocab.json is JSON.stringify(…, null, N) for a fixed N; keep that format.
const indent = [2, 4].find((n) => JSON.stringify(JSON.parse(raw), null, n) === raw || JSON.stringify(JSON.parse(raw), null, n) + "\n" === raw);
if (!indent) {
  console.error("vocab.json formatting is not a 2- or 4-space JSON.stringify round-trip; refusing to rewrite");
  process.exit(1);
}
const trailing = raw.endsWith("\n") ? "\n" : "";
fs.writeFileSync(FILE, JSON.stringify(vocab, null, indent) + trailing);
console.log(`Wrote src/data/vocab.json (indent ${indent})`);
