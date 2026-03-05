#!/usr/bin/env node
/**
 * Add 22 new verbs to verbs.json (Batch 3 — A1/A2/B1).
 * Run from project root: node scripts/add-batch3-22-verbs.js
 */
const fs = require("fs");
const path = require("path");

const verbsPath = path.join(__dirname, "../src/data/verbs.json");
const data = JSON.parse(fs.readFileSync(verbsPath, "utf8"));

const PERSONS = [
  "eu (I)",
  "tu (you singular)",
  "ele/ela/você (he/she/you formal)",
  "nós (we)",
  "eles/elas/vocês (they/you plural formal)",
];

const TENSES = ["Present", "Preterite", "Imperfect", "Future", "Conditional", "Present Subjunctive"];
const CEFR_TENSE = { Present: "A1", Preterite: "A2", Imperfect: "A2", Future: "B1", Conditional: "B1", "Present Subjunctive": "B2" };

function build(person, tense, cefrV, conj, exPt, exEn, type, notes) {
  return {
    Person: person,
    Tense: tense,
    "CEFR (Tense)": CEFR_TENSE[tense],
    "CEFR (Verb)": cefrV,
    Conjugation: conj,
    "Example Sentence": exPt,
    "English Translation": exEn,
    Type: type || "Regular Conjugation",
    Notes: notes || "",
  };
}

function fromRows(cefrV, rows, types = [], notes = []) {
  const out = [];
  for (let i = 0; i < 30; i++) {
    const p = i % 5;
    const t = TENSES[Math.floor(i / 5)];
    out.push(build(PERSONS[p], t, cefrV, rows[i][0], rows[i][1], rows[i][2], types[i], notes[i]));
  }
  return out;
}

function makeAR(inf, stem, cefrV, examples) {
  const subjStem = stem.replace(/[ao]$/, "e").replace(/([^aeiou])ar$/, "$1e");
  const base = stem.replace(/ar$/, "");
  const subj = base + "e";
  const forms = [
    [base + "o", base + "as", base + "a", base + "amos", base + "am"],
    [base + "ei", base + "aste", base + "ou", base + "ámos", base + "aram"],
    [base + "ava", base + "avas", base + "ava", base + "ávamos", base + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return fromRows(cefrV, rows);
}

// —— Generic regular -AR from stem (stem = infinitive minus -ar: am, acord, chor, etc.)
function regAR(inf, stem, cefrV) {
  const subj = stem + "e";
  const forms = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const ex = (s, e) => [s, e];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], "Example.", "Example."]);
  return fromRows(cefrV, rows);
}

// Build minimal examples for makeAR when we have stem
function arExamples(inf, stem, ptEx, enEx) {
  const subj = stem + "e";
  const out = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      out.push([`Eu ${stem}o.`, "I do."]);
  return out;
}

