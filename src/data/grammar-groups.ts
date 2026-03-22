interface GrammarGroup {
  label: string;
  labelPt: string;
  /** Topic IDs that belong to this group */
  topics: string[];
}

export const grammarGroups: GrammarGroup[] = [
  {
    label: "Nouns & articles",
    labelPt: "Nomes e artigos",
    topics: [
      "noun-gender",
      "articles",
      "plural-formation",
      "adjective-agreement",
    ],
  },
  {
    label: "Pronouns & determiners",
    labelPt: "Pronomes e determinantes",
    topics: [
      "subject-pronouns",
      "possessives",
      "demonstratives",
      "object-pronouns",
      "pronoun-placement",
      "relative-pronouns",
    ],
  },
  {
    label: "Present tense",
    labelPt: "Presente do indicativo",
    topics: [
      "verb-types",
      "present-tense-ar",
      "present-tense-er",
      "present-tense-ir",
      "ser-vs-estar",
    ],
  },
  {
    label: "Past tenses",
    labelPt: "Tempos do passado",
    topics: [
      "preterite-regular",
      "preterite-irregular",
      "imperfect-formation",
      "preterite-vs-imperfect",
      "pluperfect",
    ],
  },
  {
    label: "Future & conditional",
    labelPt: "Futuro e condicional",
    topics: [
      "future-tense",
      "conditional-tense",
      "ir-plus-infinitive",
    ],
  },
  {
    label: "Subjunctive",
    labelPt: "Conjuntivo",
    topics: [
      "subjunctive-triggers",
      "present-subjunctive-formation",
      "personal-infinitive",
    ],
  },
  {
    label: "Sentence structure",
    labelPt: "Estrutura da frase",
    topics: [
      "sentence-structure",
      "negation",
      "questions",
      "prepositions",
      "contractions",
      "por-vs-para",
      "connectors",
    ],
  },
  {
    label: "Special structures",
    labelPt: "Estruturas especiais",
    topics: [
      "estar-a-infinitive",
      "ter-de-infinitive",
      "imperative",
      "passive-voice",
      "reported-speech",
      "reflexive-verbs",
      "comparatives",
    ],
  },
  {
    label: "Vocabulary & word formation",
    labelPt: "Vocabulário e formação de palavras",
    topics: [
      "adverbs",
      "opposites",
    ],
  },
];

interface TopicItem {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
}

export function getGrammarGroups(
  topicList: TopicItem[]
): { label: string; labelPt: string; topics: TopicItem[] }[] | null {
  if (!topicList || topicList.length === 0) return null;

  const assigned = new Set<string>();
  const result: { label: string; labelPt: string; topics: TopicItem[] }[] = [];

  for (const group of grammarGroups) {
    const matching = topicList.filter((t) => {
      if (assigned.has(t.id)) return false;
      if (group.topics.includes(t.id)) {
        assigned.add(t.id);
        return true;
      }
      return false;
    });
    if (matching.length > 0) {
      result.push({ label: group.label, labelPt: group.labelPt, topics: matching });
    }
  }

  // Unmatched
  const unmatched = topicList.filter((t) => !assigned.has(t.id));
  if (unmatched.length > 0) {
    result.push({ label: "Other", labelPt: "Outros", topics: unmatched });
  }

  return result.length > 1 ? result : null;
}
