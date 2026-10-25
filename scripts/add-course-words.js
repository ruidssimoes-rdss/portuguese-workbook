/**
 * Fill chapter words that still do not resolve after fix-course-refs.js.
 * Removes a vocab ref when the same lesson already teaches that infinitive
 * as a verb. Points a ref at an existing entry when the library already
 * has the word (accent, gender pair, or a known European Portuguese form).
 * Otherwise adds a full entry. European Portuguese only.
 *
 * Run: node scripts/add-course-words.js
 */
const fs = require("fs");
const path = require("path");

function vocabKey(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/\.\.\./g, "…")
    .replace(/^(o|a|os|as|um|uma)\s+/, "");
}

function stripAccents(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ROOT = path.join(__dirname, "..");
const VOCAB_FILE = path.join(ROOT, "src", "data", "vocab.json");
const VERBS_FILE = path.join(ROOT, "src", "data", "verbs.json");
const MISSING_FILE = path.join(__dirname, "output", "missing-course-words.json");
const CURRICULUM = {
  a1: path.join(ROOT, "src", "data", "curriculum.ts"),
  rest: path.join(ROOT, "src", "data", "curriculum-a2-b1.ts"),
};

const BRAZILIAN = /\b(trem|ônibus|onibus|celular|banheiro|geladeira|café da manhã|cafe da manha|tela)\b/i;
const VOCE = /(^|[.!?]\s+)você\b/i;
const CLITIC_START = /(^|[.!?]\s+)(me|te|se|lhe)\s+/i;

/** Ref spelling -> existing headword to use instead of adding a duplicate. */
const EXPLICIT_EXISTING = {
  password: "palavra-passe",
};

const data = JSON.parse(fs.readFileSync(VOCAB_FILE, "utf8"));
const verbs = JSON.parse(fs.readFileSync(VERBS_FILE, "utf8"));
const missing = JSON.parse(fs.readFileSync(MISSING_FILE, "utf8"));
const verbKeys = new Set(Object.keys(verbs.verbs).map((key) => key.toLowerCase()));

const batchDir = path.join(__dirname, "data", "course-words");
const batchFiles = fs.readdirSync(batchDir).filter((name) => /^batch-\d+\.json$/.test(name)).sort();
const defined = [];
for (const name of batchFiles) {
  const batch = JSON.parse(fs.readFileSync(path.join(batchDir, name), "utf8"));
  defined.push(...batch);
}
const byRef = new Map(defined.map((entry) => [entry.ref, entry]));

const files = {
  a1: fs.readFileSync(CURRICULUM.a1, "utf8"),
  rest: fs.readFileSync(CURRICULUM.rest, "utf8"),
};

function which(lessonId) {
  return lessonId.startsWith("a1-") ? "a1" : "rest";
}

function lessonStarts(src) {
  const re = /\n  \{\n    id: "((?:a1|a2|b1|extra)-\d+)",/g;
  const starts = [];
  let match;
  while ((match = re.exec(src))) starts.push({ id: match[1], index: match.index + 1 });
  return starts;
}

function editLesson(lessonId, fn) {
  const key = which(lessonId);
  const src = files[key];
  const starts = lessonStarts(src);
  const i = starts.findIndex((item) => item.id === lessonId);
  if (i < 0) return false;
  const start = starts[i].index;
  const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
  const block = src.slice(start, end);
  const updated = fn(block);
  files[key] = src.slice(0, start) + updated + src.slice(end);
  return true;
}

function lessonVerbKeys(block) {
  const stage = block.match(/\n      verbs:\s*\{[\s\S]*?\n      grammar:/);
  const slice = stage ? stage[0] : "";
  return new Set([...slice.matchAll(/verbKey:\s*"([^"]+)"/g)].map((match) => match[1].toLowerCase()));
}

function spliceVocab(block, body, vocabMatch) {
  const full = vocabMatch[0];
  const at = full.indexOf(vocabMatch[1]);
  const rebuilt = full.slice(0, at) + body + full.slice(at + vocabMatch[1].length);
  return block.slice(0, vocabMatch.index) + rebuilt + block.slice(vocabMatch.index + full.length);
}

function existingHits(ref) {
  const hits = [];
  const key = vocabKey(ref);
  const folded = stripAccents(key);
  const explicit = EXPLICIT_EXISTING[ref];
  for (const category of data.categories) {
    for (const word of category.words) {
      const head = vocabKey(word.portuguese);
      if (explicit && head === vocabKey(explicit)) {
        hits.push({ categoryId: category.id, portuguese: word.portuguese, cefr: word.cefr, why: "existing European Portuguese word" });
        continue;
      }
      if (explicit) continue;
      if (head === key) {
        hits.push({ categoryId: category.id, portuguese: word.portuguese, cefr: word.cefr, why: "exact key" });
        continue;
      }
      if (stripAccents(head) === folded) {
        hits.push({ categoryId: category.id, portuguese: word.portuguese, cefr: word.cefr, why: "accent" });
        continue;
      }
      const parts = word.portuguese.split(/\s*\/\s*/);
      if (parts.length > 1 && parts.some((part) => vocabKey(part) === key)) {
        hits.push({ categoryId: category.id, portuguese: word.portuguese, cefr: word.cefr, why: "gender pair" });
      }
    }
  }
  const seen = new Set();
  return hits.filter((hit) => {
    const id = `${hit.categoryId}\n${hit.portuguese}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function chooseHit(hits, level, preferredCategory) {
  const sameCategory = hits.filter((hit) => hit.categoryId === preferredCategory);
  const pool = sameCategory.length ? sameCategory : hits;
  const sameLevel = pool.filter((hit) => hit.cefr === level);
  return sameLevel[0] || pool[0];
}

function seenKeys() {
  const keys = new Set();
  for (const category of data.categories) {
    for (const word of category.words) keys.add(vocabKey(word.portuguese));
  }
  return keys;
}

const removed = [];
const retargeted = [];
const wired = [];
const toAdd = [];

for (const item of missing) {
  const hits = existingHits(item.portuguese);
  const keptLessons = [];
  for (const lessonId of item.lessons) {
    let isVerbLesson = false;
    const found = editLesson(lessonId, (block) => {
      const keys = lessonVerbKeys(block);
      isVerbLesson = verbKeys.has(item.portuguese.toLowerCase()) && keys.has(item.portuguese.toLowerCase());
      if (!isVerbLesson) return block;
      const vocabMatch = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
      if (!vocabMatch) {
        wired.push(`// WIRE: ${lessonId} vocabulary block not found for ${item.portuguese}`);
        return block;
      }
      const re = new RegExp(`\\n[ \\t]*\\{ categoryId: "[^"]+", portuguese: "${esc(item.portuguese)}" \\},?`);
      if (!re.test(vocabMatch[1])) {
        wired.push(`// WIRE: ${lessonId} could not remove ${item.portuguese}`);
        return block;
      }
      const body = vocabMatch[1].replace(re, "");
      removed.push({ lesson: lessonId, portuguese: item.portuguese });
      console.log(`REMOVE verb ${lessonId} ${item.portuguese}`);
      return spliceVocab(block, body, vocabMatch);
    });
    if (!found) wired.push(`// WIRE: lesson ${lessonId} not found`);
    if (!isVerbLesson) keptLessons.push(lessonId);
  }

  if (keptLessons.length === 0) continue;

  if (hits.length) {
    const pick = chooseHit(hits, item.level, item.categoryId);
    const why = hits.length > 1 ? `${pick.why}; chose ${pick.categoryId} among ${hits.map((hit) => hit.categoryId).join(", ")}` : pick.why;
    console.log(`RETARGET ${item.portuguese} -> ${pick.categoryId} / ${pick.portuguese} (${why})`);
    for (const lessonId of keptLessons) {
      editLesson(lessonId, (block) => {
        const vocabMatch = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
        if (!vocabMatch) {
          wired.push(`// WIRE: ${lessonId} vocabulary block not found for ${item.portuguese}`);
          return block;
        }
        const re = new RegExp(`\\{ categoryId: "([^"]+)", portuguese: "${esc(item.portuguese)}" \\}`, "g");
        let n = 0;
        const body = vocabMatch[1].replace(re, () => {
          n++;
          return `{ categoryId: "${pick.categoryId}", portuguese: "${pick.portuguese}" }`;
        });
        if (!n) {
          const already = vocabMatch[1].includes(`portuguese: "${pick.portuguese}"`);
          if (!already) wired.push(`// WIRE: ${lessonId} could not retarget ${item.portuguese}`);
          return block;
        }
        retargeted.push({ lesson: lessonId, from: item.portuguese, to: pick.portuguese, categoryId: pick.categoryId });
        return spliceVocab(block, body, vocabMatch);
      });
    }
    continue;
  }

  const definedEntry = byRef.get(item.portuguese);
  if (!definedEntry) {
    console.error(`No entry for missing word: ${item.portuguese}`);
    process.exit(1);
  }
  toAdd.push({ item, definedEntry, lessons: keptLessons });
}

const keys = seenKeys();
for (const pending of toAdd) {
  const word = pending.definedEntry.word;
  word.cefr = pending.item.level;
  const text = `${word.portuguese}\n${word.example}`;
  const problems = [];
  for (const field of ["portuguese", "english", "pronunciation", "example", "exampleTranslation"]) {
    if (!word[field] || String(word[field]).trim() === "") problems.push(`empty ${field}`);
  }
  if (![null, "m", "f", "m/f"].includes(word.gender)) problems.push(`gender ${word.gender}`);
  if (!Array.isArray(word.relatedWords) || word.relatedWords.length < 2 || word.relatedWords.length > 3) {
    problems.push("relatedWords must be 2 or 3");
  } else if (word.relatedWords.some((related) => !related.word || !related.meaning)) {
    problems.push("relatedWords incomplete");
  }
  if (!["A1", "A2", "B1"].includes(word.cefr)) problems.push("cefr");
  if (BRAZILIAN.test(text)) problems.push("Brazilian term");
  if (VOCE.test(word.example)) problems.push("você as subject");
  if (CLITIC_START.test(word.example)) problems.push("clitic before the verb at sentence start");
  const key = vocabKey(word.portuguese);
  if (keys.has(key)) problems.push(`duplicate of existing ${key}`);
  if (problems.length) {
    console.error(`${pending.item.portuguese}: ${problems.join("; ")}`);
    process.exit(1);
  }
  keys.add(key);
  if (pending.definedEntry.categoryId !== pending.item.categoryId) {
    console.log(`CATEGORY ${pending.item.portuguese}: ${pending.item.categoryId} -> ${pending.definedEntry.categoryId}`);
  }
}

for (let i = 0; i < toAdd.length; i += 40) {
  const batch = toAdd.slice(i, i + 40);
  for (const pending of batch) {
    const category = data.categories.find((item) => item.id === pending.definedEntry.categoryId);
    if (!category) {
      console.error(`Unknown category ${pending.definedEntry.categoryId} for ${pending.item.portuguese}`);
      process.exit(1);
    }
    const word = pending.definedEntry.word;
    category.words.push({
      portuguese: word.portuguese,
      english: word.english,
      cefr: word.cefr,
      gender: word.gender,
      pronunciation: word.pronunciation,
      example: word.example,
      exampleTranslation: word.exampleTranslation,
      relatedWords: word.relatedWords,
    });
  }
  const text = JSON.stringify(data, null, 2) + "\n";
  JSON.parse(text);
  fs.writeFileSync(VOCAB_FILE, text);
  console.log(`batch ${i / 40 + 1}: added ${batch.length}; vocab.json parses (${data.categories.reduce((n, c) => n + c.words.length, 0)} words)`);
}

for (const pending of toAdd) {
  const categoryId = pending.definedEntry.categoryId;
  const portuguese = pending.definedEntry.word.portuguese;
  for (const lessonId of pending.lessons) {
    editLesson(lessonId, (block) => {
      const vocabMatch = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
      if (!vocabMatch) {
        wired.push(`// WIRE: ${lessonId} vocabulary block not found for ${pending.item.portuguese}`);
        return block;
      }
      const re = new RegExp(`\\{ categoryId: "([^"]+)", portuguese: "${esc(pending.item.portuguese)}" \\}`, "g");
      let n = 0;
      const body = vocabMatch[1].replace(re, () => {
        n++;
        return `{ categoryId: "${categoryId}", portuguese: "${portuguese}" }`;
      });
      if (!n) {
        const already = vocabMatch[1].includes(`{ categoryId: "${categoryId}", portuguese: "${portuguese}" }`);
        if (!already) wired.push(`// WIRE: ${lessonId} could not update ${pending.item.portuguese}`);
        return block;
      }
      return spliceVocab(block, body, vocabMatch);
    });
  }
}

fs.writeFileSync(CURRICULUM.a1, files.a1);
fs.writeFileSync(CURRICULUM.rest, files.rest);

console.log("");
console.log("SUMMARY");
console.log(`removed as verbs: ${removed.length}`);
console.log(`retargeted to existing words: ${retargeted.length}`);
console.log(`added: ${toAdd.length}`);
if (wired.length) {
  console.log("WIRE");
  for (const line of wired) console.log(line);
} else {
  console.log("WIRE: none");
}