// —— VESTIR (e→i): visto, vistes, veste, vestimos, vestem; vesti, vestiste, vestiu, vestimos, vestiram; vestia...; vestirei...; vestiria...; vista, vistas, vista, vistamos, vistam
function vestirConj(cefrV) {
  const rows = [
    ["visto", "Eu visto-me rapidamente.", "I get dressed quickly."],
    ["vestes", "Tu vestes-te bem.", "You dress well."],
    ["veste", "Ela veste o casaco.", "She wears the coat."],
    ["vestimos", "Nós vestimo-nos.", "We get dressed."],
    ["vestem", "Eles vestem uniforme.", "They wear uniform."],
    ["vesti", "Eu vesti o casaco.", "I put on the coat."],
    ["vestiste", "Tu vestiste-te?", "Did you get dressed?"],
    ["vestiu", "Ela vestiu o fato.", "She wore the suit."],
    ["vestimos", "Nós vestimo-nos.", "We got dressed."],
    ["vestiram", "Eles vestiram-se.", "They got dressed."],
    ["vestia", "Eu vestia-me sozinho.", "I used to get dressed alone."],
    ["vestias", "Tu vestias roupa casual.", "You used to wear casual clothes."],
    ["vestia", "Ela vestia-se depressa.", "She used to get dressed quickly."],
    ["vestíamos", "Nós vestíamo-nos.", "We used to get dressed."],
    ["vestiam", "Eles vestiam uniforme.", "They used to wear uniform."],
    ["vestirei", "Eu vestir-me-ei.", "I will get dressed."],
    ["vestirás", "Tu vestir-te-ás.", "You will get dressed."],
    ["vestirá", "Ela vestir-se-á.", "She will get dressed."],
    ["vestiremos", "Nós vestir-nos-emos.", "We will get dressed."],
    ["vestirão", "Eles vestir-se-ão.", "They will get dressed."],
    ["vestiria", "Eu vestir-me-ia.", "I would get dressed."],
    ["vestirias", "Tu vestir-te-ias.", "You would get dressed."],
    ["vestiria", "Ela vestir-se-ia.", "She would get dressed."],
    ["vestiríamos", "Nós vestir-nos-íamos.", "We would get dressed."],
    ["vestiriam", "Eles vestir-se-iam.", "They would get dressed."],
    ["vista", "Espero que eu me vista.", "I hope I get dressed."],
    ["vistas", "Quero que te vistas.", "I want you to get dressed."],
    ["vista", "É bom que ela se vista.", "It's good that she gets dressed."],
    ["vistamos", "Convém que nos vistamos.", "We should get dressed."],
    ["vistam", "Quero que se vistam.", "I want them to get dressed."],
  ];
  const types = ["Exception", "Exception", "Exception", "Exception", "Exception"].concat(Array(25).fill("Regular Conjugation"));
  const notes = ["Present 1st person. Stem change e→i: vest→vist. Often reflexive: vestir-se = to get dressed.", "", "", "", ""].concat(Array(24).fill(""));
  notes[25] = "Stem vist- in subjunctive.";
  return fromRows(cefrV, rows, types, notes);
}

// —— CHOVER (impersonal): only 3rd sg forms; use for all 5 persons
function choverConj(cefrV) {
  const forms = ["chove", "choveu", "chovia", "choverá", "choveria", "chova"];
  const exs = [
    ["Chove muito.", "It rains a lot."],
    ["Choveu ontem.", "It rained yesterday."],
    ["Chovia quando saí.", "It was raining when I left."],
    ["Choverá amanhã?", "Will it rain tomorrow?"],
    ["Choveria se estivesse frio.", "It would rain if it were cold."],
    ["Espero que chova.", "I hope it rains."],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti], exs[ti][0], exs[ti][1]]);
  const notes = Array(30).fill("Impersonal verb — used only in 3rd person singular. Forms shown for all persons for reference.");
  return fromRows(cefrV, rows, Array(30).fill("Exception"), notes);
}

// —— RIR: rio, ris, ri, rimos, riem; ri, riste, riu, rimos, riram; ria...; rirei...; riria...; ria, rias, ria, riamos, riam
function rirConj(cefrV) {
  const rows = [
    ["rio", "Eu rio muito.", "I laugh a lot."],
    ["ris", "Tu ris da piada.", "You laugh at the joke."],
    ["ri", "Ela ri.", "She laughs."],
    ["rimos", "Nós rimos juntos.", "We laugh together."],
    ["riem", "Eles riem.", "They laugh."],
    ["ri", "Eu ri muito.", "I laughed a lot."],
    ["riste", "Tu riste?", "Did you laugh?"],
    ["riu", "Ela riu.", "She laughed."],
    ["rimos", "Nós rimos.", "We laughed."],
    ["riram", "Eles riram.", "They laughed."],
    ["ria", "Eu ria sempre.", "I used to laugh always."],
    ["rias", "Tu rias muito.", "You used to laugh a lot."],
    ["ria", "Ela ria.", "She used to laugh."],
    ["ríamos", "Nós ríamos.", "We used to laugh."],
    ["riam", "Eles riam.", "They used to laugh."],
    ["rirei", "Eu rirei.", "I will laugh."],
    ["rirás", "Tu rirás.", "You will laugh."],
    ["rirá", "Ela rirá.", "She will laugh."],
    ["riremos", "Nós riremos.", "We will laugh."],
    ["rirão", "Eles rirão.", "They will laugh."],
    ["riria", "Eu riria.", "I would laugh."],
    ["ririas", "Tu ririas.", "You would laugh."],
    ["riria", "Ela riria.", "She would laugh."],
    ["riríamos", "Nós riríamos.", "We would laugh."],
    ["ririam", "Eles ririam.", "They would laugh."],
    ["ria", "Espero que eu ria.", "I hope I laugh."],
    ["rias", "Quero que tu rias.", "I want you to laugh."],
    ["ria", "É bom que ela ria.", "It's good that she laughs."],
    ["riamos", "Convém que riamos.", "We should laugh."],
    ["riam", "Quero que riam.", "I want them to laugh."],
  ];
  return fromRows(cefrV, rows, Array(30).fill("Exception"), Array(30).fill(""));
}

