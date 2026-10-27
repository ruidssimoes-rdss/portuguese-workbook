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
    leaveWith: "Greet and close a chat, say your name, use the subject pronouns, the present of ser, estar, chamar, ter and encontrar, light adjective agreement, and tu versus polite address. Then a short chapter test.",
    howToUse: [
      "Play the audio at the start of each row, then read the example aloud before you scroll on.",
      "Treat the tables as drills, not a word list to memorise: listen, echo, then use the sentence.",
      "When a word feels opaque, open it for a snapshot. Come back here for the why, how and when of the chapter.",
    ],
    whyHowWhen: [
      "Why: every conversation in Portugal starts with a greeting that matches the clock and a clear choice of you, tu or polite.",
      "How: lock in the six subject pronouns and two machines: ser for who or what something is, estar for how or where it is right now.",
      "When: bom dia until about noon, boa tarde into early evening, boa noite from early evening, for hello and goodbye. Drop the pronoun when the verb ending already shows the person.",
    ],
    etiquette: [
      "Dois beijinhos: often two cheek kisses, right side first. Follow their lead.",
      "Shop or café: say bom dia or boa tarde when you walk in. Silence feels rude.",
      "Tu with friends and peers. Polite: o senhor, a senhora or the person's name with the third person. Bare você with strangers can sound blunt.",
    ],
    sayItOutLoud: [
      "Without looking: greet for the time of day, ask Como te chamas?, answer with Chamo-me…, say Muito prazer, then close with Até logo.",
      "Then swap tu for a polite line once: Desculpe, como se chama?",
    ],
    elisioTip: "Ser and estar are not interchangeable. Ask yourself: am I saying what something is, or how or where it is right now? If \"right now\" fits, you probably want estar.",
  },
};
