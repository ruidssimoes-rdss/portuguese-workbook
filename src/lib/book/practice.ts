/**
 * Short drills for a word, verb or grammar card.
 *
 * The questions are the ones the lesson player already asks: a vocab prompt,
 * a conjugation table for one tense, grammar multiple choice from grammar.json,
 * and fill-blank sentences from the curriculum whose answer is this item.
 * Culture notes have no such exercises, so they get no drill.
 */

import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import type { CurriculumLesson } from "@/data/curriculum-types";
import type { GeneratedSection } from "@/lib/exercise-generator";
import type { ContentType, CEFRLevel } from "@/lib/learning-engine/mastery-tracker";
import { getGrammar, getVerb, getWord, wordsInCategory } from "@/lib/book/catalog";
import type { PracticeTarget } from "@/lib/book/types";

export type CardTarget = Exclude<PracticeTarget, { kind: "lesson" }>;

export interface CardDrill {
  title: string;
  cefr: CEFRLevel | null;
  sections: GeneratedSection[];
  mastery: { contentType: ContentType; contentId: string; contentCategory?: string } | null;
}

interface DrillSentence {
  sentencePt: string;
  sentenceEn: string;
  correctAnswer: string;
  acceptedAnswers: string[];
}

/** Same short pronouns the lesson conjugation section uses. */
const PRONOUN: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

const LESSONS: CurriculumLesson[] = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS];

let byAnswer: Map<string, DrillSentence[]> | undefined;

function head(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFC")
    .replace(/^(o|a|os|as|um|uma)\s+/, "")
    .split(/\s*\/\s*/)[0]
    .trim();
}

function asCefr(value: string | undefined): CEFRLevel | null {
  if (value === "A1" || value === "A2" || value === "B1") return value;
  return null;
}

function answerIndex(): Map<string, DrillSentence[]> {
  if (byAnswer) return byAnswer;
  const map = new Map<string, DrillSentence[]>();
  for (const lesson of LESSONS) {
    for (const sentence of lesson.stages.practice.sentences) {
      const key = head(sentence.correctAnswer);
      if (key.length < 3 || !sentence.sentencePt.includes("_")) continue;
      const list = map.get(key) ?? [];
      if (list.length >= 3 || list.some((item) => item.sentencePt === sentence.sentencePt)) {
        map.set(key, list);
        continue;
      }
      list.push({
        sentencePt: sentence.sentencePt,
        sentenceEn: sentence.sentenceEn,
        correctAnswer: sentence.correctAnswer,
        acceptedAnswers: sentence.acceptedAnswers?.length ? sentence.acceptedAnswers : [sentence.correctAnswer],
      });
      map.set(key, list);
    }
  }
  byAnswer = map;
  return map;
}