// —— CONDUZIR (like TRADUZIR): conduzo, conduzes, conduz, conduzimos, conduzem; conduzi, conduziste, conduziu...; subjunctive: conduza
function conduzirConj(cefrV) {
  const rows = [
    ["conduzo", "Eu conduzo o carro.", "I drive the car."],
    ["conduzes", "Tu conduzes bem?", "Do you drive well?"],
    ["conduz", "Ela conduz o autocarro.", "She drives the bus."],
    ["conduzimos", "Nós conduzimos.", "We drive."],
    ["conduzem", "Eles conduzem.", "They drive."],
    ["conduzi", "Eu conduzi até Lisboa.", "I drove to Lisbon."],
    ["conduziste", "Tu conduziste?", "Did you drive?"],
    ["conduziu", "Ela conduziu.", "She drove."],
    ["conduzimos", "Nós conduzimos.", "We drove."],
    ["conduziram", "Eles conduziram.", "They drove."],
    ["conduzia", "Eu conduzia todos os dias.", "I used to drive every day."],
    ["conduzias", "Tu conduzias?", "Did you use to drive?"],
    ["conduzia", "Ela conduzia.", "She used to drive."],
    ["conduzíamos", "Nós conduzíamos.", "We used to drive."],
    ["conduziam", "Eles conduziam.", "They used to drive."],
    ["conduzirei", "Eu conduzirei.", "I will drive."],
    ["conduzirás", "Tu conduzirás.", "You will drive."],
    ["conduzirá", "Ela conduzirá.", "She will drive."],
    ["conduziremos", "Nós conduziremos.", "We will drive."],
    ["conduzirão", "Eles conduzirão.", "They will drive."],
    ["conduziria", "Eu conduziria.", "I would drive."],
    ["conduzirias", "Tu conduzirias.", "You would drive."],
    ["conduziria", "Ela conduziria.", "She would drive."],
    ["conduziríamos", "Nós conduziríamos.", "We would drive."],
    ["conduziriam", "Eles conduziriam.", "They would drive."],
    ["conduza", "Espero que eu conduza.", "I hope I drive."],
    ["conduzas", "Quero que conduzas.", "I want you to drive."],
    ["conduza", "É preciso que ela conduza.", "She needs to drive."],
    ["conduzamos", "Convém que conduzamos.", "We should drive."],
    ["conduzam", "Quero que conduzam.", "I want them to drive."],
  ];
  const notes = ["CONDUZIR: EP word for to drive (not dirigir). Same pattern as TRADUZIR.", "", "3rd person drops -e: conduz.", "", ""].concat(Array(25).fill(""));
  notes[25] = "Subjunctive: conduza.";
  return fromRows(cefrV, rows, Array(30).fill("Exception"), notes);
}

// —— SUBIR (u→o): subo, sobes, sobe, subimos, sobem
function subirConj(cefrV) {
  const rows = [
    ["subo", "Eu subo as escadas.", "I go up the stairs."],
    ["sobes", "Tu sobes ao primeiro andar?", "Do you go up to the first floor?"],
    ["sobe", "Ela sobe o monte.", "She climbs the hill."],
    ["subimos", "Nós subimos.", "We go up."],
    ["sobem", "Eles sobem.", "They go up."],
    ["subi", "Eu subi as escadas.", "I went up the stairs."],
    ["subiste", "Tu subiste?", "Did you go up?"],
    ["subiu", "Ela subiu.", "She went up."],
    ["subimos", "Nós subimos.", "We went up."],
    ["subiram", "Eles subiram.", "They went up."],
    ["subia", "Eu subia a pé.", "I used to go up on foot."],
    ["subias", "Tu subias?", "Did you use to go up?"],
    ["subia", "Ela subia.", "She used to go up."],
    ["subíamos", "Nós subíamos.", "We used to go up."],
    ["subiam", "Eles subiam.", "They used to go up."],
    ["subirei", "Eu subirei.", "I will go up."],
    ["subirás", "Tu subirás.", "You will go up."],
    ["subirá", "Ela subirá.", "She will go up."],
    ["subiremos", "Nós subiremos.", "We will go up."],
    ["subirão", "Eles subirão.", "They will go up."],
    ["subiria", "Eu subiria.", "I would go up."],
    ["subirias", "Tu subirias.", "You would go up."],
    ["subiria", "Ela subiria.", "She would go up."],
    ["subiríamos", "Nós subiríamos.", "We would go up."],
    ["subiriam", "Eles subiriam.", "They would go up."],
    ["suba", "Espero que eu suba.", "I hope I go up."],
    ["subas", "Quero que subas.", "I want you to go up."],
    ["suba", "É bom que ela suba.", "It's good that she goes up."],
    ["subamos", "Convém que subamos.", "We should go up."],
    ["subam", "Quero que subam.", "I want them to go up."],
  ];
  const notes = ["SUBIR: stem change u→o in present (subo, sobes, sobe, subimos, sobem).", "", "", "", ""].concat(Array(25).fill(""));
  notes[25] = "Subjunctive: suba.";
  return fromRows(cefrV, rows, ["Exception", "Exception", "Exception", "Exception", "Exception"].concat(Array(25).fill("Regular Conjugation")), notes);
}

