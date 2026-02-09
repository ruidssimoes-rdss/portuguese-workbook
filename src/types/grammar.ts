export interface GrammarRule {
  rule: string;
  rulePt: string;
  examples: { pt: string; en: string }[];
  exceptions?: { pt: string; en: string }[];
}

export interface GrammarQuestion {
  questionText: string;
  questionTextPt: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary: string;
  intro: string;
  rules: GrammarRule[];
  tips: string[];
  tipsPt: string[];
  questions: GrammarQuestion[];
}

export interface GrammarData {
  version: string;
  description: string;
  topics: Record<string, GrammarTopic>;
}
