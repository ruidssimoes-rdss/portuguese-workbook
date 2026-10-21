#!/usr/bin/env node
/**
 * Rewrites the Pronouns rule (grammar.json topic «subject-pronouns») so it
 * covers every person with correct European Portuguese framing, and corrects
 * the other strings that called singular «você» simply «formal».
 *
 *   node scripts/fix-pronouns-rule.js            # apply
 *   node scripts/fix-pronouns-rule.js --dry-run  # validate and report only
 *
 * In Portugal singular «você» is avoided in speech (it can sound blunt or
 * distant). Polite address is «o senhor» / «a senhora», the person's name, or
 * the bare third person. «Vocês» is the normal, neutral plural.
 *
 * Idempotent. Edits:
 *   grammar.json  subject-pronouns: summary, intro, rules, tips, tipsPt and
 *                 five questions (topic and question counts are unchanged)
 *   grammar.json  imperative: rule 2 wording and one answer option
 *   etiquette.json  the «Você vs Tu» tip
 *   vocab.json    one proTip string («como estás?»)
 * Text avoids apostrophes because the grammar page treats '...' as emphasis.
 */
const fs = require("node:fs");
const path = require("node:path");

const DATA = path.resolve(__dirname, "../src/data");
const dryRun = process.argv.includes("--dry-run");
const changes = [];

function load(name) {
  const file = path.join(DATA, name);
  const raw = fs.readFileSync(file, "utf8");
  return { file, raw, json: JSON.parse(raw) };
}
function save({ file, raw, json }, name) {
  const indent = [2, 4].find((n) => JSON.stringify(JSON.parse(raw), null, n) === raw || JSON.stringify(JSON.parse(raw), null, n) + "\n" === raw);
  if (!indent) throw new Error(`${name}: formatting is not a 2- or 4-space JSON.stringify round-trip; refusing to rewrite`);
  fs.writeFileSync(file, JSON.stringify(json, null, indent) + (raw.endsWith("\n") ? "\n" : ""));
}
function set(label, owner, key, value) {
  if (JSON.stringify(owner[key]) === JSON.stringify(value)) return;
  changes.push(label);
  owner[key] = value;
}
const q = (questionText, questionTextPt, options, correctAnswer, explanation) => ({
  questionText,
  questionTextPt,
  options,
  correctAnswer,
  correctIndex: options.indexOf(correctAnswer),
  explanation,
});

/* ───────────── grammar.json ───────────── */
const grammar = load("grammar.json");
const topics = grammar.json.topics;

