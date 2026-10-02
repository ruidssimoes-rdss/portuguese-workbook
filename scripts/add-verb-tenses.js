/**
 * Adds Imperfect Subjunctive, Future Subjunctive and Imperative rows to every
 * verb in src/data/verbs.json, plus meta.participle (and meta.participleNote
 * where relevant). Both subjunctives are derived from the 3rd-person-plural
 * preterite already in the data; the imperative reuses the present and the
 * present subjunctive. Idempotent: re-running skips verbs that already have
 * the new tenses.
 *
 * Run: node scripts/add-verb-tenses.js
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "verbs.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Person slots. Labels vary slightly between verbs («tu (you)» vs «tu (you singular)»),
// so rows are matched by slot and written with each verb's own label.
const P = { eu: "eu", tu: "tu", ele: "ele", nos: "nos", eles: "eles" };
function slotOf(label) {
  if (label.startsWith("eles")) return "eles";
  if (label.startsWith("ele")) return "ele";
  if (label.startsWith("nós")) return "nos";
  if (label.startsWith("tu")) return "tu";
  if (label.startsWith("eu")) return "eu";
  return null;
}
function labelsOf(verb) {
  const out = {};
  for (const c of verb.conjugations) if (c.Tense === "Present") out[slotOf(c.Person)] = c.Person;
  return out;
}
const PERSON_ORDER = [P.eu, P.tu, P.ele, P.nos, P.eles];

const IMPERSONAL = new Set(["CHOVER", "NEVAR"]);
// Verbs with no natural affirmative imperative.
const NO_IMPERATIVE = new Set(["CHOVER", "NEVAR", "HAVER", "PODER", "ACONTECER", "DOER", "CUSTAR", "PARECER", "BASTAR"]);

const IRREGULAR_PARTICIPLES = {
  FAZER: "feito", DIZER: "dito", ESCREVER: "escrito", VER: "visto", PÔR: "posto", POR: "posto",
  ABRIR: "aberto", VIR: "vindo", COBRIR: "coberto", DESCOBRIR: "descoberto", DESFAZER: "desfeito",
  REFAZER: "refeito", SATISFAZER: "satisfeito", DESCREVER: "descrito", PREVER: "previsto",
  REVER: "revisto", PROPOR: "proposto", COMPOR: "composto", SUPOR: "suposto", DISPOR: "disposto",
  IMPOR: "imposto", EXPOR: "exposto", OPOR: "oposto", REPOR: "reposto", DEVOLVER: "devolvido",
};
const DOUBLE_PARTICIPLES = {
  ACEITAR: ["aceitado", "aceite"], GANHAR: ["ganhado", "ganho"], GASTAR: ["gastado", "gasto"],
  PAGAR: ["pagado", "pago"], ENTREGAR: ["entregado", "entregue"], MATAR: ["matado", "morto"],
  MORRER: ["morrido", "morto"], PRENDER: ["prendido", "preso"], ACENDER: ["acendido", "aceso"],
  SOLTAR: ["soltado", "solto"], LIMPAR: ["limpado", "limpo"], SECAR: ["secado", "seco"],
  ELEGER: ["elegido", "eleito"], IMPRIMIR: ["imprimido", "impresso"], SALVAR: ["salvado", "salvo"],
  ENCHER: ["enchido", "cheio"], EXPRIMIR: ["exprimido", "expresso"], FRITAR: ["fritado", "frito"],
};

function infinitiveOf(key) {
  return key.toLowerCase();
}

function englishBase(meta) {
  const segs = String(meta.english || "")
    .split("/")
    .map((s) => s.replace(/\(.*?\)/g, "").trim());
  const withTo = segs.find((s) => s.startsWith("to ")) || segs[0] || "";
  return withTo.replace(/^to /, "").trim();
}

function row(verb, slot, tense, tenseCefr, form, ex, exEn, type, notes) {
  return {
    Person: labelsOf(verb)[slot],
    Tense: tense,
    "CEFR (Tense)": tenseCefr,
    "CEFR (Verb)": verb.meta.cefr,
    Conjugation: form,
    "Example Sentence": ex,
    "English Translation": exEn,
    Type: type,
    Notes: notes,
  };
}

function pick(verb, tense, slot) {
  const r = verb.conjugations.find((c) => c.Tense === tense && slotOf(c.Person) === slot);
  return r ? r.Conjugation : null;
}

/** Stem for both subjunctives: 3pl preterite minus "ram". */
const IMPERSONAL_STEMS = { CHOVER: "chove", NEVAR: "neva" };
function subjStem(key, verb) {
  if (IMPERSONAL_STEMS[key]) return IMPERSONAL_STEMS[key];
  const p3 = pick(verb, "Preterite", P.eles);
  if (!p3 || !p3.endsWith("ram")) throw new Error(`${key}: unexpected 3pl preterite "${p3}"`);
  return p3.slice(0, -3);
}

