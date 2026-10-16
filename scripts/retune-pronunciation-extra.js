#!/usr/bin/env node
/**
 * Retunes the pronunciation respelling in every data file except vocab.json
 * (which scripts/retune-pronunciation.js handles) with the same rules, from
 * scripts/pronunciation-rules.js:
 *
 *   src/data/verbs.json          verbs.<KEY>.meta.pronunciation   (infinitive)
 *   src/data/sayings.json        sayings[].pronunciation
 *   src/data/regional.json       expressions[].pronunciation
 *   src/data/false-friends.json  falseFriends[].pronunciation
 *
 *   node scripts/retune-pronunciation-extra.js --dry   # write scripts/pronunciation-sample-extra.md, change nothing
 *   node scripts/retune-pronunciation-extra.js         # apply
 *
 * 121 verbs were written in a different, bare-vowel style («com-pa-RAR»). Those
 * are first rewritten into the standard symbols from
 * scripts/pronunciation-seed/verbs-restyle.json (the seed is authoritative),
 * then the rules run. Idempotent; overrides are applied last.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createRetuner, brazilianHits, stressed } = require("./pronunciation-rules");

const DATA = path.resolve(__dirname, "../src/data");
const OVERRIDES = path.resolve(__dirname, "pronunciation-overrides.json");
const RESTYLE = path.resolve(__dirname, "pronunciation-seed/verbs-restyle.json");
const SAMPLE = path.resolve(__dirname, "pronunciation-sample-extra.md");
const dry = process.argv.includes("--dry");

const overrides = Object.fromEntries(
  Object.entries(JSON.parse(fs.readFileSync(OVERRIDES, "utf8"))).filter(([k]) => !k.startsWith("_")),
);
const restyle = JSON.parse(fs.readFileSync(RESTYLE, "utf8"));
const { retune, stats, noStress } = createRetuner(overrides);

const SOURCES = [
  {
    file: "verbs.json",
    entries: (j) => Object.entries(j.verbs).map(([key, v]) => ({ key, get: () => v.meta.pronunciation, set: (x) => (v.meta.pronunciation = x) })),
  },
  {
    file: "sayings.json",
    entries: (j) => j.sayings.map((s) => ({ key: s.portuguese, get: () => s.pronunciation, set: (x) => (s.pronunciation = x) })),
  },
  {
    file: "regional.json",
    entries: (j) => j.expressions.map((s) => ({ key: s.expression, get: () => s.pronunciation, set: (x) => (s.pronunciation = x) })),
  },
  {
    file: "false-friends.json",
    entries: (j) => j.falseFriends.map((s) => ({ key: s.portuguese, get: () => s.pronunciation, set: (x) => (s.pronunciation = x) })),
  },
];

function validate(key, pron) {
  const problems = [];
  if (typeof pron !== "string" || !pron.trim()) return ["empty"];
  if (/[^A-Za-z\-\s\/?!,.;:]/.test(pron)) problems.push("character outside the respelling alphabet");
  for (const word of pron.split(/[\s\/]+/).filter(Boolean)) {
    const syl = word.replace(/[?!,.;:]+$/, "").split("-");
    if (syl.length >= 2 && !syl.some(stressed)) problems.push(`no capitalised syllable in «${word}»`);
  }
  problems.push(...brazilianHits(pron, key.toLowerCase() === key || key.includes(" ") ? key : key.toLowerCase()));
  return problems;
}

const report = [];
const allPairs = [];
let failed = false;
for (const src of SOURCES) {
  const file = path.join(DATA, src.file);
  const raw = fs.readFileSync(file, "utf8");
  const json = JSON.parse(raw);
  const entries = src.entries(json);
  let changed = 0;
  let empty = 0;
  for (const e of entries) {
    const before = e.get();
    if (typeof before !== "string" || !before.trim()) {
      empty++;
      continue;
    }
    let after = before;
    if (src.file === "verbs.json" && Object.hasOwn(restyle, e.key)) after = restyle[e.key];
    after = retune(e.key, after);
    allPairs.push({ file: src.file, key: e.key, before, after });
    if (after !== before) {
      changed++;
      const problems = validate(e.key, after);
      if (problems.length) {
        failed = true;
        console.log(`   ✗ ${src.file} ${e.key}: ${before} → ${after}: ${problems.join("; ")}`);
      }
      if (!dry) e.set(after);
    }
  }
  report.push({ file: src.file, entries: entries.length, empty, changed });
  if (!dry && changed) {
    const indent = [2, 4].find((n) => JSON.stringify(JSON.parse(raw), null, n) === raw || JSON.stringify(JSON.parse(raw), null, n) + "\n" === raw);
    if (!indent) {
      console.error(`${src.file}: formatting is not a 2- or 4-space JSON.stringify round-trip; refusing to rewrite`);
      process.exit(1);
    }
    fs.writeFileSync(file, JSON.stringify(json, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
  }
}

for (const r of report) console.log(`${r.file.padEnd(20)} ${String(r.entries).padStart(4)} entries, ${r.empty} empty, ${r.changed} ${dry ? "would change" : "changed"}`);
console.log(`rules fired: A ${stats.A}, B ${stats.B}, C ${stats.C}, D ${stats.D}, O(initial o→oo) ${stats.O}, H(h→rr) ${stats.H}, R(r→rr) ${stats.R}, E(ER→EHR) ${stats.E}, overrides ${stats.override}`);
if (noStress.size) console.log(`${noStress.size} multi-syllable word(s) with no marked stress were skipped:\n  ${[...noStress].join("\n  ")}`);
if (failed) {
  console.error("\nValidation failed on the values above.");
  process.exit(1);
}

if (dry) {
  // 60 pairs spread across the four files, changed entries first.
  const quota = { "verbs.json": 24, "sayings.json": 12, "regional.json": 12, "false-friends.json": 12 };
  const rows = [];
  for (const [file, n] of Object.entries(quota)) {
    const mine = allPairs.filter((p) => p.file === file);
    const changedOnes = mine.filter((p) => p.before !== p.after);
    const pool = changedOnes.length >= n ? changedOnes : [...changedOnes, ...mine.filter((p) => p.before === p.after)];
    const step = Math.max(1, Math.floor(pool.length / n));
    for (let i = 0, c = 0; i < pool.length && c < n; i += step, c++) rows.push(pool[i]);
  }
  const md = [
    "# Pronunciation retune (verbs, sayings, regional, false friends): review sample",
    "",
    `Generated by \`node scripts/retune-pronunciation-extra.js --dry\`. ${report.map((r) => `${r.file}: ${r.changed}/${r.entries}`).join(", ")}.`,
    "",
    "| # | File | Entry | Before | After |",
    "|---|------|-------|--------|-------|",
    ...rows.map((p, i) => `| ${i + 1} | ${p.file} | ${p.key} | \`${p.before}\` | \`${p.after}\`${p.before === p.after ? " (same)" : ""} |`),
    "",
  ].join("\n");
  fs.writeFileSync(SAMPLE, md);
  console.log(`Wrote ${path.relative(process.cwd(), SAMPLE)} (${rows.length} pairs)`);
}
