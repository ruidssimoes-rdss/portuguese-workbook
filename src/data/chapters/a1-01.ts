import type { ChapterContent } from "../chapter-types";

const G = "greetings-expressions";

export const A1_01: ChapterContent = {
  lessonId: "a1-01",
  sections: [
    {
      title: "Cumprimentos",
      blocks: [
        {
          type: "vocab",
          rows: [
            { kind: "word", categoryId: G, portuguese: "olá" },
            { kind: "word", categoryId: G, portuguese: "bom dia" },
            { kind: "word", categoryId: G, portuguese: "boa tarde" },
            { kind: "word", categoryId: G, portuguese: "boa noite" },
            { kind: "word", categoryId: G, portuguese: "adeus" },
            { kind: "word", categoryId: G, portuguese: "tchau" },
            { kind: "word", categoryId: G, portuguese: "até logo" },
            { kind: "word", categoryId: G, portuguese: "até amanhã" },
            { kind: "word", categoryId: G, portuguese: "obrigado / obrigada" },
            { kind: "word", categoryId: G, portuguese: "por favor" },
            { kind: "word", categoryId: G, portuguese: "desculpe" },
            { kind: "word", categoryId: G, portuguese: "sim" },
            { kind: "word", categoryId: G, portuguese: "não" },
            { kind: "word", categoryId: G, portuguese: "como estás?" },
            { kind: "word", categoryId: G, portuguese: "tudo bem?" },
            { kind: "word", categoryId: G, portuguese: "tudo bem" },
            { kind: "word", categoryId: G, portuguese: "como se chama?" },
            { kind: "word", categoryId: G, portuguese: "chamo-me..." },
            { kind: "word", categoryId: G, portuguese: "muito prazer" },
          ],
        },
        {
          type: "note",
          title: "Boa tarde vs boa noite",
          body: "Bom dia until about noon. Boa tarde from the afternoon into early evening. Boa noite from early evening, used as both hello and goodbye. When you walk into a shop or café, match the clock with bom dia or boa tarde.",
        },
      ],
    },
    {
      title: "Pronomes pessoais sujeitos",
      grammarTopic: "subject-pronouns",
      blocks: [
        {
          type: "vocab",
          header: "Pronome",
          rows: [
            { kind: "row", pt: "eu", phonetics: "EH-oo", en: "I", example: "Eu falo português." },
            { kind: "row", pt: "tu", phonetics: "too", en: "you (one person, informal)", example: "Tu estás bem?" },
            { kind: "row", pt: "ele / ela", phonetics: "AY-luh / EH-luh", en: "he / she", example: "Ela é professora." },
            { kind: "row", pt: "nós", phonetics: "nosh", en: "we", example: "Nós somos amigos." },
            { kind: "row", pt: "vocês", phonetics: "voh-SAYSH", en: "you (plural)", example: "Vocês falam inglês?" },
            { kind: "row", pt: "eles / elas", phonetics: "AY-lush / EH-lush", en: "they", example: "Eles estão em casa." },
          ],
        },
        {
          type: "note",
          title: "Tu vs polite (Portugal)",
          body: "Tu is for friends, family, peers and most young people. With strangers, older people or at work, use o senhor / a senhora, or the person's name, with the verb in the third person. Bare você with a stranger can sound blunt, so leave it for later.",
        },
        { type: "text", body: "Portuguese often drops the pronoun, because the verb ending already shows the person: Falo português." },
      ],
    },
    {
      title: "Ser e estar (presente)",
      blocks: [
        {
          type: "conjugation",
          items: [
            { label: "Ser: identity, what something is", verbKey: "SER", tense: "Present" },
            { label: "Estar: state, how or where right now", verbKey: "ESTAR", tense: "Present" },
          ],
        },
        {
          type: "note",
          title: "Helper",
          body: "Who or what → ser (Eu sou português). How or where right now → estar (Eu estou bem). Drill both tables out loud.",
        },
      ],
    },
    {
      title: "Chamar, ter, encontrar (presente)",
      blocks: [
        { type: "conjugation", items: [{ label: "Chamar: chamo-me for names", verbKey: "CHAMAR", tense: "Present" }] },
        { type: "conjugation", items: [{ label: "Ter: to have", verbKey: "TER", tense: "Present" }] },
        { type: "conjugation", items: [{ label: "Encontrar: to meet, to find", verbKey: "ENCONTRAR", tense: "Present" }] },
      ],
    },
    {
      title: "Acordo leve (adjetivos)",
      grammarTopic: "adjective-agreement",
      blocks: [
        { type: "text", body: "Adjectives match the gender and number of what they describe. Many change -o to -a, and a few add -a: português, portuguesa. Most come after the noun." },
        {
          type: "vocab",
          rows: [
            { kind: "row", pt: "alto / alta", phonetics: "AHL-too / AHL-tuh", en: "tall", example: "Eu sou alto. A Ana é alta." },
            { kind: "row", pt: "português / portuguesa", phonetics: "poor-too-GAYSH / poor-too-GAY-zuh", en: "Portuguese", example: "Ele é português. Ela é portuguesa." },
            { kind: "row", pt: "cansado / cansada", phonetics: "kang-SAH-doo / kang-SAH-duh", en: "tired", example: "Hoje estou cansada." },
            { kind: "row", pt: "um carro vermelho", phonetics: "oong KAH-rroo vuhr-MAY-lyoo", en: "a red car", example: "Tenho um carro vermelho." },
          ],
        },
      ],
    },
    {
      title: "Diálogos",
      blocks: [
        {
          type: "dialogue",
          lines: [
            { n: "1a", pt: "Olá. Como te chamas?", phonetics: "oo-LAH. KOH-moo tuh SHAH-mush?", en: "Hi. What is your name?" },
            { n: "1b", pt: "Chamo-me Ana. E tu?", phonetics: "SHAH-moo-muh AH-nuh. ee TOO?", en: "My name is Ana. And you?" },
            { n: "1c", pt: "Sou o Pedro. Muito prazer.", phonetics: "soh oo PEH-droo. MOOY-too pruh-ZEHR.", en: "I am Pedro. Nice to meet you." },
            { n: "1d", pt: "Muito prazer.", phonetics: "MOOY-too pruh-ZEHR.", en: "Nice to meet you." },
            { n: "2a", pt: "Bom dia. Como estás?", phonetics: "bong DEE-uh. KOH-moo shtahsh?", en: "Good morning. How are you?" },
            { n: "2b", pt: "Estou bem, obrigada. E tu?", phonetics: "shtoh bayng, oo-bree-GAH-duh. ee TOO?", en: "I am well, thanks. And you?" },
            { n: "2c", pt: "Tudo bem.", phonetics: "TOO-doo bayng.", en: "All good." },
            { n: "3a", pt: "Desculpe… como se chama?", phonetics: "dish-KOOL-puh… KOH-moo suh SHAH-muh?", en: "Excuse me… what is your name?" },
            { n: "3b", pt: "Chamo-me Maria. Sou professora.", phonetics: "SHAH-moo-muh muh-REE-uh. soh proo-fuh-SOH-ruh.", en: "My name is Maria. I am a teacher." },
            { n: "3c", pt: "Muito prazer. Eu sou o Tomás.", phonetics: "MOOY-too pruh-ZEHR. EH-oo soh oo too-MAHSH.", en: "Nice to meet you. I am Tomás." },
          ],
        },
        {
          type: "note",
          title: "Helper",
          body: "Listen for chamo-me, sou / és / é and estou / estás. Play each line, then read it aloud once.",
        },
      ],
    },
  ],
  culturaIntro: "Etiquette for this chapter. A short version also sits in the rail.",
  mustKnow: [
    "the greeting set",
    "subject pronouns",
    "ser and estar",
    "Chamo-me…",
    "ter and encontrar",
    "obrigado or obrigada agrees with the speaker",
    "light agreement",
  ],
  rail: {
    canDo: [
      { text: "Greet for the time of day", section: 1 },
      { text: "Choose tu or polite", section: 2 },
      { text: "Tell ser from estar", section: 3 },
      { text: "Say your name with chamo-me", section: 4 },
      { text: "Hold a first conversation", section: 6 },
    ],
    drills: [
      { prompt: "You walk into a café at 3 in the afternoon.", answer: "Boa tarde.", phonetics: "BOH-uh TAHR-duh" },
      { prompt: "Ask a new classmate their name.", answer: "Como te chamas?", phonetics: "KOH-moo tuh SHAH-mush" },
      { prompt: "Ask an older stranger their name, politely.", answer: "Desculpe, como se chama?", phonetics: "dish-KOOL-puh, KOH-moo suh SHAH-muh" },
      { prompt: "You're a woman. Say you're well, thank them, and ask back.", answer: "Estou bem, obrigada. E tu?", phonetics: "shtoh bayng, oo-bree-GAH-duh. ee TOO" },
    ],
    etiquette: [
      { label: "Beijinhos", text: "Two cheek kisses, right side first. Follow their lead." },
      { label: "Shops", text: "Say bom dia or boa tarde when you walk in." },
      { label: "Strangers", text: "o senhor / a senhora, not bare você." },
    ],
    elisioTip: "Stuck on ser and estar? Ask: is this what something is, or how and where it is right now? If \"right now\" fits, it's estar.",
  },
  test: [
    { prompt: "You walk into a café at 10 in the morning. What do you say?", options: ["Bom dia.", "Boa tarde.", "Boa noite.", "Adeus."], hint: "Bom dia runs until about noon.", section: 1 },
    { prompt: "A man thanks you. What does he say?", options: ["Obrigado.", "Obrigada.", "Por favor.", "Desculpe."], hint: "Obrigado or obrigada agrees with the person speaking, not the person thanked.", section: 1 },
    { prompt: "Which pronoun do you use with a close friend?", options: ["tu", "o senhor", "eles", "nós"], hint: "One person, informal.", section: 2 },
    { prompt: "Ask an older stranger their name, politely.", options: ["Como se chama?", "Como te chamas?", "Como se chamam?", "Como me chamo?"], hint: "Polite address uses the third person, as with o senhor and a senhora.", section: 2 },
    { prompt: "Choose the right verb: «I am Portuguese.»", promptPt: "Eu ___ português.", options: ["sou", "estou", "é", "está"], hint: "Identity and nationality take ser.", section: 3 },
    { prompt: "Choose the right verb: «I am tired today.»", promptPt: "Hoje ___ cansada.", options: ["estou", "sou", "está", "és"], hint: "How you are right now takes estar.", section: 3 },
    { prompt: "Choose the right verb: «Are you at home?»", promptPt: "Tu ___ em casa?", options: ["estás", "és", "está", "é"], hint: "Where someone is right now takes estar.", section: 3 },
    { prompt: "Say «My name is Ana.» the way people say it in Portugal.", options: ["Chamo-me Ana.", "Me chamo Ana.", "Eu chama Ana.", "Chamo Ana."], hint: "In Portugal the pronoun goes after the verb, joined by a hyphen.", section: 4 },
    { prompt: "Choose the right form of encontrar: «I meet Ana at the café.»", promptPt: "Eu ___ a Ana no café.", options: ["encontro", "encontra", "encontras", "encontramos"], hint: "Eu forms of -ar verbs end in -o.", section: 4 },
    { prompt: "Choose the right form of ter: «We have two children.»", promptPt: "Nós ___ dois filhos.", options: ["temos", "tem", "tens", "têm"], hint: "Nós forms end in -mos.", section: 4 },
    { prompt: "Choose the right form: «Maria is Portuguese.»", promptPt: "A Maria é ___.", options: ["portuguesa", "português", "portugueses", "portuguesas"], hint: "One woman: feminine singular.", section: 5 },
    { prompt: "Someone says «Muito prazer.» What do you answer?", options: ["Muito prazer.", "Até amanhã.", "Por favor.", "Desculpe."], hint: "You can simply say it back.", section: 6 },
  ],
};