const sp = topics["subject-pronouns"];
set(
  "subject-pronouns summary",
  sp,
  "summary",
  "eu, tu, ele/ela, nós, eles/elas, vocês and a gente. Use «tu» with friends; for polite address use «o senhor» / «a senhora» or the name of the person, not «você». «Vocês» is the normal plural.",
);
set(
  "subject-pronouns intro",
  sp,
  "intro",
  [
    "Subject pronouns say who does the action: eu (I), tu (you, one person you are close to), ele / ela (he / she), nós (we), eles / elas (they) and vocês (you, several people). In everyday speech there is also «a gente», an informal «nós».",
    "Portuguese often drops the subject because the verb ending already shows who: «Falo português» is the normal way to say «I speak Portuguese». Add «eu» only to contrast or to stress: «Eu falo, ele não.»",
    "How to say «you» in Portugal: use «tu» with friends, family and people your age. For polite address, avoid singular «você», which can sound blunt or distant. Use «o senhor» / «a senhora», the name of the person, or just the third person: «A Ana quer café?». «Vocês» is the normal, neutral plural for several people, friends or strangers. «Vós» is archaic or regional: recognise it, but do not use it.",
  ].join("\n\n"),
);
set("subject-pronouns rules", sp, "rules", [
  {
    rule: "Singular: eu (I), tu (you, informal), ele (he), ela (she).",
    rulePt: "Uma pessoa: eu, tu, ele, ela.",
    examples: [
      { pt: "Eu falo.", en: "I speak." },
      { pt: "Tu falas.", en: "You speak." },
      { pt: "Ele fala.", en: "He speaks." },
      { pt: "Ela fala.", en: "She speaks." },
    ],
  },
  {
    rule: "Plural: nós (we), eles (they, masculine or mixed), elas (they, all feminine).",
    rulePt: "Várias pessoas: nós, eles, elas.",
    examples: [
      { pt: "Nós falamos.", en: "We speak." },
      { pt: "Eles falam.", en: "They speak. (masculine or mixed)" },
      { pt: "Elas moram em Lisboa.", en: "They live in Lisbon. (all feminine)" },
    ],
  },
  {
    rule: "«A gente» means «we» in informal speech. It takes the third-person singular verb: «A gente vai», not «a gente vamos». «Nós vamos» is the neutral choice.",
    rulePt: "«A gente» é um «nós» informal e leva o verbo na terceira pessoa do singular.",
    examples: [
      { pt: "A gente vai ao cinema.", en: "We are going to the cinema. (informal)" },
      { pt: "Nós vamos ao cinema.", en: "We are going to the cinema. (neutral)" },
    ],
  },
  {
    rule: "In Portugal, use «tu» with friends, family and people your age. For polite address, use «o senhor» / «a senhora», the name of the person, or the bare third person. All of these take the third-person singular verb.",
    rulePt: "Com amigos e família, «tu». Para ser educado, «o senhor», «a senhora», o nome da pessoa ou a terceira pessoa.",
    examples: [
      { pt: "Tu queres café?", en: "Do you want coffee? (to a friend)" },
      { pt: "O senhor quer café?", en: "Would you like coffee? (polite, to a man)" },
      { pt: "A Ana quer café?", en: "Would you like coffee, Ana? (polite, by name)" },
      { pt: "Quer café?", en: "Would you like coffee? (polite, subject dropped)" },
    ],
  },
  {
    rule: "«Você» exists and takes the third-person singular verb, but in Portugal it can sound blunt or distant, so avoid it with someone you do not know well. It is not the polite form: that is «o senhor» / «a senhora» or the name of the person. In Brazilian Portuguese «você» is the everyday «you», which is one more reason not to carry it over.",
    rulePt: "Em Portugal, «você» no singular pode soar seco ou distante. Evita-o; não é a forma de cortesia.",
    examples: [
      { pt: "A Ana quer café?", en: "Would you like coffee, Ana? (instead of «você»)" },
      { pt: "O senhor já almoçou?", en: "Have you had lunch? (polite, to a man)" },
    ],
  },
  {
    rule: "«Vocês» is the normal, neutral plural for several people you are talking to: friends, family or strangers. In practice it is the plural of «tu». It takes the third-person plural verb.",
    rulePt: "«Vocês» é o plural normal, com amigos e com desconhecidos, e leva o verbo na terceira pessoa do plural.",
    examples: [
      { pt: "Vocês querem café?", en: "Do you (all) want coffee?" },
      { pt: "Vocês moram em Lisboa?", en: "Do you (all) live in Lisbon?" },
    ],
  },
  {
    rule: "«Vós» (you, plural, with its own verb forms) is archaic or regional. Recognise it in old texts, songs and prayers, but say «vocês» yourself.",
    rulePt: "«Vós» é antigo ou regional. Reconhece-o, mas diz «vocês».",
    examples: [{ pt: "Vós sois amigos.", en: "You are friends. (archaic)" }],
  },
  {
    rule: "Subject pronouns are usually dropped when the verb form is clear: «Falo português», not «Eu falo português» by default. Use them to contrast or to stress: «Eu falo, ele não.»",
    rulePt: "Os pronomes sujeito costumam omitir-se. Usam-se para contrastar ou dar ênfase.",
    examples: [
      { pt: "Falo português.", en: "I speak Portuguese." },
      { pt: "Comeu o bolo?", en: "Did you / he / she eat the cake?" },
      { pt: "Eu falo, ele não.", en: "I speak, he does not." },
    ],
  },
]);
set("subject-pronouns tips", sp, "tips", [
  "Use «tu» with friends, family and people your age. To be polite, use «o senhor» / «a senhora» or the name of the person, and avoid singular «você».",
  "«A gente vai», with the third-person singular verb. Never «a gente vamos».",
  "«Vocês» is the normal plural for friends and strangers alike. Skip «vós».",
  "Drop the subject by default: «Falo português», not «Eu falo português».",
]);
set("subject-pronouns tipsPt", sp, "tipsPt", [
  "Usa «tu» com amigos, família e pessoas da tua idade. Para ser educado, usa «o senhor», «a senhora» ou o nome da pessoa, e evita «você» no singular.",
  "«A gente vai», com o verbo na terceira pessoa do singular. Nunca «a gente vamos».",
  "«Vocês» é o plural normal, com amigos e com desconhecidos. Não uses «vós».",
  "Em regra, omite o sujeito: «Falo português», não «Eu falo português».",
]);

