#!/usr/bin/env node
/**
 * Restores the Present Subjunctive rows for the 35 regular -AR verbs that
 * commit 7681d0a1 fixed (on backup/local-main-2026-10-09) but which never
 * reached main. Replaces only those rows in src/data/verbs.json, matched on
 * verb + Tense + Person. Every other row is left untouched.
 *
 *   node scripts/fix-subjunctive-35.js            # apply
 *   node scripts/fix-subjunctive-35.js --dry-run  # print, don't write
 */
const { execFileSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const FIX_COMMIT = "7681d0a1";
const TENSE = "Present Subjunctive";
const FILE = path.resolve(__dirname, "../src/data/verbs.json");
const dryRun = process.argv.includes("--dry-run");

const git = (ref) => JSON.parse(execFileSync("git", ["show", `${ref}:src/data/verbs.json`], { maxBuffer: 1 << 28 }));
const before = git(`${FIX_COMMIT}~1`);
const fixed = git(FIX_COMMIT);

// The 35 verbs: those whose Present Subjunctive rows changed in FIX_COMMIT.
const rowKey = (r) => `${r.Tense}|${r.Person}`;
const targets = new Map(); // verb -> Map<rowKey, correct form>
for (const [verb, v] of Object.entries(fixed.verbs)) {
  const old = before.verbs[verb];
  if (!old) continue;
  const oldRows = new Map(old.conjugations.map((r) => [rowKey(r), r.Conjugation]));
  for (const r of v.conjugations) {
    if (r.Tense !== TENSE) continue;
    if (oldRows.get(rowKey(r)) !== r.Conjugation) {
      if (!targets.has(verb)) targets.set(verb, new Map());
      targets.get(verb).set(rowKey(r), r.Conjugation);
    }
  }
}
if (targets.size !== 35) {
  console.error(`Expected 35 verbs in ${FIX_COMMIT}, found ${targets.size}`);
  process.exit(1);
}

const raw = readFileSync(FILE, "utf8");
const current = JSON.parse(raw);
let changedRows = 0;
for (const [verb, rows] of targets) {
  const entry = current.verbs[verb];
  if (!entry) {
    console.error(`${verb}: missing from current verbs.json`);
    process.exit(1);
  }
  const was = [];
  const now = [];
  for (const r of entry.conjugations) {
    const want = rows.get(rowKey(r));
    if (want === undefined) continue;
    was.push(r.Conjugation);
    if (r.Conjugation !== want) {
      r.Conjugation = want;
      changedRows++;
    }
    now.push(r.Conjugation);
  }
  console.log(`${verb.padEnd(12)} ${was.join(", ")}  →  ${now.join(", ")}`);
}

console.log(`\n${targets.size} verbs, ${changedRows} rows changed`);
if (dryRun) process.exit(0);

// verbs.json is JSON.stringify(…, null, 4) with no trailing newline; keep it that way.
const out = JSON.stringify(current, null, 4);
if (JSON.stringify(JSON.parse(raw), null, 4) !== raw) {
  console.error("verbs.json formatting is not a 4-space JSON.stringify round-trip; refusing to rewrite");
  process.exit(1);
}
writeFileSync(FILE, out);
console.log(`Wrote ${path.relative(process.cwd(), FILE)}`);
