/**
 * One-off script: add ~100 new vocabulary entries to vocab.json.
 * Run from project root: node scripts/add-vocab.js
 * European Portuguese only. Skips if portuguese already exists in category.
 */
const fs = require("fs");
const path = require("path");

const vocabPath = path.join(__dirname, "../src/data/vocab.json");
const data = JSON.parse(fs.readFileSync(vocabPath, "utf8"));

function hasWord(cat, portuguese) {
  const norm = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
  const p = norm(portuguese);
  return cat.words.some((w) => norm(w.portuguese) === p);
}
function add(catId, word) {
  const cat = data.categories.find((c) => c.id === catId);
  if (!cat) return;
  if (hasWord(cat, word.portuguese)) return;
  cat.words.push(word);
}

// Greetings: only "não faz mal" (rest exist)
add("greetings-expressions", {
  portuguese: "não faz mal",
  english: "no worries / it doesn't matter",
  cefr: "A1",
  gender: null,
  pronunciation: "nowng fahsh MAL",
  example: "Não faz mal, acontece.",
  exampleTranslation: "No worries, it happens.",
});

// Numbers & Time
add("numbers-time", { portuguese: "que horas são?", english: "what time is it?", cefr: "A1", gender: null, pronunciation: "kuh OH-rush sowng?", example: "Desculpe, que horas são?", exampleTranslation: "Excuse me, what time is it?" });
add("numbers-time", { portuguese: "ontem", english: "yesterday", cefr: "A1", gender: null, pronunciation: "ON-tayng", example: "Ontem fui ao cinema.", exampleTranslation: "Yesterday I went to the cinema." });
add("numbers-time", { portuguese: "anteontem", english: "the day before yesterday", cefr: "A2", gender: null, pronunciation: "an-tee-on-TAYNG", example: "Anteontem choveu.", exampleTranslation: "The day before yesterday it rained." });

// Colours & Weather
add("colours-weather", { portuguese: "está calor", english: "it's hot", cefr: "A1", gender: null, pronunciation: "shtah kuh-LOHR", example: "Hoje está calor.", exampleTranslation: "Today it's hot." });
add("colours-weather", { portuguese: "está frio", english: "it's cold", cefr: "A1", gender: null, pronunciation: "shtah FREE-oo", example: "Está frio lá fora.", exampleTranslation: "It's cold outside." });
add("colours-weather", { portuguese: "está a chover", english: "it's raining", cefr: "A1", gender: null, pronunciation: "shtah uh shoo-VEHR", example: "Leva o guarda-chuva, está a chover.", exampleTranslation: "Take the umbrella, it's raining." });
add("colours-weather", { portuguese: "o guarda-chuva", english: "the umbrella", cefr: "A1", gender: "m", pronunciation: "oo GWAHR-duh SHOO-vruh", example: "Onde está o meu guarda-chuva?", exampleTranslation: "Where is my umbrella?" });
add("colours-weather", { portuguese: "está bom tempo", english: "the weather is nice", cefr: "A1", gender: null, pronunciation: "shtah bong TEM-poo", example: "Está bom tempo para um passeio.", exampleTranslation: "The weather is nice for a walk." });