const SP_Q = {
  2: q(
    "Which is the safest way to address one person you do not know well, politely, in Portugal?",
    "Qual é a forma mais segura de tratar com respeito uma pessoa que não conheces bem?",
    ["tu", "você", "o senhor / a senhora", "vós"],
    "o senhor / a senhora",
    "Use o senhor / a senhora, or the name of the person. Singular você can sound blunt or distant.",
  ),
  6: q(
    "Complete: ___ comeste o bolo? (Did you eat the cake?)",
    "Completa: ___ comeste o bolo?",
    ["Eu", "Tu", "Ele", "Nós"],
    "Tu",
    "Comeste is the tu form of comer in the preterite.",
  ),
  8: q(
    "How do you ask a group of friends: Do you (all) want coffee?",
    "Como perguntas a um grupo de amigos: querem café?",
    ["Tu queres café?", "Vocês querem café?", "Vocês quer café?", "Vós quer café?"],
    "Vocês querem café?",
    "Vocês is the normal plural and takes the third-person plural verb: querem.",
  ),
  12: q(
    "Complete: A gente ___ ao cinema. (ir)",
    "Completa: A gente ___ ao cinema.",
    ["vamos", "vai", "vais", "vão"],
    "vai",
    "A gente is an informal nós, but it takes the third-person singular verb: vai.",
  ),
  14: q(
    "Which sentence is the natural polite way to ask a woman you do not know: Would you like coffee?",
    "Qual é a forma natural e educada de perguntar a uma senhora que não conheces: quer café?",
    ["A senhora quer café?", "Tu queres café?", "Você quer café?", "Vós quereis café?"],
    "A senhora quer café?",
    "A senhora, or the name of the person, is the polite choice. Você can sound blunt and tu is for friends.",
  ),
};
if (sp.questions.length !== 15) throw new Error(`subject-pronouns: expected 15 questions, found ${sp.questions.length}`);
for (const [i, nq] of Object.entries(SP_Q)) {
  const cur = sp.questions[i];
  const merged = { ...cur, ...nq }; // keeps any extra keys the old question carried
  set(`subject-pronouns question ${i}`, sp.questions, i, merged);
}

const imp = topics.imperative;
set(
  "imperative rule 2 (rule)",
  imp.rules[1],
  "rule",
  "Polite form (o senhor / a senhora, also used with você): use the present subjunctive.",
);
set(
  "imperative rule 2 (rulePt)",
  imp.rules[1],
  "rulePt",
  "Forma de cortesia (o senhor / a senhora, também com «você»): usar o presente do conjuntivo.",
);
const impQ = imp.questions[14];
if (impQ.options[0] === "você (formal)" || impQ.options[0] === "o senhor / a senhora (polite)") {
  const options = ["o senhor / a senhora (polite)", ...impQ.options.slice(1)];
  set("imperative question 14 options", impQ, "options", options);
  set("imperative question 14 correctIndex", impQ, "correctIndex", options.indexOf(impQ.correctAnswer));
}

