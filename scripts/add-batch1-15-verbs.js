#!/usr/bin/env node
/**
 * Add 15 new A1 verbs to verbs.json (Batch 1).
 * Run from project root: node scripts/add-batch1-15-verbs.js
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
  return {
    Person: person,
    Tense: tense,
    "CEFR (Tense)": CEFR_TENSE[tense],
    "CEFR (Verb)": cefrV,
    Conjugation: conj,
    "Example Sentence": exPt,
    "English Translation": exEn,
    Type: type,
    Notes: notes,
  };
}

function fromData(key, cefrV, dataRows, types, notes) {
  const out = [];
  for (let i = 0; i < 30; i++) {
    const p = i % 5;
    const t = TENSES[Math.floor(i / 5)];
    out.push(build(PERSONS[p], t, cefrV, dataRows[i][0], dataRows[i][1], dataRows[i][2], types[i] || "Regular Conjugation", notes[i] || ""));
  }
  return out;
}

// —— HAVER ——
const haverData = [
  ["hei", "Nunca hei de esquecer.", "I will never forget."],
  ["hás", "Tu hás de conseguir.", "You will manage."],
  ["há", "Há um café na esquina.", "There is a café on the corner."],
  ["havemos", "Havemos de voltar.", "We will return."],
  ["hão", "Hão de chegar cedo.", "They will arrive early."],
  ["houve", "Houve um problema.", "There was a problem."],
  ["houveste", "Tu houveste tempo?", "Did you have time?"],
  ["houve", "Ontem houve festa.", "Yesterday there was a party."],
  ["houvemos", "Nós houvemos de pagar.", "We had to pay."],
  ["houveram", "Houveram muitos acidentes.", "There were many accidents."],
  ["havia", "Antes havia mais lojas.", "There used to be more shops."],
  ["havias", "Tu havias de estudar.", "You were supposed to study."],
  ["havia", "Havia muita gente.", "There were a lot of people."],
  ["havíamos", "Havíamos de ir.", "We were going to go."],
  ["haviam", "Haviam muitos turistas.", "There were many tourists."],
  ["haverei", "Haverei de explicar.", "I will have to explain."],
  ["haverás", "Haverás de ver.", "You will see."],
  ["haverá", "Haverá reunião amanhã.", "There will be a meeting tomorrow."],
  ["haveremos", "Haveremos de tentar.", "We will have to try."],
  ["haverão", "Haverão de concordar.", "They will have to agree."],
  ["haveria", "Haveria mais espaço.", "There would be more space."],
  ["haverias", "Tu haverias de gostar.", "You would like it."],
  ["haveria", "Haveria tempo?", "Would there be time?"],
  ["haveríamos", "Haveríamos de avisar.", "We would have to tell."],
  ["haveriam", "Haveriam dificuldades.", "There would be difficulties."],
  ["haja", "Espero que haja lugar.", "I hope there is room."],
  ["hajas", "Que tu hajas paz.", "May you have peace."],
  ["haja", "É preciso que haja silêncio.", "There needs to be silence."],
  ["hajamos", "É possível que hajamos de ir.", "It's possible we will have to go."],
  ["hajam", "Quero que hajam cuidado.", "I want them to be careful."],
];
const haverTypes = Array(30).fill("Exception");
const haverNotes = [
  "HAVER: 1st person rarely used. Impersonal 'há' (there is/are) is most common.",
  "2nd person. Often in 'hás de' (you will).",
  "Impersonal 'há' = there is/are. Most used form in EP.",
  "1st pl. Literary; 'havemos de' = we will.",
  "3rd pl. 'hão de' = they will.",
  ...Array(25).fill(""),
];

// —— LER ——
const lerData = [
  ["leio", "Eu leio o jornal todos os dias.", "I read the newspaper every day."],
  ["lês", "Tu lês muito?", "Do you read a lot?"],
  ["lê", "Ela lê antes de dormir.", "She reads before sleeping."],
  ["lemos", "Nós lemos o mesmo livro.", "We read the same book."],
  ["lêem", "Eles lêem em português.", "They read in Portuguese."],
  ["li", "Eu li o livro ontem.", "I read the book yesterday."],
  ["leste", "Tu leste o artigo?", "Did you read the article?"],
  ["leu", "Ela leu a mensagem.", "She read the message."],
  ["lemos", "Nós lemos o relatório.", "We read the report."],
  ["leram", "Eles leram os emails.", "They read the emails."],
  ["lia", "Eu lia muitos livros.", "I used to read many books."],
  ["lias", "Tu lias antes de dormir?", "Did you use to read before sleeping?"],
  ["lia", "Ela lia o jornal.", "She used to read the newspaper."],
  ["líamos", "Nós líamos em voz alta.", "We used to read aloud."],
  ["liam", "Eles liam na biblioteca.", "They used to read in the library."],
  ["lerei", "Eu lerei o contrato.", "I will read the contract."],
  ["lerás", "Tu lerás quando tiveres tempo.", "You will read when you have time."],
  ["lerá", "Ela lerá amanhã.", "She will read tomorrow."],
  ["leremos", "Nós leremos em conjunto.", "We will read together."],
  ["lerão", "Eles lerão o documento.", "They will read the document."],
  ["leria", "Eu leria se tivesse tempo.", "I would read if I had time."],
  ["lerias", "Tu lerias o quê?", "What would you read?"],
  ["leria", "Ela leria o livro.", "She would read the book."],
  ["leríamos", "Nós leríamos mais.", "We would read more."],
  ["leriam", "Eles leriam com prazer.", "They would read with pleasure."],
  ["leia", "Espero que eu leia isso.", "I hope I read that."],
  ["leias", "Quero que tu leias o texto.", "I want you to read the text."],
  ["leia", "É importante que ela leia.", "It's important that she reads."],
  ["leiamos", "Convém que leiamos as instruções.", "We should read the instructions."],
  ["leiam", "Exijo que leiam o aviso.", "I demand that they read the notice."],
];
const lerTypes = ["Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Exception", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Regular Conjugation", "Exception", "Exception", "Exception", "Exception", "Exception"];
const lerNotes = ["LER: irregular present. Stem changes to 'lei-' in 1st sg.", "Note accent on 'lês'.", "Circumflex on 'lê'.", "", "Two syllables: lê-em. Circumflex on first 'e'.", "Preterite 1st sg. Irregular.", "", "", "Same form as present.", "", "Stem 'li-' + -a.", "", "", "Accent on 'í'.", "", ...Array(15).fill("")];

// —— Regular -AR: OLHAR, ACHAR, FECHAR, TOMAR, CONTAR, MOSTRAR, CRIAR, TRATAR ——
function makeAR(key, stem, examples) {
  const inf = key.toLowerCase();
  const subjStem = stem.slice(0, -2) + "e";
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
  return rows;
}

const olharEx = [
  ["Olho para o relógio.", "I look at the clock."], ["Olhas para mim?", "Do you look at me?"], ["Ela olha pela janela.", "She looks out the window."], ["Nós olhamos para o mapa.", "We look at the map."], ["Eles olham para o ecrã.", "They look at the screen."],
  ["Olhei para o telemóvel.", "I looked at my mobile."], ["Olhaste para a hora?", "Did you look at the time?"], ["Ele olhou para ela.", "He looked at her."], ["Nós olhámos para o céu.", "We looked at the sky."], ["Eles olharam para a rua.", "They looked at the street."],
  ["Eu olhava pela janela.", "I used to look out the window."], ["Tu olhavas para o quadro.", "You used to look at the board."], ["Ela olhava para o mar.", "She used to look at the sea."], ["Nós olhávamos para as estrelas.", "We used to look at the stars."], ["Eles olhavam para o autocarro.", "They used to look at the bus."],
  ["Olharei quando puder.", "I will look when I can."], ["Olharás para o ecrã.", "You will look at the screen."], ["Ela olhará para ti.", "She will look at you."], ["Olharemos pela janela.", "We will look out the window."], ["Eles olharão para o quadro.", "They will look at the board."],
  ["Olharia outra vez.", "I would look again."], ["Olharias para mim?", "Would you look at me?"], ["Ela olharia para a lista.", "She would look at the list."], ["Olharíamos com atenção.", "We would look carefully."], ["Eles olhariam para o mapa.", "They would look at the map."],
  ["Espero que eu olhe.", "I hope I look."], ["Quero que olhes para mim.", "I want you to look at me."], ["É bom que ela olhe.", "It's good that she looks."], ["Convém que olhemos.", "We should look."], ["Exijo que olhem para aqui.", "I demand they look here."],
];
const acharEx = [
  ["Acho que sim.", "I think so."], ["Achas que chove?", "Do you think it will rain?"], ["Ela acha estranho.", "She finds it strange."], ["Nós achamos bem.", "We think it's fine."], ["Eles acham difícil.", "They find it difficult."],
  ["Achei o livro.", "I found the book."], ["Achaste a chave?", "Did you find the key?"], ["Ele achou a solução.", "He found the solution."], ["Nós achámos o caminho.", "We found the way."], ["Eles acharam o erro.", "They found the mistake."],
  ["Eu achava que sim.", "I used to think so."], ["Tu achavas engraçado.", "You used to find it funny."], ["Ela achava estranho.", "She used to find it strange."], ["Nós achávamos normal.", "We used to find it normal."], ["Eles achavam fácil.", "They used to find it easy."],
  ["Acharei a resposta.", "I will find the answer."], ["Acharás a saída.", "You will find the way out."], ["Ela achará uma solução.", "She will find a solution."], ["Acharemos o telemóvel.", "We will find the mobile."], ["Eles acharão o problema.", "They will find the problem."],
  ["Acharia melhor assim.", "I would find it better this way."], ["Acharias a chave?", "Would you find the key?"], ["Ela acharia estranho.", "She would find it strange."], ["Acharíamos uma solução.", "We would find a solution."], ["Eles achariam difícil.", "They would find it difficult."],
  ["Talvez eu ache.", "Maybe I'll find."], ["Espero que aches.", "I hope you find."], ["Duvido que ela ache.", "I doubt she finds."], ["É possível que achemos.", "It's possible we find."], ["Quero que achem.", "I want them to find."],
];
const fecharEx = [
  ["Feicho a porta.", "I close the door."], ["Fechas a janela?", "Do you close the window?"], ["Ele fecha a loja.", "He closes the shop."], ["Nós fechamos às seis.", "We close at six."], ["Eles fecham o café.", "They close the café."],
  ["Fechei a porta.", "I closed the door."], ["Fechaste a janela?", "Did you close the window?"], ["Ela fechou a loja.", "She closed the shop."], ["Nós fechámos cedo.", "We closed early."], ["Eles fecharam o portão.", "They closed the gate."],
  ["Eu fechava a porta.", "I used to close the door."], ["Tu fechavas a janela.", "You used to close the window."], ["Ela fechava às oito.", "She used to close at eight."], ["Nós fechávamos cedo.", "We used to close early."], ["Eles fechavam o escritório.", "They used to close the office."],
  ["Fecharei a porta.", "I will close the door."], ["Fecharás a janela?", "Will you close the window?"], ["Ela fechará a loja.", "She will close the shop."], ["Fecharemos às sete.", "We will close at seven."], ["Eles fecharão o portão.", "They will close the gate."],
  ["Fecharia a janela.", "I would close the window."], ["Fecharias a porta?", "Would you close the door?"], ["Ela fecharia a loja.", "She would close the shop."], ["Fecharíamos mais cedo.", "We would close earlier."], ["Eles fechariam o café.", "They would close the café."],
  ["Quero que feche a porta.", "I want you to close the door."], ["É preciso que feches a janela.", "You need to close the window."], ["Convém que ela feche.", "She should close."], ["Espero que fechemos cedo.", "I hope we close early."], ["Exijo que fechem a porta.", "I demand they close the door."],
];
const tomarEx = [
  ["Tomo o pequeno-almoço cedo.", "I have breakfast early."], ["Tomas café?", "Do you have coffee?"], ["Ela toma o autocarro.", "She takes the bus."], ["Nós tomamos conta.", "We take care."], ["Eles tomam decisões.", "They make decisions."],
  ["Tomei o comboio.", "I took the train."], ["Tomaste o café?", "Did you have the coffee?"], ["Ele tomou banho.", "He had a shower."], ["Nós tomámos o pequeno-almoço.", "We had breakfast."], ["Eles tomaram o avião.", "They took the plane."],
  ["Eu tomava café.", "I used to have coffee."], ["Tu tomavas o autocarro.", "You used to take the bus."], ["Ela tomava conta.", "She used to take care."], ["Nós tomávamos o pequeno-almoço.", "We used to have breakfast."], ["Eles tomavam o comboio.", "They used to take the train."],
  ["Tomarei o próximo.", "I will take the next one."], ["Tomarás café?", "Will you have coffee?"], ["Ela tomará conta.", "She will take care."], ["Tomaremos o autocarro.", "We will take the bus."], ["Eles tomarão decisões.", "They will make decisions."],
  ["Tomaria um chá.", "I would have tea."], ["Tomarias o comboio?", "Would you take the train?"], ["Ela tomaria conta.", "She would take care."], ["Tomaríamos o pequeno-almoço.", "We would have breakfast."], ["Eles tomariam o autocarro.", "They would take the bus."],
  ["Quero que tome o café.", "I want you to have the coffee."], ["Espero que tomes o pequeno-almoço.", "I hope you have breakfast."], ["Convém que ela tome.", "She should take."], ["É bom que tomemos.", "It's good that we take."], ["Quero que tomem cuidado.", "I want them to be careful."],
];
const contarEx = [
  ["Conto uma história.", "I tell a story."], ["Contas o dinheiro?", "Do you count the money?"], ["Ela conta os dias.", "She counts the days."], ["Nós contamos contigo.", "We're counting on you."], ["Eles contam as calorias.", "They count the calories."],
  ["Contei os euros.", "I counted the euros."], ["Contaste a história?", "Did you tell the story?"], ["Ele contou a verdade.", "He told the truth."], ["Nós contámos os votos.", "We counted the votes."], ["Eles contaram as moedas.", "They counted the coins."],
  ["Eu contava histórias.", "I used to tell stories."], ["Tu contavas as horas.", "You used to count the hours."], ["Ela contava o dinheiro.", "She used to count the money."], ["Nós contávamos histórias.", "We used to tell stories."], ["Eles contavam os dias.", "They used to count the days."],
  ["Contarei a história.", "I will tell the story."], ["Contarás os euros?", "Will you count the euros?"], ["Ela contará contigo.", "She will count on you."], ["Contaremos os votos.", "We will count the votes."], ["Eles contarão as calorias.", "They will count the calories."],
  ["Contaria a verdade.", "I would tell the truth."], ["Contarias a história?", "Would you tell the story?"], ["Ela contaria contigo.", "She would count on you."], ["Contaríamos os votos.", "We would count the votes."], ["Eles contariam os dias.", "They would count the days."],
  ["Quero que conte a verdade.", "I want you to tell the truth."], ["Espero que contes a história.", "I hope you tell the story."], ["É importante que ela conte.", "It's important that she tells."], ["Convém que contemos.", "We should tell."], ["Exijo que contem os votos.", "I demand they count the votes."],
];
const mostrarEx = [
  ["Mostro o telemóvel.", "I show my mobile."], ["Mostras a foto?", "Do you show the photo?"], ["Ela mostra o caminho.", "She shows the way."], ["Nós mostramos a casa.", "We show the house."], ["Eles mostram o documento.", "They show the document."],
  ["Mostrei o bilhete.", "I showed the ticket."], ["Mostraste a morada?", "Did you show the address?"], ["Ele mostrou o passaporte.", "He showed the passport."], ["Nós mostrámos a sala.", "We showed the room."], ["Eles mostraram o cartão.", "They showed the card."],
  ["Eu mostrava o caminho.", "I used to show the way."], ["Tu mostravas as fotos.", "You used to show the photos."], ["Ela mostrava a casa.", "She used to show the house."], ["Nós mostrávamos os documentos.", "We used to show the documents."], ["Eles mostravam o bilhete.", "They used to show the ticket."],
  ["Mostrarei o passaporte.", "I will show the passport."], ["Mostrarás a morada?", "Will you show the address?"], ["Ela mostrará o cartão.", "She will show the card."], ["Mostraremos a casa.", "We will show the house."], ["Eles mostrarão o documento.", "They will show the document."],
  ["Mostraria o bilhete.", "I would show the ticket."], ["Mostrarias o passaporte?", "Would you show the passport?"], ["Ela mostraria o caminho.", "She would show the way."], ["Mostraríamos a casa.", "We would show the house."], ["Eles mostrariam o cartão.", "They would show the card."],
  ["Quero que mostre o bilhete.", "I want you to show the ticket."], ["Espero que mostres o passaporte.", "I hope you show the passport."], ["Convém que ela mostre.", "She should show."], ["É preciso que mostremos.", "We need to show."], ["Exijo que mostrem o documento.", "I demand they show the document."],
];
const criarEx = [
  ["Crio conteúdo.", "I create content."], ["Crias os filhos?", "Do you raise the children?"], ["Ela cria dificuldades.", "She creates difficulties."], ["Nós criamos uma empresa.", "We created a company."], ["Eles criam oportunidades.", "They create opportunities."],
  ["Criei uma conta.", "I created an account."], ["Criaste o ficheiro?", "Did you create the file?"], ["Ele criou a empresa.", "He created the company."], ["Nós criámos o projeto.", "We created the project."], ["Eles criaram uma app.", "They created an app."],
  ["Eu criava jogos.", "I used to create games."], ["Tu criavas problemas.", "You used to create problems."], ["Ela criava os filhos.", "She used to raise the children."], ["Nós criávamos projetos.", "We used to create projects."], ["Eles criavam conteúdo.", "They used to create content."],
  ["Criarei uma conta.", "I will create an account."], ["Criarás oportunidades?", "Will you create opportunities?"], ["Ela criará a empresa.", "She will create the company."], ["Criaremos o projeto.", "We will create the project."], ["Eles criarão uma app.", "They will create an app."],
  ["Criaria uma empresa.", "I would create a company."], ["Criarias uma conta?", "Would you create an account?"], ["Ela criaria oportunidades.", "She would create opportunities."], ["Criaríamos um projeto.", "We would create a project."], ["Eles criariam uma app.", "They would create an app."],
  ["Quero que crie uma conta.", "I want you to create an account."], ["Espero que cries o ficheiro.", "I hope you create the file."], ["Convém que ela crie.", "She should create."], ["É bom que criemos.", "It's good that we create."], ["Exijo que criem uma conta.", "I demand they create an account."],
];
const tratarEx = [
  ["Trato do assunto.", "I deal with the matter."], ["Tratas dos clientes?", "Do you deal with the clients?"], ["Ela trata bem de todos.", "She treats everyone well."], ["Nós tratamos do pedido.", "We deal with the request."], ["Eles tratam do problema.", "They deal with the problem."],
  ["Tratei da papelada.", "I dealt with the paperwork."], ["Trataste do assunto?", "Did you deal with the matter?"], ["Ele tratou do cliente.", "He dealt with the client."], ["Nós tratámos do caso.", "We dealt with the case."], ["Eles trataram do problema.", "They dealt with the problem."],
  ["Eu tratava dos emails.", "I used to deal with the emails."], ["Tu tratavas dos clientes.", "You used to deal with the clients."], ["Ela tratava do assunto.", "She used to deal with the matter."], ["Nós tratávamos dos pedidos.", "We used to deal with requests."], ["Eles tratavam dos casos.", "They used to deal with the cases."],
  ["Tratarei do assunto.", "I will deal with the matter."], ["Tratarás do cliente?", "Will you deal with the client?"], ["Ela tratará do pedido.", "She will deal with the request."], ["Trataremos do problema.", "We will deal with the problem."], ["Eles tratarão do caso.", "They will deal with the case."],
  ["Trataria do assunto.", "I would deal with the matter."], ["Tratarias do cliente?", "Would you deal with the client?"], ["Ela trataria do pedido.", "She would deal with the request."], ["Trataríamos do caso.", "We would deal with the case."], ["Eles tratariam do problema.", "They would deal with the problem."],
  ["Quero que trate do assunto.", "I want you to deal with the matter."], ["Espero que trates do cliente.", "I hope you deal with the client."], ["Convém que ela trate.", "She should deal with it."], ["É preciso que tratemos.", "We need to deal with it."], ["Exijo que tratem do problema.", "I demand they deal with the problem."],
];

// Fix: FECHAR is regular -AR but "feicho" is wrong — EP is "fecho" (e from stem fech-)
fecharEx[0][0] = "Fecho a porta.";
fecharEx[0][1] = "I close the door.";

const arVerbs = [
  { key: "OLHAR", stem: "olh", english: "to look (at)", emoji: "👀", priority: "Essential", pronunciation: "oh-LYAHR", examples: olharEx },
  { key: "ACHAR", stem: "ach", english: "to think / to find", emoji: "💭", priority: "Essential", pronunciation: "ah-SHAHR", examples: acharEx },
  { key: "FECHAR", stem: "fech", english: "to close", emoji: "🔒", priority: "Essential", pronunciation: "feh-SHAHR", examples: fecharEx },
  { key: "TOMAR", stem: "tom", english: "to take / to drink", emoji: "☕", priority: "Essential", pronunciation: "toh-MAHR", examples: tomarEx },
  { key: "CONTAR", stem: "cont", english: "to tell / to count", emoji: "🔢", priority: "Essential", pronunciation: "kohn-TAHR", examples: contarEx },
  { key: "MOSTRAR", stem: "mostr", english: "to show", emoji: "👁", priority: "Core", pronunciation: "moosh-TRAHR", examples: mostrarEx },
  { key: "CRIAR", stem: "cri", english: "to create / to raise", emoji: "✨", priority: "Useful", pronunciation: "kree-AHR", examples: criarEx },
  { key: "TRATAR", stem: "trat", english: "to treat / to deal with", emoji: "🤝", priority: "Useful", pronunciation: "trah-TAHR", examples: tratarEx },
];

// Regular -ER: VENDER, COMPREENDER
function makeER(key, stem, examples) {
  const inf = key.toLowerCase();
  const forms = [
    [stem + "o", stem + "es", stem + "e", stem + "emos", stem + "em"],
    [stem + "i", stem + "este", stem + "eu", stem + "emos", stem + "eram"],
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
const venderEx = [
  ["Vendo a casa.", "I'm selling the house."], ["Vendes o carro?", "Do you sell the car?"], ["Ela vende flores.", "She sells flowers."], ["Nós vendemos na feira.", "We sell at the market."], ["Eles vendem bilhetes.", "They sell tickets."],
  ["Vendi o apartamento.", "I sold the flat."], ["Vendeste o carro?", "Did you sell the car?"], ["Ele vendeu a loja.", "He sold the shop."], ["Nós vendemos tudo.", "We sold everything."], ["Eles venderam a empresa.", "They sold the company."],
  ["Eu vendia na feira.", "I used to sell at the market."], ["Tu vendias flores.", "You used to sell flowers."], ["Ela vendia bilhetes.", "She used to sell tickets."], ["Nós vendíamos na loja.", "We used to sell at the shop."], ["Eles vendiam na rua.", "They used to sell in the street."],
  ["Venderei o carro.", "I will sell the car."], ["Venderás a casa?", "Will you sell the house?"], ["Ela venderá a loja.", "She will sell the shop."], ["Venderemos na feira.", "We will sell at the market."], ["Eles venderão tudo.", "They will sell everything."],
  ["Venderia o apartamento.", "I would sell the flat."], ["Venderias o carro?", "Would you sell the car?"], ["Ela venderia a casa.", "She would sell the house."], ["Venderíamos a loja.", "We would sell the shop."], ["Eles venderiam tudo.", "They would sell everything."],
  ["Quero que venda o carro.", "I want you to sell the car."], ["Espero que vendas a casa.", "I hope you sell the house."], ["Convém que ela venda.", "She should sell."], ["É bom que vendamos.", "It's good that we sell."], ["Exijo que vendam a loja.", "I demand they sell the shop."],
];
const compreenderEx = [
  ["Compreendo a situação.", "I understand the situation."], ["Compreendes o problema?", "Do you understand the problem?"], ["Ela compreende português.", "She understands Portuguese."], ["Nós compreendemos as regras.", "We understand the rules."], ["Eles compreendem a mensagem.", "They understand the message."],
  ["Compreendi tudo.", "I understood everything."], ["Compreendeste a explicação?", "Did you understand the explanation?"], ["Ele compreendeu o erro.", "He understood the mistake."], ["Nós compreendemos a lição.", "We understood the lesson."], ["Eles compreenderam o aviso.", "They understood the notice."],
  ["Eu compreendia pouco.", "I used to understand little."], ["Tu compreendias as instruções?", "Did you use to understand the instructions?"], ["Ela compreendia o texto.", "She used to understand the text."], ["Nós compreendíamos a matéria.", "We used to understand the subject."], ["Eles compreendiam a pergunta.", "They used to understand the question."],
  ["Compreenderei com o tempo.", "I will understand in time."], ["Compreenderás a resposta?", "Will you understand the answer?"], ["Ela compreenderá tudo.", "She will understand everything."], ["Compreenderemos a situação.", "We will understand the situation."], ["Eles compreenderão o problema.", "They will understand the problem."],
  ["Compreenderia se explicares.", "I would understand if you explain."], ["Compreenderias a mensagem?", "Would you understand the message?"], ["Ela compreenderia o erro.", "She would understand the mistake."], ["Compreenderíamos as regras.", "We would understand the rules."], ["Eles compreenderiam tudo.", "They would understand everything."],
  ["Espero que compreenda.", "I hope I understand."], ["Quero que compreendas o texto.", "I want you to understand the text."], ["É importante que ela compreenda.", "It's important that she understands."], ["Convém que compreendamos.", "We should understand."], ["Exijo que compreendam a situação.", "I demand they understand the situation."],
];
// -ER preterite 1st pl: vendemos (no accent in EP for -ER - actually in EP it's vendemos with closed e; orthographically it can be vendêmos with circumflex). Check: in ABRIR we have "abrimos" for preterite 1st pl (same as present). For -ER: comemos (comer), vendemos (vender). So no accent. So stem + "emos" for preterite 1st pl - but that's same as present! So we need vendemos for both present and preterite 1st pl. So forms[1][3] = stem + "emos" for -ER. So vender: vendo, vendes, vende, vendemos, vendem; vendi, vendeste, vendeu, vendemos, venderam. Good.

// Regular -IR: EXISTIR, PERMITIR. INCLUIR has stem change (incluo, incluímos).
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
const existirEx = [
  ["Existo, logo penso.", "I exist, therefore I think."], ["Existes para quê?", "What do you exist for?"], ["Existe um problema.", "There is a problem."], ["Nós existimos há anos.", "We have existed for years."], ["Eles existem em todo o lado.", "They exist everywhere."],
  ["Existiu uma vez.", "Once upon a time there was."], ["Exististe naquele tempo?", "Did you exist at that time?"], ["Existiu um erro.", "There was an error."], ["Nós existimos na lista.", "We existed on the list."], ["Existiram muitas dúvidas.", "There were many doubts."],
  ["Eu existia na sombra.", "I used to exist in the shadow."], ["Tu existias para mim.", "You used to exist for me."], ["Ela existia apenas no papel.", "She used to exist only on paper."], ["Nós existíamos na mesma rua.", "We used to exist on the same street."], ["Eles existiam noutro país.", "They used to exist in another country."],
  ["Existirei sempre.", "I will always exist."], ["Existirás na memória.", "You will exist in memory."], ["Ela existirá para sempre.", "She will exist forever."], ["Existiremos na história.", "We will exist in history."], ["Eles existirão sempre.", "They will always exist."],
  ["Existiria se pudesse.", "I would exist if I could."], ["Existirias noutro mundo?", "Would you exist in another world?"], ["Ela existiria de outra forma.", "She would exist in another way."], ["Existiríamos juntos.", "We would exist together."], ["Eles existiriam em paz.", "They would exist in peace."],
  ["Duvido que eu exista.", "I doubt I exist."], ["Espero que existas para mim.", "I hope you exist for me."], ["É estranho que ela exista.", "It's strange that she exists."], ["É bom que existamos.", "It's good that we exist."], ["Quero que existam sempre.", "I want them to exist forever."],
];
const permitirEx = [
  ["Permito que entres.", "I allow you to come in."], ["Permites que eu vá?", "Do you allow me to go?"], ["Ela permite animais.", "She allows animals."], ["Nós permitimos atrasos.", "We allow delays."], ["Eles permitem fumar.", "They allow smoking."],
  ["Permiti a entrada.", "I allowed them in."], ["Permitiste que ele ficasse?", "Did you allow him to stay?"], ["Ele permitiu o atraso.", "He allowed the delay."], ["Nós permitimos a visita.", "We allowed the visit."], ["Eles permitiram a mudança.", "They allowed the change."],
  ["Eu permitia tudo.", "I used to allow everything."], ["Tu permitias atrasos?", "Did you use to allow delays?"], ["Ela permitia animais.", "She used to allow animals."], ["Nós permitíamos visitas.", "We used to allow visits."], ["Eles permitiam fumar.", "They used to allow smoking."],
  ["Permitirei a entrada.", "I will allow them in."], ["Permitirás que eu vá?", "Will you allow me to go?"], ["Ela permitirá atrasos.", "She will allow delays."], ["Permitiremos a visita.", "We will allow the visit."], ["Eles permitirão a mudança.", "They will allow the change."],
  ["Permitiria se pedisses.", "I would allow it if you asked."], ["Permitirias atrasos?", "Would you allow delays?"], ["Ela permitiria a visita.", "She would allow the visit."], ["Permitiríamos a mudança.", "We would allow the change."], ["Eles permitiriam tudo.", "They would allow everything."],
  ["Quero que permita a entrada.", "I want you to allow them in."], ["Espero que permitas.", "I hope you allow."], ["Convém que ela permita.", "She should allow."], ["É preciso que permitamos.", "We need to allow."], ["Exijo que permitam a visita.", "I demand they allow the visit."],
];
const incluirEx = [
  ["Incluo-me na lista.", "I include myself on the list."], ["Incluis o café?", "Do you include the coffee?"], ["Ela inclui os doces.", "She includes the desserts."], ["Nós incluímos tudo.", "We include everything."], ["Eles incluem o pequeno-almoço.", "They include breakfast."],
  ["Incluí o teu nome.", "I included your name."], ["Incluíste o café?", "Did you include the coffee?"], ["Ele incluiu os custos.", "He included the costs."], ["Nós incluímos a taxa.", "We included the fee."], ["Eles incluíram o serviço.", "They included the service."],
  ["Eu incluía sempre tudo.", "I used to always include everything."], ["Tu incluías o pequeno-almoço?", "Did you use to include breakfast?"], ["Ela incluía os doces.", "She used to include the desserts."], ["Nós incluíamos a taxa.", "We used to include the fee."], ["Eles incluíam o serviço.", "They used to include the service."],
  ["Incluirei o teu nome.", "I will include your name."], ["Incluirás o café?", "Will you include the coffee?"], ["Ela incluirá os custos.", "She will include the costs."], ["Incluiremos tudo.", "We will include everything."], ["Eles incluirão a taxa.", "They will include the fee."],
  ["Incluiria o serviço.", "I would include the service."], ["Incluirias o café?", "Would you include the coffee?"], ["Ela incluiria os doces.", "She would include the desserts."], ["Incluiríamos a taxa.", "We would include the fee."], ["Eles incluiriam tudo.", "They would include everything."],
  ["Quero que inclua o meu nome.", "I want you to include my name."], ["Espero que incluas o café.", "I hope you include the coffee."], ["Convém que ela inclua.", "She should include."], ["É bom que incluamos tudo.", "It's good that we include everything."], ["Exijo que incluam a taxa.", "I demand they include the fee."],
];

// Build all verb entries
const newKeys = [
  "HAVER", "LER", "OLHAR", "ACHAR", "FECHAR", "VENDER", "TOMAR", "CONTAR", "MOSTRAR", "CRIAR", "TRATAR", "EXISTIR", "COMPREENDER", "INCLUIR", "PERMITIR",
];

data.verbs.HAVER = { meta: { emoji: "📌", english: "to exist / there is/are", group: "Irregular", priority: "Essential", difficulty: "Intermediate", cefr: "A1", pronunciation: "ah-VEHR" }, conjugations: fromData("HAVER", "A1", haverData, haverTypes, haverNotes) };
data.verbs.LER = { meta: { emoji: "📖", english: "to read", group: "Irregular", priority: "Essential", difficulty: "Intermediate", cefr: "A1", pronunciation: "LEHR" }, conjugations: fromData("LER", "A1", lerData, lerTypes, lerNotes) };

arVerbs.forEach(({ key, stem, english, emoji, priority, pronunciation, examples }) => {
  const rows = makeAR(key, stem, examples);
  data.verbs[key] = {
    meta: { emoji, english, group: "Regular -AR", priority, difficulty: "Beginner", cefr: "A1", pronunciation },
    conjugations: fromData(key, "A1", rows, [], []),
  };
});

data.verbs.VENDER = { meta: { emoji: "🏷", english: "to sell", group: "Regular -ER", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "vehn-DEHR" }, conjugations: fromData("VENDER", "A1", makeER("VENDER", "vend", venderEx), [], []) };
data.verbs.COMPREENDER = { meta: { emoji: "🧠", english: "to understand", group: "Regular -ER", priority: "Essential", difficulty: "Beginner", cefr: "A1", pronunciation: "kohm-pree-ehn-DEHR" }, conjugations: fromData("COMPREENDER", "A1", makeER("COMPREENDER", "compreend", compreenderEx), [], []) };

data.verbs.EXISTIR = { meta: { emoji: "🌍", english: "to exist", group: "Regular -IR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "eh-zeesh-TEER" }, conjugations: fromData("EXISTIR", "A1", makeIR("EXISTIR", "exist", existirEx), [], []) };
data.verbs.PERMITIR = { meta: { emoji: "✅", english: "to allow / to permit", group: "Regular -IR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "pehr-mee-TEER" }, conjugations: fromData("PERMITIR", "A1", makeIR("PERMITIR", "permit", permitirEx), [], []) };
// INCLUIR: stem change incluo, incluis, inclui, incluímos, incluem
data.verbs.INCLUIR = { meta: { emoji: "➕", english: "to include", group: "Regular -IR", priority: "Useful", difficulty: "Beginner", cefr: "A1", pronunciation: "een-kloo-EER" }, conjugations: fromData("INCLUIR", "A1", makeIR("INCLUIR", "inclu", incluirEx, ["incluo", "incluis", "inclui", "incluímos", "incluem"]), [], []) };

newKeys.forEach((k) => data.order.push(k));
if (data.totalVerbs !== undefined) data.totalVerbs = data.order.length;

fs.writeFileSync(verbsPath, JSON.stringify(data, null, 4), "utf8");
console.log("Added 15 A1 verbs. Total:", data.order.length);
