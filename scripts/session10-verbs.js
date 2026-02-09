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

function build(person, tense, cefrT, cefrV, conj, exPt, exEn, type, notes) {
  return { Person: person, Tense: tense, "CEFR (Tense)": cefrT, "CEFR (Verb)": cefrV, Conjugation: conj, "Example Sentence": exPt, "English Translation": exEn, Type: type, Notes: notes };
}

const TENSES = ["Present","Present","Present","Present","Present","Preterite","Preterite","Preterite","Preterite","Preterite","Imperfect","Imperfect","Imperfect","Imperfect","Imperfect","Future","Future","Future","Future","Future","Conditional","Conditional","Conditional","Conditional","Conditional","Present Subjunctive","Present Subjunctive","Present Subjunctive","Present Subjunctive","Present Subjunctive"];
const CEFR = ["A1","A1","A1","A1","A1","A1","A1","A1","A1","A1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1"];

// VIAJAR - Regular -AR. Fix: imperfect nós = viajávamos (not viajvamos)
const viajarNote = "Regular -AR [tense].";
const viajarData = [
  ["viajo", "Viajo muito por trabalho.", "I travel a lot for work."],
  ["viajas", "Viajas sozinho?", "Do you travel alone?"],
  ["viaja", "Ela viaja para Paris amanhã.", "She's travelling to Paris tomorrow."],
  ["viajamos", "Viajamos sempre nas férias de verão.", "We always travel in the summer holidays."],
  ["viajam", "Viajam de comboio.", "They travel by train."],
  ["viajei", "Viajei para o Japão no ano passado.", "I travelled to Japan last year."],
  ["viajaste", "Viajaste de avião?", "Did you travel by plane?"],
  ["viajou", "Viajou por toda a Europa.", "He travelled all over Europe."],
  ["viajamos", "Viajamos de carro até ao Algarve.", "We drove to the Algarve."],
  ["viajaram", "Viajaram juntos.", "They travelled together."],
  ["viajava", "Viajava muito quando era jovem.", "I used to travel a lot when I was young."],
  ["viajavas", "Viajavas com a família?", "Did you used to travel with your family?"],
  ["viajava", "Viajava sempre de primeira classe.", "He always used to travel first class."],
  ["viajávamos", "Viajávamos para o campo nos fins de semana.", "We used to travel to the countryside on weekends."],
  ["viajavam", "Viajavam todos os verões.", "They used to travel every summer."],
  ["viajarei", "Viajarei para os Açores.", "I will travel to the Azores."],
  ["viajarás", "Viajarás comigo?", "Will you travel with me?"],
  ["viajará", "Viajará na próxima semana.", "He will travel next week."],
  ["viajaremos", "Viajaremos de barco.", "We will travel by boat."],
  ["viajarão", "Viajarão para a Madeira.", "They will travel to Madeira."],
  ["viajaria", "Viajaria mais se tivesse dinheiro.", "I would travel more if I had money."],
  ["viajarias", "Viajarias para onde?", "Where would you travel to?"],
  ["viajaria", "Viajaria pelo mundo inteiro.", "He would travel the whole world."],
  ["viajaríamos", "Viajaríamos de comboio.", "We would travel by train."],
  ["viajariam", "Viajariam se pudessem.", "They would travel if they could."],
  ["viaje", "Espero que viaje em segurança.", "I hope I travel safely."],
  ["viajes", "Quero que viajes comigo.", "I want you to travel with me."],
  ["viaje", "Talvez ela viaje no verão.", "Maybe she'll travel in summer."],
  ["viajemos", "Esperamos que viajemos juntos.", "We hope we travel together."],
  ["viajem", "Quero que viajem de avião.", "I want them to travel by plane."],
];

const viajarEntries = viajarData.map((row, i) => build(PERSONS[i % 5], TENSES[i], CEFR[i], "A1", row[0], row[1], row[2], "Regular Pattern", viajarNote.replace("[tense]", TENSES[i])));