// Food & Drink
add("food-drink", { portuguese: "a conta", english: "the bill", cefr: "A1", gender: "f", pronunciation: "uh KON-tah", example: "A conta, por favor.", exampleTranslation: "The bill, please." });
add("food-drink", { portuguese: "uma mesa para dois", english: "a table for two", cefr: "A1", gender: null, pronunciation: "OO-muh MAY-zuh PAH-ruh DOYSH", example: "Queria uma mesa para dois.", exampleTranslation: "I'd like a table for two." });
add("food-drink", { portuguese: "tenho fome", english: "I'm hungry", cefr: "A1", gender: null, pronunciation: "TAY-nyoo FOH-muh", example: "Tenho fome, vamos jantar?", exampleTranslation: "I'm hungry, shall we have dinner?" });
add("food-drink", { portuguese: "tenho sede", english: "I'm thirsty", cefr: "A1", gender: null, pronunciation: "TAY-nyoo SEH-duh", example: "Tenho sede, há água?", exampleTranslation: "I'm thirsty, is there any water?" });
add("food-drink", { portuguese: "a gorjeta", english: "the tip (restaurant)", cefr: "A2", gender: "f", pronunciation: "uh goor-ZHAY-tuh", example: "Deixei uma gorjeta na mesa.", exampleTranslation: "I left a tip on the table." });
add("food-drink", { portuguese: "sem glúten", english: "gluten-free", cefr: "A2", gender: null, pronunciation: "sayng GLOO-ten", example: "Tem opções sem glúten?", exampleTranslation: "Do you have gluten-free options?" });
add("food-drink", { portuguese: "vegetariano / vegetariana", english: "vegetarian", cefr: "A2", gender: null, pronunciation: "veh-zhuh-tuh-ree-AH-noo / veh-zhuh-tuh-ree-AH-nuh", example: "Sou vegetariano.", exampleTranslation: "I'm vegetarian." });
add("food-drink", { portuguese: "a ementa", english: "the menu", cefr: "A1", gender: "f", pronunciation: "uh ay-MEN-tah", example: "Posso ver a ementa?", exampleTranslation: "May I see the menu?" });
add("food-drink", { portuguese: "o prato do dia", english: "dish of the day", cefr: "A1", gender: "m", pronunciation: "oo PRAH-too doo DEE-ah", example: "Qual é o prato do dia?", exampleTranslation: "What is the dish of the day?" });
add("food-drink", { portuguese: "para levar", english: "to take away", cefr: "A1", gender: null, pronunciation: "PAH-ruh luh-VAHR", example: "Dois cafés, para levar.", exampleTranslation: "Two coffees, to take away." });

// Travel & Directions
add("travel-directions", { portuguese: "estou perdido / estou perdida", english: "I'm lost", cefr: "A1", gender: null, pronunciation: "shtoh pehr-DEE-doo / shtoh pehr-DEE-dah", example: "Desculpe, estou perdido. Onde fica a estação?", exampleTranslation: "Sorry, I'm lost. Where is the station?" });
add("travel-directions", { portuguese: "pode ajudar-me?", english: "can you help me?", cefr: "A1", gender: null, pronunciation: "POH-duh uh-zhoo-VAHR-muh?", example: "Pode ajudar-me? Não encontro a rua.", exampleTranslation: "Can you help me? I can't find the street." });
add("travel-directions", { portuguese: "quanto custa?", english: "how much does it cost?", cefr: "A1", gender: null, pronunciation: "KWAN-too KOOSH-tuh?", example: "Quanto custa o bilhete?", exampleTranslation: "How much does the ticket cost?" });
add("travel-directions", { portuguese: "onde fica...?", english: "where is...?", cefr: "A1", gender: null, pronunciation: "OND FEE-kuh?", example: "Onde fica a casa de banho?", exampleTranslation: "Where is the toilet?" });
add("travel-directions", { portuguese: "a que horas...?", english: "what time...?", cefr: "A1", gender: null, pronunciation: "uh kuh OH-rush?", example: "A que horas parte o comboio?", exampleTranslation: "What time does the train leave?" });
add("travel-directions", { portuguese: "o bilhete", english: "the ticket", cefr: "A1", gender: "m", pronunciation: "oo bee-LYAY-tuh", example: "Quero comprar um bilhete para Lisboa.", exampleTranslation: "I want to buy a ticket to Lisbon." });
add("travel-directions", { portuguese: "a paragem", english: "the (bus) stop", cefr: "A1", gender: "f", pronunciation: "uh puh-RAH-zhayng", example: "A paragem fica ali.", exampleTranslation: "The bus stop is over there." });
add("travel-directions", { portuguese: "o horário", english: "the schedule / timetable", cefr: "A2", gender: "m", pronunciation: "oo oh-RAH-ree-oo", example: "Onde está o horário dos autocarros?", exampleTranslation: "Where is the bus timetable?" });
add("travel-directions", { portuguese: "é longe?", english: "is it far?", cefr: "A1", gender: null, pronunciation: "eh LONZH?", example: "O museu é longe daqui?", exampleTranslation: "Is the museum far from here?" });

