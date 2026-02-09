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
const CEFR = ["A2","A2","A2","A2","A2","A2","A2","A2","A2","A2","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1","B1"];

const receberNote = "Regular -ER [tense].";
const receberData = [
  ["recebo", "Recebo muitos emails por dia.", "I receive many emails per day."],
  ["recebes", "Recebes o salário no fim do mês?", "Do you get your salary at the end of the month?"],
  ["recebe", "Ela recebe os clientes com um sorriso.", "She welcomes clients with a smile."],
  ["recebemos", "Recebemos boas notícias.", "We received good news."],
  ["recebem", "Recebem visitas ao domingo.", "They receive visitors on Sundays."],
  ["recebi", "Recebi o pacote ontem.", "I received the package yesterday."],
  ["recebeste", "Recebeste a minha mensagem?", "Did you get my message?"],
  ["recebeu", "Recebeu um prémio.", "He received an award."],
  ["recebemos", "Recebemos os amigos em casa.", "We hosted our friends at home."],
  ["receberam", "Receberam uma multa.", "They received a fine."],
  ["recebia", "Recebia cartas todas as semanas.", "I used to receive letters every week."],
  ["recebias", "Recebias muitas visitas?", "Did you used to receive many visitors?"],
  ["recebia", "Recebia sempre elogios.", "He always used to receive compliments."],
  ["recebíamos", "Recebíamos a família no Natal.", "We used to host the family at Christmas."],
  ["recebiam", "Recebiam pouco pelo trabalho.", "They used to earn little for the work."],
  ["receberei", "Receberei a resposta amanhã.", "I will receive the reply tomorrow."],
  ["receberás", "Receberás um desconto.", "You will receive a discount."],
  ["receberá", "Receberá o resultado na segunda.", "He will receive the result on Monday."],
  ["receberemos", "Receberemos os convidados às oito.", "We will welcome the guests at eight."],
  ["receberão", "Receberão uma surpresa.", "They will receive a surprise."],
  ["receberia", "Receberia com prazer.", "I would welcome with pleasure."],
  ["receberias", "Receberias mais se mudasses de emprego.", "You would earn more if you changed jobs."],
  ["receberia", "Receberia uma compensação.", "He would receive compensation."],
  ["receberíamos", "Receberíamos os amigos se tivéssemos espaço.", "We would host friends if we had space."],
  ["receberiam", "Receberiam uma resposta rápida.", "They would receive a quick reply."],
  ["receba", "Espero que receba boas notícias.", "I hope I receive good news."],
  ["recebas", "Quero que recebas isto.", "I want you to receive this."],
  ["receba", "Talvez ela receba uma promoção.", "Maybe she'll receive a promotion."],
  ["recebamos", "Esperamos que recebamos a encomenda.", "We hope we receive the order."],
  ["recebam", "Quero que recebam o convite.", "I want them to receive the invitation."],
];

const receberEntries = receberData.map((row, i) => {
  const tense = TENSES[i];
  return build(PERSONS[i % 5], tense, CEFR[i], "A2", row[0], row[1], row[2], "Regular Pattern", receberNote.replace("[tense]", tense));
});

const parecerSubjNote = "Spelling change: c→ç before a to preserve the /s/ sound.";
const parecerData = [
  ["pareço", "Pareço mais velho do que sou.", "I look older than I am."],
  ["pareces", "Pareces cansado hoje.", "You look tired today."],
  ["parece", "Parece que vai chover.", "It looks like it's going to rain."],
  ["parecemos", "Parecemos irmãos.", "We look like siblings."],
  ["parecem", "Parecem satisfeitos.", "They seem satisfied."],
  ["pareci", "Pareci surpreendido.", "I seemed surprised."],
  ["pareceste", "Pareceste nervoso na entrevista.", "You seemed nervous at the interview."],
  ["pareceu", "Pareceu-me boa ideia.", "It seemed like a good idea to me."],
  ["parecemos", "Parecemos estranhos com aquela roupa.", "We looked weird in those clothes."],
  ["pareceram", "Pareceram gostar.", "They seemed to like it."],
  ["parecia", "Parecia impossível.", "It seemed impossible."],
  ["parecias", "Parecias feliz naquela altura.", "You seemed happy at that time."],
  ["parecia", "Parecia que nunca mais acabava.", "It seemed like it would never end."],
  ["parecíamos", "Parecíamos perdidos.", "We looked lost."],
  ["pareciam", "Pareciam mais novos.", "They looked younger."],
  ["parecerei", "Parecerei ridículo.", "I will look ridiculous."],
  ["parecerás", "Parecerás um profissional.", "You will look like a professional."],
  ["parecerá", "Parecerá estranho no início.", "It will seem strange at first."],
  ["pareceremos", "Pareceremos organizados.", "We will seem organised."],
  ["parecerão", "Parecerão diferentes.", "They will look different."],
  ["pareceria", "Pareceria mal se não fosse.", "It would look bad if I didn't go."],
  ["parecerias", "Parecerias mais novo com essa roupa.", "You would look younger in those clothes."],
  ["pareceria", "Pareceria impossível.", "It would seem impossible."],
  ["pareceríamos", "Pareceríamos tolos.", "We would look foolish."],
  ["pareceriam", "Pareceriam satisfeitos.", "They would seem satisfied."],
  ["pareça", "Embora pareça difícil, é possível.", "Although it seems difficult, it's possible."],
  ["pareças", "Mesmo que pareças confiante, sei que estás nervoso.", "Even if you seem confident, I know you're nervous."],
  ["pareça", "Ainda que pareça estranho...", "Even though it may seem strange..."],
  ["pareçamos", "Mesmo que pareçamos preparados...", "Even if we seem prepared..."],
  ["pareçam", "Espero que pareçam bem nas fotos.", "I hope they look good in the photos."],
];

