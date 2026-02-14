#!/usr/bin/env node
/**
 * Add 23 new B1 verbs to verbs.json (Batch 3).
 * Run from project root: node scripts/add-batch3-23-verbs.js
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
const CEFR_TENSE = { Present: "A1", Preterite: "A2", Imperfect: "B1", Future: "B1", Conditional: "B1", "Present Subjunctive": "B1" };

function build(person, tense, cefrV, conj, exPt, exEn, type, notes) {
  return { Person: person, Tense: tense, "CEFR (Tense)": CEFR_TENSE[tense], "CEFR (Verb)": cefrV, Conjugation: conj, "Example Sentence": exPt, "English Translation": exEn, Type: type, Notes: notes };
}

function fromData(cefrV, dataRows, types, notes) {
  const out = [];
  for (let i = 0; i < 30; i++) {
    const p = i % 5;
    const t = TENSES[Math.floor(i / 5)];
    out.push(build(PERSONS[p], t, cefrV, dataRows[i][0], dataRows[i][1], dataRows[i][2], types[i] || "Regular Conjugation", notes[i] || ""));
  }
  return out;
}

function makeAR(key, stem, examples, subjStem) {
  const inf = key.toLowerCase();
  const subj = subjStem || stem.slice(0, -2) + "e";
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
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return rows;
}

function makeER(key, stem, examples, presentRow, subjRow) {
  const inf = key.toLowerCase();
  const pres = presentRow || [stem + "o", stem + "es", stem + "e", stem + "emos", stem + "em"];
  const subj = subjRow || [stem + "a", stem + "as", stem + "a", stem + "amos", stem + "am"];
  const forms = [
    pres,
    [stem + "i", stem + "este", stem + "eu", stem + "emos", stem + "eram"],
    [stem + "ia", stem + "ias", stem + "ia", stem + "íamos", stem + "iam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    subj,
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return rows;
}

function makeIR(key, stem, examples, presentRow, subjRow) {
  const inf = key.toLowerCase();
  const pres = presentRow || [stem + "o", stem + "es", stem + "e", stem + "imos", stem + "em"];
  const subj = subjRow || [stem + "a", stem + "as", stem + "a", stem + "amos", stem + "am"];
  const forms = [
    pres,
    [stem + "i", stem + "iste", stem + "iu", stem + "imos", stem + "iram"],
    [stem + "ia", stem + "ias", stem + "ia", stem + "íamos", stem + "iam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    subj,
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return rows;
}

// —— IRREGULAR: PROPOR (like pôr) ——
const proporData = [
  ["proponho", "Proponho uma solução.", "I propose a solution."],
  ["propões", "Propões outra alternativa?", "Do you suggest another alternative?"],
  ["propõe", "Ela propõe uma reunião.", "She suggests a meeting."],
  ["propomos", "Propomos uma mudança.", "We propose a change."],
  ["propõem", "Eles propõem novas ideias.", "They propose new ideas."],
  ["propus", "Propus uma alteração ao projeto.", "I proposed a change to the project."],
  ["propuseste", "Propuseste essa ideia?", "Did you suggest that idea?"],
  ["propôs", "Ele propôs um acordo.", "He proposed an agreement."],
  ["propusemos", "Propusemos uma data.", "We proposed a date."],
  ["propuseram", "Propuseram alternativas.", "They proposed alternatives."],
  ["propunha", "Punha sempre novas soluções.", "I always used to propose new solutions."],
  ["propunhas", "Propunhas mudanças?", "Did you use to suggest changes?"],
  ["propunha", "Ela propunha reuniões.", "She used to suggest meetings."],
  ["propúnhamos", "Propúnhamos alterações.", "We used to propose changes."],
  ["propunham", "Eles propunham ideias.", "They used to propose ideas."],
  ["proporei", "Proporei uma solução amanhã.", "I will propose a solution tomorrow."],
  ["proporás", "Proporás outra data?", "Will you suggest another date?"],
  ["proporá", "Ela proporá alterações.", "She will propose changes."],
  ["proporemos", "Proporemos um novo plano.", "We will propose a new plan."],
  ["proporão", "Eles proporão alternativas.", "They will propose alternatives."],
  ["proporia", "Proporia uma reunião.", "I would suggest a meeting."],
  ["proporias", "Proporias outra solução?", "Would you suggest another solution?"],
  ["proporia", "Ela proporia mudanças.", "She would propose changes."],
  ["proporíamos", "Proporíamos um acordo.", "We would propose an agreement."],
  ["proporiam", "Eles proporiam alterações.", "They would propose changes."],
  ["proponha", "Quero que proponha uma solução.", "I want you to propose a solution."],
  ["proponhas", "Espero que proponhas ideias.", "I hope you suggest ideas."],
  ["proponha", "Convém que ela proponha.", "She should suggest."],
  ["proponhamos", "É importante que proponhamos.", "It's important that we propose."],
  ["proponham", "Exijo que proponham alternativas.", "I demand they propose alternatives."],
];

// —— IRREGULAR: SUGERIR (like seguir) ——
const sugerirData = [
  ["sugiro", "Sugiro que falemos amanhã.", "I suggest we talk tomorrow."],
  ["sugeres", "Sugeres outra opção?", "Do you suggest another option?"],
  ["sugere", "Ela sugere uma pausa.", "She suggests a break."],
  ["sugerimos", "Sugerimos uma reunião.", "We suggest a meeting."],
  ["sugerem", "Eles sugerem alternativas.", "They suggest alternatives."],
  ["sugeri", "Sugeri essa ideia ontem.", "I suggested that idea yesterday."],
  ["sugeriste", "Sugeriste essa data?", "Did you suggest that date?"],
  ["sugeriu", "Ele sugeriu uma solução.", "He suggested a solution."],
  ["sugerimos", "Sugerimos mudanças.", "We suggested changes."],
  ["sugeriram", "Sugeriram alterações.", "They suggested changes."],
  ["sugeria", "Sugeria sempre pausas.", "I always used to suggest breaks."],
  ["sugerias", "Sugerias outra opção?", "Did you use to suggest another option?"],
  ["sugeria", "Ela sugeria reuniões.", "She used to suggest meetings."],
  ["sugeríamos", "Sugeríamos alterações.", "We used to suggest changes."],
  ["sugeriam", "Eles sugeriam ideias.", "They used to suggest ideas."],
  ["sugerirei", "Sugerirei uma solução.", "I will suggest a solution."],
  ["sugerirás", "Sugerirás outra data?", "Will you suggest another date?"],
  ["sugerirá", "Ela sugerirá alterações.", "She will suggest changes."],
  ["sugeriremos", "Sugeriremos um plano.", "We will suggest a plan."],
  ["sugerirão", "Eles sugerirão opções.", "They will suggest options."],
  ["sugeriria", "Sugeriria uma pausa.", "I would suggest a break."],
  ["sugeririas", "Sugeririas outra opção?", "Would you suggest another option?"],
  ["sugeriria", "Ela sugeriria mudanças.", "She would suggest changes."],
  ["sugeriríamos", "Sugeriríamos alterações.", "We would suggest changes."],
  ["sugeririam", "Eles sugeririam soluções.", "They would suggest solutions."],
  ["sugira", "Quero que sugira uma ideia.", "I want you to suggest an idea."],
  ["sugiras", "Espero que sugiras alternativas.", "I hope you suggest alternatives."],
  ["sugira", "Convém que ela sugira.", "She should suggest."],
  ["sugiramos", "É importante que sugiramos.", "It's important that we suggest."],
  ["sugiram", "Exijo que sugiram opções.", "I demand they suggest options."],
];

// Fix propunha typo in proporData (Punha -> Propunha)
proporData[10][0] = "propunha";
proporData[10][1] = "Propunha sempre novas soluções.";

const B1 = "B1";
const exception = Array(30).fill("Exception");
const propNotes = ["Conjugates exactly like PÔR with pro- prefix.", "", "", "", "", ...Array(25).fill("")];
const sugNotes = ["Stem change: e→i in 1st sg (sugiro).", "", "", "", "", ...Array(25).fill("")];

// Regular -AR verbs with examples
const evitarEx = [
  ["Evito conflitos.", "I avoid conflicts."], ["Evitas o tema?", "Do you avoid the topic?"], ["Ela evita discussões.", "She avoids arguments."], ["Evitamos problemas.", "We avoid problems."], ["Eles evitam o assunto.", "They avoid the subject."],
  ["Evitei o confronto.", "I avoided the confrontation."], ["Evitaste a reunião?", "Did you avoid the meeting?"], ["Ele evitou o tema.", "He avoided the topic."], ["Evitámos discussões.", "We avoided arguments."], ["Evitaram o conflito.", "They avoided the conflict."],
  ["Eu evitava conflitos.", "I used to avoid conflicts."], ["Tu evitavas o tema?", "Did you use to avoid the topic?"], ["Ela evitava discussões.", "She used to avoid arguments."], ["Evitávamos problemas.", "We used to avoid problems."], ["Evitavam o assunto.", "They used to avoid the subject."],
  ["Evitarei o confronto.", "I will avoid the confrontation."], ["Evitarás a reunião?", "Will you avoid the meeting?"], ["Ela evitará o tema.", "She will avoid the topic."], ["Evitaremos discussões.", "We will avoid arguments."], ["Evitarão o conflito.", "They will avoid the conflict."],
  ["Evitaria conflitos.", "I would avoid conflicts."], ["Evitarias o tema?", "Would you avoid the topic?"], ["Ela evitaria discussões.", "She would avoid arguments."], ["Evitaríamos problemas.", "We would avoid problems."], ["Evitariam o assunto.", "They would avoid the subject."],
  ["Quero que evite conflitos.", "I want you to avoid conflicts."], ["Espero que evites o tema.", "I hope you avoid the topic."], ["Convém que ela evite.", "She should avoid it."], ["É importante que evitemos.", "It's important that we avoid."], ["Exijo que evitem discussões.", "I demand they avoid arguments."],
];

const julgarData = [
  ["julgo", "Julgo que tens razão.", "I think you're right."], ["julgas", "Julgas bem?", "Do you judge well?"], ["julga", "Ela julga com imparcialidade.", "She judges impartially."], ["julgamos", "Julgamos os factos.", "We judge the facts."], ["julgam", "Eles julgam pela aparência.", "They judge by appearance."],
  ["julguei", "Julguei mal a situação.", "I misjudged the situation."], ["julgaste", "Julgaste a tua prima?", "Did you judge your cousin?"], ["julgou", "Ele julgou o caso.", "He judged the case."], ["julgámos", "Julgámos o concurso.", "We judged the contest."], ["julgaram", "Julgaram o réu.", "They judged the defendant."],
  ["julgava", "Eu julgava mal.", "I used to misjudge."], ["julgavas", "Tu julgavas pelos factos?", "Did you use to judge by facts?"], ["julgava", "Ela julgava com justiça.", "She used to judge fairly."], ["julgávamos", "Julgávamos concursos.", "We used to judge contests."], ["julgavam", "Julgavam pela aparência.", "They used to judge by appearance."],
  ["julgarei", "Julgarei com imparcialidade.", "I will judge impartially."], ["julgarás", "Julgarás o caso?", "Will you judge the case?"], ["julgará", "Ela julgará o concurso.", "She will judge the contest."], ["julgaremos", "Julgaremos pelos factos.", "We will judge by facts."], ["julgarão", "Julgarão o réu.", "They will judge the defendant."],
  ["julgaria", "Julgaria com justiça.", "I would judge fairly."], ["julgarias", "Julgarias mal?", "Would you misjudge?"], ["julgaria", "Ela julgaria o caso.", "She would judge the case."], ["julgaríamos", "Julgaríamos imparciais.", "We would judge impartially."], ["julgariam", "Julgariam pela lei.", "They would judge by law."],
  ["julgue", "Quero que julgue com justiça.", "I want you to judge fairly."], ["julgues", "Espero que julgues bem.", "I hope you judge well."], ["julgue", "Convém que ela julgue.", "She should judge."], ["julguemos", "É preciso que julguemos.", "We need to judge."], ["julguem", "Exijo que julguem pelos factos.", "I demand they judge by facts."],
];

// arExamples for regular -AR verbs (generic)
function arExamples(stem, key, verb) {
  const k = key.toLowerCase();
  const s = stem;
  return [
    [s.charAt(0).toUpperCase() + s.slice(1) + "o.", "I " + verb + "."], [s.charAt(0).toUpperCase() + s.slice(1) + "as?", "Do you " + verb + "?"], ["Ela " + s + "a.", "She " + verb + "s."], ["Nós " + s + "amos.", "We " + verb + "."], ["Eles " + s + "am.", "They " + verb + "."],
    [s.charAt(0).toUpperCase() + s.slice(1) + "ei.", "I " + verb + "d."], [s.charAt(0).toUpperCase() + s.slice(1) + "aste?", "Did you " + verb + "?"], ["Ele " + s + "ou.", "He " + verb + "d."], ["Nós " + s + "ámos.", "We " + verb + "d."], ["Eles " + s + "aram.", "They " + verb + "d."],
    ["Eu " + s + "ava.", "I used to " + verb + "."], ["Tu " + s + "avas?", "Did you use to " + verb + "?"], ["Ela " + s + "ava.", "She used to " + verb + "."], ["Nós " + s + "ávamos.", "We used to " + verb + "."], ["Eles " + s + "avam.", "They used to " + verb + "."],
    [k.charAt(0).toUpperCase() + k.slice(1) + "ei.", "I will " + verb + "."], [k + "ás?", "Will you " + verb + "?"], ["Ela " + k + "á.", "She will " + verb + "."], [k.charAt(0).toUpperCase() + k.slice(1) + "emos.", "We will " + verb + "."], ["Eles " + k + "ão.", "They will " + verb + "."],
    [k.charAt(0).toUpperCase() + k.slice(1) + "ia.", "I would " + verb + "."], [k + "ias?", "Would you " + verb + "?"], ["Ela " + k + "ia.", "She would " + verb + "."], [k.charAt(0).toUpperCase() + k.slice(1) + "íamos.", "We would " + verb + "."], ["Eles " + k + "iam.", "They would " + verb + "."],
    ["Quero que " + s.slice(0, -2) + "e.", "I want you to " + verb + "."], ["Espero que " + s.slice(0, -2) + "es.", "I hope you " + verb + "."], ["Convém que ela " + s.slice(0, -2) + "e.", "She should " + verb + "."], ["É preciso que " + s.slice(0, -2) + "emos.", "We need to " + verb + "."], ["Exijo que " + s.slice(0, -2) + "em.", "I demand they " + verb + "."],
  ];
}

// Custom examples for remaining verbs
const desenvolverEx = [
  ["Desenvolvo novas competências.", "I develop new skills."], ["Desenvolves projetos?", "Do you develop projects?"], ["Ela desenvolve software.", "She develops software."], ["Desenvolvemos a ideia.", "We develop the idea."], ["Eles desenvolvem aplicações.", "They develop applications."],
  ["Desenvolvi um plano.", "I developed a plan."], ["Desenvolveste o projeto?", "Did you develop the project?"], ["Ele desenvolveu a aplicação.", "He developed the app."], ["Desenvolvemos a estratégia.", "We developed the strategy."], ["Desenvolveram o produto.", "They developed the product."],
  ["Eu desenvolvia projetos.", "I used to develop projects."], ["Tu desenvolvias competências?", "Did you use to develop skills?"], ["Ela desenvolvia software.", "She used to develop software."], ["Desenvolvíamos aplicações.", "We used to develop applications."], ["Desenvolviam novos produtos.", "They used to develop new products."],
  ["Desenvolverei novas competências.", "I will develop new skills."], ["Desenvolverás o projeto?", "Will you develop the project?"], ["Ela desenvolverá a aplicação.", "She will develop the app."], ["Desenvolveremos a estratégia.", "We will develop the strategy."], ["Desenvolverão o produto.", "They will develop the product."],
  ["Desenvolveria se tivesse tempo.", "I would develop if I had time."], ["Desenvolverias o projeto?", "Would you develop the project?"], ["Ela desenvolveria a aplicação.", "She would develop the app."], ["Desenvolveríamos a ideia.", "We would develop the idea."], ["Desenvolveriam o software.", "They would develop the software."],
  ["Quero que desenvolva competências.", "I want you to develop skills."], ["Espero que desenvolvas o projeto.", "I hope you develop the project."], ["Convém que ela desenvolva.", "She should develop."], ["É importante que desenvolvamos.", "It's important that we develop."], ["Exijo que desenvolvam a aplicação.", "I demand they develop the app."],
];

const imaginarEx = [
  ["Imagino o futuro.", "I imagine the future."], ["Imaginas outra solução?", "Do you imagine another solution?"], ["Ela imagina cenários.", "She imagines scenarios."], ["Imaginamos possibilidades.", "We imagine possibilities."], ["Eles imaginam um mundo melhor.", "They imagine a better world."],
  ["Imaginei tudo diferente.", "I imagined everything different."], ["Imaginaste o resultado?", "Did you imagine the result?"], ["Ele imaginou uma solução.", "He imagined a solution."], ["Imaginámos cenários.", "We imagined scenarios."], ["Imaginaram o pior.", "They imagined the worst."],
  ["Eu imaginava o futuro.", "I used to imagine the future."], ["Tu imaginavas cenários?", "Did you use to imagine scenarios?"], ["Ela imaginava possibilidades.", "She used to imagine possibilities."], ["Imaginávamos soluções.", "We used to imagine solutions."], ["Imaginavam um mundo melhor.", "They used to imagine a better world."],
  ["Imaginarei o resultado.", "I will imagine the result."], ["Imaginarás outra solução?", "Will you imagine another solution?"], ["Ela imaginará cenários.", "She will imagine scenarios."], ["Imaginaremos possibilidades.", "We will imagine possibilities."], ["Imaginarão o futuro.", "They will imagine the future."],
  ["Imaginaria outra solução.", "I would imagine another solution."], ["Imaginarias o resultado?", "Would you imagine the result?"], ["Ela imaginaria cenários.", "She would imagine scenarios."], ["Imaginaríamos possibilidades.", "We would imagine possibilities."], ["Imaginariam o pior.", "They would imagine the worst."],
  ["Quero que imagines outra solução.", "I want you to imagine another solution."], ["Espero que imagines.", "I hope you imagine."], ["Convém que ela imagine.", "She should imagine."], ["É importante que imaginemos.", "It's important that we imagine."], ["Exijo que imaginem cenários.", "I demand they imagine scenarios."],
];

const investigarEx = [
  ["Investigo o caso.", "I investigate the case."], ["Investigas o assunto?", "Do you investigate the matter?"], ["Ela investiga o crime.", "She investigates the crime."], ["Investigamos as causas.", "We investigate the causes."], ["Eles investigam o incidente.", "They investigate the incident."],
  ["Investiguei o problema.", "I investigated the problem."], ["Investigaste o caso?", "Did you investigate the case?"], ["Ele investigou o crime.", "He investigated the crime."], ["Investigámos as causas.", "We investigated the causes."], ["Investigaram o incidente.", "They investigated the incident."],
  ["Eu investigava casos.", "I used to investigate cases."], ["Tu investigavas crimes?", "Did you use to investigate crimes?"], ["Ela investigava incidentes.", "She used to investigate incidents."], ["Investigávamos problemas.", "We used to investigate problems."], ["Investigavam as causas.", "They used to investigate causes."],
  ["Investigarei o caso.", "I will investigate the case."], ["Investigarás o assunto?", "Will you investigate the matter?"], ["Ela investigará o crime.", "She will investigate the crime."], ["Investigaremos as causas.", "We will investigate the causes."], ["Investigarão o incidente.", "They will investigate the incident."],
  ["Investigaría o caso.", "I would investigate the case."], ["Investigarías o assunto?", "Would you investigate the matter?"], ["Ela investigaria o crime.", "She would investigate the crime."], ["Investigaríamos as causas.", "We would investigate the causes."], ["Investigariam o incidente.", "They would investigate the incident."],
  ["Quero que investigue o caso.", "I want you to investigate the case."], ["Espero que investigues.", "I hope you investigate."], ["Convém que ela investigue.", "She should investigate."], ["É preciso que investiguemos.", "We need to investigate."], ["Exijo que investiguem o incidente.", "I demand they investigate the incident."],
];

const negociarEx = [
  ["Negocio com o cliente.", "I negotiate with the client."], ["Negocias o preço?", "Do you negotiate the price?"], ["Ela negocia o contrato.", "She negotiates the contract."], ["Negociamos as condições.", "We negotiate the terms."], ["Eles negociam o acordo.", "They negotiate the agreement."],
  ["Negociei o salário.", "I negotiated the salary."], ["Negociaste o contrato?", "Did you negotiate the contract?"], ["Ele negociou o acordo.", "He negotiated the agreement."], ["Negociámos as condições.", "We negotiated the terms."], ["Negociaram o preço.", "They negotiated the price."],
  ["Eu negociava contratos.", "I used to negotiate contracts."], ["Tu negociavas preços?", "Did you use to negotiate prices?"], ["Ela negociava acordos.", "She used to negotiate agreements."], ["Negociávamos condições.", "We used to negotiate terms."], ["Negociavam contratos.", "They used to negotiate contracts."],
  ["Negociarei o contrato.", "I will negotiate the contract."], ["Negociarás o preço?", "Will you negotiate the price?"], ["Ela negociará o acordo.", "She will negotiate the agreement."], ["Negociaremos as condições.", "We will negotiate the terms."], ["Negociarão o acordo.", "They will negotiate the agreement."],
  ["Negociaria o preço.", "I would negotiate the price."], ["Negociarias o contrato?", "Would you negotiate the contract?"], ["Ela negociaria o acordo.", "She would negotiate the agreement."], ["Negociaríamos as condições.", "We would negotiate the terms."], ["Negociariam o acordo.", "They would negotiate the agreement."],
  ["Quero que negocie o contrato.", "I want you to negotiate the contract."], ["Espero que negocies o preço.", "I hope you negotiate the price."], ["Convém que ela negocie.", "She should negotiate."], ["É importante que negociemos.", "It's important that we negotiate."], ["Exijo que negociem o acordo.", "I demand they negotiate the agreement."],
];

const resolverEx = [
  ["Resolvo o problema.", "I solve the problem."], ["Resolves conflitos?", "Do you resolve conflicts?"], ["Ela resolve questões.", "She resolves issues."], ["Resolvemos a situação.", "We resolve the situation."], ["Eles resolvem os problemas.", "They solve the problems."],
  ["Resolvi o caso.", "I resolved the case."], ["Resolveste o conflito?", "Did you resolve the conflict?"], ["Ele resolveu a questão.", "He resolved the issue."], ["Resolvemos a situação.", "We resolved the situation."], ["Resolveram os problemas.", "They resolved the problems."],
  ["Eu resolvia conflitos.", "I used to resolve conflicts."], ["Tu resolvias questões?", "Did you use to resolve issues?"], ["Ela resolvia problemas.", "She used to resolve problems."], ["Resolvíamos situações.", "We used to resolve situations."], ["Resolviam conflitos.", "They used to resolve conflicts."],
  ["Resolverei o problema.", "I will solve the problem."], ["Resolverás o conflito?", "Will you resolve the conflict?"], ["Ela resolverá a questão.", "She will resolve the issue."], ["Resolveremos a situação.", "We will resolve the situation."], ["Resolverão os problemas.", "They will resolve the problems."],
  ["Resolveria o problema.", "I would solve the problem."], ["Resolverias o conflito?", "Would you resolve the conflict?"], ["Ela resolveria a questão.", "She would resolve the issue."], ["Resolveríamos a situação.", "We would resolve the situation."], ["Resolveriam os problemas.", "They would resolve the problems."],
  ["Quero que resolva o problema.", "I want you to solve the problem."], ["Espero que resolvas.", "I hope you resolve."], ["Convém que ela resolva.", "She should resolve."], ["É preciso que resolvamos.", "We need to resolve."], ["Exijo que resolvam o conflito.", "I demand they resolve the conflict."],
];

const analisarEx = arExamples("analis", "ANALISAR", "analyse");
const criticarEx = [
  ["Critico a decisão.", "I criticise the decision."], ["Criticas o projeto?", "Do you criticise the project?"], ["Ela critica o governo.", "She criticises the government."], ["Criticamos a política.", "We criticise the policy."], ["Eles criticam a proposta.", "They criticise the proposal."],
  ["Critiquei o relatório.", "I criticised the report."], ["Criticaste a decisão?", "Did you criticise the decision?"], ["Ele criticou o projeto.", "He criticised the project."], ["Criticámos a política.", "We criticised the policy."], ["Criticaram a proposta.", "They criticised the proposal."],
  ["Eu criticava o governo.", "I used to criticise the government."], ["Tu criticavas?", "Did you use to criticise?"], ["Ela criticava decisões.", "She used to criticise decisions."], ["Criticávamos projetos.", "We used to criticise projects."], ["Criticavam propostas.", "They used to criticise proposals."],
  ["Criticarei a decisão.", "I will criticise the decision."], ["Criticarás o projeto?", "Will you criticise the project?"], ["Ela criticará o governo.", "She will criticise the government."], ["Criticaremos a política.", "We will criticise the policy."], ["Criticarão a proposta.", "They will criticise the proposal."],
  ["Criticaria a decisão.", "I would criticise the decision."], ["Criticarias o projeto?", "Would you criticise the project?"], ["Ela criticaria o governo.", "She would criticise the government."], ["Criticaríamos a política.", "We would criticise the policy."], ["Criticariam a proposta.", "They would criticise the proposal."],
  ["Quero que critique a decisão.", "I want you to criticise the decision."], ["Espero que critiques o projeto.", "I hope you criticise the project."], ["Convém que ela critique.", "She should criticise."], ["É preciso que critiquemos.", "We need to criticise."], ["Exijo que critiquem a proposta.", "I demand they criticise the proposal."],
];

const distinguirEx = [
  ["Distingo as diferenças.", "I distinguish the differences."], ["Distingues bem?", "Do you distinguish well?"], ["Ela distingue os factos.", "She distinguishes the facts."], ["Distinguimos os casos.", "We distinguish the cases."], ["Eles distinguem as opções.", "They distinguish the options."],
  ["Distinguí os detalhes.", "I distinguished the details."], ["Distinguiste os factos?", "Did you distinguish the facts?"], ["Ele distinguiu os casos.", "He distinguished the cases."], ["Distinguimos as opções.", "We distinguished the options."], ["Distinguíram os detalhes.", "They distinguished the details."],
  ["Eu distinguia os factos.", "I used to distinguish the facts."], ["Tu distinguías os casos?", "Did you use to distinguish the cases?"], ["Ela distinguia as opções.", "She used to distinguish the options."], ["Distinguíamos os detalhes.", "We used to distinguish the details."], ["Distinguiam as diferenças.", "They used to distinguish the differences."],
  ["Distinguirei os factos.", "I will distinguish the facts."], ["Distinguirás os casos?", "Will you distinguish the cases?"], ["Ela distinguirá as opções.", "She will distinguish the options."], ["Distinguiremos os detalhes.", "We will distinguish the details."], ["Distinguirão as diferenças.", "They will distinguish the differences."],
  ["Distinguiria os factos.", "I would distinguish the facts."], ["Distinguirias os casos?", "Would you distinguish the cases?"], ["Ela distinguiria as opções.", "She would distinguish the options."], ["Distinguiríamos os detalhes.", "We would distinguish the details."], ["Distinguiriam as diferenças.", "They would distinguish the differences."],
  ["Quero que distinga os factos.", "I want you to distinguish the facts."], ["Espero que distingas.", "I hope you distinguish."], ["Convém que ela distinga.", "She should distinguish."], ["É importante que distingamos.", "It's important that we distinguish."], ["Exijo que distingam os casos.", "I demand they distinguish the cases."],
];

const envolverEx = [
  ["Envolvo o cliente no projeto.", "I involve the client in the project."], ["Envolves-te na discussão?", "Do you get involved in the discussion?"], ["O projeto envolve muitas pessoas.", "The project involves many people."], ["Envolvemos a equipa no processo.", "We involve the team in the process."], ["Eles envolvem-se nas decisões.", "They get involved in decisions."],
  ["Envolvi o cliente no caso.", "I involved the client in the case."], ["Envolveste-te na investigação?", "Did you get involved in the investigation?"], ["Ele envolveu-se no projeto.", "He got involved in the project."], ["Envolvemos a equipa.", "We involved the team."], ["Envolveram-se nas decisões.", "They got involved in the decisions."],
  ["Eu envolvia o cliente.", "I used to involve the client."], ["Tu envolvias-te nas discussões?", "Did you use to get involved in discussions?"], ["Ela envolvia-se nas reuniões.", "She used to get involved in meetings."], ["Envolvíamos a equipa.", "We used to involve the team."], ["Envolviam-se nas decisões.", "They used to get involved in decisions."],
  ["Envolverei o cliente no projeto.", "I will involve the client in the project."], ["Envolverás a equipa?", "Will you involve the team?"], ["Ela envolver-se-á nas reuniões.", "She will get involved in meetings."], ["Envolveremos a equipa no processo.", "We will involve the team in the process."], ["Envolverão-se nas decisões.", "They will get involved in decisions."],
  ["Envolveria o cliente.", "I would involve the client."], ["Envolverias a equipa?", "Would you involve the team?"], ["Ela envolver-se-ia nas reuniões.", "She would get involved in meetings."], ["Envolveríamos a equipa.", "We would involve the team."], ["Envolver-se-iam nas decisões.", "They would get involved in decisions."],
  ["Quero que envolva o cliente.", "I want you to involve the client."], ["Espero que te envolvas.", "I hope you get involved."], ["Convém que ela se envolva.", "She should get involved."], ["É importante que nos envolvamos.", "It's important that we get involved."], ["Exijo que se envolvam.", "I demand they get involved."],
];

const influenciarEx = arExamples("influenci", "INFLUENCIAR", "influence");

const reconhecerEx = [
  ["Reconheço o meu erro.", "I recognise my mistake."], ["Reconheces o problema?", "Do you recognise the problem?"], ["Ela reconhece os factos.", "She recognises the facts."], ["Reconhecemos a dificuldade.", "We recognise the difficulty."], ["Eles reconhecem o valor.", "They recognise the value."],
  ["Reconheci o meu erro.", "I recognised my mistake."], ["Reconheceste o problema?", "Did you recognise the problem?"], ["Ele reconheceu os factos.", "He recognised the facts."], ["Reconhecemos a dificuldade.", "We recognised the difficulty."], ["Reconheceram o valor.", "They recognised the value."],
  ["Eu reconhecia os erros.", "I used to recognise mistakes."], ["Tu reconhecias o problema?", "Did you use to recognise the problem?"], ["Ela reconhecia os factos.", "She used to recognise the facts."], ["Reconhecíamos a dificuldade.", "We used to recognise the difficulty."], ["Reconheciam o valor.", "They used to recognise the value."],
  ["Reconhecerei o erro.", "I will recognise the mistake."], ["Reconhecerás o problema?", "Will you recognise the problem?"], ["Ela reconhecerá os factos.", "She will recognise the facts."], ["Reconheceremos a dificuldade.", "We will recognise the difficulty."], ["Reconhecerão o valor.", "They will recognise the value."],
  ["Reconheceria o erro.", "I would recognise the mistake."], ["Reconhecerias o problema?", "Would you recognise the problem?"], ["Ela reconheceria os factos.", "She would recognise the facts."], ["Reconheceríamos a dificuldade.", "We would recognise the difficulty."], ["Reconheceriam o valor.", "They would recognise the value."],
  ["Quero que reconheça o erro.", "I want you to recognise the mistake."], ["Espero que reconheças o problema.", "I hope you recognise the problem."], ["Convém que ela reconheça.", "She should recognise."], ["É importante que reconheçamos.", "It's important that we recognise."], ["Exijo que reconheçam os factos.", "I demand they recognise the facts."],
];

const duvidarEx = [
  ["Duvido que funcione.", "I doubt it will work."], ["Duvidas do resultado?", "Do you doubt the result?"], ["Ela duvida da decisão.", "She doubts the decision."], ["Duvidamos do projeto.", "We doubt the project."], ["Eles duvidam da proposta.", "They doubt the proposal."],
  ["Duvidei da sua palavra.", "I doubted his word."], ["Duvidaste do resultado?", "Did you doubt the result?"], ["Ele duvidou da decisão.", "He doubted the decision."], ["Duvidámos do projeto.", "We doubted the project."], ["Duvidaram da proposta.", "They doubted the proposal."],
  ["Eu duvidava sempre.", "I always used to doubt."], ["Tu duvidavas do resultado?", "Did you use to doubt the result?"], ["Ela duvidava da decisão.", "She used to doubt the decision."], ["Duvidávamos do projeto.", "We used to doubt the project."], ["Duvidavam da proposta.", "They used to doubt the proposal."],
  ["Duvidarei do resultado.", "I will doubt the result."], ["Duvidarás da decisão?", "Will you doubt the decision?"], ["Ela duvidará do projeto.", "She will doubt the project."], ["Duvidaremos da proposta.", "We will doubt the proposal."], ["Duvidarão do resultado.", "They will doubt the result."],
  ["Duvidaria do resultado.", "I would doubt the result."], ["Duvidarias da decisão?", "Would you doubt the decision?"], ["Ela duvidaria do projeto.", "She would doubt the project."], ["Duvidaríamos da proposta.", "We would doubt the proposal."], ["Duvidariam do resultado.", "They would doubt the result."],
  ["Quero que não duvides.", "I want you not to doubt."], ["Espero que não duvide.", "I hope you don't doubt."], ["Convém que ela não duvide.", "She shouldn't doubt."], ["É importante que não duvidemos.", "It's important that we don't doubt."], ["Exijo que não duvidem.", "I demand they don't doubt."],
];

const proibirData = [
  ["proíbo", "Proíbo fumar aqui.", "I forbid smoking here."], ["proíbes", "Proíbes a entrada?", "Do you forbid entry?"], ["proíbe", "A lei proíbe isso.", "The law forbids that."], ["proibimos", "Proibimos o acesso.", "We prohibit access."], ["proíbem", "Eles proíbem o uso.", "They prohibit use."],
  ["proibi", "Proibi a entrada.", "I forbade entry."], ["proibiste", "Proibiste o acesso?", "Did you prohibit access?"], ["proibiu", "Ele proibiu o uso.", "He prohibited use."], ["proibimos", "Proibimos isso.", "We prohibited that."], ["proibiram", "Proibiram o acesso.", "They prohibited access."],
  ["proibia", "Eu proibia fumar.", "I used to forbid smoking."], ["proibias", "Proibias a entrada?", "Did you use to forbid entry?"], ["proibia", "A lei proibia isso.", "The law used to forbid that."], ["proibíamos", "Proibíamos o acesso.", "We used to prohibit access."], ["proibiam", "Proibiam o uso.", "They used to prohibit use."],
  ["proibirei", "Proibirei a entrada.", "I will forbid entry."], ["proibirás", "Proibirás o acesso?", "Will you prohibit access?"], ["proibirá", "A lei proibirá isso.", "The law will forbid that."], ["proibiremos", "Proibiremos o uso.", "We will prohibit use."], ["proibirão", "Proibirão o acesso.", "They will prohibit access."],
  ["proibiria", "Proibiria a entrada.", "I would forbid entry."], ["proibirias", "Proibirias o acesso?", "Would you prohibit access?"], ["proibiria", "A lei proibiria isso.", "The law would forbid that."], ["proibiríamos", "Proibiríamos o uso.", "We would prohibit use."], ["proibiriam", "Proibiriam o acesso.", "They would prohibit access."],
  ["proíba", "Quero que proíba a entrada.", "I want you to forbid entry."], ["proíbas", "Espero que proíbas.", "I hope you forbid."], ["proíba", "Convém que a lei proíba.", "The law should forbid."], ["proibamos", "É importante que proibamos.", "It's important that we forbid."], ["proíbam", "Exijo que proíbam o uso.", "I demand they prohibit use."],
];

const convencerEx = [
  ["Convenço-o facilmente.", "I convince him easily."], ["Convences o teu pai?", "Do you convince your father?"], ["Ela convence o chefe.", "She convinces the boss."], ["Convencemos a equipa.", "We convince the team."], ["Eles convencem os clientes.", "They convince the clients."],
  ["Convenci-o ontem.", "I convinced him yesterday."], ["Convenceste o teu pai?", "Did you convince your father?"], ["Ele convenceu o chefe.", "He convinced the boss."], ["Convencemos a equipa.", "We convinced the team."], ["Convenceram os clientes.", "They convinced the clients."],
  ["Eu convencia facilmente.", "I used to convince easily."], ["Tu convencias o teu pai?", "Did you use to convince your father?"], ["Ela convencia o chefe.", "She used to convince the boss."], ["Convencíamos a equipa.", "We used to convince the team."], ["Convenciam os clientes.", "They used to convince the clients."],
  ["Convencerei o teu pai.", "I will convince your father."], ["Convencerás o chefe?", "Will you convince the boss?"], ["Ela convencerá a equipa.", "She will convince the team."], ["Convenceremos os clientes.", "We will convince the clients."], ["Convencerão o teu pai.", "They will convince your father."],
  ["Convenceria o teu pai.", "I would convince your father."], ["Convencerias o chefe?", "Would you convince the boss?"], ["Ela convenceria a equipa.", "She would convince the team."], ["Convenceríamos os clientes.", "We would convince the clients."], ["Convenceriam o teu pai.", "They would convince your father."],
  ["Quero que convença o teu pai.", "I want you to convince your father."], ["Espero que convenças o chefe.", "I hope you convince the boss."], ["Convém que ela convença.", "She should convince."], ["É importante que convençamos.", "It's important that we convince."], ["Exijo que convençam os clientes.", "I demand they convince the clients."],
];

const sonharEx = [
  ["Sonho com o futuro.", "I dream about the future."], ["Sonhas com ela?", "Do you dream about her?"], ["Ela sonha com viagens.", "She dreams about travelling."], ["Sonhamos com sucesso.", "We dream about success."], ["Eles sonham com férias.", "They dream about holidays."],
  ["Sonhei contigo.", "I dreamed about you."], ["Sonhaste com isso?", "Did you dream about that?"], ["Ele sonhou com a praia.", "He dreamed about the beach."], ["Sonhámos com o futuro.", "We dreamed about the future."], ["Sonharam com viagens.", "They dreamed about travelling."],
  ["Eu sonhava muito.", "I used to dream a lot."], ["Tu sonhavas com ela?", "Did you use to dream about her?"], ["Ela sonhava com viagens.", "She used to dream about travelling."], ["Sonhávamos com sucesso.", "We used to dream about success."], ["Sonhavam com férias.", "They used to dream about holidays."],
  ["Sonharei contigo.", "I will dream about you."], ["Sonharás com isso?", "Will you dream about that?"], ["Ela sonhará com a praia.", "She will dream about the beach."], ["Sonharemos com o futuro.", "We will dream about the future."], ["Sonharão com viagens.", "They will dream about travelling."],
  ["Sonharia contigo.", "I would dream about you."], ["Sonharias com isso?", "Would you dream about that?"], ["Ela sonharia com a praia.", "She would dream about the beach."], ["Sonharíamos com o futuro.", "We would dream about the future."], ["Sonhariam com viagens.", "They would dream about travelling."],
  ["Quero que sonhes com o futuro.", "I want you to dream about the future."], ["Espero que sonhe com sucesso.", "I hope you dream about success."], ["Convém que ela sonhe.", "She should dream."], ["É bom que sonhemos.", "It's good that we dream."], ["Quero que sonhem com férias.", "I want them to dream about holidays."],
];

const divertirEx = [
  ["Divirto-me muito na festa.", "I have a lot of fun at the party."], ["Divertes-te com os amigos?", "Do you have fun with friends?"], ["Ela diverte-se a dançar.", "She has fun dancing."], ["Divertimo-nos na praia.", "We have fun at the beach."], ["Eles divertem-se no concerto.", "They have fun at the concert."],
  ["Diverti-me imenso.", "I had great fun."], ["Divertiste-te na festa?", "Did you have fun at the party?"], ["Ele divertiu-se a bailar.", "He had fun dancing."], ["Divertimo-nos muito.", "We had great fun."], ["Divertiram-se no concerto.", "They had fun at the concert."],
  ["Eu divertia-me sempre.", "I always used to have fun."], ["Tu divertias-te com os amigos?", "Did you use to have fun with friends?"], ["Ela divertia-se a dançar.", "She used to have fun dancing."], ["Divertíamo-nos na praia.", "We used to have fun at the beach."], ["Divertiam-se nos concertos.", "They used to have fun at concerts."],
  ["Divertir-me-ei na festa.", "I will have fun at the party."], ["Divertir-te-ás com os amigos?", "Will you have fun with friends?"], ["Ela divertir-se-á a dançar.", "She will have fun dancing."], ["Divertir-nos-emos na praia.", "We will have fun at the beach."], ["Divertir-se-ão no concerto.", "They will have fun at the concert."],
  ["Divertir-me-ia na festa.", "I would have fun at the party."], ["Divertir-te-ias com os amigos?", "Would you have fun with friends?"], ["Ela divertir-se-ia a dançar.", "She would have fun dancing."], ["Divertir-nos-íamos na praia.", "We would have fun at the beach."], ["Divertir-se-iam no concerto.", "They would have fun at the concert."],
  ["Quero que te divirtas.", "I want you to have fun."], ["Espero que te divirta.", "I hope you have fun."], ["Convém que ela se divirta.", "She should have fun."], ["É importante que nos divirtamos.", "It's important that we have fun."], ["Quero que se divirtam.", "I want them to have fun."],
];

const queixarEx = [
  ["Queixo-me do serviço.", "I complain about the service."], ["Queixas-te do preço?", "Do you complain about the price?"], ["Ela queixa-se sempre.", "She always complains."], ["Queixamo-nos do atraso.", "We complain about the delay."], ["Eles queixam-se da comida.", "They complain about the food."],
  ["Queixei-me do serviço.", "I complained about the service."], ["Queixaste-te do preço?", "Did you complain about the price?"], ["Ele queixou-se do atraso.", "He complained about the delay."], ["Queixámo-nos da comida.", "We complained about the food."], ["Queixaram-se do serviço.", "They complained about the service."],
  ["Eu queixava-me sempre.", "I always used to complain."], ["Tu queixavas-te do preço?", "Did you use to complain about the price?"], ["Ela queixava-se do atraso.", "She used to complain about the delay."], ["Queixávamo-nos da comida.", "We used to complain about the food."], ["Queixavam-se do serviço.", "They used to complain about the service."],
  ["Queixar-me-ei do serviço.", "I will complain about the service."], ["Queixar-te-ás do preço?", "Will you complain about the price?"], ["Ela queixar-se-á do atraso.", "She will complain about the delay."], ["Queixar-nos-emos da comida.", "We will complain about the food."], ["Queixar-se-ão do serviço.", "They will complain about the service."],
  ["Queixar-me-ia do serviço.", "I would complain about the service."], ["Queixar-te-ias do preço?", "Would you complain about the price?"], ["Ela queixar-se-ia do atraso.", "She would complain about the delay."], ["Queixar-nos-íamos da comida.", "We would complain about the food."], ["Queixar-se-iam do serviço.", "They would complain about the service."],
  ["Quero que te queixes.", "I want you to complain."], ["Espero que te queixe.", "I hope you complain."], ["Convém que ela se queixe.", "She should complain."], ["É importante que nos queixemos.", "It's important that we complain."], ["Quero que se queixem.", "I want them to complain."],
];

const arrependerEx = [
  ["Arrependo-me do que disse.", "I regret what I said."], ["Arrependes-te da decisão?", "Do you regret the decision?"], ["Ela arrepende-se de tudo.", "She regrets everything."], ["Arrependemo-nos do erro.", "We regret the mistake."], ["Eles arrependem-se da escolha.", "They regret the choice."],
  ["Arrependi-me do que disse.", "I regretted what I said."], ["Arrependeste-te da decisão?", "Did you regret the decision?"], ["Ele arrependeu-se de tudo.", "He regretted everything."], ["Arrependemo-nos do erro.", "We regretted the mistake."], ["Arrependeram-se da escolha.", "They regretted the choice."],
  ["Eu arrependia-me sempre.", "I always used to regret."], ["Tu arrependias-te da decisão?", "Did you use to regret the decision?"], ["Ela arrependia-se de tudo.", "She used to regret everything."], ["Arrependíamo-nos do erro.", "We used to regret the mistake."], ["Arrependiam-se da escolha.", "They used to regret the choice."],
  ["Arrepender-me-ei do que disse.", "I will regret what I said."], ["Arrepender-te-ás da decisão?", "Will you regret the decision?"], ["Ela arrepender-se-á de tudo.", "She will regret everything."], ["Arrepender-nos-emos do erro.", "We will regret the mistake."], ["Arrepender-se-ão da escolha.", "They will regret the choice."],
  ["Arrepender-me-ia do que disse.", "I would regret what I said."], ["Arrepender-te-ias da decisão?", "Would you regret the decision?"], ["Ela arrepender-se-ia de tudo.", "She would regret everything."], ["Arrepender-nos-íamos do erro.", "We would regret the mistake."], ["Arrepender-se-iam da escolha.", "They would regret the choice."],
  ["Quero que te arrependas.", "I want you to regret."], ["Espero que te arrependa.", "I hope you regret."], ["Convém que ela se arrependa.", "She should regret."], ["É importante que nos arrependamos.", "It's important that we regret."], ["Quero que se arrependam.", "I want them to regret."],
];

const zangarEx = [
  ["Zango-me com facilidade.", "I get angry easily."], ["Zangas-te comigo?", "Are you angry with me?"], ["Ela zanga-se por tudo.", "She gets angry about everything."], ["Zangamo-nos com o atraso.", "We get angry about the delay."], ["Eles zangam-se frequentemente.", "They get angry frequently."],
  ["Zanguei-me com ele.", "I got angry with him."], ["Zangaste-te comigo?", "Did you get angry with me?"], ["Ele zangou-se por nada.", "He got angry about nothing."], ["Zangámo-nos com o atraso.", "We got angry about the delay."], ["Zangaram-se comigo.", "They got angry with me."],
  ["Eu zangava-me sempre.", "I always used to get angry."], ["Tu zangavas-te comigo?", "Did you use to get angry with me?"], ["Ela zangava-se por tudo.", "She used to get angry about everything."], ["Zangávamo-nos com os atrasos.", "We used to get angry about delays."], ["Zangavam-se frequentemente.", "They used to get angry frequently."],
  ["Zangar-me-ei contigo.", "I will get angry with you."], ["Zangar-te-ás comigo?", "Will you get angry with me?"], ["Ela zangar-se-á por tudo.", "She will get angry about everything."], ["Zangar-nos-emos com o atraso.", "We will get angry about the delay."], ["Zangar-se-ão comigo.", "They will get angry with me."],
  ["Zangar-me-ia contigo.", "I would get angry with you."], ["Zangar-te-ias comigo?", "Would you get angry with me?"], ["Ela zangar-se-ia por tudo.", "She would get angry about everything."], ["Zangar-nos-íamos com o atraso.", "We would get angry about the delay."], ["Zangar-se-iam comigo.", "They would get angry with me."],
  ["Quero que não te zangues.", "I want you not to get angry."], ["Espero que não te zangue.", "I hope you don't get angry."], ["Convém que ela não se zangue.", "She shouldn't get angry."], ["É importante que não nos zanguemos.", "It's important that we don't get angry."], ["Quero que não se zanguem.", "I want them not to get angry."],
];

// Main execution
const newKeys = [];

// Irregular verbs
data.verbs.PROPOR = { meta: { emoji: "💡", english: "to propose / to suggest", group: "Irregular", priority: "Essential", difficulty: "Intermediate", cefr: "B1", pronunciation: "proh-POHR" }, conjugations: fromData(B1, proporData, exception, propNotes) };
newKeys.push("PROPOR");

data.verbs.SUGERIR = { meta: { emoji: "💭", english: "to suggest", group: "Irregular", priority: "Core", difficulty: "Intermediate", cefr: "B1", pronunciation: "soo-zheh-REER" }, conjugations: fromData(B1, sugerirData, exception, sugNotes) };
newKeys.push("SUGERIR");

// Custom data verbs
data.verbs.JULGAR = { meta: { emoji: "⚖️", english: "to judge", group: "Regular -AR", priority: "Essential", difficulty: "Intermediate", cefr: "B1", pronunciation: "zhool-GAHR" }, conjugations: fromData(B1, julgarData, [], []) };
newKeys.push("JULGAR");

data.verbs.PROIBIR = { meta: { emoji: "🚫", english: "to forbid / to prohibit", group: "Regular -IR", priority: "Useful", difficulty: "Intermediate", cefr: "B1", pronunciation: "proh-ee-BEER" }, conjugations: fromData(B1, proibirData, exception, ["Stem change: o→ói (proíbo, proíbes, proíbe, proíbem)."]) };
newKeys.push("PROIBIR");

// Regular -AR verbs
const arVerbs = [
  { key: "EVITAR", stem: "evit", examples: evitarEx, meta: { emoji: "🚷", english: "to avoid", priority: "Essential", pronunciation: "eh-vee-TAHR" } },
  { key: "IMAGINAR", stem: "imagin", examples: imaginarEx, meta: { emoji: "🎭", english: "to imagine", priority: "Essential", pronunciation: "ee-mah-zhee-NAHR" } },
  { key: "INVESTIGAR", stem: "investig", examples: investigarEx, subjStem: "investigue", meta: { emoji: "🔍", english: "to investigate", priority: "Essential", pronunciation: "een-vehsh-tee-GAHR" } },
  { key: "NEGOCIAR", stem: "negoci", examples: negociarEx, meta: { emoji: "🤝", english: "to negotiate", priority: "Essential", pronunciation: "neh-goh-see-AHR" } },
  { key: "ANALISAR", stem: "analis", examples: analisarEx, subjStem: "analise", meta: { emoji: "📊", english: "to analyse", priority: "Core", pronunciation: "ah-nah-lee-ZAHR" } },
  { key: "CRITICAR", stem: "critic", examples: criticarEx, subjStem: "critique", meta: { emoji: "📝", english: "to criticise", priority: "Core", pronunciation: "kree-tee-KAHR" } },
  { key: "INFLUENCIAR", stem: "influenci", examples: influenciarEx, subjStem: "influencie", meta: { emoji: "👑", english: "to influence", priority: "Core", pronunciation: "een-floo-ehn-see-AHR" } },
  { key: "DUVIDAR", stem: "duvid", examples: duvidarEx, meta: { emoji: "❓", english: "to doubt", priority: "Useful", pronunciation: "doo-vee-DAHR" } },
  { key: "SONHAR", stem: "sonh", examples: sonharEx, meta: { emoji: "💭", english: "to dream", priority: "Useful", pronunciation: "soh-NYAHR" } },
  { key: "QUEIXAR", stem: "queix", examples: queixarEx, meta: { emoji: "😤", english: "to complain (queixar-se)", priority: "Useful", pronunciation: "kay-SHAHR" } },
  { key: "ZANGAR", stem: "zang", examples: zangarEx, subjStem: "zangue", meta: { emoji: "😠", english: "to get angry (zangar-se)", priority: "Useful", pronunciation: "zahn-GAHR" } },
];
arVerbs.forEach(({ key, stem, examples, subjStem, meta }) => {
  data.verbs[key] = { meta: { ...meta, group: "Regular -AR", difficulty: "Intermediate", cefr: "B1" }, conjugations: fromData(B1, makeAR(key, stem, examples, subjStem), [], []) };
  newKeys.push(key);
});

// Regular -ER verbs
const erVerbs = [
  { key: "DESENVOLVER", stem: "desenvolv", examples: desenvolverEx, meta: { emoji: "📈", english: "to develop", priority: "Essential", pronunciation: "deh-zehn-vohl-VEHR" } },
  { key: "RESOLVER", stem: "resolv", examples: resolverEx, pres: ["resolvo", "resolves", "resolve", "resolvemos", "resolvem"], meta: { emoji: "✅", english: "to solve / to resolve", priority: "Essential", pronunciation: "hreh-zohl-VEHR" } },
  { key: "ENVOLVER", stem: "envolv", examples: envolverEx, meta: { emoji: "🔄", english: "to involve", priority: "Core", pronunciation: "ehn-vohl-VEHR" } },
  { key: "RECONHECER", stem: "reconhec", examples: reconhecerEx, pres: ["reconheço", "reconheces", "reconhece", "reconhecemos", "reconhecem"], subj: ["reconheça", "reconheças", "reconheça", "reconheçamos", "reconheçam"], meta: { emoji: "👁️", english: "to recognise", priority: "Core", pronunciation: "hreh-koh-nyeh-SEHR" } },
  { key: "CONVENCER", stem: "convenc", examples: convencerEx, pres: ["convenço", "convences", "convence", "convencemos", "convencem"], subj: ["convença", "convenças", "convença", "convençamos", "convençam"], meta: { emoji: "💬", english: "to convince", priority: "Useful", pronunciation: "kohn-vehn-SEHR" } },
  { key: "ARREPENDER", stem: "arrepend", examples: arrependerEx, meta: { emoji: "😔", english: "to regret (arrepender-se)", priority: "Useful", pronunciation: "ah-hreh-pehn-DEHR" } },
];
erVerbs.forEach(({ key, stem, examples, pres, subj, meta }) => {
  data.verbs[key] = { meta: { ...meta, group: "Regular -ER", difficulty: "Intermediate", cefr: "B1" }, conjugations: fromData(B1, makeER(key, stem, examples, pres, subj), [], []) };
  newKeys.push(key);
});

// Regular -IR verbs
data.verbs.DISTINGUIR = { meta: { emoji: "🔎", english: "to distinguish", group: "Regular -IR", priority: "Core", difficulty: "Intermediate", cefr: "B1", pronunciation: "deesh-teen-GEER" }, conjugations: fromData(B1, makeIR("DISTINGUIR", "disting", distinguirEx, ["distingo", "distingues", "distingue", "distinguimos", "distinguem"], ["distinga", "distingas", "distinga", "distingamos", "distingam"]), [], ["DISTINGUIR: keeps silent 'u' (distingo, distingues)."]) };
newKeys.push("DISTINGUIR");

data.verbs.DIVERTIR = { meta: { emoji: "🎉", english: "to have fun / to amuse (divertir-se)", group: "Regular -IR", priority: "Useful", difficulty: "Intermediate", cefr: "B1", pronunciation: "dee-vehr-TEER" }, conjugations: fromData(B1, makeIR("DIVERTIR", "divert", divertirEx, ["divirto", "divertes", "diverte", "divertimos", "divertem"], ["divirta", "divirtas", "divirta", "divertamos", "divirtam"]), [], ["Primarily reflexive (divertir-se). Stem change: e→i (divirto). EP: enclisis divirto-me."]) };
newKeys.push("DIVERTIR");

// Add to order
newKeys.forEach((k) => data.order.push(k));
if (data.totalVerbs !== undefined) data.totalVerbs = data.order.length;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added 23 B1 verbs. Total:", data.order.length);
