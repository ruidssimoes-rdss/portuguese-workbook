#!/usr/bin/env node
/**
 * Read-only audit of the prose in src/data/grammar.json.
 *
 *   node scripts/audit-grammar-text.js            # print findings, exit 1 if any
 *   node scripts/audit-grammar-text.js --strict   # also flag any 45-character run copied from the intro
 *
 * Per topic it checks intro, summary, every rule/rulePt, tips/tipsPt and every
 * question explanation for:
 *   a. a paragraph that starts like a fragment: closing bracket/quote, comma,
 *      semicolon, a dash followed by a space, or a lowercase letter right after
 *      a paragraph that did not end a sentence
 *   b. unbalanced (), [], « » or straight double quotes
 *   c. rule text that repeats the topic intro: the full intro or its first 60
 *      characters (--strict: or any 45-character run copied from it)
 *   d. mojibake (Ã£, Ã§, â€, Â , U+FFFD). Plain "Ã" in words like NÃO is fine.
 */
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.resolve(__dirname, "../src/data/grammar.json");
const grammar = JSON.parse(fs.readFileSync(FILE, "utf8"));

const WINDOW = 45;
const STRICT = process.argv.includes("--strict");
const norm = (s) => s.replace(/\s+/g, " ").trim();
const MOJIBAKE = /Ã[ -¿]|â€[\u0080-ÿ™œ“”¦]|Â[ -¿]|�/;
const SENTENCE_END = /[.!?:;»"”)]$/;

function paragraphs(text) {
  return text.split("\n").map((p) => p.trim()).filter(Boolean);
}

function count(text, ch) {
  return text.split(ch).length - 1;
}

function checkBalance(text) {
  const out = [];
  if (count(text, "(") !== count(text, ")")) out.push(`unbalanced parentheses: ${count(text, "(")} "(" vs ${count(text, ")")} ")"`);
  if (count(text, "[") !== count(text, "]")) out.push("unbalanced square brackets");
  if (count(text, "«") !== count(text, "»")) out.push("unbalanced « »");
  if (count(text, '"') % 2 !== 0) out.push("odd number of straight double quotes");
  return out;
}

function checkFragments(text) {
  const out = [];
  const paras = paragraphs(text);
  paras.forEach((p, i) => {
    if (/^[)\]»,;]/.test(p)) out.push(`paragraph ${i + 1} starts with "${p[0]}": «${p.slice(0, 40)}…»`);
    else if (/^[-–—]\s/.test(p)) out.push(`paragraph ${i + 1} starts with a dash fragment: «${p.slice(0, 40)}…»`);
    else if (i > 0 && /^\p{Ll}/u.test(p) && !SENTENCE_END.test(paras[i - 1])) {
      out.push(`paragraph ${i + 1} starts lowercase after an unfinished paragraph: «${p.slice(0, 40)}…»`);
    }
  });
  if (/^[)\]»,;]/.test(text.trim())) out.push(`string starts with "${text.trim()[0]}"`);
  return out;
}

function repeatsIntro(intro, text) {
  const i = norm(intro);
  const t = norm(text);
  if (i.length < WINDOW) return null;
  if (t.includes(i)) return "contains the full intro";
  if (t.includes(i.slice(0, 60))) return "contains the first 60 characters of the intro";
  if (!STRICT) return null;
  for (let n = 0; n + WINDOW <= i.length; n += 5) {
    const piece = i.slice(n, n + WINDOW);
    if (t.includes(piece)) return `repeats intro text: «${piece}…»`;
  }
  return null;
}

const findings = [];
function add(topic, field, kind, detail) {
  findings.push({ topic, field, kind, detail });
}

for (const [id, t] of Object.entries(grammar.topics)) {
  const strings = [];
  const push = (field, v) => typeof v === "string" && v.length > 0 && strings.push([field, v]);
  push("intro", t.intro);
  push("summary", t.summary);
  (t.rules ?? []).forEach((r, i) => {
    push(`rules[${i}].rule`, r.rule);
    push(`rules[${i}].rulePt`, r.rulePt);
  });
  (t.tips ?? []).forEach((v, i) => push(`tips[${i}]`, v));
  (t.tipsPt ?? []).forEach((v, i) => push(`tipsPt[${i}]`, v));
  (t.questions ?? []).forEach((q, i) => push(`questions[${i}].explanation`, q.explanation));

  for (const [field, text] of strings) {
    for (const d of checkFragments(text)) add(id, field, "a:fragment", d);
    for (const d of checkBalance(text)) add(id, field, "b:balance", d);
    if (MOJIBAKE.test(text)) add(id, field, "d:mojibake", `matches ${MOJIBAKE.exec(text)[0]}`);
    if (/^rules\[\d+\]\.rule(Pt)?$/.test(field) && t.intro) {
      const why = repeatsIntro(t.intro, text);
      if (why) add(id, field, "c:repeats-intro", why);
    }
  }
}

const topics = [...new Set(findings.map((f) => f.topic))];
if (findings.length === 0) {
  console.log(`grammar.json: 0 findings across ${Object.keys(grammar.topics).length} topics`);
  process.exit(0);
}
for (const topic of topics) {
  console.log(`\n${topic}`);
  for (const f of findings.filter((x) => x.topic === topic)) console.log(`  [${f.kind}] ${f.field}: ${f.detail}`);
}
const byKind = {};
for (const f of findings) byKind[f.kind] = (byKind[f.kind] ?? 0) + 1;
console.log(`\n${findings.length} findings in ${topics.length} topics of ${Object.keys(grammar.topics).length}`, byKind);
process.exit(1);