// Health & Body
add("health-body", { portuguese: "estou doente", english: "I'm sick", cefr: "A1", gender: null, pronunciation: "shtoh doo-EN-tuh", example: "Não vou trabalhar, estou doente.", exampleTranslation: "I'm not going to work, I'm sick." });
add("health-body", { portuguese: "dói-me aqui", english: "it hurts here", cefr: "A1", gender: null, pronunciation: "DOY-muh uh-KEE", example: "Dói-me aqui no braço.", exampleTranslation: "It hurts here in my arm." });
add("health-body", { portuguese: "tenho febre", english: "I have a fever", cefr: "A1", gender: null, pronunciation: "TAY-nyoo FEH-bruh", example: "Tenho febre e dor de cabeça.", exampleTranslation: "I have a fever and a headache." });
add("health-body", { portuguese: "a receita", english: "the prescription", cefr: "A2", gender: "f", pronunciation: "uh rruh-SAY-tuh", example: "Preciso da receita do médico.", exampleTranslation: "I need the doctor's prescription." });
add("health-body", { portuguese: "alérgico / alérgica", english: "allergic", cefr: "A2", gender: null, pronunciation: "uh-LEHR-zhee-koo / uh-LEHR-zhee-kuh", example: "Sou alérgico a amendoins.", exampleTranslation: "I'm allergic to peanuts." });
add("health-body", { portuguese: "a urgência", english: "the emergency room", cefr: "A2", gender: "f", pronunciation: "uh oor-ZHEN-see-uh", example: "Foi levado para a urgência.", exampleTranslation: "He was taken to the emergency room." });
add("health-body", { portuguese: "o seguro de saúde", english: "health insurance", cefr: "B1", gender: "m", pronunciation: "oo suh-GOO-roo duh sah-OO-duh", example: "Tens seguro de saúde?", exampleTranslation: "Do you have health insurance?" });
add("health-body", { portuguese: "estou constipado / constipada", english: "I have a cold", cefr: "A1", gender: null, pronunciation: "shtoh kon-shtee-PAH-doo / kon-shtee-PAH-dah", example: "Estou constipado, vou ficar em casa.", exampleTranslation: "I have a cold, I'll stay at home." });
add("health-body", { portuguese: "a dor de cabeça", english: "headache", cefr: "A1", gender: "f", pronunciation: "uh dohr duh kuh-BEH-suh", example: "Tenho uma dor de cabeça forte.", exampleTranslation: "I have a bad headache." });
add("health-body", { portuguese: "a dor de barriga", english: "stomachache", cefr: "A1", gender: "f", pronunciation: "uh dohr duh buh-RREE-guh", example: "A criança tem dor de barriga.", exampleTranslation: "The child has a stomachache." });

// Home & Rooms (chave, renda, andar, vizinho exist)
add("home-rooms", { portuguese: "a chave", english: "the key", cefr: "A1", gender: "f", pronunciation: "uh SHAH-vuh", example: "Onde está a chave de casa?", exampleTranslation: "Where is the house key?" });
add("home-rooms", { portuguese: "o vizinho / a vizinha", english: "the neighbour", cefr: "A2", gender: null, pronunciation: "oo vee-ZEE-nyoo / uh vee-ZEE-nyuh", example: "O meu vizinho é muito simpático.", exampleTranslation: "My neighbour is very friendly." });
add("home-rooms", { portuguese: "a renda / o aluguer", english: "the rent", cefr: "A2", gender: null, pronunciation: "uh REN-duh / oo uh-loo-GEHR", example: "A renda é paga no início do mês.", exampleTranslation: "The rent is paid at the start of the month." });
add("home-rooms", { portuguese: "mudar de casa", english: "to move house", cefr: "B1", gender: null, pronunciation: "moo-DAHR duh KAH-zuh", example: "Vamos mudar de casa no próximo mês.", exampleTranslation: "We're moving house next month." });
add("home-rooms", { portuguese: "o andar", english: "the floor / storey", cefr: "A2", gender: "m", pronunciation: "oo an-DAHR", example: "Vivo no terceiro andar.", exampleTranslation: "I live on the third floor." });