const parecerEntries = parecerData.map((row, i) => {
  const tense = TENSES[i];
  const isException = tense === "Present Subjunctive";
  return build(PERSONS[i % 5], tense, CEFR[i], "A2", row[0], row[1], row[2], isException ? "Exception" : "Regular Pattern", isException ? parecerSubjNote : "Regular -ER [tense]. PARECER = to seem/look like. parecer-se com = to resemble.".replace("[tense]", tense));
});

const pedirPresentEuNote = "Irregular 1st person: peço (stem change e→i, plus c→ç before o). PEDIR = to ask for/request/order. Not PERGUNTAR (to ask a question).";
const pedirSubjNote = "Irregular stem: peç- (with cedilla). Stem change from ped- to peç-. PEDIR = to ask for; PERGUNTAR = to ask a question.";
const pedirData = [
  ["peço", "Peço sempre um café depois do almoço.", "I always order a coffee after lunch."],
  ["pedes", "Pedes a conta?", "Will you ask for the bill?"],
  ["pede", "Ela pede ajuda quando precisa.", "She asks for help when she needs it."],
  ["pedimos", "Pedimos desculpa pelo atraso.", "We apologise for the delay."],
  ["pedem", "Pedem sempre a mesma coisa.", "They always order the same thing."],
  ["pedi", "Pedi um bolo e um café.", "I ordered a cake and a coffee."],
  ["pediste", "Pediste autorização?", "Did you ask for permission?"],
  ["pediu", "Pediu desculpa.", "He apologised."],
  ["pedimos", "Pedimos a ementa.", "We asked for the menu."],
  ["pediram", "Pediram um táxi.", "They ordered a taxi."],
  ["pedia", "Pedia sempre sopa.", "I always used to order soup."],
  ["pedias", "Pedias ajuda ao professor?", "Did you used to ask the teacher for help?"],
  ["pedia", "Pedia permissão antes de sair.", "He used to ask permission before leaving."],
  ["pedíamos", "Pedíamos pizza às sextas.", "We used to order pizza on Fridays."],
  ["pediam", "Pediam pouco.", "They used to ask for little."],
  ["pedirei", "Pedirei uma opinião ao advogado.", "I will ask the lawyer for an opinion."],
  ["pedirás", "Pedirás um aumento?", "Will you ask for a raise?"],
  ["pedirá", "Pedirá a transferência.", "He will request the transfer."],
  ["pediremos", "Pediremos mais informação.", "We will ask for more information."],
  ["pedirão", "Pedirão reforços.", "They will request reinforcements."],
  ["pediria", "Pediria se tivesse coragem.", "I would ask if I had the courage."],
  ["pedirias", "Pedirias emprestado?", "Would you borrow (ask to borrow)?"],
  ["pediria", "Pediria desculpa se percebesse.", "He would apologise if he understood."],
  ["pediríamos", "Pediríamos ajuda.", "We would ask for help."],
  ["pediriam", "Pediriam um desconto.", "They would ask for a discount."],
  ["peça", "Espero que peça com educação.", "I hope he asks politely."],
  ["peças", "Quero que peças desculpa.", "I want you to apologise."],
  ["peça", "Talvez ela peça um aumento.", "Maybe she'll ask for a raise."],
  ["peçamos", "Esperamos que peçamos a tempo.", "We hope we ask in time."],
  ["peçam", "Quero que peçam ajuda.", "I want them to ask for help."],
];

const pedirEntries = pedirData.map((row, i) => {
  const tense = TENSES[i];
  const isPresentEu = tense === "Present" && i === 0;
  const isSubj = tense === "Present Subjunctive";
  const type = (isPresentEu || isSubj) ? "Exception" : "Regular Pattern";
  const notes = isPresentEu ? pedirPresentEuNote : isSubj ? pedirSubjNote : "Regular -IR [tense]. PEDIR = to ask for/order. Not PERGUNTAR (to ask a question).".replace("[tense]", tense);
  return build(PERSONS[i % 5], tense, CEFR[i], "A2", row[0], row[1], row[2], type, notes);
});

data.order.push("RECEBER", "PARECER", "PEDIR");
data.verbs.RECEBER = { meta: { emoji: "📬", english: "to receive / to get / to welcome", group: "Regular -ER", priority: "Essential", difficulty: "Beginner", cefr: "A2" }, conjugations: receberEntries };
data.verbs.PARECER = { meta: { emoji: "👀", english: "to seem / to look like / to appear", group: "Regular -ER (with spelling change in subjunctive)", priority: "Useful", difficulty: "Beginner", cefr: "A2" }, conjugations: parecerEntries };
data.verbs.PEDIR = { meta: { emoji: "🙋", english: "to ask for / to request / to order", group: "Irregular -IR", priority: "Essential", difficulty: "Intermediate", cefr: "A2" }, conjugations: pedirEntries };
data.totalVerbs = 68;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added RECEBER, PARECER, PEDIR. totalVerbs:", data.totalVerbs);
