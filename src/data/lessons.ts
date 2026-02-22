export interface LessonItem {
  id: string;
  type: "vocabulary" | "verb" | "grammar" | "culture";

  // vocabulary
  word?: string;
  translation?: string;
  pronunciation?: string;
  example?: { pt: string; en: string };
  category?: string;

  // verb
  verb?: string;
  verbTranslation?: string;
  tense?: string;
  conjugations?: { pronoun: string; form: string }[];
  verbSlug?: string;

  // grammar
  rule?: string;
  rulePt?: string;
  grammarExamples?: { pt: string; en: string }[];
  topicSlug?: string;
  topicTitle?: string;

  // culture
  expression?: string;
  meaning?: string;
  literal?: string;
  cultureTip?: string;
}

export interface Lesson {
  id: string;
  title: string;
  ptTitle: string;
  description: string;
  cefr: "A1" | "A2" | "B1";
  estimatedMinutes: number;
  items: LessonItem[];
  order: number;
}

export const lessons: Lesson[] = [
  {
    id: "first-conversations",
    title: "First Conversations",
    ptTitle: "Primeiras Conversas",
    description:
      "Essential greetings, introducing yourself with ser, basic sentence structure, and your first Portuguese saying.",
    cefr: "A1",
    estimatedMinutes: 10,
    order: 1,
    items: [
      {
        id: "vocab-1",
        type: "vocabulary",
        word: "olá",
        translation: "hello",
        pronunciation: "/oh-LAH/",
        example: { pt: "Olá, como estás?", en: "Hello, how are you?" },
        category: "greetings-expressions",
      },
      {
        id: "vocab-2",
        type: "vocabulary",
        word: "bom dia",
        translation: "good morning",
        pronunciation: "/bong DEE-ah/",
        example: { pt: "Bom dia, senhora.", en: "Good morning, madam." },
        category: "greetings-expressions",
      },
      {
        id: "vocab-3",
        type: "vocabulary",
        word: "obrigado / obrigada",
        translation: "thank you (m/f)",
        pronunciation: "/oh-bree-GAH-doo/",
        example: {
          pt: "Muito obrigado pela ajuda.",
          en: "Thank you very much for the help.",
        },
        category: "greetings-expressions",
      },
      {
        id: "vocab-4",
        type: "vocabulary",
        word: "por favor",
        translation: "please",
        pronunciation: "/poor fah-VOR/",
        example: { pt: "Um café, por favor.", en: "A coffee, please." },
        category: "greetings-expressions",
      },
      {
        id: "vocab-5",
        type: "vocabulary",
        word: "como",
        translation: "how / like",
        pronunciation: "/KOH-moo/",
        example: { pt: "Como te chamas?", en: "What's your name?" },
        category: "greetings-expressions",
      },
      {
        id: "verb-1",
        type: "verb",
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
      {
        id: "grammar-1",
        type: "grammar",
        rule: "Standard word order is Subject + Verb + Object (SVO).",
        rulePt: "A ordem padrão é Sujeito + Verbo + Objeto (SVO).",
        grammarExamples: [
          { pt: "Eu como pão.", en: "I eat bread." },
          { pt: "A Maria compra um livro.", en: "Maria buys a book." },
        ],
        topicSlug: "sentence-structure",
        topicTitle: "Sentence Structure",
      },
      {
        id: "culture-1",
        type: "culture",
        expression: "Mais vale tarde do que nunca.",
        meaning: "It's better to do something late than not at all.",
        literal: "More worth late than never.",
        cultureTip:
          "A common encouraging expression when someone finally gets around to doing something.",
      },
    ],
  },
];