// —— DESCER (c→ç): desço, desces, desce, descemos, descem
function descerConj(cefrV) {
  const rows = [
    ["desço", "Eu desço as escadas.", "I go down the stairs."],
    ["desces", "Tu desces?", "Do you go down?"],
    ["desce", "Ela desce.", "She goes down."],
    ["descemos", "Nós descemos.", "We go down."],
    ["descem", "Eles descem.", "They go down."],
    ["desci", "Eu desci.", "I went down."],
    ["desceste", "Tu desceste?", "Did you go down?"],
    ["desceu", "Ela desceu.", "She went down."],
    ["descemos", "Nós descemos.", "We went down."],
    ["desceram", "Eles desceram.", "They went down."],
    ["descia", "Eu descia a pé.", "I used to go down on foot."],
    ["descias", "Tu descias?", "Did you use to go down?"],
    ["descia", "Ela descia.", "She used to go down."],
    ["descíamos", "Nós descíamos.", "We used to go down."],
    ["desciam", "Eles desciam.", "They used to go down."],
    ["descerei", "Eu descerei.", "I will go down."],
    ["descerás", "Tu descerás.", "You will go down."],
    ["descerá", "Ela descerá.", "She will go down."],
    ["desceremos", "Nós desceremos.", "We will go down."],
    ["descerão", "Eles descerão.", "They will go down."],
    ["desceria", "Eu desceria.", "I would go down."],
    ["descerias", "Tu descerias.", "You would go down."],
    ["desceria", "Ela desceria.", "She would go down."],
    ["desceríamos", "Nós desceríamos.", "We would go down."],
    ["desceriam", "Eles desceriam.", "They would go down."],
    ["desça", "Espero que eu desça.", "I hope I go down."],
    ["desças", "Quero que desças.", "I want you to go down."],
    ["desça", "É bom que ela desça.", "It's good that she goes down."],
    ["desçamos", "Convém que desçamos.", "We should go down."],
    ["desçam", "Quero que desçam.", "I want them to go down."],
  ];
  const notes = ["DESCER: spelling change c→ç in 1st person present (desço) and subjunctive (desça).", "", "", "", ""].concat(Array(25).fill(""));
  notes[25] = "Subjunctive: desça, desças, desçamos, desçam.";
  return fromRows(cefrV, rows, ["Exception", "Exception", "Exception", "Exception", "Exception"].concat(Array(25).fill("Regular Conjugation")), notes);
}

