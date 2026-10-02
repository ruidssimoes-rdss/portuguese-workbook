/**
 * Adds six grammar topics to src/data/grammar.json (content audit, Oct 2026),
 * re-tags the imperfect topics to A2 and registers the new ids in
 * src/data/grammar-groups.ts. Idempotent.
 *
 * Run: node scripts/add-b1-grammar.js
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "..", "src", "data", "grammar.json");
const GROUPS = path.join(__dirname, "..", "src", "data", "grammar-groups.ts");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

const q = (questionText, questionTextPt, options, correctAnswer, explanation, exampleSentence, exampleTranslation) => ({
  questionText, questionTextPt, options, correctAnswer, correctIndex: options.indexOf(correctAnswer), explanation,
  ...(exampleSentence ? { exampleSentence, exampleTranslation } : {}),
});
const ex = (pt, en) => ({ pt, en });

const TOPICS = [
  {
    id: "future-subjunctive",
    title: "Future Subjunctive",
    titlePt: "Futuro do Conjuntivo",
    cefr: "B1",
    summary: "Quando chegares, se puderes, assim que souber: the future subjunctive after quando, se, assim que, enquanto, como, onde and quem when they point to the future.",
    intro: "The future subjunctive is everywhere in European Portuguese and has no equivalent in English. You use it after quando, se, assim que, logo que, enquanto, sempre que, como, onde and quem when the action is still to come: «Quando chegares, liga-me» (When you arrive, call me), «Se puderes, vem cedo» (If you can, come early).\n\nTo form it, take the 3rd person plural of the preterite, drop -ram and add -r, -res, -r, -rmos, -rem. For regular verbs it looks like the infinitive: falar → falaram → falar, falares, falar, falarmos, falarem. For irregular verbs it follows the irregular preterite: fazer → fizeram → fizer; ter → tiveram → tiver; ser and ir → foram → for.\n\nThe big learner mistake is using the present after quando or se for the future: «Quando chego» describes a habit (whenever I arrive), «quando chegar» is a specific future moment.",
    rules: [
      { rule: "Form: 3rd person plural preterite minus -ram, plus -r, -res, -r, -rmos, -rem.", rulePt: "Formação: 3.ª pessoa do plural do pretérito perfeito sem -ram, mais -r, -res, -r, -rmos, -rem.", examples: [ex("falaram → falar, falares, falar, falarmos, falarem", "speak"), ex("comeram → comer, comeres, comer, comermos, comerem", "eat"), ex("partiram → partir, partires, partir, partirmos, partirem", "leave")] },
      { rule: "Irregular verbs follow their irregular preterite stem.", rulePt: "Os verbos irregulares seguem o radical irregular do pretérito.", examples: [ex("fazer → fizer", "do/make"), ex("ter → tiver · estar → estiver", "have · be"), ex("ser / ir → for", "be / go"), ex("poder → puder · querer → quiser · saber → souber", "can · want · know"), ex("vir → vier · ver → vir · dizer → disser · pôr → puser", "come · see · say · put")] },
      { rule: "After quando, assim que, logo que, enquanto and sempre que for future actions.", rulePt: "Depois de quando, assim que, logo que, enquanto e sempre que, para ações futuras.", examples: [ex("Quando chegares, liga-me.", "When you arrive, call me."), ex("Assim que souber, digo-te.", "As soon as I know, I'll tell you."), ex("Enquanto estiveres em Lisboa, fica connosco.", "While you're in Lisbon, stay with us.")] },
      { rule: "After se for real possibilities in the future (with present or future in the main clause).", rulePt: "Depois de se, para possibilidades reais no futuro.", examples: [ex("Se puderes, vem cedo.", "If you can, come early."), ex("Se chover, ficamos em casa.", "If it rains, we'll stay home."), ex("Se tiveres dúvidas, pergunta.", "If you have questions, ask.")] },
      { rule: "After como, onde, quem and o que when they refer to something not yet known.", rulePt: "Depois de como, onde, quem e o que, quando se referem a algo ainda indefinido.", examples: [ex("Faz como quiseres.", "Do it however you like."), ex("Senta-te onde quiseres.", "Sit wherever you want."), ex("Quem chegar primeiro abre a porta.", "Whoever arrives first opens the door.")] },
      { rule: "Habit vs future: present indicative for habits, future subjunctive for a specific future moment.", rulePt: "Hábito vs futuro: presente do indicativo para hábitos, futuro do conjuntivo para um momento futuro.", examples: [ex("Quando chego a casa, janto.", "When(ever) I get home, I have dinner."), ex("Quando chegar a casa, janto.", "When I get home (later today), I'll have dinner.")] },
    ],
    tips: ["Regular verbs: the future subjunctive looks like the infinitive — but irregular verbs don't (fizer, tiver, for).", "If you can say «when… (in the future)» or «if… (it might happen)», reach for the future subjunctive.", "Ver → vir and vir → vier: «quando o vir» = when I see him; «quando ele vier» = when he comes.", "Brazilians use it too, but you'll hear it constantly in Portugal: «se calhar», «quando der», «como quiseres»."],
    tipsPt: ["Verbos regulares: o futuro do conjuntivo parece o infinitivo — os irregulares não (fizer, tiver, for).", "Se dá para dizer «quando… (no futuro)» ou «se… (pode acontecer)», usa o futuro do conjuntivo.", "Ver → vir e vir → vier: «quando o vir» / «quando ele vier».", "Ouves isto a toda a hora em Portugal: «quando der», «como quiseres»."],
    questions: [
      q("Complete: Quando ___ (tu, chegar), liga-me.", "Completa: Quando ___ (tu, chegar), liga-me.", ["chegas", "chegares", "chegaste", "chegues"], "chegares", "Specific future moment after quando → future subjunctive: chegares."),
      q("Complete: Se ___ (tu, poder), vem cedo.", "Completa: Se ___ (tu, poder), vem cedo.", ["podes", "puderes", "pudesses", "possas"], "puderes", "Poder → puderam → puder, puderes."),
      q("What is the future subjunctive of «fazer» (eu)?", "Qual é o futuro do conjuntivo de «fazer» (eu)?", ["fazer", "fizer", "faça", "fizesse"], "fizer", "Fizeram → fizer."),
      q("Complete: Assim que ___ (eu, saber), digo-te.", "Completa: Assim que ___ (eu, saber), digo-te.", ["sei", "saiba", "souber", "soubesse"], "souber", "Saber → souberam → souber."),
      q("Complete: Se ___ (chover), ficamos em casa.", "Completa: Se ___ (chover), ficamos em casa.", ["chove", "chova", "chover", "chovesse"], "chover", "Real future possibility after se → chover."),
      q("Which sentence describes a habit?", "Que frase descreve um hábito?", ["Quando chego a casa, janto.", "Quando chegar a casa, janto.", "Quando chegasse a casa, jantava.", "Quando chegares a casa, janta."], "Quando chego a casa, janto.", "Present indicative after quando = whenever, a habit."),
      q("Complete: Senta-te onde ___ (tu, querer).", "Completa: Senta-te onde ___ (tu, querer).", ["queres", "queiras", "quiseres", "quisesses"], "quiseres", "Querer → quiseram → quiser, quiseres."),
      q("What is the future subjunctive of «ser» and «ir» (ele)?", "Qual é o futuro do conjuntivo de «ser» e «ir» (ele)?", ["seja / vá", "for / for", "fosse / fosse", "ser / ir"], "for / for", "Both come from foram → for."),
      q("Complete: Quando o ___ (eu, ver), dou-lhe o recado.", "Completa: Quando o ___ (eu, ver), dou-lhe o recado.", ["ver", "vir", "vier", "visse"], "vir", "Ver → viram → vir. Careful: «vier» is from vir (to come)."),
      q("Complete: Quem ___ (chegar) primeiro abre a porta.", "Completa: Quem ___ (chegar) primeiro abre a porta.", ["chega", "chegue", "chegar", "chegasse"], "chegar", "Quem + unknown future person → future subjunctive."),
    ],
  },
  {
    id: "imperfect-subjunctive",
    title: "Imperfect Subjunctive",
    titlePt: "Pretérito Imperfeito do Conjuntivo",
    cefr: "B1",
    summary: "Se eu tivesse, queria que viesses, como se fosse: the imperfect subjunctive after past triggers, in hypotheticals and after como se.",
    intro: "The imperfect subjunctive is the past version of the present subjunctive. When the trigger is in the past or the conditional, the subjunctive moves to the imperfect: «Quero que venhas» → «Queria que viesses» (I wanted you to come).\n\nIt is also the verb you use for hypotheticals with se: «Se eu tivesse tempo, ia» (If I had time, I'd go), and after como se: «Fala como se fosse o chefe» (He talks as if he were the boss).\n\nFormation uses the same stem as the future subjunctive: 3rd person plural preterite minus -ram, plus -sse, -sses, -sse, -ssemos, -ssem. The nós form always takes an accent: falássemos, comêssemos, partíssemos, fizéssemos, fôssemos.",
    rules: [
      { rule: "Form: 3rd person plural preterite minus -ram, plus -sse, -sses, -sse, -ssemos, -ssem.", rulePt: "Formação: 3.ª pessoa do plural do pretérito sem -ram, mais -sse, -sses, -sse, -ssemos, -ssem.", examples: [ex("falaram → falasse, falasses, falasse, falássemos, falassem", "speak"), ex("comeram → comesse … comêssemos", "eat"), ex("partiram → partisse … partíssemos", "leave")] },
      { rule: "Irregulars follow the irregular preterite stem.", rulePt: "Os irregulares seguem o radical irregular do pretérito.", examples: [ex("ter → tivesse · estar → estivesse", "have · be"), ex("ser / ir → fosse", "be / go"), ex("fazer → fizesse · dizer → dissesse · vir → viesse", "do · say · come"), ex("poder → pudesse · querer → quisesse · saber → soubesse", "can · want · know")] },
      { rule: "After a past or conditional trigger (queria que, era bom que, pediu que, gostava que).", rulePt: "Depois de um verbo no passado ou no condicional (queria que, era bom que, pediu que, gostava que).", examples: [ex("Queria que viesses ao jantar.", "I wanted you to come to dinner."), ex("Pediu-me que falasse mais devagar.", "She asked me to speak more slowly."), ex("Gostava que estivesses aqui.", "I wish you were here.")] },
      { rule: "In hypotheticals with se (unlikely or imaginary situations).", rulePt: "Em hipóteses com se (situações improváveis ou imaginárias).", examples: [ex("Se eu tivesse dinheiro, comprava uma casa.", "If I had money, I'd buy a house."), ex("Se fosses tu, o que fazias?", "If it were you, what would you do?")] },
      { rule: "After como se (as if) — always the imperfect subjunctive.", rulePt: "Depois de como se — sempre o imperfeito do conjuntivo.", examples: [ex("Fala como se fosse o chefe.", "He talks as if he were the boss."), ex("Olhou para mim como se não me conhecesse.", "She looked at me as if she didn't know me.")] },
    ],
    tips: ["Present trigger → present subjunctive; past trigger → imperfect subjunctive: quero que venhas / queria que viesses.", "The nós form always has an accent: falássemos, fizéssemos, fôssemos.", "«Gostava que…» (I'd like it if…) is the polite everyday way to use it in Portugal.", "Same stem as the future subjunctive: fizeram → fizer / fizesse."],
    tipsPt: ["Presente → presente do conjuntivo; passado → imperfeito do conjuntivo: quero que venhas / queria que viesses.", "O «nós» leva sempre acento: falássemos, fizéssemos, fôssemos.", "«Gostava que…» é a forma educada do dia a dia.", "Mesmo radical do futuro do conjuntivo: fizeram → fizer / fizesse."],
    questions: [
      q("Complete: Queria que tu ___ (vir) ao jantar.", "Completa: Queria que tu ___ (vir) ao jantar.", ["venhas", "vieres", "viesses", "vens"], "viesses", "Past trigger (queria que) → imperfect subjunctive: viesses."),
      q("Complete: Se eu ___ (ter) tempo, ia contigo.", "Completa: Se eu ___ (ter) tempo, ia contigo.", ["tenho", "tiver", "tivesse", "tenha"], "tivesse", "Hypothetical with se → tivesse."),
      q("Complete: Fala como se ___ (ser) o chefe.", "Completa: Fala como se ___ (ser) o chefe.", ["é", "seja", "for", "fosse"], "fosse", "Como se is always followed by the imperfect subjunctive."),
      q("What is the nós form of «falar» in the imperfect subjunctive?", "Qual é a forma «nós» de «falar» no imperfeito do conjuntivo?", ["falassemos", "falássemos", "falarmos", "falemos"], "falássemos", "The nós form always carries an accent."),
      q("Complete: Pediu-me que ___ (eu, falar) mais devagar.", "Completa: Pediu-me que ___ (eu, falar) mais devagar.", ["falo", "fale", "falasse", "falar"], "falasse", "Pediu (past) → imperfect subjunctive."),
      q("Complete: Gostava que ___ (tu, estar) aqui.", "Completa: Gostava que ___ (tu, estar) aqui.", ["estás", "estejas", "estivesses", "estiveres"], "estivesses", "Gostava que → imperfect subjunctive."),
      q("Which is correct?", "Qual está correta?", ["Quero que viesses.", "Queria que venhas.", "Queria que viesses.", "Quero que vieres."], "Queria que viesses.", "Past trigger + imperfect subjunctive."),
      q("What is the imperfect subjunctive of «fazer» (eles)?", "Qual é o imperfeito do conjuntivo de «fazer» (eles)?", ["fizessem", "fazessem", "façam", "fizerem"], "fizessem", "Fizeram → fizessem."),
      q("Complete: Se ___ (nós, poder), ficávamos mais um dia.", "Completa: Se ___ (nós, poder), ficávamos mais um dia.", ["podemos", "pudermos", "pudéssemos", "possamos"], "pudéssemos", "Hypothetical → pudéssemos."),
      q("Complete: Era bom que ele ___ (dizer) a verdade.", "Completa: Era bom que ele ___ (dizer) a verdade.", ["diz", "diga", "disser", "dissesse"], "dissesse", "Era bom que (past) → dissesse."),
    ],
  },
  {
    id: "conditional-sentences",
    title: "Conditional Sentences (If…)",
    titlePt: "Frases Condicionais",
    cefr: "B1",
    summary: "Three kinds of «se» sentence: real future (se puder, vou), hypothetical (se pudesse, ia) and past unreal (se tivesse podido, tinha ido).",
    intro: "Portuguese «se» sentences come in three types, and each one locks in a pair of tenses.\n\n1. Real future: se + future subjunctive, then present, future or imperative. «Se puder, vou» (If I can, I'll go).\n2. Hypothetical present: se + imperfect subjunctive, then conditional. «Se pudesse, iria». In spoken European Portuguese the main clause is almost always the imperfect indicative instead: «Se pudesse, ia».\n3. Past unreal: se + pluperfect subjunctive (tivesse + participle), then the compound conditional — in speech, tinha + participle. «Se tivesse sabido, tinha vindo» (If I had known, I'd have come).\n\nThe most common learner error is putting the conditional after se: never «se eu iria».",
    rules: [
      { rule: "Type 1 (real future): se + future subjunctive → present / future / imperative.", rulePt: "Tipo 1 (real): se + futuro do conjuntivo → presente / futuro / imperativo.", examples: [ex("Se puder, vou.", "If I can, I'll go."), ex("Se chover, ficamos em casa.", "If it rains, we'll stay home."), ex("Se precisares, liga-me.", "If you need to, call me.")] },
      { rule: "Type 2 (hypothetical): se + imperfect subjunctive → conditional (formal) or imperfect indicative (spoken EP).", rulePt: "Tipo 2 (hipotético): se + imperfeito do conjuntivo → condicional ou, na fala, imperfeito do indicativo.", examples: [ex("Se tivesse tempo, iria. / Se tivesse tempo, ia.", "If I had time, I'd go."), ex("Se morasses em Lisboa, víamo-nos mais.", "If you lived in Lisbon, we'd see each other more.")] },
      { rule: "Type 3 (past unreal): se + tivesse + participle → teria / tinha + participle.", rulePt: "Tipo 3 (passado irreal): se + tivesse + particípio → teria / tinha + particípio.", examples: [ex("Se tivesse sabido, tinha vindo.", "If I'd known, I'd have come."), ex("Se tivéssemos saído mais cedo, não tínhamos perdido o comboio.", "If we'd left earlier, we wouldn't have missed the train.")] },
      { rule: "Never use the conditional or the present subjunctive straight after se.", rulePt: "Nunca uses o condicional nem o presente do conjuntivo logo a seguir a se.", examples: [ex("✗ Se eu iria… → ✓ Se eu fosse…", "If I went…"), ex("✗ Se eu possa… → ✓ Se eu puder…", "If I can…")] },
    ],
    tips: ["Real chance → future subjunctive; imaginary → imperfect subjunctive.", "In Portugal people say «se pudesse, ia» far more than «se pudesse, iria». Both are correct.", "The se-clause can come first or second: «Ia, se pudesse».", "Never put the conditional right after se."],
    tipsPt: ["Possibilidade real → futuro do conjuntivo; imaginária → imperfeito do conjuntivo.", "Em Portugal diz-se mais «se pudesse, ia» do que «iria». Ambas estão certas.", "A oração com se pode vir antes ou depois.", "Nunca ponhas o condicional logo a seguir a se."],
    questions: [
      q("Complete: Se ___ (eu, poder), vou à festa.", "Completa: Se ___ (eu, poder), vou à festa.", ["posso", "puder", "pudesse", "poderia"], "puder", "Real future → future subjunctive."),
      q("Complete: Se ___ (eu, ter) dinheiro, comprava um carro.", "Completa: Se ___ (eu, ter) dinheiro, comprava um carro.", ["tenho", "tiver", "tivesse", "teria"], "tivesse", "Hypothetical → imperfect subjunctive."),
      q("Which main clause is typical in spoken European Portuguese? «Se pudesse, ___.»", "Que oração principal é típica na fala? «Se pudesse, ___.»", ["vou", "ia", "irei", "vá"], "ia", "Spoken EP uses the imperfect indicative for the hypothetical result."),
      q("Complete: Se tivesse sabido, ___ vindo.", "Completa: Se tivesse sabido, ___ vindo.", ["tenho", "tinha", "tive", "tiver"], "tinha", "Past unreal: tinha (or teria) + participle."),
      q("Which sentence is wrong?", "Que frase está errada?", ["Se eu fosse rico, viajava.", "Se eu iria, avisava-te.", "Se chover, fico em casa.", "Se precisares, liga-me."], "Se eu iria, avisava-te.", "Never the conditional right after se."),
      q("Complete: Se ___ (tu, precisar), liga-me.", "Completa: Se ___ (tu, precisar), liga-me.", ["precisas", "precisares", "precisasses", "precises"], "precisares", "Real possibility + imperative → future subjunctive."),
      q("Complete: Se morasses em Lisboa, ___ (nós, ver-se) mais.", "Completa: Se morasses em Lisboa, ___ mais.", ["vemo-nos", "víamo-nos", "veremo-nos", "vejamo-nos"], "víamo-nos", "Hypothetical result, spoken EP → imperfect: víamo-nos."),
      q("Complete: Se ___ (nós, sair) mais cedo, não tínhamos perdido o comboio.", "Completa: Se ___ mais cedo, não tínhamos perdido o comboio.", ["saímos", "sairmos", "tivéssemos saído", "temos saído"], "tivéssemos saído", "Past unreal → pluperfect subjunctive."),
    ],
  },
  {
    id: "present-perfect-composto",
    title: "The Perfeito Composto",
    titlePt: "Pretérito Perfeito Composto",
    cefr: "B1",
    summary: "«Tenho feito» means something repeated or ongoing up to now — not the English «I have done». For a single finished action, Portuguese uses the simple preterite.",
    intro: "The pretérito perfeito composto (ter in the present + participle) looks like the English present perfect, but it means something different. «Tenho estudado muito» means I've been studying a lot lately — a repeated or continuing action up to now.\n\nFor one completed action, even a recent one, European Portuguese uses the simple preterite: «Já comi» (I've already eaten), «Nunca fui ao Porto» (I've never been to Porto), «Acabei o relatório» (I've finished the report).\n\nSo «I have eaten» is never «tenho comido». Use the composto only for «lately», «these days», «recently» situations: «Tenho dormido mal» (I haven't been sleeping well).",
    rules: [
      { rule: "Form: ter (present) + past participle. The participle doesn't change.", rulePt: "Formação: ter (presente) + particípio passado, invariável.", examples: [ex("tenho falado, tens comido, tem feito", "I've been speaking, you've been eating, he's been doing"), ex("temos visto, têm trabalhado", "we've been seeing, they've been working")] },
      { rule: "Use it for a repeated or ongoing action from the past up to now.", rulePt: "Usa-se para uma ação repetida ou contínua do passado até agora.", examples: [ex("Tenho estudado muito este mês.", "I've been studying a lot this month."), ex("Tens dormido bem?", "Have you been sleeping well?"), ex("Ultimamente tem chovido imenso.", "It's been raining loads lately.")] },
      { rule: "For a single finished action (even «already», «never», «just»), use the simple preterite.", rulePt: "Para uma ação única e terminada (já, nunca, ainda não), usa-se o pretérito perfeito simples.", examples: [ex("Já comi.", "I've already eaten."), ex("Nunca fui aos Açores.", "I've never been to the Azores."), ex("Ainda não li esse livro.", "I haven't read that book yet.")] },
      { rule: "Signal words: ultimamente, nos últimos tempos, este mês, desde…", rulePt: "Palavras-sinal: ultimamente, nos últimos tempos, este mês, desde…", examples: [ex("Nos últimos tempos tenho pensado em mudar de casa.", "Lately I've been thinking about moving house.")] },
    ],
    tips: ["English «I have done» is usually the simple preterite in Portuguese: «já fiz».", "Ask yourself: lately / repeatedly? → tenho feito. Once? → fiz.", "With já and nunca, almost always the simple preterite.", "The participle never agrees with ter: «Tenho visto as minhas amigas»."],
    tipsPt: ["«I have done» em inglês é quase sempre o pretérito simples: «já fiz».", "Ultimamente / repetidamente? → tenho feito. Uma vez? → fiz.", "Com já e nunca, quase sempre o pretérito simples.", "O particípio não concorda com ter."],
    questions: [
      q("How do you say «I've already eaten»?", "Como se diz «I've already eaten»?", ["Já tenho comido.", "Já comi.", "Já como.", "Já tinha comido."], "Já comi.", "A single finished action → simple preterite."),
      q("Complete: Ultimamente ___ (eu, dormir) mal.", "Completa: Ultimamente ___ mal.", ["dormi", "tenho dormido", "durmo", "dormia"], "tenho dormido", "Ongoing «lately» situation → perfeito composto."),
      q("What does «Tenho estudado muito» mean?", "O que significa «Tenho estudado muito»?", ["I have studied a lot (once).", "I've been studying a lot lately.", "I had studied a lot.", "I will study a lot."], "I've been studying a lot lately.", "Repeated / ongoing up to now."),
      q("How do you say «I've never been to Porto»?", "Como se diz «I've never been to Porto»?", ["Nunca tenho ido ao Porto.", "Nunca fui ao Porto.", "Nunca vou ao Porto.", "Nunca tinha ido ao Porto."], "Nunca fui ao Porto.", "Nunca + simple preterite."),
      q("Complete: Nos últimos tempos ___ (chover) muito.", "Completa: Nos últimos tempos ___ muito.", ["choveu", "tem chovido", "chove", "chovia"], "tem chovido", "Lately → tem chovido."),
      q("Complete: Ainda não ___ (eu, ler) esse livro.", "Completa: Ainda não ___ esse livro.", ["tenho lido", "li", "leio", "lia"], "li", "Ainda não + simple preterite for a single action."),
      q("Which sentence is natural in European Portuguese?", "Que frase é natural em português europeu?", ["Tenho comido o almoço.", "Tenho visto muitos filmes este mês.", "Tenho chegado agora.", "Tenho nascido em Lisboa."], "Tenho visto muitos filmes este mês.", "Repeated action over a period up to now."),
      q("Complete: Tens ___ (fazer) exercício?", "Completa: Tens ___ exercício?", ["fazido", "feito", "fez", "fazer"], "feito", "Irregular participle: feito."),
    ],
  },
  {
    id: "indefinites",
    title: "Indefinites",
    titlePt: "Indefinidos",
    cefr: "A2",
    summary: "Algum, nenhum, alguém, ninguém, algo, nada, tudo, todo, qualquer, outro, cada — and Portuguese double negation (não vi ninguém).",
    intro: "Indefinites talk about people and things without naming them. Some agree in gender and number like adjectives (algum, alguma, alguns, algumas; nenhum, nenhuma; todo, toda, todos, todas; outro, outra), others never change (alguém, ninguém, algo, nada, tudo, cada).\n\nPortuguese uses double negation: «Não vi ninguém» (I didn't see anyone), «Não quero nada» (I don't want anything). If the negative word comes before the verb, drop the não: «Ninguém veio».\n\nTwo pairs trip learners up: tudo (everything, on its own) vs todo/toda (the whole, before a noun): «Comi tudo» vs «Comi o bolo todo». And qualquer (any at all) vs algum (some): «Qualquer pessoa pode vir».",
    rules: [
      { rule: "Algum / nenhum agree with the noun. Nenhum is usually singular.", rulePt: "Algum / nenhum concordam com o nome. Nenhum usa-se quase sempre no singular.", examples: [ex("Tens alguma pergunta?", "Do you have any questions?"), ex("Não tenho nenhuma dúvida.", "I have no doubts."), ex("Alguns amigos vieram.", "Some friends came.")] },
      { rule: "Alguém / ninguém (people), algo / alguma coisa / nada (things) never change.", rulePt: "Alguém / ninguém (pessoas), algo / alguma coisa / nada (coisas) são invariáveis.", examples: [ex("Está alguém em casa?", "Is anyone home?"), ex("Queres alguma coisa?", "Do you want anything?"), ex("Não se passa nada.", "Nothing's going on.")] },
      { rule: "Double negation: não + verb + ninguém / nada / nenhum. If the negative word comes first, no não.", rulePt: "Dupla negação: não + verbo + ninguém / nada / nenhum. Se a palavra negativa vier antes, sem não.", examples: [ex("Não vi ninguém.", "I didn't see anyone."), ex("Ninguém me disse nada.", "Nobody told me anything.")] },
      { rule: "Tudo = everything (alone). Todo / toda + article + noun = the whole; todos / todas = all, every.", rulePt: "Tudo = everything. Todo / toda + artigo + nome = inteiro; todos / todas = todos.", examples: [ex("Está tudo bem.", "Everything's fine."), ex("Trabalhei o dia todo.", "I worked all day."), ex("Todos os dias acordo às sete.", "Every day I wake up at seven.")] },
      { rule: "Qualquer (plural quaisquer) = any at all; cada = each; outro = another / other.", rulePt: "Qualquer (pl. quaisquer) = any; cada = each; outro = another.", examples: [ex("Qualquer dia vou ao Porto.", "One of these days I'll go to Porto."), ex("Cada pessoa paga a sua parte.", "Each person pays their share."), ex("Queres outro café?", "Do you want another coffee?")] },
    ],
    tips: ["Double negation is correct and normal: «Não sei nada».", "«Tudo» never goes before a noun — use todo/toda: «a casa toda».", "«Todo o dia» = the whole day; «todos os dias» = every day.", "Algum after the noun means «none at all» in emphatic speech: «Não tenho dúvida alguma»."],
    tipsPt: ["A dupla negação é correta e normal: «Não sei nada».", "«Tudo» nunca vai antes de um nome: «a casa toda».", "«Todo o dia» = o dia inteiro; «todos os dias» = every day.", "«Não tenho dúvida alguma» = nenhuma, com ênfase."],
    questions: [
      q("Complete: Não vi ___ na rua.", "Completa: Não vi ___ na rua.", ["alguém", "ninguém", "nada", "nenhum"], "ninguém", "People + negation → ninguém (double negation)."),
      q("Complete: Está ___ bem?", "Completa: Está ___ bem?", ["todo", "tudo", "toda", "todos"], "tudo", "Tudo = everything, on its own."),
      q("Complete: Trabalhei o dia ___.", "Completa: Trabalhei o dia ___.", ["tudo", "todo", "todos", "toda"], "todo", "Todo after the noun = the whole day."),
      q("Complete: Tens ___ pergunta?", "Completa: Tens ___ pergunta?", ["algum", "alguma", "alguém", "algo"], "alguma", "Pergunta is feminine → alguma."),
      q("Which is correct?", "Qual está correta?", ["Ninguém não veio.", "Não veio ninguém.", "Não veio alguém.", "Ninguém veio não."], "Não veio ninguém.", "Não + verb + ninguém, or Ninguém + verb with no não."),
      q("Complete: ___ pessoa paga a sua parte.", "Completa: ___ pessoa paga a sua parte.", ["Cada", "Todo", "Qualquer", "Outra"], "Cada", "Each → cada."),
      q("Complete: Queres ___ café?", "Completa: Queres ___ café?", ["outro", "um outro", "mais um outro", "outra"], "outro", "Another coffee → outro café (no um)."),
      q("Complete: Não quero ___, obrigado.", "Completa: Não quero ___, obrigado.", ["algo", "nada", "tudo", "alguma"], "nada", "Things + negation → nada."),
    ],
  },
  {
    id: "common-verb-phrases",
    title: "Everyday Verb Phrases",
    titlePt: "Expressões Verbais do Dia a Dia",
    cefr: "A2",
    summary: "Acabar de, voltar a, costumar, estar com fome, ter saudades de, há dois anos, há três anos que: the verb phrases you hear every day.",
    intro: "A handful of verb phrases do a lot of work in everyday Portuguese and don't translate word for word.\n\nAcabar de + infinitive = to have just done something: «Acabei de chegar». Voltar a + infinitive = to do again: «Voltei a ligar». Costumar + infinitive = to usually do: «Costumo jantar às oito».\n\nPhysical states use estar com: «Estou com fome / frio / sono / pressa / medo» — or ter: «Tenho fome». Time uses há: «há dois anos» (two years ago), and «há … que» or «desde» for how long something has been going on: «Há três anos que vivo aqui» = «Vivo aqui há três anos» (I've been living here for three years) — note the present tense.",
    rules: [
      { rule: "Acabar de + infinitive = to have just done.", rulePt: "Acabar de + infinitivo = ter feito há muito pouco tempo.", examples: [ex("Acabei de chegar.", "I've just arrived."), ex("Ela acabou de sair.", "She's just left.")] },
      { rule: "Voltar a + infinitive = to do again.", rulePt: "Voltar a + infinitivo = fazer outra vez.", examples: [ex("Voltei a ligar, mas ninguém atendeu.", "I called again, but nobody answered."), ex("Não volto a fazer isso.", "I won't do that again.")] },
      { rule: "Costumar + infinitive = to usually do.", rulePt: "Costumar + infinitivo = fazer habitualmente.", examples: [ex("Costumo jantar às oito.", "I usually have dinner at eight."), ex("Costumavas vir aqui?", "Did you use to come here?")] },
      { rule: "Estar com / ter + fome, sede, frio, calor, sono, pressa, medo.", rulePt: "Estar com / ter + fome, sede, frio, calor, sono, pressa, medo.", examples: [ex("Estou com fome.", "I'm hungry."), ex("Tens frio?", "Are you cold?"), ex("Estamos com pressa.", "We're in a hurry.")] },
      { rule: "Há + time = ago. Há … que / desde + present = for / since (still true now).", rulePt: "Há + tempo = ago. Há … que / desde + presente = algo que ainda continua.", examples: [ex("Mudei-me há dois anos.", "I moved two years ago."), ex("Há três anos que vivo aqui. / Vivo aqui há três anos.", "I've been living here for three years."), ex("Trabalho aqui desde março.", "I've been working here since March.")] },
      { rule: "Ter saudades de = to miss (someone / something).", rulePt: "Ter saudades de = sentir a falta de.", examples: [ex("Tenho saudades tuas.", "I miss you."), ex("Tens saudades de Portugal?", "Do you miss Portugal?")] },
    ],
    tips: ["«Há três anos que vivo aqui» uses the present — the situation is still true.", "Estar com fome and ter fome both work; estar com is very common in Portugal.", "«Acabei de» is the natural way to say «I've just…» — not «tenho acabado».", "«Costumava» = used to: «Costumava fumar»."],
    tipsPt: ["«Há três anos que vivo aqui» usa o presente — ainda é verdade.", "Estar com fome e ter fome: as duas funcionam.", "«Acabei de» = I've just…", "«Costumava» = used to."],
    questions: [
      q("How do you say «I've just arrived»?", "Como se diz «I've just arrived»?", ["Tenho chegado.", "Acabei de chegar.", "Voltei a chegar.", "Costumo chegar."], "Acabei de chegar.", "Acabar de + infinitive."),
      q("Complete: ___ jantar às oito. (I usually…)", "Completa: ___ jantar às oito.", ["Acabo de", "Costumo", "Volto a", "Estou a"], "Costumo", "Costumar + infinitive = usually."),
      q("Complete: Estou ___ fome.", "Completa: Estou ___ fome.", ["de", "com", "em", "a"], "com", "Estar com fome."),
      q("Complete: Mudei-me para cá ___ dois anos.", "Completa: Mudei-me para cá ___ dois anos.", ["desde", "há", "faz que", "para"], "há", "Há + time = ago."),
      q("How do you say «I've been living here for three years»?", "Como se diz «I've been living here for three years»?", ["Vivi aqui há três anos.", "Vivo aqui há três anos.", "Tenho vivido aqui três anos.", "Vivia aqui desde três anos."], "Vivo aqui há três anos.", "Still true now → present + há."),
      q("Complete: Voltei ___ ligar, mas ninguém atendeu.", "Completa: Voltei ___ ligar.", ["de", "a", "para", "com"], "a", "Voltar a + infinitive = again."),
      q("How do you say «I miss you»?", "Como se diz «I miss you»?", ["Tenho saudades tuas.", "Estou com saudades a ti.", "Perco-te.", "Falto-te."], "Tenho saudades tuas.", "Ter saudades de alguém — «tuas» for you."),
      q("Complete: Trabalho aqui ___ março.", "Completa: Trabalho aqui ___ março.", ["há", "desde", "para", "em"], "desde", "Desde + starting point."),
    ],
  },
];

let added = 0;
for (const t of TOPICS) {
  for (const qq of t.questions) {
    if (qq.correctIndex < 0) throw new Error(`${t.id}: answer not in options — ${qq.questionText}`);
  }
  if (data.topics[t.id]) continue;
  data.topics[t.id] = t;
  added++;
}

for (const id of ["imperfect-formation", "preterite-vs-imperfect"]) {
  if (!data.topics[id]) throw new Error(`Missing topic ${id}`);
  data.topics[id].cefr = "A2";
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");

// Register the new ids in grammar-groups.ts
let groups = fs.readFileSync(GROUPS, "utf8");
const addToGroup = (labelPt, ids) => {
  const marker = `labelPt: "${labelPt}",\n    topics: [`;
  const i = groups.indexOf(marker);
  if (i < 0) throw new Error(`Group not found: ${labelPt}`);
  const insertAt = groups.indexOf("\n    ],", i); // end of this group's topic list
  const missing = ids.filter((id) => !groups.includes(`"${id}"`));
  if (!missing.length) return;
  groups = groups.slice(0, insertAt) + missing.map((id) => `\n      "${id}",`).join("") + groups.slice(insertAt);
};
addToGroup("Conjuntivo", ["future-subjunctive", "imperfect-subjunctive", "conditional-sentences"]);
addToGroup("Tempos do passado", ["present-perfect-composto"]);
addToGroup("Pronomes e determinantes", ["indefinites"]);
addToGroup("Estruturas especiais", ["common-verb-phrases"]);
fs.writeFileSync(GROUPS, groups);

const counts = {};
for (const t of Object.values(data.topics)) counts[t.cefr] = (counts[t.cefr] || 0) + 1;
console.log(`Added ${added} topics. Total ${Object.keys(data.topics).length}.`, counts);