// Family & Daily Routine
add("family-daily-routine", { portuguese: "estou atrasado / atrasada", english: "I'm late", cefr: "A1", gender: null, pronunciation: "shtoh uh-truh-ZAH-doo / uh-truh-ZAH-dah", example: "Desculpa, estou atrasada.", exampleTranslation: "Sorry, I'm late." });
add("family-daily-routine", { portuguese: "tenho sono", english: "I'm sleepy", cefr: "A1", gender: null, pronunciation: "TAY-nyoo SOH-noo", example: "Tenho muito sono, vou dormir.", exampleTranslation: "I'm very sleepy, I'm going to sleep." });
add("family-daily-routine", { portuguese: "o fim de semana", english: "the weekend", cefr: "A1", gender: "m", pronunciation: "oo feeng duh suh-MAH-nuh", example: "O que vais fazer no fim de semana?", exampleTranslation: "What are you going to do at the weekend?" });
add("family-daily-routine", { portuguese: "o feriado", english: "the public holiday", cefr: "A2", gender: "m", pronunciation: "oo fuh-ree-AH-doo", example: "Na segunda-feira é feriado.", exampleTranslation: "Monday is a public holiday." });
add("family-daily-routine", { portuguese: "dia a dia", english: "day to day / daily", cefr: "A2", gender: null, pronunciation: "DEE-ah uh DEE-ah", example: "As coisas melhoram dia a dia.", exampleTranslation: "Things get better day by day." });

// Work & Education
add("work-education", { portuguese: "estou a trabalhar", english: "I'm working", cefr: "A1", gender: null, pronunciation: "shtoh uh truh-bah-LYAHR", example: "Não posso falar, estou a trabalhar.", exampleTranslation: "I can't talk, I'm working." });
add("work-education", { portuguese: "o estágio", english: "the internship", cefr: "A2", gender: "m", pronunciation: "oo shtah-zhee-oo", example: "Fiz um estágio numa empresa.", exampleTranslation: "I did an internship at a company." });
add("work-education", { portuguese: "o currículo", english: "the CV / resume", cefr: "A2", gender: "m", pronunciation: "oo koo-RREE-koo-loo", example: "Enviei o meu currículo.", exampleTranslation: "I sent my CV." });
add("work-education", { portuguese: "a entrevista", english: "the interview (job)", cefr: "A2", gender: "f", pronunciation: "uh en-truh-VEESH-tuh", example: "Tenho uma entrevista amanhã.", exampleTranslation: "I have a job interview tomorrow." });
add("work-education", { portuguese: "o patrão / a patroa", english: "the boss", cefr: "A2", gender: null, pronunciation: "oo puh-TROWNG / uh puh-TROH-uh", example: "O patrão quer falar contigo.", exampleTranslation: "The boss wants to talk to you." });
add("work-education", { portuguese: "despedir", english: "to fire / to quit", cefr: "B1", gender: null, pronunciation: "dish-puh-DEER", example: "Foi despedido na semana passada.", exampleTranslation: "He was fired last week." });
add("work-education", { portuguese: "o salário", english: "the salary", cefr: "A2", gender: "m", pronunciation: "oo suh-LAH-ree-oo", example: "O salário é pago no fim do mês.", exampleTranslation: "The salary is paid at the end of the month." });
add("work-education", { portuguese: "a folga", english: "day off", cefr: "A2", gender: "f", pronunciation: "uh FOL-guh", example: "Amanhã tenho folga.", exampleTranslation: "I have the day off tomorrow." });
add("work-education", { portuguese: "as férias", english: "holidays / vacation", cefr: "A1", gender: "f", pronunciation: "ush FEH-ree-ush", example: "Nas férias fui ao Algarve.", exampleTranslation: "On holiday I went to the Algarve." });
add("work-education", { portuguese: "a reforma", english: "retirement", cefr: "B1", gender: "f", pronunciation: "uh rruh-FOHR-muh", example: "O meu pai está na reforma.", exampleTranslation: "My father is retired." });