function sentencesFor(keys: string[], limit = 3): DrillSentence[] {
  const map = answerIndex();
  const out: DrillSentence[] = [];
  const seen = new Set<string>();
  for (const key of keys) {
    if (key.length < 3) continue;
    for (const sentence of map.get(key) ?? []) {
      if (seen.has(sentence.sentencePt)) continue;
      seen.add(sentence.sentencePt);
      out.push(sentence);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function fillSection(sentences: DrillSentence[], showEnglish: boolean): GeneratedSection {
  return {
    key: "fill-blank",
    namePt: "Completa as frases",
    nameEn: "Complete the sentences",
    totalQuestions: sentences.length,
    data: {
      showEnglish,
      sentences: sentences.map((sentence, i) => ({
        id: `fill-${i}-${head(sentence.correctAnswer)}`,
        sentencePt: sentence.sentencePt,
        sentenceEn: showEnglish ? sentence.sentenceEn : undefined,
        correctAnswer: sentence.correctAnswer,
        acceptedAnswers: sentence.acceptedAnswers,
      })),
    },
  };
}

function wordDrill(category: string, word: string): CardDrill | null {
  const entry = getWord({ kind: "word", category, word });
  if (!entry?.english) return null;
  const cefr = asCefr(entry.cefr);
  const showEnglish = cefr === "A1" || cefr === "A2";
  const seen = new Set<string>([entry.english.toLowerCase()]);
  const distractors: string[] = [];
  for (const other of wordsInCategory(entry.category)) {
    const english = other.english?.trim();
    if (!english) continue;
    const key = english.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(english);
    if (distractors.length >= 3) break;
  }
  const questions: Record<string, unknown>[] = [
    {
      id: `vocab-type-${entry.category}-${entry.portuguese}`,
      type: "type-answer",
      portugueseWord: entry.portuguese,
      englishWord: entry.english,
      pronunciation: entry.pronunciation,
      acceptedAnswers: [entry.english],
    },
  ];
  if (distractors.length >= 2) {
    questions.push({
      id: `vocab-mc-${entry.category}-${entry.portuguese}`,
      type: "mc",
      portugueseWord: entry.portuguese,
      englishWord: entry.english,
      pronunciation: entry.pronunciation,
      options: [entry.english, ...distractors],
      correctIndex: 0,
    });
  }
  const sections: GeneratedSection[] = [
    {
      key: "vocab",
      namePt: "Vocabulário",
      nameEn: "Vocabulary",
      totalQuestions: questions.length,
      data: { questions, showEnglish },
    },
  ];
  const blanks = sentencesFor([head(entry.portuguese), entry.portuguese.toLowerCase()]);
  if (blanks.length > 0) sections.push(fillSection(blanks, showEnglish));
  return {
    title: entry.portuguese,
    cefr,
    sections,
    mastery: { contentType: "vocab", contentId: entry.portuguese, contentCategory: entry.category },
  };
}

function verbDrill(id: string): CardDrill | null {
  const verb = getVerb(id);
  if (!verb || verb.tenses.length === 0) return null;
  const tense = verb.tenses.includes("Present") ? "Present" : verb.tenses[0];
  const rows = verb.rows(tense).slice(0, 6);
  if (rows.length === 0) return null;
  const cefr = asCefr(verb.cefr);
  const showEnglish = cefr === "A1" || cefr === "A2";
  const persons = rows.map((row) => ({
    pronoun: PRONOUN[row.person] ?? row.person.split(" (")[0],
    correctForm: row.form,
  }));
  const sections: GeneratedSection[] = [
    {
      key: "conjugation",
      namePt: "Conjugação",
      nameEn: "Conjugation",
      totalQuestions: persons.length,
      data: {
        showEnglish,
        verbs: [
          {
            verb: verb.id,
            verbMeaning: showEnglish ? verb.english : undefined,
            tense,
            persons,
          },
        ],
      },
    },
  ];
  const forms = verb.tenses.flatMap((item) => verb.rows(item).map((row) => head(row.form)));
  const blanks = sentencesFor(forms);
  if (blanks.length > 0) sections.push(fillSection(blanks, showEnglish));
  return {
    title: verb.id,
    cefr,
    sections,
    mastery: { contentType: "verb", contentId: verb.id.toUpperCase(), contentCategory: verb.group },
  };
}

function grammarDrill(id: string): CardDrill | null {
  const topic = getGrammar(id);
  if (!topic) return null;
  const picked = topic.questions
    .filter((question) => question.options.length >= 2 && question.correctIndex >= 0 && question.correctIndex < question.options.length)
    .slice(0, 4);
  if (picked.length === 0) return null;
  const cefr = asCefr(topic.cefr);
  const showEnglish = cefr === "A1" || cefr === "A2";
  return {
    title: topic.titlePt,
    cefr,
    sections: [
      {
        key: "grammar",
        namePt: "Gramática",
        nameEn: "Grammar",
        totalQuestions: picked.length,
        data: {
          showEnglish,
          questions: picked.map((question, i) => ({
            id: `grammar-${topic.id}-${i}`,
            type: "mc",
            question: question.questionTextPt || question.questionText,
            questionEnglish: showEnglish ? question.questionText : undefined,
            options: [...question.options],
            correctIndex: question.correctIndex,
            explanation: question.explanation,
          })),
        },
      },
    ],
    mastery: { contentType: "grammar", contentId: topic.id },
  };
}

export function cardDrill(target: CardTarget): CardDrill | null {
  switch (target.kind) {
    case "word":
      return wordDrill(target.category, target.word);
    case "verb":
      return verbDrill(target.id);
    case "grammar":
      return grammarDrill(target.id);
  }
}

export function practiceLabel(target: PracticeTarget, lessonTitle?: string): string {
  if (target.kind === "lesson") return lessonTitle || "Esta lição";
  return cardDrill(target)?.title ?? (target.kind === "word" ? target.word : target.kind === "verb" ? target.id : target.id);
}
