/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * A1 rebalance and library tidy.
 *
 * Language fixes, re-filing, level re-tags, and A1 chapter ref edits.
 * European Portuguese only. Library entries are moved or corrected,
 * never deleted, except bocada. Chapter refs are updated in the same run.
 *
 * Run once: node scripts/a1-rebalance.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const VOCAB_FILE = path.join(ROOT, "src", "data", "vocab.json");
const CURRICULUM = [
  path.join(ROOT, "src", "data", "curriculum.ts"),
  path.join(ROOT, "src", "data", "curriculum-a2-b1.ts"),
];

function vocabKey(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\.\.\./g, "…")
    .replace(/^(o|a|os|as|um|uma)\s+/, "");
}

const data = JSON.parse(fs.readFileSync(VOCAB_FILE, "utf8"));

function category(id) {
  const cat = data.categories.find((item) => item.id === id);
  if (!cat) throw new Error(`missing category ${id}`);
  return cat;
}

function entriesNamed(portuguese) {
  const hits = [];
  for (const cat of data.categories) {
    for (const word of cat.words) {
      if (word.portuguese === portuguese) hits.push({ cat, word });
    }
  }
  return hits;
}

function requireIn(catId, portuguese) {
  const cat = category(catId);
  const index = cat.words.findIndex((word) => word.portuguese === portuguese);
  if (index < 0) throw new Error(`missing "${portuguese}" in ${catId}`);
  return { cat, index, word: cat.words[index] };
}

/** Chapter lookup uses vocabKey, which strips a leading article. Keep the entry this script just wrote ahead of an older headword with the same key so refs resolve to it. */
function placeBeforeSameKey(cat, word) {
  const index = cat.words.indexOf(word);
  const key = vocabKey(word.portuguese);
  const earlier = cat.words.findIndex((item, itemIndex) => itemIndex < index && vocabKey(item.portuguese) === key);
  if (earlier < 0) return;
  cat.words.splice(index, 1);
  cat.words.splice(earlier, 0, word);
}

// --- 1A. Language fixes ---

const curativo = requireIn("health-body", "curativo");
curativo.cat.words[curativo.index] = {
  portuguese: "o penso",
  english: "plaster / bandage",
  cefr: curativo.word.cefr,
  gender: "m",
  pronunciation: "oo PEN-soo",
  example: "Pus um penso no dedo.",
  exampleTranslation: "I put a plaster on my finger.",
  relatedWords: [
    { word: "o dedo", meaning: "the finger" },
    { word: "a farmácia", meaning: "the pharmacy" },
  ],
};
placeBeforeSameKey(curativo.cat, curativo.cat.words[curativo.index]);

const bocada = requireIn("colloquial-slang", "bocada");
bocada.cat.words.splice(bocada.index, 1);
requireIn("colloquial-slang", "bocado");

const espirrar = requireIn("health-body", "espirrar");
if (espirrar.word.example !== "Não pares de espirrar. Estás constipado?") {
  throw new Error(`unexpected espirrar example: ${espirrar.word.example}`);
}
espirrar.word.example = "Não paras de espirrar. Estás constipado?";
espirrar.word.exampleTranslation = "You can't stop sneezing. Do you have a cold?";

const optimista = requireIn("emotions-personality", "optimista");
optimista.word.portuguese = "otimista";
optimista.word.pronunciation = "oh-tee-MEESH-tuh";
optimista.word.example = optimista.word.example.replaceAll("optimista", "otimista");
placeBeforeSameKey(optimista.cat, optimista.word);

// --- 1B. Re-file ---

const MOVES = [
  { from: "food-drink", to: "hobbies-leisure", words: ["fado", "convívio"] },
  {
    from: "home-rooms",
    to: "hobbies-leisure",
    words: ["ficção", "autor / autora", "leitor / leitora", "crítica", "bestseller"],
  },
  { from: "home-rooms", to: "opinions-connectors", words: ["facto"] },
  {
    from: "emotions-personality",
    to: "opinions-connectors",
    words: [
      "dúvida",
      "certeza",
      "possibilidade",
      "condição",
      "hipótese",
      "realidade",
      "preferência",
      "escolha",
      "decisão",
      "consequência",
    ],
  },
  {
    from: "emotions-personality",
    to: "news-society",
    words: [
      "comunidade",
      "direitos",
      "deveres",
      "liberdade",
      "igualdade",
      "justiça",
      "solidariedade",
      "respeito",
      "tolerância",
      "cooperação",
      "voluntário / voluntária",
      "participação",
      "eleição",
    ],
  },
  {
    from: "clothing-appearance",
    to: "news-society",
    words: ["identidade", "valores", "crenças", "cultura", "modernidade"],
  },
  {
    from: "clothing-appearance",
    to: "emotions-personality",
    words: ["criatividade", "originalidade", "autenticidade"],
  },
  { from: "clothing-appearance", to: "opinions-connectors", words: ["expressão"] },
  {
    from: "colloquial-slang",
    to: "opinions-connectors",
    words: ["então", "provavelmente", "possivelmente"],
  },
  { from: "colloquial-slang", to: "health-body", words: ["engolir"] },
  { from: "colloquial-slang", to: "family-daily-routine", words: ["rapariga"] },
  { from: "health-body", to: "greetings-expressions", words: ["bem", "mal"] },
];

