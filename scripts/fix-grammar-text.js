#!/usr/bin/env node
/**
 * Repairs the prose findings of scripts/audit-grammar-text.js in
 * src/data/grammar.json. Idempotent: a second run changes nothing.
 *
 *   node scripts/fix-grammar-text.js            # apply
 *   node scripts/fix-grammar-text.js --dry-run  # report only
 *
 * 1. Every topic: a paragraph break that landed before a closing bracket
 *    ("…Porquê?\n\n). Por que…") is removed, so the sentence reads as one.
 * 2. noun-gender: one clean intro paragraph, and Rules 2-4 each carry their own
 *    content instead of restating the intro. Rule count and ids are unchanged.
 * 3. articles: Rule 1 no longer opens with the intro's first sentence.
 *
 * No mojibake exists in the source files (the "Ã" hits are real capitals such
 * as NÃO), so no encoding repair is needed.
 */
const fs = require("node:fs");
const path = require("node:path");

const FILE = path.resolve(__dirname, "../src/data/grammar.json");
const dryRun = process.argv.includes("--dry-run");
const raw = fs.readFileSync(FILE, "utf8");
const grammar = JSON.parse(raw);
const changes = [];

function set(topic, field, owner, key, value) {
  if (JSON.stringify(owner[key]) === JSON.stringify(value)) return;
  changes.push(`${topic} ${field}`);
  owner[key] = value;
}

/* 1. Stray paragraph breaks before closing punctuation, every topic */
const STRAY_BREAK = /\s*\n+\s*(?=[)\]»,;])/g;
for (const [id, t] of Object.entries(grammar.topics)) {
  const fix = (owner, key, field) => {
    if (typeof owner[key] === "string") set(id, field, owner, key, owner[key].replace(STRAY_BREAK, ""));
  };
  fix(t, "intro", "intro");
  fix(t, "summary", "summary");
  (t.rules ?? []).forEach((r, i) => {
    fix(r, "rule", `rules[${i}].rule`);
    fix(r, "rulePt", `rules[${i}].rulePt`);
  });
  (t.tips ?? []).forEach((_, i) => fix(t.tips, i, `tips[${i}]`));
  (t.tipsPt ?? []).forEach((_, i) => fix(t.tipsPt, i, `tipsPt[${i}]`));
  (t.questions ?? []).forEach((q, i) => fix(q, "explanation", `questions[${i}].explanation`));
}

/* 2. noun-gender */
const ng = grammar.topics["noun-gender"];
if (ng.rules.length !== 5) throw new Error(`noun-gender: expected 5 rules, found ${ng.rules.length}`);
set(
  "noun-gender",
  "intro",
  ng,
  "intro",
  "Every Portuguese noun is either masculine or feminine, and the article tells you which: o for masculine, a for feminine (o livro, a casa). The ending of a noun is a good first guide, but only a guide. The rules below cover the common patterns and the exceptions you will meet early on.",
);
const [, masc, fem, tricky] = ng.rules;
set(
  "noun-gender",
  "rules[1].rule",
  masc,
  "rule",
  "Masculine endings: -o (o carro), -or (o computador, o professor), -ão (o pão, o avião), and Greek-origin words in -ema and -ama (o problema, o sistema, o tema, o programa, o telegrama). Exceptions: a cor, a flor, a dor and a mão are feminine.",
);
set("noun-gender", "rules[1].examples", masc, "examples", [
  { pt: "o computador", en: "the computer" },
  { pt: "o pão", en: "the bread" },
  { pt: "o problema", en: "the problem" },
  { pt: "o programa", en: "the programme" },
]);
set(
  "noun-gender",
  "rules[2].rule",
  fem,
  "rule",
  "Feminine endings: -a (a casa, a mesa), -ção (a lição, a estação, a informação), -dade (a cidade, a universidade, a felicidade) and -gem (a viagem, a garagem, a paisagem).",
);
set("noun-gender", "rulePt[2]", fem, "rulePt", "Terminações femininas: -a, -ção, -dade, -gem.");
set("noun-gender", "rules[2].examples", fem, "examples", [
  { pt: "a cidade", en: "the city" },
  { pt: "a lição", en: "the lesson" },
  { pt: "a felicidade", en: "happiness" },
  { pt: "a viagem", en: "the journey" },
]);
set(
  "noun-gender",
  "rules[3].rule",
  tricky,
  "rule",
  "Some nouns do not follow their ending. Masculine despite -a: o dia (day), o mapa (map), o planeta (planet), o cinema. Feminine despite -o: a tribo (tribe), a foto (photo), a moto (motorbike). Feminine despite -ama: a cama (bed), a fama (fame). One spelling, two genders: o rádio (the radio set) and a rádio (the radio station).",
);
set("noun-gender", "tips[1]", ng.tips, 1, "Greek-origin words in -ema and -ama are usually masculine (o problema, o programa), but a cama and a fama are feminine.");
set("noun-gender", "tipsPt[1]", ng.tipsPt, 1, "Palavras de origem grega em -ema e -ama costumam ser masculinas (o problema, o programa).");

/* 3. articles: Rule 1 should not open with the intro's own first sentence */
const articles = grammar.topics.articles;
set(
  "articles",
  "rules[0].rule",
  articles.rules[0],
  "rule",
  "The definite article agrees with its noun in gender and number: o (m. sing.), a (f. sing.), os (m. pl.), as (f. pl.).",
);

if (changes.length === 0) {
  console.log("grammar.json: nothing to fix");
  process.exit(0);
}
console.log(`${changes.length} field(s) ${dryRun ? "would change" : "changed"}:`);
for (const c of changes) console.log(`  ${c}`);
if (dryRun) process.exit(0);

// grammar.json is JSON.stringify(…, null, 2) plus a trailing newline.
if (JSON.stringify(JSON.parse(raw), null, 2) + "\n" !== raw) {
  console.error("grammar.json formatting is not a 2-space JSON.stringify round-trip; refusing to rewrite");
  process.exit(1);
}
fs.writeFileSync(FILE, JSON.stringify(grammar, null, 2) + "\n");
console.log("Wrote src/data/grammar.json");