// PREFERIR - Irregular -IR: Present eu + all Subjunctive = Exception (e→i)
const preferirPresentEuNote = "Stem change: e→i in 1st person (prefiro, not *prefero).";
const preferirSubjNote = "Stem change: e→i throughout (prefira, prefiras, etc.).";
const preferirData = [
  ["prefiro", "Prefiro chá a café.", "I prefer tea to coffee."],
  ["preferes", "Preferes ir ao cinema ou ao teatro?", "Do you prefer going to the cinema or the theatre?"],
  ["prefere", "Ela prefere ficar em casa.", "She prefers to stay at home."],
  ["preferimos", "Preferimos viajar de comboio.", "We prefer to travel by train."],
  ["preferem", "Preferem comida caseira.", "They prefer homemade food."],
  ["preferi", "Preferi ficar calado.", "I preferred to stay quiet."],
  ["preferiste", "Preferiste o azul?", "Did you prefer the blue one?"],
  ["preferiu", "Preferiu não comentar.", "He preferred not to comment."],
  ["preferimos", "Preferimos ir a pé.", "We preferred to walk."],
  ["preferiram", "Preferiram esperar.", "They preferred to wait."],
  ["preferia", "Preferia chocolate quando era miúdo.", "I used to prefer chocolate when I was a kid."],
  ["preferias", "Preferias o campo ou a praia?", "Did you used to prefer the countryside or the beach?"],
  ["preferia", "Preferia trabalhar sozinho.", "He used to prefer to work alone."],
  ["preferíamos", "Preferíamos jantar cedo.", "We used to prefer eating dinner early."],
  ["preferiam", "Preferiam o verão.", "They used to prefer summer."],
  ["preferirei", "Preferirei esperar pela tua resposta.", "I will prefer to wait for your answer."],
  ["preferirás", "Preferirás mudar de ideias.", "You will prefer to change your mind."],
  ["preferirá", "Preferirá a opção mais barata.", "He will prefer the cheaper option."],
  ["preferiremos", "Preferiremos ir no sábado.", "We will prefer to go on Saturday."],
  ["preferirão", "Preferirão ficar.", "They will prefer to stay."],
  ["preferiria", "Preferiria não ir.", "I would prefer not to go."],
  ["preferirias", "Preferirias outra cor?", "Would you prefer another colour?"],
  ["preferiria", "Preferiria algo mais simples.", "He would prefer something simpler."],
  ["preferiríamos", "Preferiríamos adiar.", "We would prefer to postpone."],
  ["prefeririam", "Prefeririam o hotel.", "They would prefer the hotel."],
  ["prefira", "Embora prefira ficar, vou sair.", "Although I prefer to stay, I'll go out."],
  ["prefiras", "O que quer que prefiras, está bem.", "Whatever you prefer, that's fine."],
  ["prefira", "Caso ela prefira outro dia...", "In case she prefers another day..."],
  ["prefiramos", "Mesmo que prefiramos outra opção...", "Even if we prefer another option..."],
  ["prefiram", "Espero que prefiram a nossa proposta.", "I hope they prefer our proposal."],
];

const preferirEntries = preferirData.map((row, i) => {
  const tense = TENSES[i];
  const isPresentEu = tense === "Present" && i === 0;
  const isSubj = tense === "Present Subjunctive";
  const type = (isPresentEu || isSubj) ? "Exception" : "Regular Pattern";
  const notes = isPresentEu ? preferirPresentEuNote : isSubj ? preferirSubjNote : "Regular -IR [tense]. PREFERIR = to prefer (noun or infinitive).".replace("[tense]", tense);
  return build(PERSONS[i % 5], tense, CEFR[i], "A2", row[0], row[1], row[2], type, notes);
});

