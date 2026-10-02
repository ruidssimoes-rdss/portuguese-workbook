/**
 * Merges the B1 vocabulary batches in scripts/data/b1-vocab/*.json into
 * src/data/vocab.json (content audit, Oct 2026). Adds 5 new categories,
 * skips duplicates (article-stripped, case-insensitive, across all
 * categories), validates every entry and prints a report. Idempotent.
 *
 * Run: node scripts/add-b1-vocab.js
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "vocab.json");
const BATCH_DIR = path.join(__dirname, "data", "b1-vocab");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

const NEW_CATEGORIES = [
  { id: "services-bureaucracy", title: "Services & Bureaucracy", description: "Finanças, banks, post office, counters and paperwork — getting things done in Portugal" },
  { id: "renting-home-life", title: "Renting & Home Life", description: "Renting a flat, landlords, bills, repairs and living with neighbours" },
  { id: "news-society", title: "News & Society", description: "Government, elections, work, housing and the words you read in the news" },
  { id: "environment", title: "Environment & Climate", description: "Recycling, climate, energy, fires and droughts — environment talk in Portugal" },
  { id: "opinions-connectors", title: "Opinions & Arguments", description: "Giving your opinion, agreeing, disagreeing and linking ideas" },
];
for (const c of NEW_CATEGORIES) {
  if (!data.categories.some((x) => x.id === c.id)) data.categories.push({ ...c, words: [] });
}

const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, " ").replace(/^(o|a|os|as) /, "");
const seen = new Set();
for (const c of data.categories) for (const w of c.words) seen.add(norm(w.portuguese));

const KEYS = ["portuguese", "english", "cefr", "gender", "pronunciation", "example", "exampleTranslation", "relatedWords", "proTip"];
const REQUIRED = ["portuguese", "english", "cefr", "pronunciation", "example", "exampleTranslation"];
const BRAZILIAN = /\b(trem|ônibus|onibus|celular|banheiro|geladeira|café da manhã|tela|moça|xícara|sorvete|açougue|pedágio|carteira de motorista)\b/i;

const report = { added: 0, duplicates: [], invalid: [], brazilian: [], perCategory: {}, perLevel: {} };

const files = fs.readdirSync(BATCH_DIR).filter((f) => /^batch-\d+\.json$/.test(f)).sort();
for (const f of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, f), "utf8"));
  for (const { categoryId, word } of batch) {
    const cat = data.categories.find((c) => c.id === categoryId);
    if (!cat) { report.invalid.push(`${f}: unknown category ${categoryId}`); continue; }
    const missing = REQUIRED.filter((k) => !word[k] || String(word[k]).trim() === "");
    if (missing.length || !["A1", "A2", "B1"].includes(word.cefr)) { report.invalid.push(`${f}: ${word.portuguese} (${missing.join(",") || "cefr"})`); continue; }
    const text = [word.portuguese, word.example].join(" ");
    if (BRAZILIAN.test(text)) { report.brazilian.push(`${f}: ${word.portuguese} — ${word.example}`); continue; }
    const key = norm(word.portuguese);
    if (seen.has(key)) { report.duplicates.push(`${f}: ${word.portuguese}`); continue; }
    seen.add(key);
    const clean = {};
    for (const k of KEYS) if (word[k] !== undefined) clean[k] = word[k];
    if (clean.gender === undefined) clean.gender = null;
    cat.words.push(clean);
    report.added++;
    report.perCategory[categoryId] = (report.perCategory[categoryId] || 0) + 1;
    report.perLevel[word.cefr] = (report.perLevel[word.cefr] || 0) + 1;
  }
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");

const totals = { A1: 0, A2: 0, B1: 0 };
let total = 0;
for (const c of data.categories) for (const w of c.words) { totals[w.cefr]++; total++; }
console.log(JSON.stringify({ added: report.added, perLevel: report.perLevel, perCategory: report.perCategory }, null, 2));
console.log(`Duplicates skipped (${report.duplicates.length}):`, report.duplicates);
console.log(`Invalid skipped (${report.invalid.length}):`, report.invalid);
console.log(`Brazilian-term hits (${report.brazilian.length}):`, report.brazilian);
console.log(`Vocab now: ${total} words in ${data.categories.length} categories`, totals);
