/**
 * Novel Sentence Generator — creates new exercise sentences by combining
 * verified content fragments via AI. Constrained to ONLY use provided vocabulary.
 */

import { generateTiered } from "./tiered-model";
import { z } from "zod";

const sentenceSchema = z.object({
  sentences: z.array(z.object({
    pt: z.string(),
    en: z.string(),
    gapWord: z.string(),
    gapPosition: z.number(),
    acceptedAnswers: z.array(z.string()),
  })).min(1).max(5),
});

export type GeneratedSentences = z.infer<typeof sentenceSchema>;

export async function generateNovelSentences(
  availableVocab: string[],
  availableVerbs: string[],
  targetTense: string,
  count: number,
  difficulty: string,
): Promise<GeneratedSentences> {
  const systemPrompt = `You are a European Portuguese sentence generator.
Create simple, natural sentences using ONLY the provided vocabulary and verbs.
These sentences will be used for fill-in-the-blank exercises.

RULES:
- Use ONLY the words provided — never introduce new vocabulary
- All Portuguese must be European Portuguese (PT-PT)
- Sentences should be natural and useful for A1-A2 learners
- Each sentence must have exactly one word that can be blanked out
- Provide the English translation
- Output ONLY valid JSON

OUTPUT SCHEMA:
{
  "sentences": [
    {
      "pt": "Eu como pão ao pequeno-almoço",
      "en": "I eat bread at breakfast",
      "gapWord": "pão",
      "gapPosition": 2,
      "acceptedAnswers": ["pão"]
    }
  ]
}`;

  const userPrompt = `Generate ${count} simple Portuguese sentences using these words:

AVAILABLE VOCAB: ${availableVocab.slice(0, 30).join(", ")}
AVAILABLE VERBS: ${availableVerbs.slice(0, 15).join(", ")}
TARGET TENSE: ${targetTense}
DIFFICULTY: ${difficulty}

Respond with ONLY the JSON.`;

  const { data } = await generateTiered(
    "quality",
    systemPrompt,
    userPrompt,
    sentenceSchema,
  );

  // Safety: discard sentences containing words not in our vocabulary
  const allowedWords = new Set([
    ...availableVocab.map((w) => w.toLowerCase()),
    ...availableVerbs.map((v) => v.toLowerCase()),
  ]);

  data.sentences = data.sentences.filter((s) => {
    const words = s.pt.toLowerCase().split(/\s+/);
    // Allow common function words (articles, prepositions, pronouns)
    const functionWords = new Set([
      "eu", "tu", "ele", "ela", "nós", "eles", "elas", "você", "vocês",
      "o", "a", "os", "as", "um", "uma", "uns", "umas",
      "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
      "com", "por", "para", "ao", "à", "aos", "às",
      "e", "ou", "mas", "que", "não", "sim", "muito", "bem",
    ]);
    return words.every((w) => allowedWords.has(w) || functionWords.has(w) || w.length <= 2);
  });

  return data;
}
