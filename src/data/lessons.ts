export interface VocabItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: { pt: string; en: string };
}

export interface VerbItem {
  id: string;
  verb: string;
  verbTranslation: string;
  tense: string;
  conjugations: { pronoun: string; form: string }[];
  verbSlug: string;
}

export interface GrammarItem {
  id: string;
  rule: string;
  rulePt: string;
  examples: { pt: string; en: string }[];
  topicSlug: string;
  topicTitle: string;
}

export interface CultureItem {
  id: string;
  expression: string;
  meaning: string;
  literal: string;
  tip: string;
}

export interface PracticeItem {
  id: string;
  sentence: string;
  answer: string;
  fullSentence: string;
  translation: string;
  acceptedAnswers: string[];
}

export interface LessonStage {
  id: string;
  type: "vocabulary" | "verb" | "grammar" | "culture" | "practice" | "summary";
  title: string;
  ptTitle: string;
  description: string;
  items?: VocabItem[];
  verbs?: VerbItem[];
  grammarItems?: GrammarItem[];
  cultureItems?: CultureItem[];
  practiceItems?: PracticeItem[];
}

export interface Lesson {
  id: string;
  title: string;
  ptTitle: string;
  description: string;
  cefr: "A1" | "A2" | "B1";
  estimatedMinutes: number;
  order: number;
  stages: LessonStage[];
}

export function getLessonItemCount(lesson: Lesson): number {
  return lesson.stages.reduce((sum, stage) => {
    return (
      sum +
      (stage.items?.length || 0) +
      (stage.verbs?.[0]?.conjugations.length || 0) +
      (stage.grammarItems?.[0]?.examples.length || 0) +
      (stage.cultureItems?.length || 0) +
      (stage.practiceItems?.length || 0)
    );
  }, 0);
}