// Shopping & Money
add("shopping-money", { portuguese: "o talão", english: "the receipt", cefr: "A2", gender: "m", pronunciation: "oo tuh-LOWNG", example: "Guarde o talão para devoluções.", exampleTranslation: "Keep the receipt for returns." });
add("shopping-money", { portuguese: "o multibanco", english: "the ATM", cefr: "A1", gender: "m", pronunciation: "oo mool-tee-BAN-koo", example: "Onde há um multibanco?", exampleTranslation: "Where is there an ATM?" });
add("shopping-money", { portuguese: "devolver", english: "to return (item)", cefr: "A2", gender: null, pronunciation: "duh-vol-VEHR", example: "Quero devolver esta camisola.", exampleTranslation: "I want to return this shirt." });
add("shopping-money", { portuguese: "o desconto", english: "the discount", cefr: "A2", gender: "m", pronunciation: "oo dish-KON-too", example: "Há desconto para estudantes?", exampleTranslation: "Is there a student discount?" });
add("shopping-money", { portuguese: "em promoção", english: "on sale", cefr: "A2", gender: null, pronunciation: "ayng proo-moo-SOWNG", example: "Estes sapatos estão em promoção.", exampleTranslation: "These shoes are on sale." });

// Numbers & Time (extra - meia hora, um quarto de hora might exist)
add("numbers-time", { portuguese: "meia hora", english: "half an hour", cefr: "A1", gender: null, pronunciation: "MAY-uh OH-ruh", example: "Falta meia hora para o comboio.", exampleTranslation: "The train leaves in half an hour." });
add("numbers-time", { portuguese: "um quarto de hora", english: "a quarter of an hour", cefr: "A2", gender: null, pronunciation: "oong KWAHR-too duh OH-ruh", example: "Demorou um quarto de hora.", exampleTranslation: "It took a quarter of an hour." });

// Emotions & Personality (add only those not already there: cansado, entediado, assustado, ciumento, confuso, surpreendido, animado, solitário, grato, ansioso, chateado)
add("emotions-personality", { portuguese: "cansado / cansada", english: "tired", cefr: "A1", gender: null, pronunciation: "kan-SAH-doo / kan-SAH-dah", example: "Estou muito cansado.", exampleTranslation: "I'm very tired." });
add("emotions-personality", { portuguese: "entediado / entediada", english: "bored", cefr: "A2", gender: null, pronunciation: "en-tuh-dee-AH-doo / en-tuh-dee-AH-dah", example: "As crianças estão entediadas.", exampleTranslation: "The children are bored." });
add("emotions-personality", { portuguese: "assustado / assustada", english: "scared / frightened", cefr: "A2", gender: null, pronunciation: "uh-soosh-TAH-doo / uh-soosh-TAH-dah", example: "Fiquei assustado com o barulho.", exampleTranslation: "I was scared by the noise." });
add("emotions-personality", { portuguese: "envergonhado / envergonhada", english: "embarrassed / ashamed", cefr: "A2", gender: null, pronunciation: "en-vehr-goo-NYAH-doo / en-vehr-goo-NYAH-dah", example: "Senti-me envergonhada.", exampleTranslation: "I felt embarrassed." });
add("emotions-personality", { portuguese: "ciumento / ciumenta", english: "jealous", cefr: "A2", gender: null, pronunciation: "see-oo-MEN-too / see-oo-MEN-tah", example: "O irmão está ciumento.", exampleTranslation: "The brother is jealous." });
add("emotions-personality", { portuguese: "confuso / confusa", english: "confused", cefr: "A2", gender: null, pronunciation: "kon-FOO-zoo / kon-FOO-zuh", example: "Estou confuso com as instruções.", exampleTranslation: "I'm confused by the instructions." });
add("emotions-personality", { portuguese: "surpreendido / surpreendida", english: "surprised", cefr: "A2", gender: null, pronunciation: "soor-pree-en-DEE-doo / soor-pree-en-DEE-dah", example: "Fiquei surpreendido com a notícia.", exampleTranslation: "I was surprised by the news." });
add("emotions-personality", { portuguese: "animado / animada", english: "excited", cefr: "A2", gender: null, pronunciation: "uh-nee-MAH-doo / uh-nee-MAH-dah", example: "Estamos animados com a viagem.", exampleTranslation: "We're excited about the trip." });
add("emotions-personality", { portuguese: "solitário / solitária", english: "lonely", cefr: "B1", gender: null, pronunciation: "soo-lee-TAH-ree-oo / soo-lee-TAH-ree-uh", example: "Sinto-me solitário às vezes.", exampleTranslation: "I feel lonely sometimes." });
add("emotions-personality", { portuguese: "grato / grata", english: "grateful", cefr: "B1", gender: null, pronunciation: "GRAH-too / GRAH-tah", example: "Estou grato pela tua ajuda.", exampleTranslation: "I'm grateful for your help." });
add("emotions-personality", { portuguese: "ansioso / ansiosa", english: "anxious", cefr: "A2", gender: null, pronunciation: "an-see-OH-zoo / an-see-OH-zuh", example: "Estou ansioso com o exame.", exampleTranslation: "I'm anxious about the exam." });
add("emotions-personality", { portuguese: "chateado / chateada", english: "upset / annoyed", cefr: "A2", gender: null, pronunciation: "shuh-tee-AH-doo / shuh-tee-AH-dah", example: "Ele está chateado contigo.", exampleTranslation: "He's upset with you." });

