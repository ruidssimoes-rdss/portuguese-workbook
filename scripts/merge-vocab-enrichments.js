/**
 * Merges vocab-enrichments.json into vocab.json.
 * Only adds relatedWords/proTip to words that DON'T already have them.
 * Usage: node scripts/merge-vocab-enrichments.js
 */
const fs = require("fs");
const path = require("path");

const vocabPath = path.join(__dirname, "../src/data/vocab.json");
const enrichmentsPath = path.join(__dirname, "vocab-enrichments.json");

const vocab = JSON.parse(fs.readFileSync(vocabPath, "utf8"));
const enrichments = JSON.parse(fs.readFileSync(enrichmentsPath, "utf8"));

let added = 0;
for (const cat of vocab.categories) {
  for (const word of cat.words) {
    const key = word.portuguese;
    const enr = enrichments[key];
    if (!enr) continue;
    if (enr.relatedWords && !word.relatedWords?.length) {
      word.relatedWords = enr.relatedWords;
      added++;
    }
    if (enr.proTip && !word.proTip) {
      word.proTip = enr.proTip;
      added++;
    }
  }
}

fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2) + "\n", "utf8");
console.log(`Merged ${added} enrichments.`);
