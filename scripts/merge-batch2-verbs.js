#!/usr/bin/env node
/**
 * Merge 11 B1 verbs from batch2-verbs.json into src/data/verbs.json.
 * Place each new verb in alphabetical order within the verbs object.
 * Run from project root: node scripts/merge-batch2-verbs.js
 */
const fs = require("fs");
const path = require("path");

const verbsPath = path.join(__dirname, "../src/data/verbs.json");
const batch2Path = path.join(__dirname, "batch2-verbs.json");

const data = JSON.parse(fs.readFileSync(verbsPath, "utf8"));
const newVerbs = JSON.parse(fs.readFileSync(batch2Path, "utf8"));

// Insert after which existing key (alphabetical placement)
const insertAfter = {
  COMPARAR: "COMPRAR",
  CONFIRMAR: "COMPREENDER",
  DEPENDER: "DEMORAR",
  DISCUTIR: "DEVER",
  GARANTIR: "GANHAR",
  INSISTIR: "INFLUENCIAR",
  MELHORAR: "MANTER",
  PRETENDER: "PREOCUPAR",
  RECUSAR: "RECEBER",
  REDUZIR: "RECUSAR",   // after RECUSAR (new)
  TRADUZIR: "TRATAR",
};

const existingOrder = data.order.slice();
const allKeys = [];
for (let i = 0; i < existingOrder.length; i++) {
  allKeys.push(existingOrder[i]);
  for (const [newKey, afterKey] of Object.entries(insertAfter)) {
    if (existingOrder[i] === afterKey && !allKeys.includes(newKey)) {
      allKeys.push(newKey);
      for (const [k2, a2] of Object.entries(insertAfter)) {
        if (a2 === newKey && !allKeys.includes(k2)) allKeys.push(k2);
      }
    }
  }
}

const orderedVerbs = {};
for (const k of allKeys) {
  if (newVerbs[k]) orderedVerbs[k] = newVerbs[k];
  else if (data.verbs[k]) orderedVerbs[k] = data.verbs[k];
  else throw new Error("Missing verb: " + k);
}

data.verbs = orderedVerbs;
data.order = allKeys;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Merged", Object.keys(newVerbs).length, "verbs. Total:", data.order.length);