// —— SORRIR (like RIR): sorrio, sorris, sorri, sorrimos, sorriem; sorri, sorriste, sorriu...; subjunctive sorria
function sorrirConj(cefrV) {
  const rows = [
    ["sorrio", "Eu sorrio sempre.", "I always smile."],
    ["sorris", "Tu sorris?", "Do you smile?"],
    ["sorri", "Ela sorri.", "She smiles."],
    ["sorrimos", "Nós sorrimos.", "We smile."],
    ["sorriem", "Eles sorriem.", "They smile."],
    ["sorri", "Eu sorri.", "I smiled."],
    ["sorriste", "Tu sorriste?", "Did you smile?"],
    ["sorriu", "Ela sorriu.", "She smiled."],
    ["sorrimos", "Nós sorrimos.", "We smiled."],
    ["sorriram", "Eles sorriram.", "They smiled."],
    ["sorria", "Eu sorria muito.", "I used to smile a lot."],
    ["sorrias", "Tu sorrias.", "You used to smile."],
    ["sorria", "Ela sorria.", "She used to smile."],
    ["sorríamos", "Nós sorríamos.", "We used to smile."],
    ["sorriam", "Eles sorriam.", "They used to smile."],
    ["sorrirei", "Eu sorrirei.", "I will smile."],
    ["sorrirás", "Tu sorrirás.", "You will smile."],
    ["sorrirá", "Ela sorrirá.", "She will smile."],
    ["sorriremos", "Nós sorriremos.", "We will smile."],
    ["sorrirão", "Eles sorrirão.", "They will smile."],
    ["sorriria", "Eu sorriria.", "I would smile."],
    ["sorririas", "Tu sorririas.", "You would smile."],
    ["sorriria", "Ela sorriria.", "She would smile."],
    ["sorriríamos", "Nós sorriríamos.", "We would smile."],
    ["sorririam", "Eles sorririam.", "They would smile."],
    ["sorria", "Espero que eu sorria.", "I hope I smile."],
    ["sorrias", "Quero que sorrias.", "I want you to smile."],
    ["sorria", "É bom que ela sorria.", "It's good that she smiles."],
    ["sorriamos", "Convém que sorriamos.", "We should smile."],
    ["sorriam", "Quero que sorriam.", "I want them to smile."],
  ];
  return fromRows(cefrV, rows, Array(30).fill("Exception"), Array(30).fill(""));
}

// —— PERTENCER (c→ç): pertenço, pertences, pertence, pertencemos, pertencem; subjunctive pertença
function pertencerConj(cefrV) {
  const rows = [
    ["pertenço", "Isso pertence-me.", "That belongs to me."],
    ["pertences", "Tu pertences ao clube?", "Do you belong to the club?"],
    ["pertence", "Isto pertence a ela.", "This belongs to her."],
    ["pertencemos", "Nós pertencemos à equipa.", "We belong to the team."],
    ["pertencem", "Eles pertencem ao grupo.", "They belong to the group."],
    ["pertenci", "Eu pertenci ao clube.", "I belonged to the club."],
    ["pertenceste", "Tu pertenceste?", "Did you belong?"],
    ["pertenceu", "Ela pertenceu à associação.", "She belonged to the association."],
    ["pertencemos", "Nós pertencemos.", "We belonged."],
    ["pertenceram", "Eles pertenceram.", "They belonged."],
    ["pertencia", "Eu pertencia.", "I used to belong."],
    ["pertencias", "Tu pertencias?", "Did you use to belong?"],
    ["pertencia", "Ela pertencia.", "She used to belong."],
    ["pertencíamos", "Nós pertencíamos.", "We used to belong."],
    ["pertenciam", "Eles pertenciam.", "They used to belong."],
    ["pertencerei", "Eu pertencerei.", "I will belong."],
    ["pertencerás", "Tu pertencerás.", "You will belong."],
    ["pertencerá", "Ela pertencerá.", "She will belong."],
    ["pertenceremos", "Nós pertenceremos.", "We will belong."],
    ["pertencerão", "Eles pertencerão.", "They will belong."],
    ["pertenceria", "Eu pertenceria.", "I would belong."],
    ["pertencerias", "Tu pertencerias.", "You would belong."],
    ["pertenceria", "Ela pertenceria.", "She would belong."],
    ["pertenceríamos", "Nós pertenceríamos.", "We would belong."],
    ["pertenceriam", "Eles pertenceriam.", "They would belong."],
    ["pertença", "Espero que eu pertença.", "I hope I belong."],
    ["pertenças", "Quero que pertenças.", "I want you to belong."],
    ["pertença", "É importante que ela pertença.", "It's important that she belongs."],
    ["pertençamos", "Convém que pertençamos.", "We should belong."],
    ["pertençam", "Quero que pertençam.", "I want them to belong."],
  ];
  const notes = ["PERTENCER: spelling change c→ç in 1st person present (pertenço) and subjunctive (pertença).", "", "", "", ""].concat(Array(25).fill(""));
  notes[25] = "Subjunctive: pertença.";
  return fromRows(cefrV, rows, ["Exception", "Exception", "Exception", "Exception", "Exception"].concat(Array(25).fill("Regular Conjugation")), notes);
}