const movedPortuguese = [];
for (const move of MOVES) {
  const src = category(move.from);
  const dst = category(move.to);
  for (const portuguese of move.words) {
    const index = src.words.findIndex((word) => word.portuguese === portuguese);
    if (index < 0) throw new Error(`cannot move "${portuguese}" — not in ${move.from}`);
    if (dst.words.some((word) => word.portuguese === portuguese)) {
      throw new Error(`"${portuguese}" already exists in ${move.to}`);
    }
    const [word] = src.words.splice(index, 1);
    dst.words.push(word);
    movedPortuguese.push({ portuguese, from: move.from, to: move.to });
  }
}

// --- 1C. Re-tag levels ---

function retag(label, cefr) {
  let hits = entriesNamed(label);
  if (hits.length === 0) {
    const stripped = label.replace(/^(o|a|os|as)\s+/, "");
    if (stripped !== label) hits = entriesNamed(stripped);
  }
  if (hits.length !== 1) {
    const where = hits.map((hit) => `${hit.cat.id}:${hit.word.portuguese}`).join(", ");
    throw new Error(`retag "${label}" matched ${hits.length} entries${where ? `: ${where}` : ""}`);
  }
  const before = hits[0].word.cefr;
  hits[0].word.cefr = cefr;
  return `${hits[0].cat.id}:${hits[0].word.portuguese} ${before} -> ${cefr}`;
}

const TO_A1 = [
  "família",
  "dia",
  "bem",
  "mal",
  "brincar",
  "estudar",
  "aprender",
  "ensinar",
  "tomar",
  "chover",
  "nevar",
  "rapariga",
  "com certeza",
  "igualmente",
  "segundo",
  "nublado",
  "fresco",
  "pastel de nata",
  "a ementa",
  "bairro",
  "teatro",
  "casamento",
  "revista",
  "podcast",
];
const TO_A2 = ["miúdo / miúda", "então"];

const retags = [];
for (const label of TO_A1) retags.push(retag(label, "A1"));
for (const label of TO_A2) retags.push(retag(label, "A2"));

fs.writeFileSync(VOCAB_FILE, JSON.stringify(data, null, 2) + "\n");

// --- Chapter refs (1A renames, 1B category updates, 1D removals, 1E additions) ---

const RENAMES = [
  { from: "curativo", to: "o penso", categoryId: "health-body" },
  { from: "bocada", to: "bocado", categoryId: "colloquial-slang" },
  { from: "optimista", to: "otimista", categoryId: "emotions-personality" },
];

const REMOVE = {
  "a1-02": ["muito prazer"],
  "a1-06": ["dourado", "prateado"],
  "a1-07": ["brisa", "relâmpago", "trovão"],
  "a1-08": ["nata", "canela"],
  "a1-09": ["pepino", "molho", "mostarda", "laranja"],
  "a1-10": ["francesinha", "caldo verde", "bifana", "ginjinha", "tremoço", "bolo", "a conta"],
  "a1-11": ["trânsito", "multa", "cinto de segurança", "estacionar"],
  "a1-12": ["ponte", "túnel", "calçada"],
  "a1-13": ["miradouro", "estátua", "monumento", "o bilhete"],
  "a1-14": ["teto", "campainha", "quarto", "chave", "a chave"],
  "a1-15": ["adulto", "nascimento"],
  "a1-16": ["aspirar", "varrer", "o fim de semana"],
};

