#!/usr/bin/env node
/**
 * Add 11 new A1/A2 verbs to verbs.json (Batch 1 — ACEITAR, BRINCAR, COZINHAR, DEMORAR, LAVAR, LEVANTAR, LIGAR, MARCAR, PREOCUPAR, SENTAR, SERVIR).
 * Inserts each verb in alphabetical position within the verbs object.
 * Run from project root: node scripts/add-batch1-11-verbs.js
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

// —— Regular -AR helper: stem for present/imperfect, inf for future/conditional, subjStem for subjunctive (e-ending)
function makeAR(key, stem, cefrV, examples) {
  const inf = key.toLowerCase();
  const subjStem = stem.slice(0, -1) + "e"; // e.g. aceit → aceite
  const forms = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subjStem, subjStem + "s", subjStem, subjStem + "mos", subjStem + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return fromRows(cefrV, rows);
}

// —— ACEITAR (regular -AR)
const aceitarEx = [
  ["Eu aceito a oferta.", "I accept the offer."], ["Tu aceitas cartão?", "Do you accept card?"], ["Ela aceita a proposta.", "She accepts the proposal."], ["Nós aceitamos a decisão.", "We accept the decision."], ["Eles aceitam encomendas.", "They accept orders."],
  ["Eu aceitei o trabalho.", "I accepted the job."], ["Tu aceitaste as condições?", "Did you accept the conditions?"], ["Ele aceitou o convite.", "He accepted the invitation."], ["Nós aceitámos o desafio.", "We accepted the challenge."], ["Eles aceitaram a oferta.", "They accepted the offer."],
  ["Eu aceitava críticas.", "I used to accept criticism."], ["Tu aceitavas pagamentos.", "You used to accept payments."], ["Ela aceitava encomendas.", "She used to accept orders."], ["Nós aceitávamos cheques.", "We used to accept cheques."], ["Eles aceitavam propostas.", "They used to accept proposals."],
  ["Aceitarei o convite.", "I will accept the invitation."], ["Aceitarás as condições?", "Will you accept the conditions?"], ["Ela aceitará a oferta.", "She will accept the offer."], ["Aceitaremos a proposta.", "We will accept the proposal."], ["Eles aceitarão o trabalho.", "They will accept the job."],
  ["Aceitaria se pudesse.", "I would accept if I could."], ["Aceitarias a oferta?", "Would you accept the offer?"], ["Ela aceitaria o convite.", "She would accept the invitation."], ["Aceitaríamos a proposta.", "We would accept the proposal."], ["Eles aceitariam as condições.", "They would accept the conditions."],
  ["Espero que eu aceite.", "I hope I accept."], ["Quero que aceites a oferta.", "I want you to accept the offer."], ["É bom que ela aceite.", "It's good that she accepts."], ["Convém que aceitemos.", "We should accept."], ["Exijo que aceitem a proposta.", "I demand they accept the proposal."],
];
// —— BRINCAR (c→qu before e)
const brincarEx = [
  ["Eu brinco no jardim.", "I play in the garden."], ["Tu brincas com os miúdos?", "Do you play with the kids?"], ["Ela brinca com o cão.", "She plays with the dog."], ["Nós brincamos na rua.", "We play in the street."], ["Eles brincam no parque.", "They play in the park."],
  ["Eu brinquei muito.", "I played a lot."], ["Tu brincaste com eles?", "Did you play with them?"], ["Ele brincou na praia.", "He played on the beach."], ["Nós brincámos no jardim.", "We played in the garden."], ["Eles brincaram o dia todo.", "They played all day."],
  ["Eu brincava aqui.", "I used to play here."], ["Tu brincavas com ela?", "Did you use to play with her?"], ["Ela brincava no parque.", "She used to play in the park."], ["Nós brincávamos juntos.", "We used to play together."], ["Eles brincavam na escola.", "They used to play at school."],
  ["Brincarei contigo.", "I will play with you."], ["Brincarás com os miúdos?", "Will you play with the kids?"], ["Ela brincará no jardim.", "She will play in the garden."], ["Brincaremos amanhã.", "We will play tomorrow."], ["Eles brincarão no parque.", "They will play in the park."],
  ["Brincaria se tivesse tempo.", "I would play if I had time."], ["Brincarias comigo?", "Would you play with me?"], ["Ela brincaria connosco.", "She would play with us."], ["Brincaríamos no jardim.", "We would play in the garden."], ["Eles brincariam na praia.", "They would play on the beach."],
  ["Espero que eu brinque.", "I hope I play."], ["Quero que brinques com eles.", "I want you to play with them."], ["É bom que ela brinque.", "It's good that she plays."], ["Convém que brinquemos.", "We should play."], ["Quero que brinquem no parque.", "I want them to play in the park."],
];
const brincarRows = (() => {
  const stem = "brinc", inf = "brincar", subj = "brinque";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [subj + "i", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], brincarEx[ti * 5 + pi][0], brincarEx[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— COZINHAR
const cozinharEx = [
  ["Eu cozinho ao jantar.", "I cook at dinner."], ["Tu cozinhas bem?", "Do you cook well?"], ["Ela cozinha todos os dias.", "She cooks every day."], ["Nós cozinhamos em casa.", "We cook at home."], ["Eles cozinham no restaurante.", "They cook at the restaurant."],
  ["Eu cozinhei a massa.", "I cooked the pasta."], ["Tu cozinhaste o peixe?", "Did you cook the fish?"], ["Ele cozinhou o jantar.", "He cooked dinner."], ["Nós cozinhámos a sopa.", "We cooked the soup."], ["Eles cozinharam o bife.", "They cooked the steak."],
  ["Eu cozinhava muito.", "I used to cook a lot."], ["Tu cozinhavas em casa?", "Did you use to cook at home?"], ["Ela cozinhava aos domingos.", "She used to cook on Sundays."], ["Nós cozinhávamos juntos.", "We used to cook together."], ["Eles cozinhavam no café.", "They used to cook at the café."],
  ["Cozinharei amanhã.", "I will cook tomorrow."], ["Cozinharás o jantar?", "Will you cook dinner?"], ["Ela cozinhará a massa.", "She will cook the pasta."], ["Cozinharemos em casa.", "We will cook at home."], ["Eles cozinharão o peixe.", "They will cook the fish."],
  ["Cozinharia se tivesse tempo.", "I would cook if I had time."], ["Cozinharias para nós?", "Would you cook for us?"], ["Ela cozinharia o bife.", "She would cook the steak."], ["Cozinharíamos a sopa.", "We would cook the soup."], ["Eles cozinhariam o jantar.", "They would cook dinner."],
  ["Espero que eu cozinhe.", "I hope I cook."], ["Quero que cozinhes o peixe.", "I want you to cook the fish."], ["É bom que ela cozinhe.", "It's good that she cooks."], ["Convém que cozinhemos.", "We should cook."], ["Quero que cozinhem o jantar.", "I want them to cook dinner."],
];
// —— DEMORAR
const demorarEx = [
  ["Eu demoro muito.", "I take long."], ["Tu demoras a chegar?", "Do you take long to arrive?"], ["Ela demora no banho.", "She takes long in the shower."], ["Nós demoramos uma hora.", "We take an hour."], ["Eles demoram a responder.", "They take long to reply."],
  ["Eu demorei dez minutos.", "I took ten minutes."], ["Tu demoraste muito?", "Did you take long?"], ["Ele demorou a chegar.", "He took long to arrive."], ["Nós demorámos duas horas.", "We took two hours."], ["Eles demoraram a decidir.", "They took long to decide."],
  ["Eu demorava no caminho.", "I used to take long on the way."], ["Tu demoravas no banho?", "Did you use to take long in the shower?"], ["Ela demorava a vestir-se.", "She used to take long to get dressed."], ["Nós demorávamos muito.", "We used to take long."], ["Eles demoravam a pagar.", "They used to take long to pay."],
  ["Demorarei pouco.", "I will not take long."], ["Demorarás muito?", "Will you take long?"], ["Ela demorará uma hora.", "She will take an hour."], ["Demoraremos dez minutos.", "We will take ten minutes."], ["Eles demorarão a chegar.", "They will take long to arrive."],
  ["Demoraria mais se chovesse.", "I would take longer if it rained."], ["Demorarias muito?", "Would you take long?"], ["Ela demoraria a responder.", "She would take long to reply."], ["Demoraríamos uma hora.", "We would take an hour."], ["Eles demorariam a decidir.", "They would take long to decide."],
  ["Espero que eu não demore.", "I hope I don't take long."], ["Quero que não demores.", "I want you not to take long."], ["É bom que ela não demore.", "It's good that she doesn't take long."], ["Convém que não demoremos.", "We should not take long."], ["Quero que não demorem.", "I want them not to take long."],
];
// —— LAVAR
const lavarEx = [
  ["Eu lavo a louça.", "I wash the dishes."], ["Tu lavas o carro?", "Do you wash the car?"], ["Ela lava a roupa.", "She washes the clothes."], ["Nós lavamos as mãos.", "We wash our hands."], ["Eles lavam a casa.", "They wash the house."],
  ["Eu lavei o cabelo.", "I washed my hair."], ["Tu lavaste a louça?", "Did you wash the dishes?"], ["Ele lavou o carro.", "He washed the car."], ["Nós lavámos a roupa.", "We washed the clothes."], ["Eles lavaram a cozinha.", "They washed the kitchen."],
  ["Eu lavava a louça.", "I used to wash the dishes."], ["Tu lavavas o carro?", "Did you use to wash the car?"], ["Ela lavava a roupa.", "She used to wash the clothes."], ["Nós lavávamos as mãos.", "We used to wash our hands."], ["Eles lavavam a casa.", "They used to wash the house."],
  ["Lavarei a louça.", "I will wash the dishes."], ["Lavarás o carro?", "Will you wash the car?"], ["Ela lavará a roupa.", "She will wash the clothes."], ["Lavaremos a cozinha.", "We will wash the kitchen."], ["Eles lavarão a casa.", "They will wash the house."],
  ["Lavaria a louça se tivesse tempo.", "I would wash the dishes if I had time."], ["Lavarias o carro?", "Would you wash the car?"], ["Ela lavaria a roupa.", "She would wash the clothes."], ["Lavaríamos a louça.", "We would wash the dishes."], ["Eles lavariam a casa.", "They would wash the house."],
  ["Espero que eu lave a louça.", "I hope I wash the dishes."], ["Quero que laves as mãos.", "I want you to wash your hands."], ["É bom que ela lave a roupa.", "It's good that she washes the clothes."], ["Convém que lavemos a louça.", "We should wash the dishes."], ["Quero que lavem as mãos.", "I want them to wash their hands."],
];
// —— LEVANTAR
const levantarEx = [
  ["Eu levanto-me cedo.", "I get up early."], ["Tu levantas-te às oito?", "Do you get up at eight?"], ["Ela levanta-se tarde.", "She gets up late."], ["Nós levantamo-nos cedo.", "We get up early."], ["Eles levantam-se às sete.", "They get up at seven."],
  ["Eu levantei-me às seis.", "I got up at six."], ["Tu levantaste-te cedo?", "Did you get up early?"], ["Ele levantou-se tarde.", "He got up late."], ["Nós levantámo-nos cedo.", "We got up early."], ["Eles levantaram-se às oito.", "They got up at eight."],
  ["Eu levantava-me cedo.", "I used to get up early."], ["Tu levantavas-te tarde?", "Did you use to get up late?"], ["Ela levantava-se às sete.", "She used to get up at seven."], ["Nós levantávamo-nos cedo.", "We used to get up early."], ["Eles levantavam-se às oito.", "They used to get up at eight."],
  ["Levantar-me-ei cedo.", "I will get up early."], ["Levantar-te-ás às oito?", "Will you get up at eight?"], ["Ela levantar-se-á cedo.", "She will get up early."], ["Levantar-nos-emos cedo.", "We will get up early."], ["Eles levantar-se-ão às sete.", "They will get up at seven."],
  ["Levantar-me-ia cedo.", "I would get up early."], ["Levantar-te-ias às oito?", "Would you get up at eight?"], ["Ela levantar-se-ia cedo.", "She would get up early."], ["Levantar-nos-íamos cedo.", "We would get up early."], ["Eles levantar-se-iam às sete.", "They would get up at seven."],
  ["Espero que eu me levante cedo.", "I hope I get up early."], ["Quero que te levantes.", "I want you to get up."], ["É bom que ela se levante.", "It's good that she gets up."], ["Convém que nos levantemos.", "We should get up."], ["Quero que se levantem cedo.", "I want them to get up early."],
];
// LEVANTAR uses reflexive; simple forms for future/conditional: levantararei, levantarás... (in EP often levantar-me-ei). Using non-reflexive for simplicity in examples for future/conditional: "Eu levantarei cedo" etc.
const levantarRows = (() => {
  const stem = "levant", inf = "levantar", subj = "levante";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const ex = [
    ["Eu levanto-me cedo.", "I get up early."], ["Tu levantas-te às oito?", "Do you get up at eight?"], ["Ela levanta-se tarde.", "She gets up late."], ["Nós levantamo-nos cedo.", "We get up early."], ["Eles levantam-se às sete.", "They get up at seven."],
    ["Eu levantei-me às seis.", "I got up at six."], ["Tu levantaste-te cedo?", "Did you get up early?"], ["Ele levantou-se tarde.", "He got up late."], ["Nós levantámo-nos cedo.", "We got up early."], ["Eles levantaram-se às oito.", "They got up at eight."],
    ["Eu levantava-me cedo.", "I used to get up early."], ["Tu levantavas-te tarde?", "Did you use to get up late?"], ["Ela levantava-se às sete.", "She used to get up at seven."], ["Nós levantávamo-nos cedo.", "We used to get up early."], ["Eles levantavam-se às oito.", "They used to get up at eight."],
    ["Eu levantarei cedo.", "I will get up early."], ["Tu levantarás às oito?", "Will you get up at eight?"], ["Ela levantará cedo.", "She will get up early."], ["Nós levantaremos cedo.", "We will get up early."], ["Eles levantarão às sete.", "They will get up at seven."],
    ["Eu levantaria cedo.", "I would get up early."], ["Tu levantarias às oito?", "Would you get up at eight?"], ["Ela levantaria cedo.", "She would get up early."], ["Nós levantaríamos cedo.", "We would get up early."], ["Eles levantariam às sete.", "They would get up at seven."],
    ["Espero que eu me levante cedo.", "I hope I get up early."], ["Quero que te levantes.", "I want you to get up."], ["É bom que ela se levante.", "It's good that she gets up."], ["Convém que nos levantemos.", "We should get up."], ["Quero que se levantem cedo.", "I want them to get up early."],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], ex[ti * 5 + pi][0], ex[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— LIGAR (g→gu before e)
const ligarEx = [
  ["Eu ligo ao João.", "I call João."], ["Tu ligas ao cliente?", "Do you call the client?"], ["Ela liga todos os dias.", "She calls every day."], ["Nós ligamos à família.", "We call the family."], ["Eles ligam do escritório.", "They call from the office."],
  ["Eu liguei ontem.", "I called yesterday."], ["Tu ligaste ao médico?", "Did you call the doctor?"], ["Ele ligou à noite.", "He called at night."], ["Nós ligámos ao hotel.", "We called the hotel."], ["Eles ligaram ao cliente.", "They called the client."],
  ["Eu ligava sempre.", "I used to call always."], ["Tu ligavas ao João?", "Did you use to call João?"], ["Ela ligava à mãe.", "She used to call her mother."], ["Nós ligávamos ao escritório.", "We used to call the office."], ["Eles ligavam aos clientes.", "They used to call the clients."],
  ["Ligarei amanhã.", "I will call tomorrow."], ["Ligarás ao João?", "Will you call João?"], ["Ela ligará à noite.", "She will call at night."], ["Ligaremos ao cliente.", "We will call the client."], ["Eles ligarão ao hotel.", "They will call the hotel."],
  ["Ligaria se tivesse tempo.", "I would call if I had time."], ["Ligarias ao médico?", "Would you call the doctor?"], ["Ela ligaria à família.", "She would call the family."], ["Ligaríamos ao hotel.", "We would call the hotel."], ["Eles ligariam ao cliente.", "They would call the client."],
  ["Espero que eu ligue ao João.", "I hope I call João."], ["Quero que ligues ao médico.", "I want you to call the doctor."], ["É bom que ela ligue.", "It's good that she calls."], ["Convém que liguemos ao hotel.", "We should call the hotel."], ["Quero que liguem ao cliente.", "I want them to call the client."],
];
const ligarRows = (() => {
  const stem = "lig", inf = "ligar", subj = "ligue";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [subj + "i", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], ligarEx[ti * 5 + pi][0], ligarEx[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— MARCAR (c→qu before e)
const marcarEx = [
  ["Eu marco uma reunião.", "I schedule a meeting."], ["Tu marcas a hora?", "Do you set the time?"], ["Ela marca o encontro.", "She schedules the meeting."], ["Nós marcamos a data.", "We set the date."], ["Eles marcam consultas.", "They book appointments."],
  ["Eu marquei a reunião.", "I scheduled the meeting."], ["Tu marcaste a hora?", "Did you set the time?"], ["Ele marcou o encontro.", "He scheduled the meeting."], ["Nós marcámos a data.", "We set the date."], ["Eles marcaram a consulta.", "They booked the appointment."],
  ["Eu marcava reuniões.", "I used to schedule meetings."], ["Tu marcavas a hora?", "Did you use to set the time?"], ["Ela marcava encontros.", "She used to schedule meetings."], ["Nós marcávamos as datas.", "We used to set the dates."], ["Eles marcavam consultas.", "They used to book appointments."],
  ["Marcarei uma reunião.", "I will schedule a meeting."], ["Marcarás a hora?", "Will you set the time?"], ["Ela marcará o encontro.", "She will schedule the meeting."], ["Marcaremos a data.", "We will set the date."], ["Eles marcarão a consulta.", "They will book the appointment."],
  ["Marcaria a reunião se pudesse.", "I would schedule the meeting if I could."], ["Marcarias a hora?", "Would you set the time?"], ["Ela marcaria o encontro.", "She would schedule the meeting."], ["Marcaríamos a data.", "We would set the date."], ["Eles marcariam a consulta.", "They would book the appointment."],
  ["Espero que eu marque a reunião.", "I hope I schedule the meeting."], ["Quero que marques a hora.", "I want you to set the time."], ["É bom que ela marque.", "It's good that she schedules."], ["Convém que marquemos a data.", "We should set the date."], ["Quero que marquem a consulta.", "I want them to book the appointment."],
];
const marcarRows = (() => {
  const stem = "marc", inf = "marcar", subj = "marque";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [subj + "i", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], marcarEx[ti * 5 + pi][0], marcarEx[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— PREOCUPAR
const preocuparEx = [
  ["Eu preocupo-me muito.", "I worry a lot."], ["Tu preocupas-te com isso?", "Do you worry about that?"], ["Ela preocupa-se com o trabalho.", "She worries about work."], ["Nós preocupamo-nos com a família.", "We worry about the family."], ["Eles preocupam-se com o futuro.", "They worry about the future."],
  ["Eu preocupei-me com ele.", "I worried about him."], ["Tu preocupaste-te?", "Did you worry?"], ["Ele preocupou-se com a nota.", "He worried about the grade."], ["Nós preocupámo-nos com o exame.", "We worried about the exam."], ["Eles preocuparam-se com o resultado.", "They worried about the result."],
  ["Eu preocupava-me muito.", "I used to worry a lot."], ["Tu preocupavas-te com isso?", "Did you use to worry about that?"], ["Ela preocupava-se com os filhos.", "She used to worry about the children."], ["Nós preocupávamo-nos com tudo.", "We used to worry about everything."], ["Eles preocupavam-se com o trabalho.", "They used to worry about work."],
  ["Preocupar-me-ei com isso.", "I will worry about that."], ["Preocupar-te-ás?", "Will you worry?"], ["Ela preocupar-se-á.", "She will worry."], ["Preocupar-nos-emos com o exame.", "We will worry about the exam."], ["Eles preocupar-se-ão.", "They will worry."],
  ["Preocupar-me-ia se soubesse.", "I would worry if I knew."], ["Preocupar-te-ias com isso?", "Would you worry about that?"], ["Ela preocupar-se-ia.", "She would worry."], ["Preocupar-nos-íamos.", "We would worry."], ["Eles preocupar-se-iam.", "They would worry."],
  ["Espero que eu não me preocupe.", "I hope I don't worry."], ["Quero que não te preocupes.", "I want you not to worry."], ["É bom que ela não se preocupe.", "It's good that she doesn't worry."], ["Convém que não nos preocupemos.", "We should not worry."], ["Quero que não se preocupem.", "I want them not to worry."],
];
const preocuparRows = (() => {
  const stem = "preocup", inf = "preocupar", subj = "preocupe";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const ex = [
    ["Eu preocupo-me muito.", "I worry a lot."], ["Tu preocupas-te com isso?", "Do you worry about that?"], ["Ela preocupa-se com o trabalho.", "She worries about work."], ["Nós preocupamo-nos com a família.", "We worry about the family."], ["Eles preocupam-se com o futuro.", "They worry about the future."],
    ["Eu preocupei-me com ele.", "I worried about him."], ["Tu preocupaste-te?", "Did you worry?"], ["Ele preocupou-se com a nota.", "He worried about the grade."], ["Nós preocupámo-nos com o exame.", "We worried about the exam."], ["Eles preocuparam-se com o resultado.", "They worried about the result."],
    ["Eu preocupava-me muito.", "I used to worry a lot."], ["Tu preocupavas-te com isso?", "Did you use to worry about that?"], ["Ela preocupava-se com os filhos.", "She used to worry about the children."], ["Nós preocupávamo-nos com tudo.", "We used to worry about everything."], ["Eles preocupavam-se com o trabalho.", "They used to worry about work."],
    ["Eu preocuparei com isso.", "I will worry about that."], ["Tu preocuparás?", "Will you worry?"], ["Ela preocupará.", "She will worry."], ["Nós preocuparemos com o exame.", "We will worry about the exam."], ["Eles preocuparão.", "They will worry."],
    ["Eu preocuparia se soubesse.", "I would worry if I knew."], ["Tu preocuparias com isso?", "Would you worry about that?"], ["Ela preocuparia.", "She would worry."], ["Nós preocuparíamos.", "We would worry."], ["Eles preocupariam.", "They would worry."],
    ["Espero que eu não me preocupe.", "I hope I don't worry."], ["Quero que não te preocupes.", "I want you not to worry."], ["É bom que ela não se preocupe.", "It's good that she doesn't worry."], ["Convém que não nos preocupemos.", "We should not worry."], ["Quero que não se preocupem.", "I want them not to worry."],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], ex[ti * 5 + pi][0], ex[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— SENTAR
const sentarEx = [
  ["Eu sento-me aqui.", "I sit down here."], ["Tu sentas-te no sofá?", "Do you sit on the sofa?"], ["Ela senta-se à mesa.", "She sits at the table."], ["Nós sentamo-nos no jardim.", "We sit in the garden."], ["Eles sentam-se na varanda.", "They sit on the balcony."],
  ["Eu sentei-me no banco.", "I sat on the bench."], ["Tu sentaste-te aqui?", "Did you sit here?"], ["Ele sentou-se no chão.", "He sat on the floor."], ["Nós sentámo-nos à mesa.", "We sat at the table."], ["Eles sentaram-se no sofá.", "They sat on the sofa."],
  ["Eu sentava-me ali.", "I used to sit there."], ["Tu sentavas-te no jardim?", "Did you use to sit in the garden?"], ["Ela sentava-se à janela.", "She used to sit by the window."], ["Nós sentávamo-nos no café.", "We used to sit at the café."], ["Eles sentavam-se na esplanada.", "They used to sit on the terrace."],
  ["Sentar-me-ei aqui.", "I will sit here."], ["Sentar-te-ás no sofá?", "Will you sit on the sofa?"], ["Ela sentar-se-á à mesa.", "She will sit at the table."], ["Sentar-nos-emos no jardim.", "We will sit in the garden."], ["Eles sentar-se-ão na varanda.", "They will sit on the balcony."],
  ["Sentar-me-ia aqui.", "I would sit here."], ["Sentar-te-ias no sofá?", "Would you sit on the sofa?"], ["Ela sentar-se-ia à mesa.", "She would sit at the table."], ["Sentar-nos-íamos no jardim.", "We would sit in the garden."], ["Eles sentar-se-iam na varanda.", "They would sit on the balcony."],
  ["Espero que eu me sente.", "I hope I sit down."], ["Quero que te sentes aqui.", "I want you to sit here."], ["É bom que ela se sente.", "It's good that she sits down."], ["Convém que nos sentemos.", "We should sit down."], ["Quero que se sentem à mesa.", "I want them to sit at the table."],
];
const sentarRows = (() => {
  const stem = "sent", inf = "sentar", subj = "sente";
  const f = [
    [stem + "o", stem + "as", stem + "a", stem + "amos", stem + "am"],
    [stem + "ei", stem + "aste", stem + "ou", stem + "ámos", stem + "aram"],
    [stem + "ava", stem + "avas", stem + "ava", stem + "ávamos", stem + "avam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [subj, subj + "s", subj, subj + "mos", subj + "m"],
  ];
  const ex = [
    ["Eu sento-me aqui.", "I sit down here."], ["Tu sentas-te no sofá?", "Do you sit on the sofa?"], ["Ela senta-se à mesa.", "She sits at the table."], ["Nós sentamo-nos no jardim.", "We sit in the garden."], ["Eles sentam-se na varanda.", "They sit on the balcony."],
    ["Eu sentei-me no banco.", "I sat on the bench."], ["Tu sentaste-te aqui?", "Did you sit here?"], ["Ele sentou-se no chão.", "He sat on the floor."], ["Nós sentámo-nos à mesa.", "We sat at the table."], ["Eles sentaram-se no sofá.", "They sat on the sofa."],
    ["Eu sentava-me ali.", "I used to sit there."], ["Tu sentavas-te no jardim?", "Did you use to sit in the garden?"], ["Ela sentava-se à janela.", "She used to sit by the window."], ["Nós sentávamo-nos no café.", "We used to sit at the café."], ["Eles sentavam-se na esplanada.", "They used to sit on the terrace."],
    ["Eu sentarei aqui.", "I will sit here."], ["Tu sentarás no sofá?", "Will you sit on the sofa?"], ["Ela sentará à mesa.", "She will sit at the table."], ["Nós sentaremos no jardim.", "We will sit in the garden."], ["Eles sentarão na varanda.", "They will sit on the balcony."],
    ["Eu sentaria aqui.", "I would sit here."], ["Tu sentarias no sofá?", "Would you sit on the sofa?"], ["Ela sentaria à mesa.", "She would sit at the table."], ["Nós sentaríamos no jardim.", "We would sit in the garden."], ["Eles sentariam na varanda.", "They would sit on the balcony."],
    ["Espero que eu me sente.", "I hope I sit down."], ["Quero que te sentes aqui.", "I want you to sit here."], ["É bom que ela se sente.", "It's good that she sits down."], ["Convém que nos sentemos.", "We should sit down."], ["Quero que se sentem à mesa.", "I want them to sit at the table."],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++) for (let pi = 0; pi < 5; pi++) rows.push([f[ti][pi], ex[ti * 5 + pi][0], ex[ti * 5 + pi][1]]);
  return fromRows("A1", rows);
})();
// —— SERVIR (irregular -IR: e→i in present and subjunctive)
const servirData = [
  ["sirvo", "Eu sirvo o jantar.", "I serve dinner."], ["serves", "Tu serves o café?", "Do you serve coffee?"], ["serve", "Ela serve os clientes.", "She serves the clients."], ["servimos", "Nós servimos o almoço.", "We serve lunch."], ["servem", "Eles servem à mesa.", "They serve at the table."],
  ["servi", "Eu servi o chá.", "I served the tea."], ["serviste", "Tu serviste o jantar?", "Did you serve dinner?"], ["serviu", "Ele serviu o café.", "He served the coffee."], ["servimos", "Nós servimos o almoço.", "We served lunch."], ["serviram", "Eles serviram os convidados.", "They served the guests."],
  ["servia", "Eu servia no restaurante.", "I used to serve at the restaurant."], ["servias", "Tu servias o café?", "Did you use to serve the coffee?"], ["servia", "Ela servia os clientes.", "She used to serve the clients."], ["servíamos", "Nós servíamos o jantar.", "We used to serve dinner."], ["serviam", "Eles serviam à mesa.", "They used to serve at the table."],
  ["servirei", "Eu servirei o jantar.", "I will serve dinner."], ["servirás", "Tu servirás o café?", "Will you serve the coffee?"], ["servirá", "Ela servirá os clientes.", "She will serve the clients."], ["serviremos", "Nós serviremos o almoço.", "We will serve lunch."], ["servirão", "Eles servirão à mesa.", "They will serve at the table."],
  ["serviria", "Eu serviria se pudesse.", "I would serve if I could."], ["servirias", "Tu servirias o jantar?", "Would you serve dinner?"], ["serviria", "Ela serviria o café.", "She would serve the coffee."], ["serviríamos", "Nós serviríamos o almoço.", "We would serve lunch."], ["serviriam", "Eles serviriam os convidados.", "They would serve the guests."],
  ["sirva", "Espero que eu sirva o jantar.", "I hope I serve dinner."], ["sirvas", "Quero que sirvas o café.", "I want you to serve the coffee."], ["sirva", "É bom que ela sirva os clientes.", "It's good that she serves the clients."], ["sirvamos", "Convém que sirvamos o almoço.", "We should serve lunch."], ["sirvam", "Quero que sirvam à mesa.", "I want them to serve at the table."],
];
const servirTypes = ["Exception", "Exception", "Exception", "Exception", "Exception", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Exception", "Exception", "Exception", "Exception", "Exception"];
const servirNotes = ["SERVIR: stem change e→i in present (sirvo, serves, serve, servimos, servem).", "", "", "", "", "", "", "", "Same as present.", "", "", "", "", "", "", ...Array(14).fill(""), "Stem 'sirv-' in subjunctive.", "", "", "", ""];

// Build new verb entries
const newVerbs = {
  ACEITAR: { meta: { emoji: "✅", english: "to accept", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "ah-say-TAHR" }, conjugations: makeAR("aceitar", "aceit", "A1", aceitarEx) },
  BRINCAR: { meta: { emoji: "🎮", english: "to play / to have fun", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "breen-KAHR" }, conjugations: brincarRows },
  COZINHAR: { meta: { emoji: "👨‍🍳", english: "to cook", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "koo-zee-NYAHR" }, conjugations: makeAR("cozinhar", "cozinh", "A1", cozinharEx) },
  DEMORAR: { meta: { emoji: "⏱", english: "to take (time) / to delay", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "deh-moo-RAHR" }, conjugations: makeAR("demorar", "demor", "A2", demorarEx) },
  LAVAR: { meta: { emoji: "🧼", english: "to wash", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "lah-VAHR" }, conjugations: makeAR("lavar", "lav", "A1", lavarEx) },
  LEVANTAR: { meta: { emoji: "🛏", english: "to get up / to lift", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "leh-vahn-TAHR" }, conjugations: levantarRows },
  LIGAR: { meta: { emoji: "📞", english: "to call / to connect", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "lee-GAHR" }, conjugations: ligarRows },
  MARCAR: { meta: { emoji: "📅", english: "to mark / to schedule / to book", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "mahr-KAHR" }, conjugations: marcarRows },
  PREOCUPAR: { meta: { emoji: "😟", english: "to worry", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A2", pronunciation: "preh-oo-koo-PAHR" }, conjugations: preocuparRows },
  SENTAR: { meta: { emoji: "🪑", english: "to sit (down)", group: "Regular -AR", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "sehn-TAHR" }, conjugations: sentarRows },
  SERVIR: { meta: { emoji: "🍽", english: "to serve", group: "Regular -IR", priority: "Useful", difficulty: "Intermediate", cefr: "A2", pronunciation: "sehr-VEER" }, conjugations: fromRows("A2", servirData, servirTypes, servirNotes) },
};

// Insertion points: after which key to insert each new verb (so new verb appears after that key in the object)
const insertAfter = {
  ACEITAR: "ARREPENDER",
  BRINCAR: "BEBER",
  COZINHAR: "CRITICAR",
  DEMORAR: "DIVERTIR",
  LAVAR: "LEVAR",   // LAVAR before LEMBRAR alphabetically; user said "after LA verbs" (none), so we insert after LEVAR so that when we build order we get LAVAR before LEMBRAR. Actually: current order has LEMBRAR, LER, LEVAR. So "after LA" = no LA verbs, so LAVAR goes at start of L block = before LEMBRAR. So we need to insert LAVAR *before* LEMBRAR. So insertAfter LAVAR = last key before LEMBRAR = LEVAR (so we insert after LEVAR, but then LAVAR would come after LEVAR). So we need "insert before LEMBRAR". So when building the new key order we insert LAVAR before LEMBRAR, i.e. after the key that comes before LEMBRAR. Before LEMBRAR in order is VOLTAR (54). So insert LAVAR after VOLTAR to get ... VOLTAR, LAVAR, LEMBRAR ...
  LEVANTAR: "LEVAR",
  LIGAR: "LEVANTAR",  // after we insert LEVANTAR
  MARCAR: "MANTER",
  PREOCUPAR: "PROCURAR",
  SENTAR: "SEGUIR",
  SERVIR: "SENTAR",
};
// Fix: LAVAR should appear before LEMBRAR. So in the order array, LAVAR goes after VOLTAR (so before LEMBRAR). So insertAfter LAVAR = "VOLTAR".
insertAfter.LAVAR = "VOLTAR";

// Build new key order: existing order + insert new keys at correct positions
const existingOrder = data.order.slice();
const allKeys = [];
for (let i = 0; i < existingOrder.length; i++) {
  allKeys.push(existingOrder[i]);
  // After this key, insert any new verb that belongs here
  for (const [newKey, afterKey] of Object.entries(insertAfter)) {
    if (existingOrder[i] === afterKey && !allKeys.includes(newKey)) {
      allKeys.push(newKey);
      // If any other new verb should come right after this new one (e.g. SERVIR after SENTAR), add it
      for (const [k2, a2] of Object.entries(insertAfter)) {
        if (a2 === newKey && !allKeys.includes(k2)) allKeys.push(k2);
      }
    }
  }
}

// Build new verbs object with correct key order
const orderedVerbs = {};
for (const k of allKeys) {
  if (newVerbs[k]) orderedVerbs[k] = newVerbs[k];
  else if (data.verbs[k]) orderedVerbs[k] = data.verbs[k];
  else throw new Error("Missing verb: " + k);
}

data.verbs = orderedVerbs;
data.order = allKeys;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added 11 verbs. Total:", data.order.length);
