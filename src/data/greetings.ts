export interface Greeting {
  id: string;
  portuguese: string;
  english: string;
  pronunciation: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime";
  level: "A1" | "A2";
  acceptedResponses: Array<{
    text: string;
    display: string;
    feedback: string;
  }>;
  commonMistakes: Array<{
    text: string;
    correction: string;
    explanation: string;
  }>;
  hint: string;
}

export const greetings: Greeting[] = [
  {
    id: "morning-1",
    portuguese: "Bom dia! Como estás?",
    english: "Good morning! How are you?",
    pronunciation: "bong DEE-ah! KOH-moo esh-TAHSH?",
    timeOfDay: "morning",
    level: "A1",
    acceptedResponses: [
      {
        text: "estou bem obrigado",
        display: "Estou bem, obrigado!",
        feedback: "Muito bem! Perfect response.",
      },
      {
        text: "estou bem obrigada",
        display: "Estou bem, obrigada!",
        feedback: "Muito bem! Perfect response.",
      },
      { text: "estou bem", display: "Estou bem!", feedback: "Boa! Simple and correct." },
      {
        text: "bom dia estou bem",
        display: "Bom dia! Estou bem.",
        feedback: "Excellent — greeting back and answering. Very natural!",
      },
      {
        text: "tudo bem",
        display: "Tudo bem!",
        feedback: "Boa! Very common casual response.",
      },
      {
        text: "estou otimo",
        display: "Estou ótimo!",
        feedback: "Fantástico! Feeling great!",
      },
      {
        text: "estou otima",
        display: "Estou ótima!",
        feedback: "Fantástico! Feeling great!",
      },
      {
        text: "bem e tu",
        display: "Bem, e tu?",
        feedback: "Perfeito! Answering and asking back — very polite.",
      },
      {
        text: "tudo bem e tu",
        display: "Tudo bem, e tu?",
        feedback: "Natural and conversational. Muito bem!",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: 'Honesty is good! "More or less" — a useful phrase.',
      },
      {
        text: "estou assim assim",
        display: "Estou assim-assim.",
        feedback: "So-so — another great way to express yourself!",
      },
    ],
    commonMistakes: [
      {
        text: "estou bom",
        correction: "Estou bem",
        explanation:
          'We use "bem" (well) with "estar," not "bom" (good). "Estou bem" = I am well.',
      },
      {
        text: "estou boa",
        correction: "Estou bem",
        explanation:
          'Use "bem" with "estar" for how you feel. "Estou bem" = I am well.',
      },
      {
        text: "eu sou bem",
        correction: "Estou bem",
        explanation:
          '"Ser" is for permanent traits. For how you feel right now, use "estar": Estou bem.',
      },
      {
        text: "bom",
        correction: "Estou bem / Tudo bem",
        explanation:
          'Just "bom" on its own is not a natural response. Try "Estou bem" or "Tudo bem" instead.',
      },
    ],
    hint: 'Try saying how you are feeling. Start with "Estou..." (I am...)',
  },
  {
    id: "morning-2",
    portuguese: "Bom dia! Dormiste bem?",
    english: "Good morning! Did you sleep well?",
    pronunciation: "bong DEE-ah! door-MEESH-tuh beng?",
    timeOfDay: "morning",
    level: "A2",
    acceptedResponses: [
      {
        text: "sim dormi bem",
        display: "Sim, dormi bem!",
        feedback: "Boa! Glad to hear it.",
      },
      {
        text: "dormi bem obrigado",
        display: "Dormi bem, obrigado!",
        feedback: "Muito bem! Polite and correct.",
      },
      {
        text: "dormi bem obrigada",
        display: "Dormi bem, obrigada!",
        feedback: "Muito bem! Polite and correct.",
      },
      {
        text: "sim muito bem",
        display: "Sim, muito bem!",
        feedback: "Fantástico! Great to hear.",
      },
      {
        text: "dormi muito bem",
        display: "Dormi muito bem!",
        feedback: "Perfeito! Slept very well.",
      },
      {
        text: "nao dormi bem",
        display: "Não dormi bem.",
        feedback: "Oh no! But grammatically perfect.",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: "More or less — honest answer! Well done.",
      },
    ],
    commonMistakes: [
      {
        text: "dormei bem",
        correction: "Dormi bem",
        explanation:
          '"Dormir" is irregular in the past tense. "Eu dormi" not "dormei."',
      },
      {
        text: "eu dormiu bem",
        correction: "Eu dormi bem",
        explanation: '"Dormiu" is the ele/ela form. For "eu" use "dormi."',
      },
    ],
    hint: 'Answer about your sleep. "Dormi..." means "I slept..."',
  },
  {
    id: "afternoon-1",
    portuguese: "Boa tarde! Tudo bem contigo?",
    english: "Good afternoon! Everything ok with you?",
    pronunciation: "BOH-ah TAHR-duh! TOO-doo beng kong-TEE-goo?",
    timeOfDay: "afternoon",
    level: "A1",
    acceptedResponses: [
      { text: "tudo bem", display: "Tudo bem!", feedback: "Boa! Short and sweet." },
      {
        text: "sim tudo bem",
        display: "Sim, tudo bem!",
        feedback: "Perfeito! Simple and natural.",
      },
      {
        text: "tudo bem e contigo",
        display: "Tudo bem, e contigo?",
        feedback: "Excellent — asking back is very polite!",
      },
      {
        text: "tudo otimo",
        display: "Tudo ótimo!",
        feedback: "Fantástico! Everything is great!",
      },
      {
        text: "tudo bem obrigado",
        display: "Tudo bem, obrigado!",
        feedback: "Muito bem! Polite response.",
      },
      {
        text: "tudo bem obrigada",
        display: "Tudo bem, obrigada!",
        feedback: "Muito bem! Polite response.",
      },
      {
        text: "esta tudo bem",
        display: "Está tudo bem!",
        feedback: "Boa! Slightly more formal, but perfect.",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: "More or less — a useful phrase for those so-so days.",
      },
    ],
    commonMistakes: [
      {
        text: "todo bem",
        correction: "Tudo bem",
        explanation:
          '"Tudo" (everything) not "todo" (all/every). "Tudo bem" is the fixed expression.',
      },
      {
        text: "tudo bon",
        correction: "Tudo bem / Tudo bom",
        explanation:
          "In Portuguese it's \"bom\" not \"bon.\" But \"Tudo bem\" is more natural than \"Tudo bom.\"",
      },
    ],
    hint: 'A simple "Tudo bem" works perfectly here!',
  },
  {
    id: "afternoon-2",
    portuguese: "Boa tarde! O que vais fazer hoje?",
    english: "Good afternoon! What are you going to do today?",
    pronunciation: "BOH-ah TAHR-duh! oo kuh vysh fah-ZEHR OH-juh?",
    timeOfDay: "afternoon",
    level: "A2",
    acceptedResponses: [
      {
        text: "vou estudar portugues",
        display: "Vou estudar português!",
        feedback: "Boa! And you already are!",
      },
      {
        text: "vou trabalhar",
        display: "Vou trabalhar.",
        feedback: "Productive day! Well constructed.",
      },
      {
        text: "vou descansar",
        display: "Vou descansar.",
        feedback: 'Everyone needs rest! Perfect use of "ir + infinitive."',
      },
      {
        text: "nao sei",
        display: "Não sei.",
        feedback: "Fair enough! \"I don't know\" is always useful.",
      },
      {
        text: "nada de especial",
        display: "Nada de especial.",
        feedback: "Nothing special — very natural casual response!",
      },
      {
        text: "vou passear",
        display: "Vou passear.",
        feedback: "Going for a stroll! Lovely. Perfect sentence.",
      },
      {
        text: "vou cozinhar",
        display: "Vou cozinhar.",
        feedback: "Going to cook — delicious plans! Well said.",
      },
    ],
    commonMistakes: [
      {
        text: "eu vai fazer",
        correction: "Eu vou fazer",
        explanation: '"Vai" is for ele/ela. For "eu" use "vou": Eu vou fazer.',
      },
      {
        text: "vou a estudar",
        correction: "Vou estudar",
        explanation:
          'With "ir + infinitive" in Portuguese, no preposition is needed. Just "Vou estudar."',
      },
    ],
    hint: 'Use "Vou..." (I\'m going to...) followed by an activity verb.',
  },
  {
    id: "evening-1",
    portuguese: "Boa noite! Como correu o teu dia?",
    english: "Good evening! How did your day go?",
    pronunciation: "BOH-ah NOY-tuh! KOH-moo koh-HREH-oo oo teh-oo DEE-ah?",
    timeOfDay: "evening",
    level: "A2",
    acceptedResponses: [
      {
        text: "correu bem",
        display: "Correu bem!",
        feedback: "Boa! Glad to hear it went well.",
      },
      {
        text: "correu muito bem",
        display: "Correu muito bem!",
        feedback: "Fantástico! Great day.",
      },
      {
        text: "o meu dia correu bem",
        display: "O meu dia correu bem!",
        feedback: "Perfeito! Full sentence, very natural.",
      },
      {
        text: "correu bem obrigado",
        display: "Correu bem, obrigado!",
        feedback: "Muito bem! Polite and correct.",
      },
      {
        text: "correu bem obrigada",
        display: "Correu bem, obrigada!",
        feedback: "Muito bem! Polite and correct.",
      },
      {
        text: "foi um bom dia",
        display: "Foi um bom dia!",
        feedback: "It was a good day — nice alternative phrasing!",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: "More or less — hope tomorrow is better!",
      },
      {
        text: "correu mal",
        display: "Correu mal.",
        feedback: "Sorry to hear that. But your Portuguese is correct!",
      },
    ],
    commonMistakes: [
      {
        text: "corri bem",
        correction: "Correu bem",
        explanation:
          '"Corri" means "I ran." The day "correu" (it went). The subject is "o dia" not "eu."',
      },
      {
        text: "foi bem",
        correction: "Correu bem",
        explanation:
          '"Foi bem" is understandable but "Correu bem" is the natural way to say a day went well.',
      },
    ],
    hint: 'The day "correu" (went/ran). Try "Correu..." followed by how it went.',
  },
  {
    id: "evening-2",
    portuguese: "Boa noite! Já jantaste?",
    english: "Good evening! Have you eaten dinner yet?",
    pronunciation: "BOH-ah NOY-tuh! jah zhang-TAHSH-tuh?",
    timeOfDay: "evening",
    level: "A2",
    acceptedResponses: [
      {
        text: "sim ja jantei",
        display: "Sim, já jantei!",
        feedback: "Boa! Hope it was delicious.",
      },
      { text: "ja jantei", display: "Já jantei!", feedback: "Perfeito! Short and correct." },
      {
        text: "ainda nao",
        display: "Ainda não.",
        feedback: "Not yet — a very useful phrase! Well done.",
      },
      {
        text: "ainda nao jantei",
        display: "Ainda não jantei.",
        feedback: "Full sentence, perfect grammar!",
      },
      {
        text: "sim obrigado",
        display: "Sim, obrigado!",
        feedback: "Simple and polite. Muito bem!",
      },
      {
        text: "sim obrigada",
        display: "Sim, obrigada!",
        feedback: "Simple and polite. Muito bem!",
      },
      {
        text: "nao tenho fome",
        display: "Não tenho fome.",
        feedback: 'Not hungry — good use of "ter fome"!',
      },
      {
        text: "vou jantar agora",
        display: "Vou jantar agora.",
        feedback: 'Going to eat now — perfect "ir + infinitive"!',
      },
    ],
    commonMistakes: [
      {
        text: "sim eu jantou",
        correction: "Sim, eu jantei",
        explanation: '"Jantou" is for ele/ela. For "eu" use "jantei."',
      },
      {
        text: "jantei ja",
        correction: "Já jantei",
        explanation:
          'Word order: "Já" (already) comes before the verb in Portuguese. "Já jantei."',
      },
    ],
    hint: '"Já" means "already." Try "Já jantei" (I already ate dinner) or "Ainda não" (not yet).',
  },
  {
    id: "anytime-1",
    portuguese: "Olá! Como estás?",
    english: "Hello! How are you?",
    pronunciation: "oh-LAH! KOH-moo esh-TAHSH?",
    timeOfDay: "anytime",
    level: "A1",
    acceptedResponses: [
      {
        text: "estou bem",
        display: "Estou bem!",
        feedback: "Perfeito! Simple and correct.",
      },
      {
        text: "estou bem obrigado",
        display: "Estou bem, obrigado!",
        feedback: "Muito bem! Polite response.",
      },
      {
        text: "estou bem obrigada",
        display: "Estou bem, obrigada!",
        feedback: "Muito bem! Polite response.",
      },
      {
        text: "tudo bem",
        display: "Tudo bem!",
        feedback: "Boa! Very casual and natural.",
      },
      {
        text: "ola estou bem",
        display: "Olá! Estou bem.",
        feedback: "Greeting back and answering — natural and polite!",
      },
      {
        text: "bem e tu",
        display: "Bem, e tu?",
        feedback: "Perfeito! Answering and asking back.",
      },
      {
        text: "estou otimo",
        display: "Estou ótimo!",
        feedback: "Great to hear! Fantástico!",
      },
      {
        text: "estou otima",
        display: "Estou ótima!",
        feedback: "Great to hear! Fantástico!",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: "More or less — an honest and useful phrase!",
      },
    ],
    commonMistakes: [
      {
        text: "estou bom",
        correction: "Estou bem",
        explanation:
          'Use "bem" (well) with "estar" for feelings, not "bom" (good). "Estou bem."',
      },
      {
        text: "eu sou bem",
        correction: "Estou bem",
        explanation:
          '"Ser" is for permanent traits. For current state, use "estar": Estou bem.',
      },
      {
        text: "como estas",
        correction: "",
        explanation:
          "You repeated the question! Try answering — \"Estou bem\" (I am well).",
      },
    ],
    hint: 'Tell me how you are! "Estou..." (I am...) + "bem" (well), "ótimo/a" (great), etc.',
  },
  {
    id: "anytime-2",
    portuguese: "Tudo bem? Como vai isso?",
    english: "All good? How's it going?",
    pronunciation: "TOO-doo beng? KOH-moo vy EE-soo?",
    timeOfDay: "anytime",
    level: "A1",
    acceptedResponses: [
      {
        text: "tudo bem",
        display: "Tudo bem!",
        feedback: "Boa! Mirror response — very natural.",
      },
      {
        text: "tudo otimo",
        display: "Tudo ótimo!",
        feedback: "Everything's great! Fantástico!",
      },
      {
        text: "vai tudo bem",
        display: "Vai tudo bem!",
        feedback: "Perfeito! Everything's going well.",
      },
      {
        text: "tudo tranquilo",
        display: "Tudo tranquilo.",
        feedback: "All chill — very Portuguese casual vibe!",
      },
      {
        text: "sim tudo bem",
        display: "Sim, tudo bem!",
        feedback: "Simple and correct. Muito bem!",
      },
      {
        text: "tudo bem e tu",
        display: "Tudo bem, e tu?",
        feedback: "Asking back — polite and conversational!",
      },
      {
        text: "mais ou menos",
        display: "Mais ou menos.",
        feedback: "So-so — keep it real! Well done.",
      },
    ],
    commonMistakes: [
      {
        text: "todo bem",
        correction: "Tudo bem",
        explanation:
          '"Tudo" (everything) not "todo" (all/every). Fixed expression: "Tudo bem."',
      },
    ],
    hint: 'You can mirror back: "Tudo bem!" or add more: "Tudo ótimo!"',
  },
];