// DEVER - Regular -ER. Special notes for Imperfect and Conditional (modal uses)
const deverNote = "Regular -ER [tense]. DEVER as modal: must/should (obligation/probability). DEVER as verb: to owe.";
const deverImperfectNote = "Regular -ER Imperfect. DEVIA + infinitive = 'should have' (past advice/regret). Very common in EP: Devias ter vindo. (You should have come.)";
const deverConditionalNote = "Regular -ER Conditional. DEVERIA + infinitive = 'should' (polite advice). Deverias ir ao médico. (You should go to the doctor.)";
const deverData = [
  ["devo", "Devo ir ao médico.", "I should go to the doctor."],
  ["deves", "Deves ter mais cuidado.", "You should be more careful."],
  ["deve", "Deve estar a chover lá fora.", "It must be raining outside."],
  ["devemos", "Devemos chegar a tempo.", "We should arrive on time."],
  ["devem", "Devem estar a dormir.", "They must be sleeping."],
  ["devi", "Devi ter sido eu.", "It must have been me."],
  ["deveste", "Deveste ficar preocupado.", "You must have been worried."],
  ["deveu", "Deveu-me vinte euros.", "He owed me twenty euros."],
  ["devemos", "Devemos ter errado o caminho.", "We must have taken the wrong way."],
  ["deveram", "Deveram muito dinheiro ao banco.", "They owed a lot of money to the bank."],
  ["devia", "Devia ter estudado mais.", "I should have studied more."],
  ["devias", "Devias ter vindo.", "You should have come."],
  ["devia", "Devia ser meia-noite quando chegámos.", "It must have been midnight when we arrived."],
  ["devíamos", "Devíamos ter pedido ajuda.", "We should have asked for help."],
  ["deviam", "Deviam ter avisado.", "They should have warned us."],
  ["deverei", "Deverei entregar o relatório amanhã.", "I will have to hand in the report tomorrow."],
  ["deverás", "Deverás pagar antes do prazo.", "You will have to pay before the deadline."],
  ["deverá", "Deverá comparecer em tribunal.", "He will have to appear in court."],
  ["deveremos", "Deveremos decidir em breve.", "We will have to decide soon."],
  ["deverão", "Deverão apresentar os documentos.", "They will have to present the documents."],
  ["deveria", "Deveria ligar à minha mãe.", "I should call my mother."],
  ["deverias", "Deverias ir ao médico.", "You should go to the doctor."],
  ["deveria", "Deveria pedir desculpa.", "He should apologise."],
  ["deveríamos", "Deveríamos poupar mais.", "We should save more."],
  ["deveriam", "Deveriam ter mais cuidado.", "They should be more careful."],
  ["deva", "Caso deva pagar, avisa-me.", "If I have to pay, let me know."],
  ["devas", "Mesmo que devas partir, despede-te.", "Even if you must leave, say goodbye."],
  ["deva", "Talvez deva esperar.", "Maybe he should wait."],
  ["devamos", "Caso devamos cancelar...", "In case we have to cancel..."],
  ["devam", "Espero que devam pouco.", "I hope they owe little."],
];

const deverEntries = deverData.map((row, i) => {
  const tense = TENSES[i];
  let notes = deverNote.replace("[tense]", tense);
  if (tense === "Imperfect") notes = deverImperfectNote;
  if (tense === "Conditional") notes = deverConditionalNote;
  return build(PERSONS[i % 5], tense, CEFR[i], "A2", row[0], row[1], row[2], "Regular Pattern", notes);
});

data.order.push("VIAJAR", "PREFERIR", "DEVER");
data.verbs.VIAJAR = { meta: { emoji: "✈️", english: "to travel", group: "Regular -AR", priority: "Useful", difficulty: "Beginner", cefr: "A1" }, conjugations: viajarEntries };
data.verbs.PREFERIR = { meta: { emoji: "👍", english: "to prefer", group: "Irregular -IR", priority: "Useful", difficulty: "Intermediate", cefr: "A2" }, conjugations: preferirEntries };
data.verbs.DEVER = { meta: { emoji: "📌", english: "to must / to owe / should", group: "Regular -ER", priority: "Essential", difficulty: "Beginner", cefr: "A2" }, conjugations: deverEntries };
data.totalVerbs = 71;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added VIAJAR, PREFERIR, DEVER. totalVerbs:", data.totalVerbs);