export const lessons: Lesson[] = [
  {
    id: "first-conversations",
    title: "First Conversations",
    ptTitle: "Primeiras Conversas",
    description:
      "Essential greetings, introducing yourself with ser, basic sentence structure, and your first Portuguese saying.",
    cefr: "A1",
    estimatedMinutes: 15,
    order: 1,
    stages: [
      {
        id: "stage-vocab",
        type: "vocabulary",
        title: "Greetings & Essentials",
        ptTitle: "Cumprimentos e Essenciais",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "vocab-1",
            word: "olá",
            translation: "hello",
            pronunciation: "/oh-LAH/",
            example: { pt: "Olá, como estás?", en: "Hello, how are you?" },
          },
          {
            id: "vocab-2",
            word: "bom dia",
            translation: "good morning",
            pronunciation: "/bong DEE-ah/",
            example: { pt: "Bom dia, senhora.", en: "Good morning, madam." },
          },
          {
            id: "vocab-3",
            word: "boa tarde",
            translation: "good afternoon",
            pronunciation: "/BOH-ah TAHR-duh/",
            example: {
              pt: "Boa tarde a todos.",
              en: "Good afternoon everyone.",
            },
          },
          {
            id: "vocab-4",
            word: "boa noite",
            translation: "good evening / good night",
            pronunciation: "/BOH-ah NOY-tuh/",
            example: {
              pt: "Boa noite, dorme bem.",
              en: "Good night, sleep well.",
            },
          },
          {
            id: "vocab-5",
            word: "obrigado / obrigada",
            translation: "thank you (m/f)",
            pronunciation: "/oh-bree-GAH-doo/",
            example: {
              pt: "Muito obrigado pela ajuda.",
              en: "Thank you very much for the help.",
            },
          },
          {
            id: "vocab-6",
            word: "por favor",
            translation: "please",
            pronunciation: "/poor fah-VOR/",
            example: { pt: "Um café, por favor.", en: "A coffee, please." },
          },
          {
            id: "vocab-7",
            word: "desculpe",
            translation: "excuse me / sorry (formal)",
            pronunciation: "/dush-KOOL-puh/",
            example: {
              pt: "Desculpe, onde é a estação?",
              en: "Excuse me, where is the station?",
            },
          },
          {
            id: "vocab-8",
            word: "sim / não",
            translation: "yes / no",
            pronunciation: "/seeng/ /nowng/",
            example: {
              pt: "Sim, eu falo português.",
              en: "Yes, I speak Portuguese.",
            },
          },
        ],
      },
      {
        id: "stage-verb",
        type: "verb",
        title: "Verb: Ser",
        ptTitle: "Verbo: Ser",
        description:
          "Fill in the correct conjugation of 'ser' (to be) in the present tense.",
        verbs: [
          {
            id: "verb-1",
            verb: "ser",
            verbTranslation: "to be (permanent)",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "sou" },
              { pronoun: "tu", form: "és" },
              { pronoun: "ele/ela", form: "é" },
              { pronoun: "nós", form: "somos" },
              { pronoun: "eles/elas", form: "são" },
            ],
            verbSlug: "ser",
          },
        ],
      },
      {
        id: "stage-grammar",
        type: "grammar",
        title: "Sentence Structure",
        ptTitle: "Estrutura da Frase",
        description:
          "Review the basic word order pattern and test yourself with the examples.",
        grammarItems: [
          {
            id: "grammar-1",
            rule: "Standard word order is Subject + Verb + Object (SVO).",
            rulePt: "A ordem padrão é Sujeito + Verbo + Objeto (SVO).",
            examples: [
              { pt: "Eu como pão.", en: "I eat bread." },
              { pt: "A Maria compra um livro.", en: "Maria buys a book." },
              { pt: "Nós falamos português.", en: "We speak Portuguese." },
              {
                pt: "O Pedro trabalha em Lisboa.",
                en: "Pedro works in Lisbon.",
              },
            ],
            topicSlug: "sentence-structure",
            topicTitle: "Sentence Structure",
          },
        ],
      },
      {
        id: "stage-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "culture-1",
            expression: "Mais vale tarde do que nunca.",
            meaning: "It's better to do something late than not at all.",
            literal: "More worth late than never.",
            tip: "A common encouraging expression when someone finally gets around to doing something.",
          },
          {
            id: "culture-2",
            expression: "Quem não tem cão, caça com gato.",
            meaning: "Make do with what you have.",
            literal: "Who doesn't have a dog, hunts with a cat.",
            tip: "Used when someone finds a creative solution because the ideal option isn't available.",
          },
        ],
      },
      {
        id: "stage-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "practice-1",
            sentence: "___, como estás?",
            answer: "Olá",
            fullSentence: "Olá, como estás?",
            translation: "Hello, how are you?",
            acceptedAnswers: ["olá", "Olá", "ola", "Ola"],
          },
          {
            id: "practice-2",
            sentence: "Eu ___ português.",
            answer: "sou",
            fullSentence: "Eu sou português.",
            translation: "I am Portuguese.",
            acceptedAnswers: ["sou"],
          },
          {
            id: "practice-3",
            sentence: "Um café, por ___.",
            answer: "favor",
            fullSentence: "Um café, por favor.",
            translation: "A coffee, please.",
            acceptedAnswers: ["favor"],
          },
          {
            id: "practice-4",
            sentence: "Bom ___, senhora.",
            answer: "dia",
            fullSentence: "Bom dia, senhora.",
            translation: "Good morning, madam.",
            acceptedAnswers: ["dia"],
          },
          {
            id: "practice-5",
            sentence: "___, onde é a estação?",
            answer: "Desculpe",
            fullSentence: "Desculpe, onde é a estação?",
            translation: "Excuse me, where is the station?",
            acceptedAnswers: ["desculpe", "Desculpe"],
          },
        ],
      },
    ],
  },
  {
    id: "at-the-cafe",
    title: "At the Café",
    ptTitle: "No Café",
    description:
      "Order food and drinks, use ter and querer, learn articles, discover pastel de nata culture, and practise café scenarios.",
    cefr: "A1",
    estimatedMinutes: 20,
    order: 2,
    stages: [
      {
        id: "cafe-vocab",
        type: "vocabulary",
        title: "Café Essentials",
        ptTitle: "Essenciais do Café",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "cafe-v1",
            word: "café",
            translation: "coffee",
            pronunciation: "/kah-FEH/",
            example: { pt: "Quero um café com leite.", en: "I want a coffee with milk." },
          },
          {
            id: "cafe-v2",
            word: "chá",
            translation: "tea",
            pronunciation: "/SHAH/",
            example: { pt: "Um chá de camomila.", en: "A chamomile tea." },
          },
          {
            id: "cafe-v3",
            word: "água",
            translation: "water",
            pronunciation: "/AH-gwah/",
            example: { pt: "Uma garrafa de água, por favor.", en: "A bottle of water, please." },
          },
          {
            id: "cafe-v4",
            word: "leite",
            translation: "milk",
            pronunciation: "/LAY-tuh/",
            example: { pt: "Bebo leite ao pequeno-almoço.", en: "I drink milk at breakfast." },
          },
          {
            id: "cafe-v5",
            word: "pão",
            translation: "bread",
            pronunciation: "/POWNG/",
            example: { pt: "Pão fresco da padaria.", en: "Fresh bread from the bakery." },
          },
          {
            id: "cafe-v6",
            word: "a conta",
            translation: "the bill",
            pronunciation: "/uh KON-tah/",
            example: { pt: "A conta, por favor.", en: "The bill, please." },
          },
          {
            id: "cafe-v7",
            word: "a ementa",
            translation: "the menu",
            pronunciation: "/uh ay-MEN-tah/",
            example: { pt: "Posso ver a ementa?", en: "May I see the menu?" },
          },
          {
            id: "cafe-v8",
            word: "pastel de nata",
            translation: "custard tart",
            pronunciation: "/pahsh-TEHL duh NAH-tah/",
            example: { pt: "Os pastéis de nata de Belém.", en: "The custard tarts from Belém." },
          },
        ],
      },
      {
        id: "cafe-verb-ter",
        type: "verb",
        title: "Verb: Ter",
        ptTitle: "Verbo: Ter",
        description:
          "Fill in the correct conjugation of 'ter' (to have) in the present tense.",
        verbs: [
          {
            id: "cafe-ter",
            verb: "ter",
            verbTranslation: "to have",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "tenho" },
              { pronoun: "tu", form: "tens" },
              { pronoun: "ele/ela", form: "tem" },
              { pronoun: "nós", form: "temos" },
              { pronoun: "eles/elas", form: "têm" },
            ],
            verbSlug: "ter",
          },
        ],
      },
      {
        id: "cafe-verb-querer",
        type: "verb",
        title: "Verb: Querer",
        ptTitle: "Verbo: Querer",
        description:
          "Fill in the correct conjugation of 'querer' (to want) in the present tense.",
        verbs: [
          {
            id: "cafe-querer",
            verb: "querer",
            verbTranslation: "to want",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "quero" },
              { pronoun: "tu", form: "queres" },
              { pronoun: "ele/ela", form: "quer" },
              { pronoun: "nós", form: "queremos" },
              { pronoun: "eles/elas", form: "querem" },
            ],
            verbSlug: "querer",
          },
        ],
      },
      {
        id: "cafe-grammar",
        type: "grammar",
        title: "Articles",
        ptTitle: "Artigos",
        description:
          "Learn the definite and indefinite articles and when to use them.",
        grammarItems: [
          {
            id: "cafe-g1",
            rule: "Definite articles: o (m. sing.), a (f. sing.), os (m. pl.), as (f. pl.). Indefinite: um (m.), uma (f.).",
            rulePt: "Artigos definidos: o, a, os, as. Indefinidos: um, uma.",
            examples: [
              { pt: "o café", en: "the coffee" },
              { pt: "a conta", en: "the bill" },
              { pt: "um chá", en: "a tea" },
              { pt: "uma água", en: "a water" },
            ],
            topicSlug: "articles",
            topicTitle: "Articles",
          },
        ],
      },
      {
        id: "cafe-culture",
        type: "culture",
        title: "Café Culture",
        ptTitle: "Cultura do Café",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "cafe-c1",
            expression: "Comer e coçar, é só começar.",
            meaning: "The hardest part is getting started. Once you begin, it gets easier.",
            literal: "Eating and scratching, you just have to start.",
            tip: "A perfect saying for café culture — once you sit down and order, you'll relax in no time.",
          },
          {
            id: "cafe-c2",
            expression: "O barato sai caro.",
            meaning: "You get what you pay for. Buying cheap often costs more in the long run.",
            literal: "The cheap comes out expensive.",
            tip: "Used when someone buys a low-quality product and it breaks or disappoints.",
          },
        ],
      },
      {
        id: "cafe-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "cafe-p1",
            sentence: "Um ___, por favor.",
            answer: "café",
            fullSentence: "Um café, por favor.",
            translation: "A coffee, please.",
            acceptedAnswers: ["café", "cafe"],
          },
          {
            id: "cafe-p2",
            sentence: "Eu ___ um chá.",
            answer: "quero",
            fullSentence: "Eu quero um chá.",
            translation: "I want a tea.",
            acceptedAnswers: ["quero"],
          },
          {
            id: "cafe-p3",
            sentence: "A ___, por favor.",
            answer: "conta",
            fullSentence: "A conta, por favor.",
            translation: "The bill, please.",
            acceptedAnswers: ["conta"],
          },
          {
            id: "cafe-p4",
            sentence: "Nós ___ fome.",
            answer: "temos",
            fullSentence: "Nós temos fome.",
            translation: "We are hungry.",
            acceptedAnswers: ["temos"],
          },
          {
            id: "cafe-p5",
            sentence: "Posso ver ___ ementa?",
            answer: "a",
            fullSentence: "Posso ver a ementa?",
            translation: "May I see the menu?",
            acceptedAnswers: ["a"],
          },
        ],
      },
    ],
  },
  {
    id: "getting-around",
    title: "Getting Around",
    ptTitle: "Deslocar-se",
    description:
      "Transport vocabulary, the verb ir (to go), prepositions of place, and asking for directions.",
    cefr: "A1",
    estimatedMinutes: 18,
    order: 3,
    stages: [
      {
        id: "travel-vocab",
        type: "vocabulary",
        title: "Transport & Directions",
        ptTitle: "Transportes e Direções",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "travel-v1",
            word: "comboio",
            translation: "train",
            pronunciation: "/kom-BOY-oo/",
            example: { pt: "Apanhei o comboio para o Porto.", en: "I caught the train to Porto." },
          },
          {
            id: "travel-v2",
            word: "autocarro",
            translation: "bus",
            pronunciation: "/ow-too-KAH-rroo/",
            example: { pt: "O autocarro passa às nove.", en: "The bus comes at nine." },
          },
          {
            id: "travel-v3",
            word: "metro",
            translation: "metro / underground",
            pronunciation: "/MEH-troo/",
            example: { pt: "A estação de metro é aqui perto.", en: "The metro station is nearby." },
          },
          {
            id: "travel-v4",
            word: "bilhete",
            translation: "ticket",
            pronunciation: "/bee-LYEH-tuh/",
            example: { pt: "Onde compro o bilhete?", en: "Where do I buy the ticket?" },
          },
          {
            id: "travel-v5",
            word: "direita",
            translation: "right",
            pronunciation: "/dee-RAY-tah/",
            example: { pt: "Vira à direita.", en: "Turn right." },
          },
          {
            id: "travel-v6",
            word: "esquerda",
            translation: "left",
            pronunciation: "/shKEHR-dah/",
            example: { pt: "Vira à esquerda.", en: "Turn left." },
          },
          {
            id: "travel-v7",
            word: "em frente",
            translation: "straight ahead",
            pronunciation: "/ayng FREN-tuh/",
            example: { pt: "Segue em frente.", en: "Go straight ahead." },
          },
          {
            id: "travel-v8",
            word: "perto",
            translation: "near / close",
            pronunciation: "/PEHR-too/",
            example: { pt: "Fica perto daqui.", en: "It's near here." },
          },
        ],
      },
      {
        id: "travel-verb",
        type: "verb",
        title: "Verb: Ir",
        ptTitle: "Verbo: Ir",
        description:
          "Fill in the correct conjugation of 'ir' (to go) in the present tense.",
        verbs: [
          {
            id: "travel-ir",
            verb: "ir",
            verbTranslation: "to go",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "vou" },
              { pronoun: "tu", form: "vais" },
              { pronoun: "ele/ela", form: "vai" },
              { pronoun: "nós", form: "vamos" },
              { pronoun: "eles/elas", form: "vão" },
            ],
            verbSlug: "ir",
          },
        ],
      },
      {
        id: "travel-grammar",
        type: "grammar",
        title: "Prepositions of Place",
        ptTitle: "Preposições de Lugar",
        description:
          "Review how to say where things are using em, de, a and their contractions.",
        grammarItems: [
          {
            id: "travel-g1",
            rule: "Use 'em' (in/on/at) with contractions: em + o = no, em + a = na. Use 'de' (from/of): de + o = do, de + a = da. Use 'a' (to): a + o = ao, a + a = à.",
            rulePt: "Preposições com contrações: no, na, do, da, ao, à.",
            examples: [
              { pt: "Estou no metro.", en: "I'm in the metro." },
              { pt: "Vou ao Porto.", en: "I'm going to Porto." },
              { pt: "Venho da estação.", en: "I come from the station." },
              { pt: "Estou na paragem.", en: "I'm at the bus stop." },
            ],
            topicSlug: "contractions",
            topicTitle: "Contractions",
          },
        ],
      },
      {
        id: "travel-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "travel-c1",
            expression: "Devagarinho se vai ao longe.",
            meaning: "Slow and steady wins the race. Take your time and you'll get there.",
            literal: "Slowly, one goes far.",
            tip: "Perfect for travel — it reminds you to enjoy the journey, not rush the destination.",
          },
          {
            id: "travel-c2",
            expression: "Quem vai ao mar, avia-se em terra.",
            meaning: "Prepare properly before starting something. Plan ahead.",
            literal: "Who goes to sea, prepares on land.",
            tip: "Always plan your trip before leaving — buy tickets, check schedules!",
          },
        ],
      },
      {
        id: "travel-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "travel-p1",
            sentence: "Eu ___ ao Porto de comboio.",
            answer: "vou",
            fullSentence: "Eu vou ao Porto de comboio.",
            translation: "I'm going to Porto by train.",
            acceptedAnswers: ["vou"],
          },
          {
            id: "travel-p2",
            sentence: "Onde compro o ___?",
            answer: "bilhete",
            fullSentence: "Onde compro o bilhete?",
            translation: "Where do I buy the ticket?",
            acceptedAnswers: ["bilhete"],
          },
          {
            id: "travel-p3",
            sentence: "Vira à ___.",
            answer: "direita",
            fullSentence: "Vira à direita.",
            translation: "Turn right.",
            acceptedAnswers: ["direita"],
          },
          {
            id: "travel-p4",
            sentence: "Nós ___ de autocarro.",
            answer: "vamos",
            fullSentence: "Nós vamos de autocarro.",
            translation: "We go by bus.",
            acceptedAnswers: ["vamos"],
          },
          {
            id: "travel-p5",
            sentence: "Estou ___ estação.",
            answer: "na",
            fullSentence: "Estou na estação.",
            translation: "I'm at the station.",
            acceptedAnswers: ["na"],
          },
        ],
      },
    ],
  },
  {
    id: "my-day",
    title: "My Day",
    ptTitle: "O Meu Dia",
    description:
      "Daily routine vocabulary, reflexive verbs, telling the time, -AR verb conjugation, and the concept of saudade.",
    cefr: "A1",
    estimatedMinutes: 22,
    order: 4,
    stages: [
      {
        id: "day-vocab",
        type: "vocabulary",
        title: "Daily Routine",
        ptTitle: "Rotina Diária",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "day-v1",
            word: "acordar",
            translation: "to wake up",
            pronunciation: "/ah-koor-DAHR/",
            example: { pt: "Acordo às sete da manhã.", en: "I wake up at seven in the morning." },
          },
          {
            id: "day-v2",
            word: "levantar-se",
            translation: "to get up",
            pronunciation: "/luh-vahn-TAHR-suh/",
            example: { pt: "Levanto-me cedo.", en: "I get up early." },
          },
          {
            id: "day-v3",
            word: "tomar banho",
            translation: "to take a shower / bath",
            pronunciation: "/too-MAHR BAH-nyoo/",
            example: { pt: "Tomo banho de manhã.", en: "I shower in the morning." },
          },
          {
            id: "day-v4",
            word: "pequeno-almoço",
            translation: "breakfast",
            pronunciation: "/puh-KAY-noo ahl-MOH-soo/",
            example: { pt: "O pequeno-almoço está incluído.", en: "Breakfast is included." },
          },
          {
            id: "day-v5",
            word: "almoço",
            translation: "lunch",
            pronunciation: "/ahl-MOH-soo/",
            example: { pt: "Vamos almoçar juntos?", en: "Shall we have lunch together?" },
          },
          {
            id: "day-v6",
            word: "jantar",
            translation: "dinner",
            pronunciation: "/zhan-TAHR/",
            example: { pt: "O jantar é às oito.", en: "Dinner is at eight." },
          },
          {
            id: "day-v7",
            word: "trabalhar",
            translation: "to work",
            pronunciation: "/trah-bah-LYAHR/",
            example: { pt: "Trabalho em casa.", en: "I work from home." },
          },
          {
            id: "day-v8",
            word: "dormir",
            translation: "to sleep",
            pronunciation: "/door-MEER/",
            example: { pt: "Durmo oito horas por noite.", en: "I sleep eight hours a night." },
          },
        ],
      },
      {
        id: "day-verb-falar",
        type: "verb",
        title: "Verb: Falar (-AR)",
        ptTitle: "Verbo: Falar (-AR)",
        description:
          "Fill in the correct conjugation of 'falar' (to speak) in the present tense. This is a model -AR verb.",
        verbs: [
          {
            id: "day-falar",
            verb: "falar",
            verbTranslation: "to speak / to talk",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "falo" },
              { pronoun: "tu", form: "falas" },
              { pronoun: "ele/ela", form: "fala" },
              { pronoun: "nós", form: "falamos" },
              { pronoun: "eles/elas", form: "falam" },
            ],
            verbSlug: "falar",
          },
        ],
      },
      {
        id: "day-verb-trabalhar",
        type: "verb",
        title: "Verb: Trabalhar (-AR)",
        ptTitle: "Verbo: Trabalhar (-AR)",
        description:
          "Fill in the correct conjugation of 'trabalhar' (to work) in the present tense.",
        verbs: [
          {
            id: "day-trabalhar",
            verb: "trabalhar",
            verbTranslation: "to work",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "trabalho" },
              { pronoun: "tu", form: "trabalhas" },
              { pronoun: "ele/ela", form: "trabalha" },
              { pronoun: "nós", form: "trabalhamos" },
              { pronoun: "eles/elas", form: "trabalham" },
            ],
            verbSlug: "trabalhar",
          },
        ],
      },
      {
        id: "day-grammar",
        type: "grammar",
        title: "Telling the Time",
        ptTitle: "As Horas",
        description:
          "Learn how to ask and tell the time in Portuguese.",
        grammarItems: [
          {
            id: "day-g1",
            rule: "Ask: 'Que horas são?' (What time is it?). Answer with 'São' + hours, except 1 o'clock: 'É uma hora'. Use 'e' for past and 'menos' for to. 'Meia' = half, 'um quarto' = quarter.",
            rulePt: "Que horas são? São + horas. É uma hora. E = past, menos = to.",
            examples: [
              { pt: "São três horas.", en: "It's three o'clock." },
              { pt: "É uma hora.", en: "It's one o'clock." },
              { pt: "São dez e meia.", en: "It's half past ten." },
              { pt: "São cinco menos um quarto.", en: "It's a quarter to five." },
            ],
            topicSlug: "questions",
            topicTitle: "Forming Questions",
          },
        ],
      },
      {
        id: "day-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "day-c1",
            expression: "De grão em grão, enche a galinha o papo.",
            meaning: "Little by little, small efforts add up to big results.",
            literal: "Grain by grain, the hen fills her crop.",
            tip: "Like learning Portuguese — every new word adds up! Keep at it daily.",
          },
          {
            id: "day-c2",
            expression: "Depois da tempestade vem a bonança.",
            meaning: "Bad times are followed by good times. Things will get better.",
            literal: "After the storm comes the calm.",
            tip: "A comforting saying when you're having a tough day.",
          },
        ],
      },
      {
        id: "day-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "day-p1",
            sentence: "Eu ___ às sete da manhã.",
            answer: "acordo",
            fullSentence: "Eu acordo às sete da manhã.",
            translation: "I wake up at seven in the morning.",
            acceptedAnswers: ["acordo"],
          },
          {
            id: "day-p2",
            sentence: "Nós ___ português.",
            answer: "falamos",
            fullSentence: "Nós falamos português.",
            translation: "We speak Portuguese.",
            acceptedAnswers: ["falamos"],
          },
          {
            id: "day-p3",
            sentence: "Tu ___ em Lisboa.",
            answer: "trabalhas",
            fullSentence: "Tu trabalhas em Lisboa.",
            translation: "You work in Lisbon.",
            acceptedAnswers: ["trabalhas"],
          },
          {
            id: "day-p4",
            sentence: "Que ___ são?",
            answer: "horas",
            fullSentence: "Que horas são?",
            translation: "What time is it?",
            acceptedAnswers: ["horas"],
          },
          {
            id: "day-p5",
            sentence: "O ___ é às oito.",
            answer: "jantar",
            fullSentence: "O jantar é às oito.",
            translation: "Dinner is at eight.",
            acceptedAnswers: ["jantar"],
          },
        ],
      },
    ],
  },
  {
    id: "at-the-market",
    title: "At the Market",
    ptTitle: "No Mercado",
    description:
      "Food and shopping vocabulary, the verb comprar, noun gender basics, and haggling expressions.",
    cefr: "A1",
    estimatedMinutes: 18,
    order: 5,
    stages: [
      {
        id: "market-vocab",
        type: "vocabulary",
        title: "Food & Shopping",
        ptTitle: "Comida e Compras",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "market-v1",
            word: "fruta",
            translation: "fruit",
            pronunciation: "/FROO-tah/",
            example: { pt: "Como fruta todos os dias.", en: "I eat fruit every day." },
          },
          {
            id: "market-v2",
            word: "legumes",
            translation: "vegetables",
            pronunciation: "/luh-GOO-mush/",
            example: { pt: "Como legumes ao jantar.", en: "I eat vegetables at dinner." },
          },
          {
            id: "market-v3",
            word: "carne",
            translation: "meat",
            pronunciation: "/KAHR-nuh/",
            example: { pt: "Não como carne.", en: "I don't eat meat." },
          },
          {
            id: "market-v4",
            word: "peixe",
            translation: "fish",
            pronunciation: "/PAY-shuh/",
            example: { pt: "Em Portugal comemos muito peixe.", en: "In Portugal we eat a lot of fish." },
          },
          {
            id: "market-v5",
            word: "queijo",
            translation: "cheese",
            pronunciation: "/KAY-zhoo/",
            example: { pt: "Queijo da Serra é delicioso.", en: "Serra cheese is delicious." },
          },
          {
            id: "market-v6",
            word: "preço",
            translation: "price",
            pronunciation: "/PRAY-soo/",
            example: { pt: "Qual é o preço?", en: "What is the price?" },
          },
          {
            id: "market-v7",
            word: "barato",
            translation: "cheap",
            pronunciation: "/bah-RAH-too/",
            example: { pt: "Está barato.", en: "It's cheap." },
          },
          {
            id: "market-v8",
            word: "caro",
            translation: "expensive",
            pronunciation: "/KAH-roo/",
            example: { pt: "Lisboa é caro.", en: "Lisbon is expensive." },
          },
        ],
      },
      {
        id: "market-verb",
        type: "verb",
        title: "Verb: Comprar",
        ptTitle: "Verbo: Comprar",
        description:
          "Fill in the correct conjugation of 'comprar' (to buy) in the present tense.",
        verbs: [
          {
            id: "market-comprar",
            verb: "comprar",
            verbTranslation: "to buy",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "compro" },
              { pronoun: "tu", form: "compras" },
              { pronoun: "ele/ela", form: "compra" },
              { pronoun: "nós", form: "compramos" },
              { pronoun: "eles/elas", form: "compram" },
            ],
            verbSlug: "comprar",
          },
        ],
      },
      {
        id: "market-grammar",
        type: "grammar",
        title: "Noun Gender",
        ptTitle: "Género dos Nomes",
        description:
          "Learn how to tell if a noun is masculine or feminine in Portuguese.",
        grammarItems: [
          {
            id: "market-g1",
            rule: "Basic rule: words ending in -o are usually masculine (o livro), words ending in -a are usually feminine (a mesa). Exceptions: o dia, o mapa (masculine despite -a); a tribo, a foto (feminine despite -o).",
            rulePt: "Regra básica: -o = masculino, -a = feminino. Exceções: o dia, o mapa; a tribo, a foto.",
            examples: [
              { pt: "o queijo", en: "the cheese (masculine)" },
              { pt: "a fruta", en: "the fruit (feminine)" },
              { pt: "o peixe", en: "the fish (masculine)" },
              { pt: "a carne", en: "the meat (feminine)" },
            ],
            topicSlug: "noun-gender",
            topicTitle: "Noun Gender",
          },
        ],
      },
      {
        id: "market-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "market-c1",
            expression: "Quem não arrisca, não petisca.",
            meaning: "Nothing ventured, nothing gained. You have to take risks to get rewards.",
            literal: "Who doesn't risk, doesn't snack.",
            tip: "Used to encourage someone to try something new — like ordering an unfamiliar dish at the market!",
          },
          {
            id: "market-c2",
            expression: "Nem tudo o que reluz é ouro.",
            meaning: "Appearances can be deceiving. Don't judge by the surface.",
            literal: "Not everything that shines is gold.",
            tip: "Good advice when shopping — the prettiest packaging doesn't always mean the best quality.",
          },
        ],
      },
      {
        id: "market-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "market-p1",
            sentence: "Eu ___ fruta no mercado.",
            answer: "compro",
            fullSentence: "Eu compro fruta no mercado.",
            translation: "I buy fruit at the market.",
            acceptedAnswers: ["compro"],
          },
          {
            id: "market-p2",
            sentence: "Qual é ___ preço?",
            answer: "o",
            fullSentence: "Qual é o preço?",
            translation: "What is the price?",
            acceptedAnswers: ["o"],
          },
          {
            id: "market-p3",
            sentence: "___ carne é fresca.",
            answer: "A",
            fullSentence: "A carne é fresca.",
            translation: "The meat is fresh.",
            acceptedAnswers: ["a", "A"],
          },
          {
            id: "market-p4",
            sentence: "Nós ___ legumes todos os dias.",
            answer: "compramos",
            fullSentence: "Nós compramos legumes todos os dias.",
            translation: "We buy vegetables every day.",
            acceptedAnswers: ["compramos"],
          },
          {
            id: "market-p5",
            sentence: "Está muito ___!",
            answer: "caro",
            fullSentence: "Está muito caro!",
            translation: "It's very expensive!",
            acceptedAnswers: ["caro"],
          },
        ],
      },
    ],
  },
  {
    id: "my-home",
    title: "My Home",
    ptTitle: "A Minha Casa",
    description:
      "Rooms and furniture vocabulary, the verb estar, ser vs estar distinction, and Portuguese home culture.",
    cefr: "A1",
    estimatedMinutes: 18,
    order: 6,
    stages: [
      {
        id: "home-vocab",
        type: "vocabulary",
        title: "Rooms & Furniture",
        ptTitle: "Divisões e Mobília",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "home-v1",
            word: "casa",
            translation: "house / home",
            pronunciation: "/KAH-zah/",
            example: { pt: "A minha casa é pequena.", en: "My house is small." },
          },
          {
            id: "home-v2",
            word: "cozinha",
            translation: "kitchen",
            pronunciation: "/koo-ZEE-nyah/",
            example: { pt: "A cozinha é grande.", en: "The kitchen is big." },
          },
          {
            id: "home-v3",
            word: "sala",
            translation: "living room",
            pronunciation: "/SAH-lah/",
            example: { pt: "Estamos na sala.", en: "We're in the living room." },
          },
          {
            id: "home-v4",
            word: "quarto",
            translation: "bedroom",
            pronunciation: "/KWAHR-too/",
            example: { pt: "O quarto tem uma janela grande.", en: "The bedroom has a big window." },
          },
          {
            id: "home-v5",
            word: "casa de banho",
            translation: "bathroom",
            pronunciation: "/KAH-zah duh BAH-nyoo/",
            example: { pt: "Onde é a casa de banho?", en: "Where is the bathroom?" },
          },
          {
            id: "home-v6",
            word: "cama",
            translation: "bed",
            pronunciation: "/KAH-mah/",
            example: { pt: "A cama é confortável.", en: "The bed is comfortable." },
          },
          {
            id: "home-v7",
            word: "mesa",
            translation: "table",
            pronunciation: "/MAY-zah/",
            example: { pt: "Põe a mesa para o jantar.", en: "Set the table for dinner." },
          },
          {
            id: "home-v8",
            word: "cadeira",
            translation: "chair",
            pronunciation: "/kah-DAY-rah/",
            example: { pt: "Senta-te na cadeira.", en: "Sit on the chair." },
          },
        ],
      },
      {
        id: "home-verb",
        type: "verb",
        title: "Verb: Estar",
        ptTitle: "Verbo: Estar",
        description:
          "Fill in the correct conjugation of 'estar' (to be — temporary) in the present tense.",
        verbs: [
          {
            id: "home-estar",
            verb: "estar",
            verbTranslation: "to be (temporary / location)",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "estou" },
              { pronoun: "tu", form: "estás" },
              { pronoun: "ele/ela", form: "está" },
              { pronoun: "nós", form: "estamos" },
              { pronoun: "eles/elas", form: "estão" },
            ],
            verbSlug: "estar",
          },
        ],
      },
      {
        id: "home-grammar",
        type: "grammar",
        title: "Ser vs Estar",
        ptTitle: "Ser vs Estar",
        description:
          "Understand when to use 'ser' (permanent) vs 'estar' (temporary/location).",
        grammarItems: [
          {
            id: "home-g1",
            rule: "Use SER for permanent traits (identity, origin, profession, time). Use ESTAR for temporary states (feelings, locations, conditions). Remember: 'A casa é grande' (the house IS big — permanent feature) vs 'A casa está suja' (the house IS dirty — can change).",
            rulePt: "SER = permanente (identidade, origem). ESTAR = temporário (sentimentos, localização).",
            examples: [
              { pt: "Eu sou português.", en: "I am Portuguese. (permanent — ser)" },
              { pt: "Eu estou cansado.", en: "I am tired. (temporary — estar)" },
              { pt: "A casa é grande.", en: "The house is big. (permanent — ser)" },
              { pt: "A casa está limpa.", en: "The house is clean. (temporary — estar)" },
            ],
            topicSlug: "ser-vs-estar",
            topicTitle: "SER vs ESTAR",
          },
        ],
      },
      {
        id: "home-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "home-c1",
            expression: "Casa onde não há pão, todos ralham e ninguém tem razão.",
            meaning: "Poverty and scarcity cause conflict. People fight when basic needs aren't met.",
            literal: "House where there's no bread, everyone argues and nobody is right.",
            tip: "A reminder that a happy home starts with meeting everyone's basic needs.",
          },
          {
            id: "home-c2",
            expression: "Santos da casa não fazem milagres.",
            meaning: "Familiarity breeds contempt. People don't value what's close to them.",
            literal: "Saints of the house don't perform miracles.",
            tip: "We tend to appreciate experts from far away more than the ones right at home.",
          },
        ],
      },
      {
        id: "home-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "home-p1",
            sentence: "Eu ___ na cozinha.",
            answer: "estou",
            fullSentence: "Eu estou na cozinha.",
            translation: "I'm in the kitchen.",
            acceptedAnswers: ["estou"],
          },
          {
            id: "home-p2",
            sentence: "A casa ___ grande.",
            answer: "é",
            fullSentence: "A casa é grande.",
            translation: "The house is big.",
            acceptedAnswers: ["é", "e"],
          },
          {
            id: "home-p3",
            sentence: "Onde é ___ casa de banho?",
            answer: "a",
            fullSentence: "Onde é a casa de banho?",
            translation: "Where is the bathroom?",
            acceptedAnswers: ["a"],
          },
          {
            id: "home-p4",
            sentence: "Nós ___ na sala.",
            answer: "estamos",
            fullSentence: "Nós estamos na sala.",
            translation: "We're in the living room.",
            acceptedAnswers: ["estamos"],
          },
          {
            id: "home-p5",
            sentence: "A cama ___ confortável.",
            answer: "é",
            fullSentence: "A cama é confortável.",
            translation: "The bed is comfortable.",
            acceptedAnswers: ["é", "e"],
          },
        ],
      },
    ],
  },
  {
    id: "feeling-unwell",
    title: "Feeling Unwell",
    ptTitle: "Sentir-se Mal",
    description:
      "Body parts and health vocabulary, the verb doer (to hurt), negation rules, and pharmacy interactions.",
    cefr: "A2",
    estimatedMinutes: 18,
    order: 7,
    stages: [
      {
        id: "health-vocab",
        type: "vocabulary",
        title: "Body & Health",
        ptTitle: "Corpo e Saúde",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "health-v1",
            word: "cabeça",
            translation: "head",
            pronunciation: "/kah-BAY-sah/",
            example: { pt: "Dói-me a cabeça.", en: "My head hurts." },
          },
          {
            id: "health-v2",
            word: "dor de cabeça",
            translation: "headache",
            pronunciation: "/DOHR duh kah-BAY-sah/",
            example: { pt: "Tenho uma dor de cabeça forte.", en: "I have a bad headache." },
          },
          {
            id: "health-v3",
            word: "febre",
            translation: "fever",
            pronunciation: "/FEH-bruh/",
            example: { pt: "O miúdo tem febre.", en: "The child has a fever." },
          },
          {
            id: "health-v4",
            word: "constipação",
            translation: "cold (illness)",
            pronunciation: "/konsh-tee-pah-SOWNG/",
            example: { pt: "Estou com constipação.", en: "I have a cold." },
          },
          {
            id: "health-v5",
            word: "farmácia",
            translation: "pharmacy",
            pronunciation: "/fahr-MAH-see-ah/",
            example: { pt: "Onde é a farmácia mais próxima?", en: "Where is the nearest pharmacy?" },
          },
          {
            id: "health-v6",
            word: "comprimido",
            translation: "pill / tablet",
            pronunciation: "/kom-pree-MEE-doo/",
            example: { pt: "Tomo um comprimido por dia.", en: "I take one pill a day." },
          },
          {
            id: "health-v7",
            word: "doente",
            translation: "sick / ill",
            pronunciation: "/doo-EN-tuh/",
            example: { pt: "Estou doente, não vou trabalhar.", en: "I'm sick, I'm not going to work." },
          },
          {
            id: "health-v8",
            word: "dor de garganta",
            translation: "sore throat",
            pronunciation: "/DOHR duh gahr-GAN-tah/",
            example: { pt: "Tenho dor de garganta.", en: "I have a sore throat." },
          },
        ],
      },
      {
        id: "health-verb",
        type: "verb",
        title: "Verb: Fazer",
        ptTitle: "Verbo: Fazer",
        description:
          "Fill in the correct conjugation of 'fazer' (to do/make) in the present tense.",
        verbs: [
          {
            id: "health-fazer",
            verb: "fazer",
            verbTranslation: "to do / to make",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "faço" },
              { pronoun: "tu", form: "fazes" },
              { pronoun: "ele/ela", form: "faz" },
              { pronoun: "nós", form: "fazemos" },
              { pronoun: "eles/elas", form: "fazem" },
            ],
            verbSlug: "fazer",
          },
        ],
      },
      {
        id: "health-grammar",
        type: "grammar",
        title: "Negation",
        ptTitle: "Negação",
        description:
          "Learn how to say 'no' and make negative sentences in Portuguese.",
        grammarItems: [
          {
            id: "health-g1",
            rule: "Place 'não' before the verb to make it negative. Unlike English, Portuguese allows double negatives: 'Não quero nada' (I don't want nothing = I don't want anything).",
            rulePt: "Coloca 'não' antes do verbo. Dupla negação é normal: Não quero nada.",
            examples: [
              { pt: "Não estou bem.", en: "I'm not well." },
              { pt: "Não quero nada.", en: "I don't want anything." },
              { pt: "Nunca fui ao hospital.", en: "I've never been to the hospital." },
              { pt: "Não como carne.", en: "I don't eat meat." },
            ],
            topicSlug: "negation",
            topicTitle: "Negation",
          },
        ],
      },
      {
        id: "health-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "health-c1",
            expression: "Não há bem que sempre dure, nem mal que nunca se cure.",
            meaning: "Nothing lasts forever — neither good times nor bad.",
            literal: "There's no good that always lasts, nor bad that never heals.",
            tip: "A comforting saying when you're feeling unwell — you'll get better!",
          },
          {
            id: "health-c2",
            expression: "A esperança é a última a morrer.",
            meaning: "Never give up hope. Hope persists even in the darkest times.",
            literal: "Hope is the last to die.",
            tip: "Portuguese people often use this saying to stay optimistic during tough times.",
          },
        ],
      },
      {
        id: "health-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "health-p1",
            sentence: "Dói-me a ___.",
            answer: "cabeça",
            fullSentence: "Dói-me a cabeça.",
            translation: "My head hurts.",
            acceptedAnswers: ["cabeça", "cabeca"],
          },
          {
            id: "health-p2",
            sentence: "___ estou bem.",
            answer: "Não",
            fullSentence: "Não estou bem.",
            translation: "I'm not well.",
            acceptedAnswers: ["não", "Não", "nao", "Nao"],
          },
          {
            id: "health-p3",
            sentence: "Estou ___, não vou trabalhar.",
            answer: "doente",
            fullSentence: "Estou doente, não vou trabalhar.",
            translation: "I'm sick, I'm not going to work.",
            acceptedAnswers: ["doente"],
          },
          {
            id: "health-p4",
            sentence: "Eu ___ exercício todos os dias.",
            answer: "faço",
            fullSentence: "Eu faço exercício todos os dias.",
            translation: "I do exercise every day.",
            acceptedAnswers: ["faço", "faco"],
          },
          {
            id: "health-p5",
            sentence: "Tenho ___ de garganta.",
            answer: "dor",
            fullSentence: "Tenho dor de garganta.",
            translation: "I have a sore throat.",
            acceptedAnswers: ["dor"],
          },
        ],
      },
    ],
  },
  {
    id: "making-plans",
    title: "Making Plans",
    ptTitle: "Fazer Planos",
    description:
      "Time expressions, the verb poder, ir + infinitive for future plans, forming questions, and weekend culture.",
    cefr: "A2",
    estimatedMinutes: 22,
    order: 8,
    stages: [
      {
        id: "plans-vocab",
        type: "vocabulary",
        title: "Time & Plans",
        ptTitle: "Tempo e Planos",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "plans-v1",
            word: "hoje",
            translation: "today",
            pronunciation: "/OH-zhuh/",
            example: { pt: "Hoje é segunda-feira.", en: "Today is Monday." },
          },
          {
            id: "plans-v2",
            word: "amanhã",
            translation: "tomorrow",
            pronunciation: "/ah-mah-NYAH/",
            example: { pt: "Amanhã vou ao médico.", en: "Tomorrow I'm going to the doctor." },
          },
          {
            id: "plans-v3",
            word: "fim de semana",
            translation: "weekend",
            pronunciation: "/FEENG duh suh-MAH-nah/",
            example: { pt: "O que vais fazer no fim de semana?", en: "What are you going to do at the weekend?" },
          },
          {
            id: "plans-v4",
            word: "sempre",
            translation: "always",
            pronunciation: "/SEM-pruh/",
            example: { pt: "Ela chega sempre a horas.", en: "She always arrives on time." },
          },
          {
            id: "plans-v5",
            word: "nunca",
            translation: "never",
            pronunciation: "/NOON-kah/",
            example: { pt: "Nunca fui ao Brasil.", en: "I've never been to Brazil." },
          },
          {
            id: "plans-v6",
            word: "às vezes",
            translation: "sometimes",
            pronunciation: "/ahsh VAY-zush/",
            example: { pt: "Às vezes como fora.", en: "Sometimes I eat out." },
          },
          {
            id: "plans-v7",
            word: "férias",
            translation: "holidays / vacation",
            pronunciation: "/FEH-ree-ahsh/",
            example: { pt: "Estou de férias.", en: "I'm on holiday." },
          },
          {
            id: "plans-v8",
            word: "sábado",
            translation: "Saturday",
            pronunciation: "/SAH-bah-doo/",
            example: { pt: "Ao sábado vou à praia.", en: "On Saturday I go to the beach." },
          },
        ],
      },
      {
        id: "plans-verb-poder",
        type: "verb",
        title: "Verb: Poder",
        ptTitle: "Verbo: Poder",
        description:
          "Fill in the correct conjugation of 'poder' (can / to be able to) in the present tense.",
        verbs: [
          {
            id: "plans-poder",
            verb: "poder",
            verbTranslation: "can / to be able to",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "posso" },
              { pronoun: "tu", form: "podes" },
              { pronoun: "ele/ela", form: "pode" },
              { pronoun: "nós", form: "podemos" },
              { pronoun: "eles/elas", form: "podem" },
            ],
            verbSlug: "poder",
          },
        ],
      },
      {
        id: "plans-verb-gostar",
        type: "verb",
        title: "Verb: Gostar",
        ptTitle: "Verbo: Gostar",
        description:
          "Fill in the correct conjugation of 'gostar' (to like) in the present tense. Remember: gostar de + noun.",
        verbs: [
          {
            id: "plans-gostar",
            verb: "gostar",
            verbTranslation: "to like",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "gosto" },
              { pronoun: "tu", form: "gostas" },
              { pronoun: "ele/ela", form: "gosta" },
              { pronoun: "nós", form: "gostamos" },
              { pronoun: "eles/elas", form: "gostam" },
            ],
            verbSlug: "gostar",
          },
        ],
      },
      {
        id: "plans-grammar",
        type: "grammar",
        title: "Forming Questions",
        ptTitle: "Formar Perguntas",
        description:
          "Learn how to ask questions in Portuguese — with and without question words.",
        grammarItems: [
          {
            id: "plans-g1",
            rule: "Yes/no questions: raise intonation at the end (same word order as statements). Question words: Onde (where), Quando (when), Como (how), O que (what), Quem (who), Quanto/a (how much), Por que / Porquê (why).",
            rulePt: "Perguntas sim/não: entoação ascendente. Palavras interrogativas: Onde, Quando, Como, O que, Quem, Quanto, Porquê.",
            examples: [
              { pt: "Falas português?", en: "Do you speak Portuguese?" },
              { pt: "Onde moras?", en: "Where do you live?" },
              { pt: "Quando é a festa?", en: "When is the party?" },
              { pt: "O que vais fazer?", en: "What are you going to do?" },
            ],
            topicSlug: "questions",
            topicTitle: "Forming Questions",
          },
        ],
      },
      {
        id: "plans-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "plans-c1",
            expression: "Quem tudo quer, tudo perde.",
            meaning: "Being too greedy leads to losing it all.",
            literal: "Who wants everything, loses everything.",
            tip: "A good reminder when making weekend plans — don't try to do everything!",
          },
          {
            id: "plans-c2",
            expression: "Há mar e mar, há ir e voltar.",
            meaning: "Be careful — things aren't always as simple as they seem. Respect the risk.",
            literal: "There's sea and sea, there's going and coming back.",
            tip: "Originally a maritime safety campaign slogan, now a widely used proverb in Portugal.",
          },
        ],
      },
      {
        id: "plans-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "plans-p1",
            sentence: "___ moras?",
            answer: "Onde",
            fullSentence: "Onde moras?",
            translation: "Where do you live?",
            acceptedAnswers: ["onde", "Onde"],
          },
          {
            id: "plans-p2",
            sentence: "Eu ___ ir ao cinema.",
            answer: "posso",
            fullSentence: "Eu posso ir ao cinema.",
            translation: "I can go to the cinema.",
            acceptedAnswers: ["posso"],
          },
          {
            id: "plans-p3",
            sentence: "Eu ___ de praia.",
            answer: "gosto",
            fullSentence: "Eu gosto de praia.",
            translation: "I like the beach.",
            acceptedAnswers: ["gosto"],
          },
          {
            id: "plans-p4",
            sentence: "O que vais fazer no ___ de semana?",
            answer: "fim",
            fullSentence: "O que vais fazer no fim de semana?",
            translation: "What are you going to do at the weekend?",
            acceptedAnswers: ["fim"],
          },
          {
            id: "plans-p5",
            sentence: "___ vou ao médico.",
            answer: "Amanhã",
            fullSentence: "Amanhã vou ao médico.",
            translation: "Tomorrow I'm going to the doctor.",
            acceptedAnswers: ["amanhã", "Amanhã", "amanha", "Amanha"],
          },
        ],
      },
    ],
  },
  {
    id: "work-and-study",
    title: "Work & Study",
    ptTitle: "Trabalho e Estudo",
    description:
      "Profession and school vocabulary, -ER verb conjugation with comer, possessive adjectives, and workplace expressions.",
    cefr: "A2",
    estimatedMinutes: 18,
    order: 9,
    stages: [
      {
        id: "work-vocab",
        type: "vocabulary",
        title: "Jobs & School",
        ptTitle: "Profissões e Escola",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "work-v1",
            word: "professor / professora",
            translation: "teacher",
            pronunciation: "/proo-feh-SOHR / proo-feh-SOH-rah/",
            example: { pt: "O meu professor de português é simpático.", en: "My Portuguese teacher is friendly." },
          },
          {
            id: "work-v2",
            word: "médico / médica",
            translation: "doctor",
            pronunciation: "/MEH-dee-koo / MEH-dee-kah/",
            example: { pt: "Preciso de ir ao médico.", en: "I need to go to the doctor." },
          },
          {
            id: "work-v3",
            word: "escola",
            translation: "school",
            pronunciation: "/shKOH-lah/",
            example: { pt: "Os miúdos vão à escola de autocarro.", en: "The children go to school by bus." },
          },
          {
            id: "work-v4",
            word: "universidade",
            translation: "university",
            pronunciation: "/oo-nee-vehr-see-DAH-duh/",
            example: { pt: "Estudei na Universidade de Lisboa.", en: "I studied at the University of Lisbon." },
          },
          {
            id: "work-v5",
            word: "escritório",
            translation: "office",
            pronunciation: "/shKree-TOH-ree-oo/",
            example: { pt: "Trabalho num escritório no centro.", en: "I work in an office in the centre." },
          },
          {
            id: "work-v6",
            word: "aula",
            translation: "class / lesson",
            pronunciation: "/OW-lah/",
            example: { pt: "A aula de português é às três.", en: "The Portuguese class is at three." },
          },
          {
            id: "work-v7",
            word: "colega",
            translation: "colleague",
            pronunciation: "/koo-LEH-gah/",
            example: { pt: "Os meus colegas são simpáticos.", en: "My colleagues are friendly." },
          },
          {
            id: "work-v8",
            word: "exame",
            translation: "exam",
            pronunciation: "/ee-ZAH-muh/",
            example: { pt: "Tenho um exame na sexta-feira.", en: "I have an exam on Friday." },
          },
        ],
      },
      {
        id: "work-verb",
        type: "verb",
        title: "Verb: Comer (-ER)",
        ptTitle: "Verbo: Comer (-ER)",
        description:
          "Fill in the correct conjugation of 'comer' (to eat) in the present tense. This is a model -ER verb.",
        verbs: [
          {
            id: "work-comer",
            verb: "comer",
            verbTranslation: "to eat",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "como" },
              { pronoun: "tu", form: "comes" },
              { pronoun: "ele/ela", form: "come" },
              { pronoun: "nós", form: "comemos" },
              { pronoun: "eles/elas", form: "comem" },
            ],
            verbSlug: "comer",
          },
        ],
      },
      {
        id: "work-grammar",
        type: "grammar",
        title: "Possessive Adjectives",
        ptTitle: "Adjetivos Possessivos",
        description:
          "Learn how to say 'my', 'your', 'his/her' in Portuguese. In EP, always use the article before the possessive.",
        grammarItems: [
          {
            id: "work-g1",
            rule: "Possessives agree in gender/number with the thing owned: o meu (my m.), a minha (my f.), o teu (your m.), a tua (your f.), o seu (his/her/your formal). In EP, always use the definite article: O meu livro, A minha casa.",
            rulePt: "Possessivos concordam com o objeto: o meu, a minha, o teu, a tua. Em PE, usa artigo: O meu livro.",
            examples: [
              { pt: "O meu professor é simpático.", en: "My teacher is friendly." },
              { pt: "A minha escola é grande.", en: "My school is big." },
              { pt: "O teu exame é amanhã.", en: "Your exam is tomorrow." },
              { pt: "A tua colega é portuguesa.", en: "Your colleague is Portuguese." },
            ],
            topicSlug: "possessives",
            topicTitle: "Possessive Adjectives & Pronouns",
          },
        ],
      },
      {
        id: "work-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "work-c1",
            expression: "A bom entendedor, meia palavra basta.",
            meaning: "A word to the wise is sufficient. Smart people catch on quickly.",
            literal: "To a good understander, half a word is enough.",
            tip: "Used when someone is quick to understand a subtle message.",
          },
          {
            id: "work-c2",
            expression: "Amigos, amigos, negócios à parte.",
            meaning: "Don't mix friendship and business. Keep personal and professional separate.",
            literal: "Friends, friends, business aside.",
            tip: "Very relevant in Portuguese work culture — maintain boundaries between friends and work.",
          },
        ],
      },
      {
        id: "work-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "work-p1",
            sentence: "O ___ professor é simpático.",
            answer: "meu",
            fullSentence: "O meu professor é simpático.",
            translation: "My teacher is friendly.",
            acceptedAnswers: ["meu"],
          },
          {
            id: "work-p2",
            sentence: "Nós ___ ao meio-dia.",
            answer: "comemos",
            fullSentence: "Nós comemos ao meio-dia.",
            translation: "We eat at noon.",
            acceptedAnswers: ["comemos"],
          },
          {
            id: "work-p3",
            sentence: "A ___ escola é grande.",
            answer: "minha",
            fullSentence: "A minha escola é grande.",
            translation: "My school is big.",
            acceptedAnswers: ["minha"],
          },
          {
            id: "work-p4",
            sentence: "Tu ___ peixe ao jantar.",
            answer: "comes",
            fullSentence: "Tu comes peixe ao jantar.",
            translation: "You eat fish at dinner.",
            acceptedAnswers: ["comes"],
          },
          {
            id: "work-p5",
            sentence: "Tenho um ___ na sexta-feira.",
            answer: "exame",
            fullSentence: "Tenho um exame na sexta-feira.",
            translation: "I have an exam on Friday.",
            acceptedAnswers: ["exame"],
          },
        ],
      },
    ],
  },
  {
    id: "people-and-feelings",
    title: "People & Feelings",
    ptTitle: "Pessoas e Sentimentos",
    description:
      "Family and emotions vocabulary, the verbs saber and conhecer, demonstratives, and Portuguese relationship culture.",
    cefr: "A2",
    estimatedMinutes: 22,
    order: 10,
    stages: [
      {
        id: "people-vocab",
        type: "vocabulary",
        title: "Family & Emotions",
        ptTitle: "Família e Emoções",
        description:
          "Tap each card to reveal the English meaning. How many did you already know?",
        items: [
          {
            id: "people-v1",
            word: "mãe",
            translation: "mother",
            pronunciation: "/MAHNG/",
            example: { pt: "A minha mãe chama-se Ana.", en: "My mother is called Ana." },
          },
          {
            id: "people-v2",
            word: "pai",
            translation: "father",
            pronunciation: "/PAH-ee/",
            example: { pt: "O meu pai é professor.", en: "My father is a teacher." },
          },
          {
            id: "people-v3",
            word: "irmão / irmã",
            translation: "brother / sister",
            pronunciation: "/eer-MAHNG / eer-MAH/",
            example: { pt: "Tenho um irmão mais velho.", en: "I have an older brother." },
          },
          {
            id: "people-v4",
            word: "avó / avô",
            translation: "grandmother / grandfather",
            pronunciation: "/ah-VOH / ah-VOH/",
            example: { pt: "A minha avó faz o melhor bolo.", en: "My grandmother makes the best cake." },
          },
          {
            id: "people-v5",
            word: "feliz",
            translation: "happy",
            pronunciation: "/fuh-LEESH/",
            example: { pt: "Estou muito feliz.", en: "I'm very happy." },
          },
          {
            id: "people-v6",
            word: "triste",
            translation: "sad",
            pronunciation: "/TREESH-tuh/",
            example: { pt: "Ele está triste hoje.", en: "He's sad today." },
          },
          {
            id: "people-v7",
            word: "cansado / cansada",
            translation: "tired",
            pronunciation: "/kahn-SAH-doo / kahn-SAH-dah/",
            example: { pt: "Estou muito cansado.", en: "I'm very tired." },
          },
          {
            id: "people-v8",
            word: "preocupado / preocupada",
            translation: "worried",
            pronunciation: "/pree-oh-koo-PAH-doo/",
            example: { pt: "A mãe está preocupada.", en: "Mum is worried." },
          },
        ],
      },
      {
        id: "people-verb-saber",
        type: "verb",
        title: "Verb: Saber",
        ptTitle: "Verbo: Saber",
        description:
          "Fill in the correct conjugation of 'saber' (to know — facts/skills) in the present tense.",
        verbs: [
          {
            id: "people-saber",
            verb: "saber",
            verbTranslation: "to know (facts / skills)",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "sei" },
              { pronoun: "tu", form: "sabes" },
              { pronoun: "ele/ela", form: "sabe" },
              { pronoun: "nós", form: "sabemos" },
              { pronoun: "eles/elas", form: "sabem" },
            ],
            verbSlug: "saber",
          },
        ],
      },
      {
        id: "people-verb-conhecer",
        type: "verb",
        title: "Verb: Conhecer",
        ptTitle: "Verbo: Conhecer",
        description:
          "Fill in the correct conjugation of 'conhecer' (to know — people/places) in the present tense.",
        verbs: [
          {
            id: "people-conhecer",
            verb: "conhecer",
            verbTranslation: "to know (people / places)",
            tense: "Present",
            conjugations: [
              { pronoun: "eu", form: "conheço" },
              { pronoun: "tu", form: "conheces" },
              { pronoun: "ele/ela", form: "conhece" },
              { pronoun: "nós", form: "conhecemos" },
              { pronoun: "eles/elas", form: "conhecem" },
            ],
            verbSlug: "conhecer",
          },
        ],
      },
      {
        id: "people-grammar",
        type: "grammar",
        title: "Demonstratives",
        ptTitle: "Demonstrativos",
        description:
          "Learn how to say 'this', 'that', and 'that over there' in Portuguese.",
        grammarItems: [
          {
            id: "people-g1",
            rule: "Este/esta (this — near me), esse/essa (that — near you), aquele/aquela (that over there). They agree in gender: este livro (this book), esta casa (this house). Contractions: em + este = neste, de + esse = desse.",
            rulePt: "Este/esta (perto de mim), esse/essa (perto de ti), aquele/aquela (longe). Concordam em género.",
            examples: [
              { pt: "Este livro é meu.", en: "This book is mine." },
              { pt: "Essa casa é bonita.", en: "That house is beautiful." },
              { pt: "Aquele senhor é o meu avô.", en: "That man over there is my grandfather." },
              { pt: "Quem é esta pessoa?", en: "Who is this person?" },
            ],
            topicSlug: "demonstratives",
            topicTitle: "Demonstratives",
          },
        ],
      },
      {
        id: "people-culture",
        type: "culture",
        title: "Saying of the Day",
        ptTitle: "Provérbio do Dia",
        description:
          "Read the Portuguese saying and try to guess the meaning before revealing it.",
        cultureItems: [
          {
            id: "people-c1",
            expression: "Filho de peixe sabe nadar.",
            meaning: "Like father, like son. Children inherit their parents' traits.",
            literal: "Son of a fish knows how to swim.",
            tip: "Used when a child shows the same talent or behaviour as their parents.",
          },
          {
            id: "people-c2",
            expression: "Diz-me com quem andas, dir-te-ei quem és.",
            meaning: "You're known by the company you keep.",
            literal: "Tell me who you walk with, I'll tell you who you are.",
            tip: "A reminder that the people around you reflect who you are.",
          },
        ],
      },
      {
        id: "people-practice",
        type: "practice",
        title: "Quick Practice",
        ptTitle: "Prática Rápida",
        description:
          "Fill in the missing word. Use what you've revised in this lesson.",
        practiceItems: [
          {
            id: "people-p1",
            sentence: "Eu ___ falar português.",
            answer: "sei",
            fullSentence: "Eu sei falar português.",
            translation: "I know how to speak Portuguese.",
            acceptedAnswers: ["sei"],
          },
          {
            id: "people-p2",
            sentence: "Tu ___ a Maria?",
            answer: "conheces",
            fullSentence: "Tu conheces a Maria?",
            translation: "Do you know Maria?",
            acceptedAnswers: ["conheces"],
          },
          {
            id: "people-p3",
            sentence: "___ livro é meu.",
            answer: "Este",
            fullSentence: "Este livro é meu.",
            translation: "This book is mine.",
            acceptedAnswers: ["este", "Este"],
          },
          {
            id: "people-p4",
            sentence: "Estou muito ___.",
            answer: "feliz",
            fullSentence: "Estou muito feliz.",
            translation: "I'm very happy.",
            acceptedAnswers: ["feliz"],
          },
          {
            id: "people-p5",
            sentence: "A minha ___ chama-se Ana.",
            answer: "mãe",
            fullSentence: "A minha mãe chama-se Ana.",
            translation: "My mother is called Ana.",
            acceptedAnswers: ["mãe", "mae"],
          },
        ],
      },
    ],
  },
];
