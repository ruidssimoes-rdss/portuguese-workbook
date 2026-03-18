import type { Meta, StoryObj } from "@storybook/react";
import { TranslateExercise } from "@/components/blocks/exercises/translate-exercise";
import { fn } from "@storybook/test";

const meta: Meta<typeof TranslateExercise> = {
  title: "Exercises/TranslateExercise",
  component: TranslateExercise,
  tags: ["autodocs"],
};
export default meta;

export const PTtoEN: StoryObj<typeof TranslateExercise> = {
  args: {
    data: {
      exerciseType: "translate",
      word: "obrigado",
      correctAnswer: "thank you",
      acceptedAnswers: ["thank you", "thanks"],
      pronunciation: "/oh-bree-GAH-doo/",
      direction: "pt-to-en",
    },
    difficulty: "foundation",
    onAnswer: fn(),
    showEnglish: true,
  },
};

export const ENtoPT: StoryObj<typeof TranslateExercise> = {
  args: {
    data: {
      exerciseType: "translate",
      word: "thank you",
      correctAnswer: "obrigado",
      acceptedAnswers: ["obrigado", "obrigada"],
      direction: "en-to-pt",
    },
    difficulty: "developing",
    onAnswer: fn(),
  },
};