const ADD = {
  "a1-02": [
    ["greetings-expressions", "isto"],
    ["greetings-expressions", "mais"],
    ["greetings-expressions", "menos"],
    ["greetings-expressions", "outro / outra"],
    ["technology-internet", "pedir desculpa"],
  ],
  "a1-03": [
    ["numbers-time", "treze"],
    ["numbers-time", "catorze"],
    ["numbers-time", "quinze"],
  ],
  "a1-07": [
    ["food-drink", "uva"],
    ["food-drink", "pêra"],
    ["food-drink", "limão"],
    ["nature-animals", "o passeio"],
  ],
  "a1-10": [
    ["shopping-money", "barato"],
    ["shopping-money", "caro"],
    ["shopping-money", "grátis"],
    ["shopping-money", "saco"],
    ["shopping-money", "moeda"],
  ],
  "a1-11": [
    ["travel-directions", "lugar"],
    ["travel-directions", "centro"],
  ],
  "a1-12": [
    ["opposites", "nunca"],
    ["opposites", "sempre"],
  ],
  "a1-13": [
    ["greetings-expressions", "o quê"],
    ["greetings-expressions", "porque"],
    ["greetings-expressions", "qual"],
    ["greetings-expressions", "quanto"],
    ["greetings-expressions", "quantos"],
  ],
  "a1-14": [
    ["opposites", "dentro"],
    ["opposites", "fora"],
  ],
  "a1-15": [
    ["greetings-expressions", "minha"],
    ["greetings-expressions", "teu"],
    ["greetings-expressions", "tua"],
  ],
  "a1-16": [
    ["family-daily-routine", "tomar o pequeno-almoço"],
    ["family-daily-routine", "almoçar"],
    ["family-daily-routine", "passear"],
    ["family-daily-routine", "fazer compras"],
  ],
  "a1-17": [
    ["technology-internet", "telefone"],
    ["technology-internet", "ideia"],
  ],
};

const EXPECTED_A1 = {
  "a1-01": 19,
  "a1-02": 15,
  "a1-03": 23,
  "a1-04": 16,
  "a1-05": 18,
  "a1-06": 15,
  "a1-07": 15,
  "a1-08": 16,
  "a1-09": 16,
  "a1-10": 15,
  "a1-11": 17,
  "a1-12": 18,
  "a1-13": 16,
  "a1-14": 19,
  "a1-15": 15,
  "a1-16": 15,
  "a1-17": 15,
  "a1-18": 26,
};

function libraryHead(categoryId, portuguese) {
  const cat = category(categoryId);
  const word = cat.words.find((item) => item.portuguese === portuguese);
  if (!word) throw new Error(`add target missing from library: ${categoryId}:${portuguese}`);
  if (word.cefr !== "A1") throw new Error(`add target is ${word.cefr}, not A1: ${categoryId}:${portuguese}`);
  return word.portuguese;
}

for (const pairs of Object.values(ADD)) {
  for (const [categoryId, portuguese] of pairs) libraryHead(categoryId, portuguese);
}

