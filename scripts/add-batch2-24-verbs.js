#!/usr/bin/env node
/**
 * Add 24 new A2 verbs to verbs.json (Batch 2).
 * Run from project root: node scripts/add-batch2-24-verbs.js
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

function makeIR(key, stem, examples, presentRow) {
  const inf = key.toLowerCase();
  const pres = presentRow || [stem + "o", stem + "es", stem + "e", stem + "imos", stem + "em"];
  const forms = [
    pres,
    [stem + "i", stem + "iste", stem + "iu", stem + "imos", stem + "iram"],
    [stem + "ia", stem + "ias", stem + "ia", stem + "íamos", stem + "iam"],
    [inf + "ei", inf + "ás", inf + "á", inf + "emos", inf + "ão"],
    [inf + "ia", inf + "ias", inf + "ia", inf + "íamos", inf + "iam"],
    [stem + "a", stem + "as", stem + "a", stem + "amos", stem + "am"],
  ];
  const rows = [];
  for (let ti = 0; ti < 6; ti++)
    for (let pi = 0; pi < 5; pi++)
      rows.push([forms[ti][pi], examples[ti * 5 + pi][0], examples[ti * 5 + pi][1]]);
  return rows;
}

// —— IRREGULAR: MANTER (like ter) ——
const manterData = [
  ["mantenho", "Mantenho a porta fechada.", "I keep the door closed."],
  ["manténs", "Tu manténs o segredo?", "Do you keep the secret?"],
  ["mantém", "Ela mantém a calma.", "She keeps calm."],
  ["mantemos", "Nós mantemos o contacto.", "We keep in touch."],
  ["mantêm", "Eles mantêm as tradições.", "They maintain the traditions."],
  ["mantive", "Mantive a promessa.", "I kept the promise."],
  ["mantiveste", "Mantiveste a palavra?", "Did you keep your word?"],
  ["manteve", "Ele manteve a compostura.", "He kept his composure."],
  ["mantivemos", "Mantivemos a esperança.", "We kept hope."],
  ["mantiveram", "Eles mantiveram o silêncio.", "They kept silent."],
  ["mantinha", "Mantinha sempre a porta fechada.", "I always used to keep the door closed."],
  ["mantinhas", "Mantinhas o contacto?", "Did you use to keep in touch?"],
  ["mantinha", "Ela mantinha a calma.", "She used to keep calm."],
  ["mantínhamos", "Mantínhamos as tradições.", "We used to maintain the traditions."],
  ["mantinham", "Eles mantinham o segredo.", "They used to keep the secret."],
  ["manterei", "Manterei a promessa.", "I will keep the promise."],
  ["manterás", "Manterás o contacto?", "Will you keep in touch?"],
  ["manterá", "Ela manterá a calma.", "She will keep calm."],
  ["manteremos", "Manteremos as tradições.", "We will maintain the traditions."],
  ["manterão", "Eles manterão o segredo.", "They will keep the secret."],
  ["manteria", "Manteria a porta fechada.", "I would keep the door closed."],
  ["manterias", "Manterias o contacto?", "Would you keep in touch?"],
  ["manteria", "Ela manteria a calma.", "She would keep calm."],
  ["manteríamos", "Manteríamos as tradições.", "We would maintain the traditions."],
  ["manteriam", "Eles manteriam o segredo.", "They would keep the secret."],
  ["mantenha", "Quero que mantenha a calma.", "I want you to keep calm."],
  ["mantenhas", "Espero que mantenhas o segredo.", "I hope you keep the secret."],
  ["mantenha", "Convém que ela mantenha.", "She should keep it."],
  ["mantenhamos", "É importante que mantenhamos.", "It's important that we keep."],
  ["mantenham", "Exijo que mantenham silêncio.", "I demand they keep silent."],
];

// —— IRREGULAR: PERDER (perco in 1st sg) ——
const perderData = [
  ["perco", "Perco sempre as chaves.", "I always lose my keys."],
  ["perdes", "Perdes o autocarro?", "Do you miss the bus?"],
  ["perde", "Ela perde a paciência.", "She loses her patience."],
  ["perdemos", "Perdemos o comboio.", "We missed the train."],
  ["perdem", "Eles perdem muito tempo.", "They waste a lot of time."],
  ["perdi", "Perdi a carteira ontem.", "I lost my wallet yesterday."],
  ["perdeste", "Perdeste o telemóvel?", "Did you lose your mobile?"],
  ["perdeu", "Ele perdeu o emprego.", "He lost his job."],
  ["perdemos", "Perdemos o jogo.", "We lost the game."],
  ["perderam", "Eles perderam a oportunidade.", "They lost the opportunity."],
  ["perdia", "Perdia sempre as chaves.", "I always used to lose my keys."],
  ["perdias", "Perdias o autocarro?", "Did you use to miss the bus?"],
  ["perdia", "Ela perdia a paciência.", "She used to lose her patience."],
  ["perdíamos", "Perdíamos muito tempo.", "We used to waste a lot of time."],
  ["perdiam", "Eles perdiam o comboio.", "They used to miss the train."],
  ["perderei", "Perderei o comboio.", "I will miss the train."],
  ["perderás", "Perderás a oportunidade?", "Will you lose the opportunity?"],
  ["perderá", "Ela perderá a paciência.", "She will lose her patience."],
  ["perderemos", "Perderemos o jogo.", "We will lose the game."],
  ["perderão", "Eles perderão tempo.", "They will waste time."],
  ["perderia", "Perderia o autocarro.", "I would miss the bus."],
  ["perderias", "Perderias a carteira?", "Would you lose your wallet?"],
  ["perderia", "Ela perderia a paciência.", "She would lose her patience."],
  ["perderíamos", "Perderíamos o jogo.", "We would lose the game."],
  ["perderiam", "Eles perderiam a oportunidade.", "They would lose the opportunity."],
  ["perca", "Não quero que perca a paciência.", "I don't want you to lose your patience."],
  ["percas", "Espero que não percas as chaves.", "I hope you don't lose your keys."],
  ["perca", "É possível que ela perca.", "It's possible she'll lose."],
  ["percamos", "É melhor que não percamos.", "It's better we don't lose."],
  ["percam", "Quero que não percam tempo.", "I want them not to waste time."],
];

// —— IRREGULAR: SEGUIR (sigo in 1st sg) ——
const seguirData = [
  ["sigo", "Sigo as instruções.", "I follow the instructions."],
  ["segues", "Tu segues as regras?", "Do you follow the rules?"],
  ["segue", "Ela segue em frente.", "She continues forward."],
  ["seguimos", "Seguimos o mapa.", "We follow the map."],
  ["seguem", "Eles seguem o exemplo.", "They follow the example."],
  ["segui", "Segui o teu conselho.", "I followed your advice."],
  ["seguiste", "Seguiste as indicações?", "Did you follow the directions?"],
  ["seguiu", "Ele seguiu o caminho.", "He followed the path."],
  ["seguimos", "Seguimos o plano.", "We followed the plan."],
  ["seguiram", "Eles seguiram em frente.", "They continued forward."],
  ["seguia", "Seguia sempre as regras.", "I always used to follow the rules."],
  ["seguias", "Seguias as indicações?", "Did you use to follow the directions?"],
  ["seguia", "Ela seguia o exemplo.", "She used to follow the example."],
  ["seguíamos", "Seguíamos o mapa.", "We used to follow the map."],
  ["seguiam", "Eles seguiam em frente.", "They used to continue forward."],
  ["seguirei", "Seguirei as instruções.", "I will follow the instructions."],
  ["seguirás", "Seguirás as regras?", "Will you follow the rules?"],
  ["seguirá", "Ela seguirá em frente.", "She will continue forward."],
  ["seguiremos", "Seguiremos o plano.", "We will follow the plan."],
  ["seguirão", "Eles seguirão o exemplo.", "They will follow the example."],
  ["seguiria", "Seguiria o teu conselho.", "I would follow your advice."],
  ["seguirias", "Seguirias as indicações?", "Would you follow the directions?"],
  ["seguiria", "Ela seguiria o caminho.", "She would follow the path."],
  ["seguiríamos", "Seguiríamos o plano.", "We would follow the plan."],
  ["seguiriam", "Eles seguiriam em frente.", "They would continue forward."],
  ["siga", "Quero que siga as instruções.", "I want you to follow the instructions."],
  ["sigas", "Espero que sigas as regras.", "I hope you follow the rules."],
  ["siga", "Convém que ela siga.", "She should follow."],
  ["sigamos", "É importante que sigamos.", "It's important that we follow."],
  ["sigam", "Exijo que sigam o plano.", "I demand they follow the plan."],
];

// —— IRREGULAR: CAIR (caio, cais, cai, caímos, caem) ——
const cairData = [
  ["caio", "Caio sempre na mesma armadilha.", "I always fall into the same trap."],
  ["cais", "Tu cais muito?", "Do you fall often?"],
  ["cai", "A chuva cai forte.", "The rain is falling heavily."],
  ["caímos", "Caímos no erro.", "We fell into the error."],
  ["caem", "As folhas caem no outono.", "The leaves fall in autumn."],
  ["caí", "Caí da escada.", "I fell down the stairs."],
  ["caíste", "Caíste no gelo?", "Did you fall on the ice?"],
  ["caiu", "Ele caiu na rua.", "He fell in the street."],
  ["caímos", "Caímos na tentação.", "We fell into temptation."],
  ["caíram", "Eles caíram na armadilha.", "They fell into the trap."],
  ["caía", "Caía sempre no mesmo sítio.", "I always used to fall in the same place."],
  ["caías", "Caías muito quando eras pequeno?", "Did you use to fall a lot when you were little?"],
  ["caía", "A neve caía suavemente.", "The snow used to fall softly."],
  ["caíamos", "Caíamos na armadilha.", "We used to fall into the trap."],
  ["caíam", "As folhas caíam no jardim.", "The leaves used to fall in the garden."],
  ["cairei", "Cairei se me empurrares.", "I will fall if you push me."],
  ["cairás", "Cairás na armadilha?", "Will you fall into the trap?"],
  ["cairá", "A chuva cairá amanhã.", "The rain will fall tomorrow."],
  ["cairemos", "Cairemos na tentação.", "We will fall into temptation."],
  ["cairão", "Eles cairão no erro.", "They will fall into the error."],
  ["cairia", "Cairia se escorregasse.", "I would fall if I slipped."],
  ["cairias", "Cairias na armadilha?", "Would you fall into the trap?"],
  ["cairia", "A neve cairia se fizesse frio.", "The snow would fall if it were cold."],
  ["cairíamos", "Cairíamos na tentação.", "We would fall into temptation."],
  ["cairiam", "Eles cairiam no erro.", "They would fall into the error."],
  ["caia", "Cuidado para não caia.", "Be careful not to fall."],
  ["caias", "Espero que não caias.", "I hope you don't fall."],
  ["caia", "É possível que ela caia.", "It's possible she'll fall."],
  ["caiamos", "É melhor que não caiamos.", "It's better we don't fall."],
  ["caiam", "Quero que não caiam.", "I want them not to fall."],
];

// —— IRREGULAR: PRODUZIR (produzo, like dizer) ——
const produzirData = [
  ["produzo", "Produzo conteúdo digital.", "I produce digital content."],
  ["produzes", "Produzes muito?", "Do you produce a lot?"],
  ["produz", "A fábrica produz carros.", "The factory produces cars."],
  ["produzimos", "Produzimos filmes.", "We produce films."],
  ["produzem", "Eles produzem energia.", "They produce energy."],
  ["produzi", "Produzi um relatório.", "I produced a report."],
  ["produziste", "Produziste o documento?", "Did you produce the document?"],
  ["produziu", "Ela produziu resultados.", "She produced results."],
  ["produzimos", "Produzimos a série.", "We produced the series."],
  ["produziram", "Eles produziram o filme.", "They produced the film."],
  ["produzia", "Produzia artigos.", "I used to produce articles."],
  ["produzias", "Produzias conteúdo?", "Did you use to produce content?"],
  ["produzia", "A empresa produzia mais.", "The company used to produce more."],
  ["produzíamos", "Produzíamos documentários.", "We used to produce documentaries."],
  ["produziam", "Eles produziam energia.", "They used to produce energy."],
  ["produzirei", "Produzirei o relatório.", "I will produce the report."],
  ["produzirás", "Produzirás o documento?", "Will you produce the document?"],
  ["produzirá", "Ela produzirá resultados.", "She will produce results."],
  ["produziremos", "Produziremos a série.", "We will produce the series."],
  ["produzirão", "Eles produzirão energia.", "They will produce energy."],
  ["produziria", "Produziria mais se pudesse.", "I would produce more if I could."],
  ["produzirias", "Produzirias o relatório?", "Would you produce the report?"],
  ["produziria", "A fábrica produziria mais.", "The factory would produce more."],
  ["produziríamos", "Produziríamos a série.", "We would produce the series."],
  ["produziriam", "Eles produziriam energia.", "They would produce energy."],
  ["produza", "Quero que produza o relatório.", "I want you to produce the report."],
  ["produzas", "Espero que produzas resultados.", "I hope you produce results."],
  ["produza", "Convém que ela produza.", "She should produce."],
  ["produzamos", "É importante que produzamos.", "It's important that we produce."],
  ["produzam", "Exijo que produzam o documento.", "I demand they produce the document."],
];

// —— IRREGULAR: SURGIR (surjo, like conseguir) ——
const surgirData = [
  ["surjo", "Surjo quando menos esperas.", "I appear when you least expect it."],
  ["surges", "Surges do nada?", "Do you appear from nowhere?"],
  ["surge", "Um problema surge.", "A problem arises."],
  ["surgimos", "Surgimos em momento de crise.", "We appeared in a moment of crisis."],
  ["surgem", "Dúvidas surgem sempre.", "Doubts always arise."],
  ["surgi", "Surgi de repente.", "I appeared suddenly."],
  ["surgiste", "Surgiste a tempo?", "Did you appear in time?"],
  ["surgiu", "Uma oportunidade surgiu.", "An opportunity arose."],
  ["surgimos", "Surgimos na reunião.", "We appeared at the meeting."],
  ["surgiram", "Problemas surgiram.", "Problems arose."],
  ["surgia", "Surgia sempre a mesma dúvida.", "The same doubt always used to arise."],
  ["surgias", "Surgias quando?", "When did you use to appear?"],
  ["surgia", "Uma ideia surgia.", "An idea used to arise."],
  ["surgíamos", "Surgíamos em momentos difíceis.", "We used to appear in difficult moments."],
  ["surgiam", "Dúvidas surgiam.", "Doubts used to arise."],
  ["surgirei", "Surgirei quando precisares.", "I will appear when you need me."],
  ["surgirás", "Surgirás a tempo?", "Will you appear in time?"],
  ["surgirá", "Uma oportunidade surgirá.", "An opportunity will arise."],
  ["surgiremos", "Surgiremos na reunião.", "We will appear at the meeting."],
  ["surgirão", "Problemas surgirão.", "Problems will arise."],
  ["surgiria", "Surgiria se chamasse.", "I would appear if you called."],
  ["surgirias", "Surgirias a tempo?", "Would you appear in time?"],
  ["surgiria", "Uma oportunidade surgiria.", "An opportunity would arise."],
  ["surgiríamos", "Surgiríamos se precisassem.", "We would appear if they needed."],
  ["surgiriam", "Problemas surgiriam.", "Problems would arise."],
  ["surja", "Espero que surja uma oportunidade.", "I hope an opportunity arises."],
  ["surjas", "Quero que surjas a tempo.", "I want you to appear in time."],
  ["surja", "É possível que surja um problema.", "It's possible a problem will arise."],
  ["surjamos", "Convém que surjamos.", "We should appear."],
  ["surjam", "Quero que surjam oportunidades.", "I want opportunities to arise."],
];

// Regular -AR with spelling change: COLOCAR (c→qu before e)
const colocarEx = [
  ["Coloco o livro na mesa.", "I place the book on the table."], ["Colocas o casaco?", "Do you put the coat?"], ["Ela coloca os pratos.", "She places the plates."], ["Nós colocamos a questão.", "We raise the question."], ["Eles colocam os livros.", "They place the books."],
  ["Coloquei o telefone na mesa.", "I put the phone on the table."], ["Colocaste o casaco?", "Did you put the coat?"], ["Ele colocou a questão.", "He raised the question."], ["Nós colocámos os pratos.", "We placed the plates."], ["Eles colocaram os livros.", "They placed the books."],
  ["Eu colocava sempre na mesma gaveta.", "I always used to put it in the same drawer."], ["Tu colocavas os livros?", "Did you use to place the books?"], ["Ela colocava a questão.", "She used to raise the question."], ["Nós colocávamos os pratos.", "We used to place the plates."], ["Eles colocavam os livros.", "They used to place the books."],
  ["Colocarei na mesa.", "I will place it on the table."], ["Colocarás o casaco?", "Will you put the coat?"], ["Ela colocará a questão.", "She will raise the question."], ["Colocaremos os pratos.", "We will place the plates."], ["Eles colocarão os livros.", "They will place the books."],
  ["Colocaria aqui.", "I would place it here."], ["Colocarias o casaco?", "Would you put the coat?"], ["Ela colocaria a questão.", "She would raise the question."], ["Colocaríamos os pratos.", "We would place the plates."], ["Eles colocariam os livros.", "They would place the books."],
  ["Quero que coloque na mesa.", "I want you to place it on the table."], ["Espero que coloques o casaco.", "I hope you put the coat."], ["Convém que ela coloque.", "She should place it."], ["É preciso que coloquemos.", "We need to place."], ["Exijo que coloquem aqui.", "I demand they place it here."],
];

// -ER with c→ç: NASCER, APARECER
const nascerEx = [
  ["Nasço em Lisboa.", "I was born in Lisbon."], ["Nasces em que ano?", "What year were you born?"], ["Ela nasce em maio.", "She was born in May."], ["Nós nascemos no Porto.", "We were born in Porto."], ["Eles nascem em Portugal.", "They were born in Portugal."],
  ["Nasci em 1990.", "I was born in 1990."], ["Nasceu em que cidade?", "What city were you born in?"], ["Ela nasceu no Algarve.", "She was born in the Algarve."], ["Nós nascemos em Lisboa.", "We were born in Lisbon."], ["Eles nasceram no mesmo ano.", "They were born in the same year."],
  ["Nasci em 1990.", "I was born in 1990."], ["Nasceu em que cidade?", "What city were you born in?"], ["Ela nasceu no Algarve.", "She was born in the Algarve."], ["Nós nascemos em Lisboa.", "We were born in Lisbon."], ["Eles nasceram no mesmo ano.", "They were born in the same year."],
  ["Nasceremos no mesmo hospital.", "We will be born in the same hospital."], ["Nascerás em Portugal?", "Will you be born in Portugal?"], ["O sol nascerá às seis.", "The sun will rise at six."], ["Nasceremos em maio.", "We will be born in May."], ["Os bebés nascerão em junho.", "The babies will be born in June."],
  ["Nasceria em Lisboa se pudesse.", "I would be born in Lisbon if I could."], ["Nascerias noutro país?", "Would you be born in another country?"], ["O sol nasceria cedo.", "The sun would rise early."], ["Nasceríamos no mesmo sítio.", "We would be born in the same place."], ["Eles nasceriam em Portugal.", "They would be born in Portugal."],
  ["Espero que nasça são.", "I hope he's born healthy."], ["Que nasças em maio.", "May you be born in May."], ["É bom que nasça cedo.", "It's good that it's born early."], ["Que nasçamos em Portugal.", "May we be born in Portugal."], ["Que nasçam felizes.", "May they be born happy."],
];
nascerEx[6] = ["Nasceste em que cidade?", "What city were you born in?"];
nascerEx[7] = ["Ela nasceu no Algarve.", "She was born in the Algarve."];
nascerEx[8] = ["Nós nascemos em Lisboa.", "We were born in Lisbon."];
nascerEx[9] = ["Eles nasceram no mesmo ano.", "They were born in the same year."];
nascerEx[10] = ["O sol nascia às seis.", "The sun used to rise at six."];
nascerEx[11] = ["Tu nascias em que mês?", "What month were you born in?"];
nascerEx[12] = ["Ela nascia em maio.", "She used to be born in May."];
nascerEx[13] = ["Nós nascíamos naquele hospital.", "We used to be born in that hospital."];
nascerEx[14] = ["Eles nasciam em Portugal.", "They used to be born in Portugal."];

const aparecerEx = [
  ["Apareço quando precisas.", "I appear when you need me."], ["Apareces a horas?", "Do you show up on time?"], ["Ela aparece sempre.", "She always shows up."], ["Nós aparecemos na festa.", "We appeared at the party."], ["Eles aparecem de repente.", "They appear suddenly."],
  ["Apareci na reunião.", "I showed up at the meeting."], ["Apareceste na festa?", "Did you show up at the party?"], ["Ele apareceu tarde.", "He showed up late."], ["Nós aparecemos a tempo.", "We showed up on time."], ["Eles apareceram de surpresa.", "They appeared by surprise."],
  ["Eu aparecia sempre.", "I always used to show up."], ["Tu aparecias tarde?", "Did you use to show up late?"], ["Ela aparecia de repente.", "She used to appear suddenly."], ["Nós aparecíamos nas festas.", "We used to appear at parties."], ["Eles apareciam a horas.", "They used to show up on time."],
  ["Aparecerei quando puder.", "I will show up when I can."], ["Aparecerás na festa?", "Will you show up at the party?"], ["Ela aparecerá amanhã.", "She will appear tomorrow."], ["Apareceremos na reunião.", "We will show up at the meeting."], ["Eles aparecerão de surpresa.", "They will appear by surprise."],
  ["Apareceria se me convidasses.", "I would show up if you invited me."], ["Aparecerias na festa?", "Would you show up at the party?"], ["Ela apareceria cedo.", "She would show up early."], ["Apareceríamos na reunião.", "We would show up at the meeting."], ["Eles apareceriam a horas.", "They would show up on time."],
  ["Espero que apareça.", "I hope you show up."], ["Quero que apareças na festa.", "I want you to show up at the party."], ["É bom que ela apareça.", "It's good that she shows up."], ["Convém que apareçamos.", "We should show up."], ["Quero que apareçam.", "I want them to show up."],
];

// Compact example arrays for regular -AR verbs (CONTINUAR, USAR, PROCURAR, GANHAR, TENTAR, etc.)
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

// Batch 2 verb definitions
const BATCH2 = [
  // Irregular
  { key: "MANTER", meta: { emoji: "🔒", english: "to keep / to maintain", group: "Irregular", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "mahn-TEHR" }, conjugations: fromData("A2", manterData, Array(30).fill("Exception"), ["Conjugates exactly like TER with man- prefix.", "", "", "", "", ...Array(25).fill("")]) },
  { key: "PERDER", meta: { emoji: "❌", english: "to lose / to miss", group: "Irregular", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "pehr-DEHR" }, conjugations: fromData("A2", perderData, [...Array(5).fill("Exception"), ...Array(10).fill("Regular Conjugation"), ...Array(10).fill("Regular Conjugation"), ...Array(5).fill("Exception")], ["PERDER: d→c in 1st sg (perco).", "", "", "", "", ...Array(25).fill("")]) },
  { key: "SEGUIR", meta: { emoji: "➡️", english: "to follow / to continue", group: "Irregular", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "seh-GEER" }, conjugations: fromData("A2", seguirData, [...Array(5).fill("Exception"), ...Array(10).fill("Regular Conjugation"), ...Array(10).fill("Regular Conjugation"), ...Array(5).fill("Exception")], ["Stem change: e→i in 1st sg (sigo).", "", "", "", "", ...Array(25).fill("")]) },
  { key: "CAIR", meta: { emoji: "⬇️", english: "to fall", group: "Irregular", priority: "Core", difficulty: "Elementary", cefr: "A2", pronunciation: "kah-EER" }, conjugations: fromData("A2", cairData, Array(30).fill("Exception"), ["CAIR: irregular present (caio, cais, cai, caímos, caem).", "", "", "", "", ...Array(25).fill("")]) },
  { key: "PRODUZIR", meta: { emoji: "🏭", english: "to produce", group: "Regular -IR", priority: "Useful", difficulty: "Elementary", cefr: "A2", pronunciation: "proh-doo-ZEER" }, conjugations: fromData("A2", produzirData, Array(30).fill("Exception"), ["PRODUZIR: like DIZER, z→z in present (produzo).", "", "", "", "", ...Array(25).fill("")]) },
  { key: "SURGIR", meta: { emoji: "✨", english: "to arise / to appear", group: "Regular -IR", priority: "Useful", difficulty: "Elementary", cefr: "A2", pronunciation: "soor-ZHEER" }, conjugations: fromData("A2", surgirData, Array(30).fill("Exception"), ["SURGIR: like CONSEGUIR, g→j in 1st sg (surjo).", "", "", "", "", ...Array(25).fill("")]) },
];


const regularAR = [
  { key: "CONTINUAR", stem: "continu", english: "to continue", emoji: "🔄", priority: "Essential", pronunciation: "kohn-tee-noo-AHR" },
  { key: "USAR", stem: "us", english: "to use", emoji: "🛠", priority: "Essential", pronunciation: "oo-ZAHR" },
  { key: "PROCURAR", stem: "procur", english: "to look for / to search", emoji: "🔍", priority: "Essential", pronunciation: "proh-koo-RAHR" },
  { key: "GANHAR", stem: "ganh", english: "to win / to earn", emoji: "🏆", priority: "Essential", pronunciation: "gah-NYAHR" },
  { key: "TENTAR", stem: "tent", english: "to try / to attempt", emoji: "🎯", priority: "Essential", pronunciation: "tehn-TAHR" },
  { key: "REPRESENTAR", stem: "represent", english: "to represent", emoji: "🎭", priority: "Useful", pronunciation: "hreh-preh-zehn-TAHR" },
  { key: "FORMAR", stem: "form", english: "to form / to train", emoji: "📚", priority: "Useful", pronunciation: "fohr-MAHR" },
  { key: "REALIZAR", stem: "realiz", english: "to carry out / to achieve", emoji: "✅", priority: "Useful", pronunciation: "hreh-ah-lee-ZAHR" },
  { key: "AFIRMAR", stem: "afirm", english: "to affirm / to state", emoji: "💬", priority: "Useful", pronunciation: "ah-feer-MAHR" },
  { key: "APRESENTAR", stem: "apresent", english: "to present / to introduce", emoji: "👋", priority: "Useful", pronunciation: "ah-preh-zehn-TAHR" },
  { key: "CONSIDERAR", stem: "consider", english: "to consider", emoji: "🤔", priority: "Useful", pronunciation: "kohn-see-deh-RAHR" },
  { key: "TORNAR", stem: "torn", english: "to become / to turn into", emoji: "🔄", priority: "Useful", pronunciation: "tohr-NAHR" },
];

const regularER = [
  { key: "APARECER", stem: "aparec", english: "to appear / to show up", emoji: "👻", priority: "Core", pronunciation: "ah-pah-reh-SEHR", pres: ["apareço", "apareces", "aparece", "aparecemos", "aparecem"], subj: ["apareça", "apareças", "apareça", "apareçamos", "apareçam"] },
  { key: "OCORRER", stem: "ocor", english: "to occur / to happen", emoji: "📅", priority: "Core", pronunciation: "oh-koh-HEHR" },
  { key: "NASCER", stem: "nasc", english: "to be born", emoji: "👶", priority: "Core", pronunciation: "nahsh-SEHR", pres: ["nasço", "nasces", "nasce", "nascemos", "nascem"], subj: ["nasça", "nasças", "nasça", "nasçamos", "nasçam"] },
  { key: "MORRER", stem: "morr", english: "to die", emoji: "🕯", priority: "Core", pronunciation: "moh-HEHR" },
];

const regularIR = [
  { key: "CONSTITUIR", stem: "constitu", english: "to constitute / to make up", emoji: "🧩", priority: "Useful", pronunciation: "kohnsh-tee-too-EER", pres: ["constituo", "constituis", "constitui", "constituímos", "constituem"] },
];

// Add all Batch 2 verbs
const newKeys = [];

BATCH2.forEach((v) => {
  data.verbs[v.key] = { meta: v.meta, conjugations: v.conjugations };
  newKeys.push(v.key);
});

// COLOCAR (c→qu)
data.verbs.COLOCAR = { meta: { emoji: "📦", english: "to place / to put", group: "Regular -AR", priority: "Useful", difficulty: "Elementary", cefr: "A2", pronunciation: "koh-loh-KAHR" }, conjugations: fromData("A2", makeAR("COLOCAR", "coloc", colocarEx, "coloqu"), [], []) };
newKeys.push("COLOCAR");

// Regular -AR
regularAR.forEach(({ key, stem, english, emoji, priority, pronunciation }) => {
  const ex = arExamples(stem, key, english.split(" ")[1] || "do");
  data.verbs[key] = { meta: { emoji, english, group: "Regular -AR", priority, difficulty: priority === "Essential" ? "Elementary" : "Elementary", cefr: "A2", pronunciation }, conjugations: fromData("A2", makeAR(key, stem, ex), [], []) };
  newKeys.push(key);
});

// Regular -ER with special forms
data.verbs.APARECER = { meta: { emoji: "👻", english: "to appear / to show up", group: "Regular -ER", priority: "Core", difficulty: "Elementary", cefr: "A2", pronunciation: "ah-pah-reh-SEHR" }, conjugations: fromData("A2", makeER("APARECER", "aparec", aparecerEx, ["apareço", "apareces", "aparece", "aparecemos", "aparecem"], ["apareça", "apareças", "apareça", "apareçamos", "apareçam"]), [], []) };
newKeys.push("APARECER");

data.verbs.OCORRER = { meta: { emoji: "📅", english: "to occur / to happen", group: "Regular -ER", priority: "Core", difficulty: "Elementary", cefr: "A2", pronunciation: "oh-koh-HEHR" }, conjugations: fromData("A2", makeER("OCORRER", "ocor", [[ "Ocorro sempre.", "I always occur."], ["Ocorres?", "Do you occur?"], ["Ocorre um problema.", "A problem occurs."], ["Ocorremos na reunião.", "We occurred at the meeting."], ["Ocorrem erros.", "Errors occur."], ["Ocorri ontem.", "I occurred yesterday."], ["Ocorreste?", "Did you occur?"], ["Ocorreu um acidente.", "An accident occurred."], ["Ocorremos na mesma altura.", "We occurred at the same time."], ["Ocorreram problemas.", "Problems occurred."], ["Eu ocorria sempre.", "I always used to occur."], ["Tu ocorrias?", "Did you use to occur?"], ["Ocorria um erro.", "An error used to occur."], ["Ocorríamos na reunião.", "We used to occur at the meeting."], ["Ocorriam acidentes.", "Accidents used to occur."], ["Ocorrerei.", "I will occur."], ["Ocorrerás?", "Will you occur?"], ["Ocorrerá um problema.", "A problem will occur."], ["Ocorreremos.", "We will occur."], ["Ocorrerão erros.", "Errors will occur."], ["Ocorreria.", "I would occur."], ["Ocorrerias?", "Would you occur?"], ["Ocorreria um erro.", "An error would occur."], ["Ocorreríamos.", "We would occur."], ["Ocorreriam problemas.", "Problems would occur."], ["Espero que ocorra.", "I hope it occurs."], ["Quero que ocorras.", "I want you to occur."], ["Convém que ocorra.", "It should occur."], ["É possível que ocorramos.", "It's possible we occur."], ["Quero que ocorram.", "I want them to occur."]]), [], []) };
newKeys.push("OCORRER");

data.verbs.NASCER = { meta: { emoji: "👶", english: "to be born", group: "Regular -ER", priority: "Core", difficulty: "Elementary", cefr: "A2", pronunciation: "nahsh-SEHR" }, conjugations: fromData("A2", makeER("NASCER", "nasc", nascerEx, ["nasço", "nasces", "nasce", "nascemos", "nascem"], ["nasça", "nasças", "nasça", "nasçamos", "nasçam"]), [], []) };
newKeys.push("NASCER");

data.verbs.MORRER = { meta: { emoji: "🕯", english: "to die", group: "Regular -ER", priority: "Core", difficulty: "Elementary", cefr: "A2", pronunciation: "moh-HEHR" }, conjugations: fromData("A2", makeER("MORRER", "morr", [["Morro de vontade.", "I'm dying to."], ["Morres de frio?", "Are you freezing?"], ["Ela morre de medo.", "She's scared to death."], ["Nós morremos de rir.", "We're dying of laughter."], ["Eles morrem de fome.", "They're starving."], ["Morri de susto.", "I nearly died of fright."], ["Morreste de medo?", "Did you nearly die of fear?"], ["Ele morreu há um ano.", "He died a year ago."], ["Morremos na mesma época.", "We died around the same time."], ["Eles morreram em paz.", "They died in peace."], ["Eu morria de vergonha.", "I used to die of embarrassment."], ["Tu morrias de medo?", "Did you use to be scared to death?"], ["Ela morria de fome.", "She used to be starving."], ["Morríamos de rir.", "We used to die laughing."], ["Eles morriam de frio.", "They used to freeze."], ["Morrerei em paz.", "I will die in peace."], ["Morrerás de medo?", "Will you die of fear?"], ["Ela morrerá cedo.", "She will die early."], ["Morreremos juntos.", "We will die together."], ["Eles morrerão em paz.", "They will die in peace."], ["Morreria por ti.", "I would die for you."], ["Morrerias de susto?", "Would you die of fright?"], ["Ela morreria de vergonha.", "She would die of embarrassment."], ["Morreríamos de fome.", "We would die of hunger."], ["Eles morreriam de frio.", "They would freeze."], ["Espero que não morra.", "I hope he doesn't die."], ["Quero que não morras.", "I don't want you to die."], ["Convém que ela não morra.", "She shouldn't die."], ["É triste que morramos.", "It's sad that we die."], ["Quero que não morram.", "I don't want them to die."]]), [], []) };
newKeys.push("MORRER");

// CONSTITUIR
const constituirEx = [
  ["Constituo uma minoria.", "I constitute a minority."], ["Constituis uma exceção?", "Do you constitute an exception?"], ["Ela constitui um problema.", "She constitutes a problem."], ["Nós constituímos a equipa.", "We make up the team."], ["Eles constituem a maioria.", "They constitute the majority."],
  ["Constituí a comissão.", "I constituted the committee."], ["Constituíste o grupo?", "Did you form the group?"], ["Ele constituiu a equipa.", "He formed the team."], ["Constituímos a maioria.", "We constituted the majority."], ["Eles constituíram o júri.", "They constituted the jury."],
  ["Eu constituía uma minoria.", "I used to constitute a minority."], ["Tu constituías uma exceção?", "Did you use to constitute an exception?"], ["Ela constituía um problema.", "She used to constitute a problem."], ["Constituíamos a equipa.", "We used to make up the team."], ["Eles constituíam a maioria.", "They used to constitute the majority."],
  ["Constituirei a comissão.", "I will constitute the committee."], ["Constituirás o grupo?", "Will you form the group?"], ["Ela constituirá a equipa.", "She will form the team."], ["Constituiremos a maioria.", "We will constitute the majority."], ["Eles constituirão o júri.", "They will constitute the jury."],
  ["Constituiria uma minoria.", "I would constitute a minority."], ["Constituirias uma exceção?", "Would you constitute an exception?"], ["Ela constituiria um problema.", "She would constitute a problem."], ["Constituiríamos a equipa.", "We would make up the team."], ["Eles constituiriam a maioria.", "They would constitute the majority."],
  ["Quero que constitua a comissão.", "I want you to constitute the committee."], ["Espero que constituas o grupo.", "I hope you form the group."], ["Convém que ela constitua.", "She should constitute."], ["É importante que constituamos.", "It's important that we constitute."], ["Exijo que constituam o júri.", "I demand they constitute the jury."],
];
data.verbs.CONSTITUIR = { meta: { emoji: "🧩", english: "to constitute / to make up", group: "Regular -IR", priority: "Useful", difficulty: "Elementary", cefr: "A2", pronunciation: "kohnsh-tee-too-EER" }, conjugations: fromData("A2", makeIR("CONSTITUIR", "constitu", constituirEx, ["constituo", "constituis", "constitui", "constituímos", "constituem"]), [], []) };
newKeys.push("CONSTITUIR");

// Fix regularAR examples - use proper EP sentences
const continuarEx = [
  ["Continuo a trabalhar.", "I continue working."], ["Continuas o projeto?", "Do you continue the project?"], ["Ela continua a estudar.", "She continues studying."], ["Nós continuamos em frente.", "We continue forward."], ["Eles continuam na mesma.", "They continue the same."],
  ["Continuei o trabalho.", "I continued the work."], ["Continuaste o projeto?", "Did you continue the project?"], ["Ele continuou a estudar.", "He continued studying."], ["Continuámos em frente.", "We continued forward."], ["Eles continuaram na mesma.", "They continued the same."],
  ["Eu continuava a trabalhar.", "I used to continue working."], ["Tu continuavas o projeto?", "Did you use to continue the project?"], ["Ela continuava a estudar.", "She used to continue studying."], ["Continuávamos em frente.", "We used to continue forward."], ["Eles continuavam na mesma.", "They used to continue the same."],
  ["Continuarei o trabalho.", "I will continue the work."], ["Continuarás o projeto?", "Will you continue the project?"], ["Ela continuará a estudar.", "She will continue studying."], ["Continuaremos em frente.", "We will continue forward."], ["Eles continuarão na mesma.", "They will continue the same."],
  ["Continuaria a trabalhar.", "I would continue working."], ["Continuarias o projeto?", "Would you continue the project?"], ["Ela continuaria a estudar.", "She would continue studying."], ["Continuaríamos em frente.", "We would continue forward."], ["Eles continuariam na mesma.", "They would continue the same."],
  ["Quero que continue.", "I want you to continue."], ["Espero que continues o projeto.", "I hope you continue the project."], ["Convém que ela continue.", "She should continue."], ["É preciso que continuemos.", "We need to continue."], ["Exijo que continuem.", "I demand they continue."],
];
const usarEx = [
  ["Uso o telemóvel.", "I use my mobile."], ["Usas o autocarro?", "Do you use the bus?"], ["Ela usa o portátil.", "She uses the laptop."], ["Nós usamos o comboio.", "We use the train."], ["Eles usam aplicações.", "They use apps."],
  ["Usei o telemóvel.", "I used my mobile."], ["Usaste o autocarro?", "Did you use the bus?"], ["Ele usou o portátil.", "He used the laptop."], ["Usámos o comboio.", "We used the train."], ["Eles usaram aplicações.", "They used apps."],
  ["Eu usava o telemóvel.", "I used to use my mobile."], ["Tu usavas o autocarro?", "Did you use to use the bus?"], ["Ela usava o portátil.", "She used to use the laptop."], ["Usávamos o comboio.", "We used to use the train."], ["Eles usavam aplicações.", "They used to use apps."],
  ["Usarei o telemóvel.", "I will use my mobile."], ["Usarás o autocarro?", "Will you use the bus?"], ["Ela usará o portátil.", "She will use the laptop."], ["Usaremos o comboio.", "We will use the train."], ["Eles usarão aplicações.", "They will use apps."],
  ["Usaria o telemóvel.", "I would use my mobile."], ["Usarias o autocarro?", "Would you use the bus?"], ["Ela usaria o portátil.", "She would use the laptop."], ["Usaríamos o comboio.", "We would use the train."], ["Eles usariam aplicações.", "They would use apps."],
  ["Quero que use o telemóvel.", "I want you to use the mobile."], ["Espero que uses o autocarro.", "I hope you use the bus."], ["Convém que ela use.", "She should use."], ["É preciso que usemos.", "We need to use."], ["Exijo que usem.", "I demand they use."],
];
const procurarEx = [
  ["Procuro as chaves.", "I'm looking for my keys."], ["Procuras emprego?", "Are you looking for a job?"], ["Ela procura um apartamento.", "She's looking for a flat."], ["Nós procuramos informação.", "We're searching for information."], ["Eles procuram o telemóvel.", "They're looking for the mobile."],
  ["Procurei as chaves.", "I looked for my keys."], ["Procuraste emprego?", "Did you look for a job?"], ["Ele procurou um apartamento.", "He looked for a flat."], ["Procurámos informação.", "We searched for information."], ["Eles procuraram o telemóvel.", "They looked for the mobile."],
  ["Eu procurava as chaves.", "I used to look for my keys."], ["Tu procuravas emprego?", "Did you use to look for a job?"], ["Ela procurava um apartamento.", "She used to look for a flat."], ["Procurávamos informação.", "We used to search for information."], ["Eles procuravam o telemóvel.", "They used to look for the mobile."],
  ["Procurarei as chaves.", "I will look for my keys."], ["Procurarás emprego?", "Will you look for a job?"], ["Ela procurará um apartamento.", "She will look for a flat."], ["Procuraremos informação.", "We will search for information."], ["Eles procurarão o telemóvel.", "They will look for the mobile."],
  ["Procuraria as chaves.", "I would look for my keys."], ["Procurarias emprego?", "Would you look for a job?"], ["Ela procuraria um apartamento.", "She would look for a flat."], ["Procuraríamos informação.", "We would search for information."], ["Eles procurariam o telemóvel.", "They would look for the mobile."],
  ["Quero que procure as chaves.", "I want you to look for the keys."], ["Espero que procures emprego.", "I hope you look for a job."], ["Convém que ela procure.", "She should search."], ["É preciso que procuremos.", "We need to search."], ["Exijo que procurem.", "I demand they search."],
];
const ganharEx = [
  ["Ganho o jogo.", "I win the game."], ["Ganhas quanto?", "How much do you earn?"], ["Ela ganha bem.", "She earns well."], ["Nós ganhamos o campeonato.", "We won the championship."], ["Eles ganham pouco.", "They earn little."],
  ["Ganhei o jogo.", "I won the game."], ["Ganhaste quanto?", "How much did you earn?"], ["Ele ganhou a corrida.", "He won the race."], ["Ganhamos o campeonato.", "We won the championship."], ["Eles ganharam a aposta.", "They won the bet."],
  ["Eu ganhava o jogo.", "I used to win the game."], ["Tu ganhavas quanto?", "How much did you use to earn?"], ["Ela ganhava bem.", "She used to earn well."], ["Ganávamos o campeonato.", "We used to win the championship."], ["Eles ganhavam pouco.", "They used to earn little."],
  ["Ganharei o jogo.", "I will win the game."], ["Ganharás quanto?", "How much will you earn?"], ["Ela ganhará bem.", "She will earn well."], ["Ganharemos o campeonato.", "We will win the championship."], ["Eles ganharão a aposta.", "They will win the bet."],
  ["Ganharia o jogo.", "I would win the game."], ["Ganharias quanto?", "How much would you earn?"], ["Ela ganharia bem.", "She would earn well."], ["Ganharíamos o campeonato.", "We would win the championship."], ["Eles ganhariam a aposta.", "They would win the bet."],
  ["Quero que ganhe o jogo.", "I want you to win the game."], ["Espero que ganhes.", "I hope you win."], ["Convém que ela ganhe.", "She should win."], ["É preciso que ganhemos.", "We need to win."], ["Exijo que ganhem.", "I demand they win."],
];
const tentarEx = [
  ["Tento fazer o meu melhor.", "I try to do my best."], ["Tentas outra vez?", "Do you try again?"], ["Ela tenta ajudar.", "She tries to help."], ["Nós tentamos resolver.", "We try to solve."], ["Eles tentam chegar a horas.", "They try to arrive on time."],
  ["Tentei falar contigo.", "I tried to talk to you."], ["Tentaste outra vez?", "Did you try again?"], ["Ele tentou fugir.", "He tried to escape."], ["Tentámos resolver.", "We tried to solve."], ["Eles tentaram ajudar.", "They tried to help."],
  ["Eu tentava fazer melhor.", "I used to try to do better."], ["Tu tentavas outra vez?", "Did you use to try again?"], ["Ela tentava ajudar.", "She used to try to help."], ["Tentávamos resolver.", "We used to try to solve."], ["Eles tentavam chegar.", "They used to try to arrive."],
  ["Tentarei outra vez.", "I will try again."], ["Tentarás falar comigo?", "Will you try to talk to me?"], ["Ela tentará ajudar.", "She will try to help."], ["Tentaremos resolver.", "We will try to solve."], ["Eles tentarão chegar.", "They will try to arrive."],
  ["Tentaria outra vez.", "I would try again."], ["Tentarias falar?", "Would you try to talk?"], ["Ela tentaria ajudar.", "She would try to help."], ["Tentaríamos resolver.", "We would try to solve."], ["Eles tentariam ajudar.", "They would try to help."],
  ["Quero que tente.", "I want you to try."], ["Espero que tentes.", "I hope you try."], ["Convém que ela tente.", "She should try."], ["É preciso que tentemos.", "We need to try."], ["Exijo que tentem.", "I demand they try."],
];

// Override regular AR verbs with proper examples
data.verbs.CONTINUAR = { meta: { emoji: "🔄", english: "to continue", group: "Regular -AR", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "kohn-tee-noo-AHR" }, conjugations: fromData("A2", makeAR("CONTINUAR", "continu", continuarEx), [], []) };
data.verbs.USAR = { meta: { emoji: "🛠", english: "to use", group: "Regular -AR", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "oo-ZAHR" }, conjugations: fromData("A2", makeAR("USAR", "us", usarEx), [], []) };
data.verbs.PROCURAR = { meta: { emoji: "🔍", english: "to look for / to search", group: "Regular -AR", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "proh-koo-RAHR" }, conjugations: fromData("A2", makeAR("PROCURAR", "procur", procurarEx), [], []) };
data.verbs.GANHAR = { meta: { emoji: "🏆", english: "to win / to earn", group: "Regular -AR", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "gah-NYAHR" }, conjugations: fromData("A2", makeAR("GANHAR", "ganh", ganharEx), [], []) };
data.verbs.TENTAR = { meta: { emoji: "🎯", english: "to try / to attempt", group: "Regular -AR", priority: "Essential", difficulty: "Elementary", cefr: "A2", pronunciation: "tehn-TAHR" }, conjugations: fromData("A2", makeAR("TENTAR", "tent", tentarEx), [], []) };

// REPRESENTAR, FORMAR, REALIZAR, AFIRMAR, APRESENTAR, CONSIDERAR, TORNAR - use arExamples
["REPRESENTAR", "FORMAR", "REALIZAR", "AFIRMAR", "APRESENTAR", "CONSIDERAR", "TORNAR"].forEach((key, i) => {
  const stems = ["represent", "form", "realiz", "afirm", "apresent", "consider", "torn"];
  const verbs = ["represent", "form", "carry out", "affirm", "present", "consider", "become"];
  const ex = arExamples(stems[i], key, verbs[i]);
  const meta = { REPRESENTAR: { emoji: "🎭", priority: "Useful", pronunciation: "hreh-preh-zehn-TAHR" }, FORMAR: { emoji: "📚", priority: "Useful", pronunciation: "fohr-MAHR" }, REALIZAR: { emoji: "✅", priority: "Useful", pronunciation: "hreh-ah-lee-ZAHR" }, AFIRMAR: { emoji: "💬", priority: "Useful", pronunciation: "ah-feer-MAHR" }, APRESENTAR: { emoji: "👋", priority: "Useful", pronunciation: "ah-preh-zehn-TAHR" }, CONSIDERAR: { emoji: "🤔", priority: "Useful", pronunciation: "kohn-see-deh-RAHR" }, TORNAR: { emoji: "🔄", priority: "Useful", pronunciation: "tohr-NAHR" } }[key];
  const eng = { REPRESENTAR: "to represent", FORMAR: "to form / to train", REALIZAR: "to carry out / to achieve", AFIRMAR: "to affirm / to state", APRESENTAR: "to present / to introduce", CONSIDERAR: "to consider", TORNAR: "to become / to turn into" }[key];
  if (!data.verbs[key]) {
    data.verbs[key] = { meta: { ...meta, english: eng, group: "Regular -AR", difficulty: "Elementary", cefr: "A2" }, conjugations: fromData("A2", makeAR(key, stems[i], ex), [], []) };
    newKeys.push(key);
  }
});

newKeys.forEach((k) => data.order.push(k));
if (data.totalVerbs !== undefined) data.totalVerbs = data.order.length;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added 24 A2 verbs. Total:", data.order.length);