// Nature & Animals
add("nature-animals", { portuguese: "o passeio", english: "the walk / stroll", cefr: "A1", gender: "m", pronunciation: "oo puh-SAY-oo", example: "Fomos dar um passeio à beira-mar.", exampleTranslation: "We went for a walk by the sea." });
add("nature-animals", { portuguese: "a paisagem", english: "the landscape / scenery", cefr: "A2", gender: "f", pronunciation: "uh pai-SAH-zhayng", example: "A paisagem é linda.", exampleTranslation: "The scenery is beautiful." });
add("nature-animals", { portuguese: "o pôr do sol", english: "the sunset", cefr: "A2", gender: "m", pronunciation: "oo pohr doo sohl", example: "Vamos ver o pôr do sol.", exampleTranslation: "Let's watch the sunset." });
add("nature-animals", { portuguese: "o nascer do sol", english: "the sunrise", cefr: "A2", gender: "m", pronunciation: "oo nush-SEHR doo sohl", example: "Acordámos para ver o nascer do sol.", exampleTranslation: "We woke up to see the sunrise." });
add("nature-animals", { portuguese: "a onda", english: "the wave (ocean)", cefr: "A2", gender: "f", pronunciation: "uh ON-duh", example: "As ondas estão grandes hoje.", exampleTranslation: "The waves are big today." });

// Colloquial & Slang
add("colloquial-slang", { portuguese: "bora", english: "let's go (informal)", cefr: "A1", gender: null, pronunciation: "BOH-ruh", example: "Bora, já vamos atrasados!", exampleTranslation: "Let's go, we're already late!" });
add("colloquial-slang", { portuguese: "ya", english: "yeah (informal)", cefr: "A1", gender: null, pronunciation: "yah", example: "Ya, concordo.", exampleTranslation: "Yeah, I agree." });
add("colloquial-slang", { portuguese: "tranquilo", english: "no worries / chill / it's fine", cefr: "A1", gender: null, pronunciation: "tran-KEE-loo", example: "Tranquilo, não há problema.", exampleTranslation: "No worries, no problem." });
add("colloquial-slang", { portuguese: "curto muito", english: "I really like/enjoy (it)", cefr: "A2", gender: null, pronunciation: "KOOR-too MOO-lee-too", example: "Curto muito este café.", exampleTranslation: "I really like this café." });
add("colloquial-slang", { portuguese: "que seca", english: "how boring / what a drag", cefr: "A2", gender: null, pronunciation: "kuh SEH-kuh", example: "Que seca de filme!", exampleTranslation: "What a boring film!" });

fs.writeFileSync(vocabPath, JSON.stringify(data, null, 2), "utf8");
console.log("Done. Check vocab.json for new entries.");
const total = data.categories.reduce((s, c) => s + c.words.length, 0);
console.log("Total words:", total);
