import type { Meta, StoryObj } from "@storybook/react";
import { MatchPairsExercise } from "@/components/blocks/exercises/match-pairs-exercise";
import { fn } from "@storybook/test";

const meta: Meta<typeof MatchPairsExercise> = {
  title: "Exercises/MatchPairsExercise",
  component: MatchPairsExercise,
  tags: ["autodocs"],
};
export default meta;

export const Default: StoryObj<typeof MatchPairsExercise> = {
  args: {
    data: {
      exerciseType: "match-pairs",
      pairs: [
        { left: "casa", right: "house" },
        { left: "mãe", right: "mother" },
        { left: "pão", right: "bread" },
        { left: "médico", right: "doctor" },
      ],
    },
    difficulty: "foundation",
    onAnswer: fn(),
  },
};
