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
];
