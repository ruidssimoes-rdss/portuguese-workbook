import type { Meta, StoryObj } from "@storybook/react";
import { ChooseCorrectExercise } from "@/components/blocks/exercises/choose-correct-exercise";
import { fn } from "@storybook/test";

const meta: Meta<typeof ChooseCorrectExercise> = {
  title: "Exercises/ChooseCorrectExercise",
  component: ChooseCorrectExercise,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof ChooseCorrectExercise> = {
  args: {
    data: {
      exerciseType: "choose-correct",
      question: "What does 'bom dia' mean?",
      options: ["Good morning", "Good night", "Goodbye", "Thank you"],
      correctIndex: 0,
    },
    difficulty: "foundation",
    onAnswer: fn(),
  },
};