/** Stressed form of the stem's last vowel, used in nós of the imperfect subjunctive. */
function accentStem(key, stem) {
  const inf = infinitiveOf(key);
  const last = stem.slice(-1);
  const head = stem.slice(0, -1);
  if (/[áéêíóôú]$/.test(stem)) return stem;
  if (last === "a") return head + "á";
  if (last === "i") return head + "í";
  if (last === "o") return head + "ô";
  if (last === "e") {
    // Regular -er pattern (comeram ← comer) takes ê; strong preterites (fizeram, deram, vieram) take é.
    const regular = inf.endsWith("er") && stem === inf.slice(0, -2) + "e";
    return head + (regular ? "ê" : "é");
  }
  return stem;
}

function stripAccent(s) {
  return s.replace(/í$/, "i");
}

function imperfectSubjunctive(key, verb) {
  const s = subjStem(key, verb);
  const a = accentStem(key, s);
  return {
    [P.eu]: s + "sse",
    [P.tu]: s + "sses",
    [P.ele]: s + "sse",
    [P.nos]: a + "ssemos",
    [P.eles]: s + "ssem",
  };
}

function futureSubjunctive(key, verb) {
  const s = subjStem(key, verb);
  // sair → saíram: sair, saíres, sair, sairmos, saírem
  const plain = stripAccent(s);
  return {
    [P.eu]: plain + "r",
    [P.tu]: s + "res",
    [P.ele]: plain + "r",
    [P.nos]: plain + "rmos",
    [P.eles]: s + "rem",
  };
}

