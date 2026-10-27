/**
 * Adds "Pronunciation" (respelling) to the Present rows of the five A1.1 verbs.
 * Idempotent. Keeps verbs.json formatting as found. Fails if any of the 25 rows is missing.
 *
 * Run: node scripts/add-a1-01-verb-phonetics.js
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "verbs.json");
const original = fs.readFileSync(FILE, "utf8");
const indent = 4;
const trailingNewline = original.endsWith("\n");
const data = JSON.parse(original);

// person index in data order: eu, tu, ele/ela/você, nós, eles/elas/vocês
const TABLE = {
  SER: [["sou", "soh"], ["és", "ehsh"], ["é", "eh"], ["somos", "SOH-moosh"], ["são", "sowng"]],
  ESTAR: [["estou", "shtoh"], ["estás", "shtahsh"], ["está", "shtah"], ["estamos", "shtuh-MOOSH"], ["estão", "shtowng"]],
  CHAMAR: [["chamo", "SHAH-moo"], ["chamas", "SHAH-mush"], ["chama", "SHAH-muh"], ["chamamos", "shuh-MAH-moosh"], ["chamam", "SHAH-mowng"]],
  TER: [["tenho", "TAY-nyoo"], ["tens", "tayngsh"], ["tem", "tayng"], ["temos", "TEH-moosh"], ["têm", "TAYNG-ayng"]],
  ENCONTRAR: [
    ["encontro", "eng-KONG-troo"],
    ["encontras", "eng-KONG-trush"],
    ["encontra", "eng-KONG-truh"],
    ["encontramos", "eng-kong-TRAH-moosh"],
    ["encontram", "eng-KONG-trowng"],
  ],
};

let changed = 0;
const missing = [];

for (const [verb, forms] of Object.entries(TABLE)) {
  const entry = data.verbs[verb];
  if (!entry) {
    missing.push(`${verb} (verb)`);
    continue;
  }
  for (const [form, pron] of forms) {
    const i = entry.conjugations.findIndex((row) => row.Tense === "Present" && row.Conjugation === form);
    if (i < 0) {
      missing.push(`${verb} ${form}`);
      continue;
    }
    const row = entry.conjugations[i];
    if (row.Pronunciation === pron) continue;
    const next = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === "Pronunciation") continue;
      next[k] = v;
      if (k === "Conjugation") next.Pronunciation = pron;
    }
    entry.conjugations[i] = next;
    changed++;
    console.log(`${verb.padEnd(10)} ${row.Person.padEnd(40)} ${form.padEnd(12)} ${pron}`);
  }
}

if (missing.length) {
  console.error(`Missing rows: ${missing.join(", ")}`);
  process.exit(1);
}

fs.writeFileSync(FILE, JSON.stringify(data, null, indent) + (trailingNewline ? "\n" : ""));
console.log(`${changed} rows changed`);