// —— EXIGIR (g→j): exijo, exiges, exige, exigimos, exigem; subjunctive exija
function exigirConj(cefrV) {
  const rows = [
    ["exijo", "Eu exijo silêncio.", "I demand silence."],
    ["exiges", "Tu exiges muito?", "Do you demand a lot?"],
    ["exige", "Ela exige respeito.", "She demands respect."],
    ["exigimos", "Nós exigimos explicações.", "We demand explanations."],
    ["exigem", "Eles exigem qualidade.", "They demand quality."],
    ["exigi", "Eu exigi uma resposta.", "I demanded an answer."],
    ["exigiste", "Tu exigiste?", "Did you demand?"],
    ["exigiu", "Ela exigiu.", "She demanded."],
    ["exigimos", "Nós exigimos.", "We demanded."],
    ["exigiram", "Eles exigiram.", "They demanded."],
    ["exigia", "Eu exigia sempre.", "I used to demand always."],
    ["exigias", "Tu exigias?", "Did you use to demand?"],
    ["exigia", "Ela exigia.", "She used to demand."],
    ["exigíamos", "Nós exigíamos.", "We used to demand."],
    ["exigiam", "Eles exigiam.", "They used to demand."],
    ["exigirei", "Eu exigirei.", "I will demand."],
    ["exigirás", "Tu exigirás.", "You will demand."],
    ["exigirá", "Ela exigirá.", "She will demand."],
    ["exigiremos", "Nós exigiremos.", "We will demand."],
    ["exigirão", "Eles exigirão.", "They will demand."],
    ["exigiria", "Eu exigiria.", "I would demand."],
    ["exigirias", "Tu exigirias.", "You would demand."],
    ["exigiria", "Ela exigiria.", "She would demand."],
    ["exigiríamos", "Nós exigiríamos.", "We would demand."],
    ["exigiriam", "Eles exigiriam.", "They would demand."],
    ["exija", "Espero que eu exija.", "I hope I demand."],
    ["exijas", "Quero que exijas.", "I want you to demand."],
    ["exija", "É preciso que ela exija.", "She needs to demand."],
    ["exijamos", "Convém que exijamos.", "We should demand."],
    ["exijam", "Quero que exijam.", "I want them to demand."],
  ];
  const notes = ["EXIGIR: spelling change g→j in 1st person present (exijo) and subjunctive (exija).", "", "", "", ""].concat(Array(25).fill(""));
  notes[25] = "Subjunctive: exija.";
  return fromRows(cefrV, rows, ["Exception", "Exception", "Exception", "Exception", "Exception"].concat(Array(25).fill("Regular Conjugation")), notes);
}

// —— Helper: generate 30 example pairs for regular -AR from stem
function arEx(stem, inf) {
  const subj = stem + "e";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const out = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      out.push([`Example ${f[ti][pi]}.`, "Example."]);
  return out;
}

// Build regular -AR verb with minimal examples
function makeRegAR(inf, stem, cefrV) {
  const subj = stem + "e";
  const forms = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], `Eu ${forms[ti][pi]}.`, "I do."]);
  return fromRows(cefrV, rows);
}