function imperative(key, verb) {
  const tu = key === "SER" ? "sê" : pick(verb, "Present", P.ele);
  return {
    [P.tu]: tu,
    [P.ele]: pick(verb, "Present Subjunctive", P.ele),
    [P.nos]: pick(verb, "Present Subjunctive", P.nos),
    [P.eles]: pick(verb, "Present Subjunctive", P.eles),
  };
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function examplesImpSubj(base) {
  return {
    [P.eu]: [(f) => `Se eu ${f} mais vezes, era mais fácil.`, `If I were to ${base} more often, it would be easier.`],
    [P.tu]: [(f) => `A professora pediu que tu ${f}.`, `The teacher asked you to ${base}.`],
    [P.ele]: [(f) => `Era bom que ele ${f} hoje.`, `It would be good if he were to ${base} today.`],
    [P.nos]: [(f) => `Se nós ${f} juntos, era melhor.`, `If we were to ${base} together, it would be better.`],
    [P.eles]: [(f) => `Queria que eles ${f} também.`, `I wanted them to ${base} too.`],
  };
}

function examplesFutSubj(base) {
  return {
    [P.eu]: [(f) => `Quando eu ${f}, aviso-te.`, `When I ${base}, I'll let you know.`],
    [P.tu]: [(f) => `Se tu ${f}, diz-me.`, `If you ${base}, tell me.`],
    [P.ele]: [(f) => `Se ele ${f} amanhã, tudo bem.`, `If he should ${base} tomorrow, that's fine.`],
    [P.nos]: [(f) => `Quando nós ${f}, avisamos.`, `When we ${base}, we'll let you know.`],
    [P.eles]: [(f) => `Se eles ${f}, ficamos contentes.`, `If they ${base}, we'll be happy.`],
  };
}

function examplesImperative(base) {
  return {
    [P.tu]: [(f) => `${cap(f)} agora, por favor.`, `${cap(base)} now, please.`],
    [P.ele]: [(f) => `Por favor, ${f} amanhã.`, `Please ${base} tomorrow (formal).`],
    [P.nos]: [(f) => `${cap(f)} juntos!`, `Let's ${base} together!`],
    [P.eles]: [(f) => `${cap(f)} com calma.`, `${cap(base)} calmly (you all).`],
  };
}

const IMPERSONAL_EX = {
  CHOVER: {
    imp: ["Se chovesse, ficávamos em casa.", "If it rained, we'd stay at home."],
    fut: ["Se chover amanhã, levamos guarda-chuva.", "If it rains tomorrow, we'll take an umbrella."],
  },
  NEVAR: {
    imp: ["Se nevasse em Lisboa, ninguém ia trabalhar.", "If it snowed in Lisbon, nobody would go to work."],
    fut: ["Se nevar na Serra da Estrela, vamos lá.", "If it snows in Serra da Estrela, we'll go there."],
  },
};

// Data fix: OCORRER was stored with a single «r» in every form (ocoro, ocoreu…).
if (data.verbs.OCORRER) {
  for (const c of data.verbs.OCORRER.conjugations) {
    c.Conjugation = c.Conjugation.replace(/^ocor(?!r)/, "ocorr");
    c["Example Sentence"] = c["Example Sentence"].replace(/\b([Oo])cor(?!r)/g, "$1corr");
  }
}

let added = 0;
let skipped = 0;
const spot = {};

for (const key of data.order) {
  const verb = data.verbs[key];
  if (!verb) continue;
  if (verb.conjugations.some((c) => c.Tense === "Imperfect Subjunctive")) {
    skipped++;
    continue;
  }
  const base = englishBase(verb.meta);
  const regularGroup = String(verb.meta.group).startsWith("Regular");
  const subjType = regularGroup ? "Regular Pattern" : "Exception";
  const newRows = [];

  const imp = imperfectSubjunctive(key, verb);
  const fut = futureSubjunctive(key, verb);

  if (IMPERSONAL.has(key)) {
    const ex = IMPERSONAL_EX[key];
    for (const p of PERSON_ORDER) {
      newRows.push(row(verb, p, "Imperfect Subjunctive", "B1", imp[P.ele], ex.imp[0], ex.imp[1], "Exception", "Impersonal: only the 3rd person singular is used."));
    }
    for (const p of PERSON_ORDER) {
      newRows.push(row(verb, p, "Future Subjunctive", "B1", fut[P.ele], ex.fut[0], ex.fut[1], "Exception", "Impersonal: only the 3rd person singular is used."));
    }
  } else {
    const ei = examplesImpSubj(base);
    for (const p of PERSON_ORDER) {
      newRows.push(row(verb, p, "Imperfect Subjunctive", "B1", imp[p], ei[p][0](imp[p]), ei[p][1], subjType,
        "Imperfect subjunctive. Formed from the 3rd person plural preterite minus -ram, plus -sse. Used after past triggers (queria que, era bom que), in «se» hypotheticals and after «como se»."));
    }
    const ef = examplesFutSubj(base);
    for (const p of PERSON_ORDER) {
      newRows.push(row(verb, p, "Future Subjunctive", "B1", fut[p], ef[p][0](fut[p]), ef[p][1], subjType,
        "Future subjunctive. Same stem as the imperfect subjunctive, plus -r. Used after quando, se, assim que, logo que, enquanto, como, onde and quem when they point to the future."));
    }
  }

  if (!NO_IMPERATIVE.has(key)) {
    const im = imperative(key, verb);
    const eim = examplesImperative(base);
    const negTu = pick(verb, "Present Subjunctive", P.tu);
    for (const p of [P.tu, P.ele, P.nos, P.eles]) {
      if (!im[p]) throw new Error(`${key}: missing imperative source for ${p}`);
      const note =
        p === P.tu
          ? `Affirmative «tu» = present 3rd person singular${key === "SER" ? " (exception: sê)" : ""}. Negative: não ${negTu}.`
          : "Affirmative and negative use the present subjunctive form.";
      newRows.push(row(verb, p, "Imperative", "A2", im[p], eim[p][0](im[p]), eim[p][1], key === "SER" && p === P.tu ? "Exception" : "Regular Pattern", note));
    }
  }

  verb.conjugations.push(...newRows);
  added += newRows.length;

  // Participle in meta (not a conjugation row, so exercise engines never pick it up as a "tense").
  const inf = infinitiveOf(key);
  let participle = IRREGULAR_PARTICIPLES[key];
  if (!participle) participle = inf.endsWith("ar") ? inf.slice(0, -2) + "ado" : inf.slice(0, -2) + "ido";
  if (inf.endsWith("air") || (inf.endsWith("uir") && !/[gq]uir$/.test(inf))) participle = inf.slice(0, -1).slice(0, -1) + "ído"; // sair → saído, construir → construído
  verb.meta.participle = participle;
  if (DOUBLE_PARTICIPLES[key]) {
    const [reg, irr] = DOUBLE_PARTICIPLES[key];
    verb.meta.participle = reg;
    verb.meta.participleNote = `Two participles: «${reg}» with ter/haver (tenho ${reg}), «${irr}» with ser/estar (foi ${irr}). In everyday EP «${irr}» is often used with ter too.`;
  } else if (IRREGULAR_PARTICIPLES[key]) {
    verb.meta.participleNote = "Irregular participle.";
  }

  spot[key] = [imp[P.eu], fut[P.eu], NO_IMPERATIVE.has(key) ? "—" : imperative(key, verb)[P.tu], verb.meta.participle];
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 4));

const check = ["SER", "IR", "TER", "FAZER", "PÔR", "POR", "VER", "VIR", "DIZER", "DAR", "FALAR", "SAIR", "CONSTRUIR", "LER", "COMER", "PARTIR"];
console.log(`Added ${added} rows; skipped ${skipped} verbs already done.`);
for (const k of check) if (spot[k]) console.log(`${k.padEnd(10)} ${spot[k].join(" / ")}`);
