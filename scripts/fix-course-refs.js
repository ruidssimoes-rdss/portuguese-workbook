/**
 * Re-point chapter vocab refs that fail the strict vocabKey match but
 * exist in another category. Writes the rest to
 * scripts/output/missing-course-words.json.
 *
 * Run: node scripts/fix-course-refs.js
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

const ROOT = path.join(__dirname, "..");
const FILES = [
  path.join(ROOT, "src", "data", "curriculum.ts"),
  path.join(ROOT, "src", "data", "curriculum-a2-b1.ts"),
];
const vocab = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "vocab.json"), "utf8"));

const byKey = new Map();
for (const category of vocab.categories) {
  for (const word of category.words) {
    const key = vocabKey(word.portuguese);
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push({
      categoryId: category.id,
      portuguese: word.portuguese,
      cefr: word.cefr,
    });
  }
}

function uniqueCategories(entries) {
  const seen = new Map();
  for (const entry of entries) {
    if (!seen.has(entry.categoryId)) seen.set(entry.categoryId, entry);
  }
  return [...seen.values()];
}

function lessonStarts(src) {
  const re = /\n  \{\n    id: "((?:a1|a2|b1|extra)-\d+)",/g;
  const starts = [];
  let match;
  while ((match = re.exec(src))) starts.push({ id: match[1], index: match.index + 1 });
  return starts;
}

const repointed = [];
const ambiguous = [];
const wired = [];
const missing = new Map();

for (const file of FILES) {
  const src = fs.readFileSync(file, "utf8");
  const starts = lessonStarts(src);
  let cursor = 0;
  let next = "";
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : src.length;
    next += src.slice(cursor, start);
    let block = src.slice(start, end);
    const level = (block.match(/cefrLevel: "(A1|A2|B1)"/) || [])[1];
    const vocabMatch = block.match(/vocabulary:\s*\{\s*words:\s*\[([\s\S]*?)\]\s*,/);
    if (!vocabMatch || !level) {
      wired.push(`// WIRE: ${starts[i].id} vocabulary block not found`);
      next += block;
      cursor = end;
      continue;
    }
    let body = vocabMatch[1];
    const refs = [...body.matchAll(/\{\s*categoryId:\s*"([^"]+)",\s*portuguese:\s*"([^"]*)"\s*\}/g)];
    for (const ref of refs) {
      const categoryId = ref[1];
      const portuguese = ref[2];
      const key = vocabKey(portuguese);
      const hits = byKey.get(key) || [];
      const inCategory = hits.some((entry) => entry.categoryId === categoryId);
      if (inCategory) continue;
      const others = uniqueCategories(hits);
      const literal = `{ categoryId: "${categoryId}", portuguese: "${portuguese}" }`;
      if (others.length === 1) {
        const target = others[0].categoryId;
        const updated = `{ categoryId: "${target}", portuguese: "${portuguese}" }`;
        if (!body.includes(literal)) {
          wired.push(`// WIRE: ${starts[i].id} ${literal}`);
          continue;
        }
        body = body.split(literal).join(updated);
        repointed.push({ lesson: starts[i].id, portuguese, from: categoryId, to: target, entry: others[0].portuguese });
      } else if (others.length > 1) {
        const sameLevel = others.filter((entry) => entry.cefr === level);
        const pick = (sameLevel[0] || others[0]);
        const updated = `{ categoryId: "${pick.categoryId}", portuguese: "${portuguese}" }`;
        if (!body.includes(literal)) {
          wired.push(`// WIRE: ${starts[i].id} ${literal}`);
          continue;
        }
        body = body.split(literal).join(updated);
        const why = sameLevel.length ? "cefr matches lesson" : "first category";
        ambiguous.push({
          lesson: starts[i].id,
          portuguese,
          from: categoryId,
          options: others.map((entry) => `${entry.categoryId} (${entry.cefr}, ${entry.portuguese})`),
          pick: `${pick.categoryId} (${pick.cefr})`,
          why,
        });
        console.log(
          `AMBIGUOUS ${starts[i].id} "${portuguese}": ${others
            .map((entry) => `${entry.categoryId}/${entry.cefr}`)
            .join(" | ")} -> ${pick.categoryId} (${why})`,
        );
      } else {
        const group = missing.get(portuguese) || {
          portuguese,
          lessons: [],
          level,
          categoryId,
        };
        if (!group.lessons.includes(starts[i].id)) group.lessons.push(starts[i].id);
        missing.set(portuguese, group);
      }
    }
    const full = vocabMatch[0];
    const rebuilt = full.replace(vocabMatch[1], body);
    block = block.slice(0, vocabMatch.index) + rebuilt + block.slice(vocabMatch.index + full.length);
    next += block;
    cursor = end;
  }
  next += src.slice(cursor);
  fs.writeFileSync(file, next);
}

const outDir = path.join(__dirname, "output");
fs.mkdirSync(outDir, { recursive: true });
const missingList = [...missing.values()];
fs.writeFileSync(
  path.join(outDir, "missing-course-words.json"),
  JSON.stringify(missingList, null, 2) + "\n",
);

const byLevel = { A1: 0, A2: 0, B1: 0 };
for (const item of missingList) byLevel[item.level]++;

console.log("");
console.log("SUMMARY");
console.log(`re-pointed: ${repointed.length}`);
console.log(`ambiguous: ${ambiguous.length}`);
console.log(`missing refs collected as ${missingList.length} unique words`, byLevel);
console.log(`runtime ids changed (category rewrite): ${repointed.length + ambiguous.length}`);
if (wired.length) {
  console.log("WIRE");
  for (const line of wired) console.log(line);
}