/* ───────────── etiquette.json ───────────── */
const etiquette = load("etiquette.json");
const tip = etiquette.json.tips.find((t) => t.id === "greeting-formality");
if (!tip) throw new Error("etiquette.json: tip greeting-formality not found");
set(
  "etiquette description",
  tip,
  "description",
  "Portuguese has informal (tu) and polite address. Tu is for friends, family, peers and young people. For polite address, use o senhor / a senhora, the name of the person, or the bare third person: A Ana quer café? Você exists, but in Portugal it can sound blunt or distant, so avoid it with strangers. Portugal is less formal than people expect: most young people switch to tu quickly.",
);
set(
  "etiquette doThis",
  tip,
  "doThis",
  "Start with o senhor / a senhora, or the name of the person, when meeting someone older or in a professional setting. Switch to tu once they suggest it or the tone becomes casual.",
);
set(
  "etiquette avoidThis",
  tip,
  "avoidThis",
  "Do not use tu with elderly people, professors, or in formal business settings unless invited to. Do not reach for singular você as the polite form: it can sound blunt.",
);

/* ───────────── vocab.json (one proTip string) ───────────── */
const vocab = load("vocab.json");
const word = vocab.json.categories.flatMap((c) => c.words).find((w) => w.portuguese === "como estás?");
if (!word) throw new Error("vocab.json: «como estás?» not found");
set(
  "vocab proTip «como estás?»",
  word,
  "proTip",
  "Use «como estás?» with friends and family (informal). To be polite, use «como está?» with o senhor / a senhora, or add the name of the person.",
);

/* ───────────── validate ───────────── */
const problems = [];
if (Object.keys(topics).length !== 48) problems.push(`grammar.json has ${Object.keys(topics).length} topics, expected 48`);
let questions = 0;
for (const [id, t] of Object.entries(topics)) {
  (t.questions ?? []).forEach((qq, i) => {
    questions++;
    const idx = qq.correctIndex ?? qq.correct;
    const answer = qq.correctAnswer ?? qq.options[idx];
    if (qq.options[idx] !== answer) problems.push(`${id}[${i}]: correctAnswer !== options[correctIndex]`);
    if (new Set(qq.options).size !== qq.options.length) problems.push(`${id}[${i}]: duplicate options`);
  });
}
if (questions !== 763) problems.push(`${questions} questions, expected 763`);
const FORMAL_VOCE = /(?:você[^.?!]{0,40}\bformal\b|\bformal\b[^.?!]{0,40}você)/i;
for (const [name, doc] of [["grammar.json", grammar.json], ["etiquette.json", etiquette.json]]) {
  const walk = (o, p) => {
    if (typeof o === "string") {
      if (FORMAL_VOCE.test(o) && !/senhor|polite|cortesia|educado/i.test(o)) problems.push(`${name} ${p}: still calls você formal`);
    } else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${p}[${i}]`));
    else if (o && typeof o === "object") for (const k of Object.keys(o)) walk(o[k], `${p}.${k}`);
  };
  walk(doc, "");
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

if (changes.length === 0) {
  console.log("Nothing to change (already applied).");
  process.exit(0);
}
console.log(`${changes.length} field(s) ${dryRun ? "would change" : "changed"}:`);
for (const c of changes) console.log(`  ${c}`);
console.log(`topics: ${Object.keys(topics).length}, questions: ${questions}, rules in subject-pronouns: ${sp.rules.length}`);
if (!dryRun) {
  save(grammar, "grammar.json");
  save(etiquette, "etiquette.json");
  save(vocab, "vocab.json");
  console.log("Wrote grammar.json, etiquette.json, vocab.json");
}