// —— New verbs definition
const newVerbs = {
  ACORDAR: { meta: { emoji: "⏰", english: "to wake up", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "a-kor-DAR" }, conjugations: makeRegAR("acordar", "acord", "A1") },
  AMAR: { meta: { emoji: "❤️", english: "to love", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "a-MAR" }, conjugations: makeRegAR("amar", "am", "A1") },
  APANHAR: { meta: { emoji: "🚌", english: "to catch / pick up / get", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "a-pa-NYAR" }, conjugations: makeRegAR("apanhar", "apanh", "A2") },
  CASAR: { meta: { emoji: "💒", english: "to marry / get married", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "ka-ZAR" }, conjugations: makeRegAR("casar", "cas", "A2") },
  CHORAR: { meta: { emoji: "😢", english: "to cry", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "sho-RAR" }, conjugations: makeRegAR("chorar", "chor", "A1") },
  CHOVER: { meta: { emoji: "🌧️", english: "to rain", group: "Irregular defective (impersonal)", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "sho-VER" }, conjugations: choverConj("A1") },
  CONDUZIR: { meta: { emoji: "🚗", english: "to drive / conduct", group: "Irregular -IR (z→z stem)", priority: "Essential", difficulty: "Intermediate", cefr: "A2", pronunciation: "con-du-ZEER" }, conjugations: conduzirConj("A2") },
  DESCER: { meta: { emoji: "⬇️", english: "to go down / get off", group: "Irregular -ER", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "desh-SER" }, conjugations: descerConj("A2") },
  ENSINAR: { meta: { emoji: "📚", english: "to teach", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "en-si-NAR" }, conjugations: makeRegAR("ensinar", "ensin", "A1") },
  EXIGIR: { meta: { emoji: "⚠️", english: "to demand / require", group: "Irregular -IR (spelling change)", priority: "Core", difficulty: "Elementary", cefr: "B1", pronunciation: "e-zi-ZHEER" }, conjugations: exigirConj("B1") },
  GASTAR: { meta: { emoji: "💸", english: "to spend (money/time) / use up", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "gash-TAR" }, conjugations: makeRegAR("gastar", "gast", "A2") },
  GRITAR: { meta: { emoji: "📢", english: "to shout / scream", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "gri-TAR" }, conjugations: makeRegAR("gritar", "grit", "A2") },
  LIMPAR: { meta: { emoji: "🧹", english: "to clean", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "lim-PAR" }, conjugations: makeRegAR("limpar", "limp", "A1") },
  NADAR: { meta: { emoji: "🏊", english: "to swim", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "na-DAR" }, conjugations: makeRegAR("nadar", "nad", "A1") },
  PERTENCER: { meta: { emoji: "🔗", english: "to belong to", group: "Irregular -ER (spelling change)", priority: "Core", difficulty: "Elementary", cefr: "B1", pronunciation: "per-ten-SER" }, conjugations: pertencerConj("B1") },
  POUPAR: { meta: { emoji: "💰", english: "to save (money/time)", group: "Regular -AR", priority: "Core", difficulty: "Beginner", cefr: "B1", pronunciation: "po-PAR" }, conjugations: makeRegAR("poupar", "poup", "B1") },
  PROVAR: { meta: { emoji: "👅", english: "to try / taste / prove", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "pro-VAR" }, conjugations: makeRegAR("provar", "prov", "A2") },
  RIR: { meta: { emoji: "😂", english: "to laugh", group: "Irregular -IR", priority: "Useful", difficulty: "Intermediate", cefr: "A1", pronunciation: "REER" }, conjugations: rirConj("A1") },
  SORRIR: { meta: { emoji: "😊", english: "to smile", group: "Irregular -IR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "so-REER" }, conjugations: sorrirConj("A2") },
  SUBIR: { meta: { emoji: "⬆️", english: "to go up / climb / get on", group: "Irregular -IR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "su-BEER" }, conjugations: subirConj("A2") },
  VESTIR: { meta: { emoji: "👕", english: "to dress / wear", group: "Irregular -IR (e→i stem change)", priority: "Core", difficulty: "Beginner", cefr: "A1", pronunciation: "vesh-TEER" }, conjugations: vestirConj("A1") },
  VISITAR: { meta: { emoji: "🏠", english: "to visit", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "vi-zi-TAR" }, conjugations: makeRegAR("visitar", "visit", "A2") },
};

// Insert after (alphabetical placement)
const insertAfter = {
  ACORDAR: "ACREDITAR",
  AMAR: "ACHAR",
  APANHAR: "APRESENTAR",
  CASAR: "CAIR",
  CHORAR: "CHAMAR",
  CHOVER: "CHORAR",
  CONDUZIR: "COLOCAR",
  DESCER: "DEPENDER",
  ENSINAR: "ENVIAR",
  EXIGIR: "EXPLICAR",
  GASTAR: "GARANTIR",
  GRITAR: "GASTAR",
  LIMPAR: "LIGAR",
  NADAR: "MUDAR",
  PERTENCER: "PERMITIR",
  POUPAR: "PREFERIR",
  PROVAR: "PRODUZIR",
  RIR: "RESPONDER",
  SORRIR: "SENTIR",
  SUBIR: "SEGUIR",
  VESTIR: "VENDER",
  VISITAR: "VIAJAR",
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
console.log("Added 22 verbs. Total:", data.order.length);