function lessonStarts(src) {
  const re = /\n  \{\n    id: "((?:a1|a2|b1|extra)-\d+)",/g;
  const starts = [];
  let match;
  while ((match = re.exec(src))) starts.push({ id: match[1], index: match.index + 1 });
  return starts;
}

function outsideVocab(src) {
  return src.replace(/vocabulary:\s*\{\s*words:\s*\[[\s\S]*?\]\s*,/g, "VOCAB");
}

const refStats = { renamed: 0, moved: 0, removed: 0, added: 0 };

function editFile(file) {
  const original = fs.readFileSync(file, "utf8");
  const frozen = outsideVocab(original);
  const starts = lessonStarts(original);
  let src = original;
  for (let i = starts.length - 1; i >= 0; i--) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
    const block = src.slice(start, end);
    const updated = editLesson(starts[i].id, block);
    src = src.slice(0, start) + updated + src.slice(end);
  }
  if (outsideVocab(src) !== frozen) {
    throw new Error(`edit touched non-vocab content in ${path.basename(file)}`);
  }
  fs.writeFileSync(file, src);
}

function editLesson(lessonId, block) {
  const match = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
  if (!match) throw new Error(`no vocabulary block in ${lessonId}`);
  const lines = match[1].split("\n").filter((line) => line.trim().length > 0);
  const entries = lines.map((line) => {
    const parsed = line.match(/^(\s*)\{ categoryId: "([^"]+)", portuguese: "([^"]*)" \},?\s*$/);
    if (!parsed) throw new Error(`unparsed vocab ref in ${lessonId}: ${line}`);
    return { indent: parsed[1], categoryId: parsed[2], portuguese: parsed[3] };
  });
  const indent = entries[0] ? entries[0].indent : "          ";

  for (const entry of entries) {
    const rename = RENAMES.find((item) => item.from === entry.portuguese && item.categoryId === entry.categoryId);
    if (rename) {
      entry.portuguese = rename.to;
      refStats.renamed++;
    }
    const move = movedPortuguese.find((item) => item.portuguese === entry.portuguese && item.from === entry.categoryId);
    if (move) {
      entry.categoryId = move.to;
      refStats.moved++;
    }
  }

  const drop = new Set(REMOVE[lessonId] ?? []);
  const kept = [];
  for (const entry of entries) {
    if (drop.has(entry.portuguese)) {
      drop.delete(entry.portuguese);
      refStats.removed++;
      continue;
    }
    kept.push(entry);
  }
  if (drop.size > 0) throw new Error(`${lessonId} missing refs to remove: ${[...drop].join(", ")}`);

  for (const [categoryId, portuguese] of ADD[lessonId] ?? []) {
    const exact = libraryHead(categoryId, portuguese);
    if (kept.some((entry) => entry.portuguese === exact && entry.categoryId === categoryId)) {
      throw new Error(`${lessonId} already has ${categoryId}:${exact}`);
    }
    kept.push({ indent, categoryId, portuguese: exact });
    refStats.added++;
  }

  const body =
    "\n" +
    kept.map((entry) => `${entry.indent}{ categoryId: "${entry.categoryId}", portuguese: "${entry.portuguese}" },`).join("\n") +
    "\n        ";
  return block.slice(0, match.index) + match[0].replace(match[1], body) + block.slice(match.index + match[0].length);
}

for (const file of CURRICULUM) editFile(file);

// --- Checks ---

const forbidden = ["curativo", "bocada", "optimista"];
for (const file of [VOCAB_FILE, ...CURRICULUM]) {
  const text = fs.readFileSync(file, "utf8");
  for (const word of forbidden) {
    if (text.includes(word)) throw new Error(`${word} still present in ${path.relative(ROOT, file)}`);
  }
}

let refiledCopies = 0;
for (const item of movedPortuguese) {
  const cats = data.categories.filter((cat) => cat.words.some((word) => word.portuguese === item.portuguese));
  if (cats.length !== 1 || cats[0].id !== item.to) {
    refiledCopies++;
    console.log(`COPY ${item.portuguese} -> ${cats.map((cat) => cat.id).join(", ") || "(none)"}`);
  }
}

let withinCategory = 0;
for (const cat of data.categories) {
  const seen = new Map();
  for (const word of cat.words) {
    const key = vocabKey(word.portuguese);
    if (seen.has(key)) {
      withinCategory++;
      console.log(`WITHIN ${cat.id}: ${seen.get(key)} / ${word.portuguese}`);
    } else {
      seen.set(key, word.portuguese);
    }
  }
}

function countWords(src) {
  const starts = lessonStarts(src);
  const counts = {};
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
    const block = src.slice(start, end);
    const vocab = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
    const words = vocab ? [...vocab[1].matchAll(/portuguese: "/g)].length : 0;
    counts[starts[i].id] = words;
  }
  return counts;
}

const a1Counts = countWords(fs.readFileSync(CURRICULUM[0], "utf8"));
for (const [id, expected] of Object.entries(EXPECTED_A1)) {
  if (a1Counts[id] !== expected) throw new Error(`${id} has ${a1Counts[id]} words, expected ${expected}`);
}

const espirrarNow = requireIn("health-body", "espirrar").word;
if (espirrarNow.example !== "Não paras de espirrar. Estás constipado?") {
  throw new Error("espirrar example was not updated");
}
requireIn("health-body", "o penso");
requireIn("colloquial-slang", "bocado");
const otimistaHits = entriesNamed("otimista").filter((hit) => hit.cat.id === "emotions-personality");
if (!otimistaHits.some((hit) => hit.word.pronunciation === "oh-tee-MEESH-tuh")) {
  throw new Error("otimista pronunciation was not updated");
}

console.log(`re-filed: ${movedPortuguese.length}`);
console.log(`retagged: ${retags.length}`);
console.log(`refs renamed: ${refStats.renamed}, re-pointed: ${refStats.moved}, removed: ${refStats.removed}, added: ${refStats.added}`);
console.log(`duplicate check (re-filed words in more than one category): ${refiledCopies}`);
console.log(`within-category vocabKey duplicates: ${withinCategory}`);
console.log("A1 word counts:");
for (const id of Object.keys(EXPECTED_A1)) console.log(`  ${id} ${a1Counts[id]}`);
