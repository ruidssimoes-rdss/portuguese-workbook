import type { Meta, StoryObj } from "@storybook/react";
import { VocabBlock } from "@/components/blocks/content/vocab-block";

const meta: Meta<typeof VocabBlock> = {
  title: "Content/VocabBlock",
  component: VocabBlock,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof VocabBlock>;

const sampleWord = {
  id: "casa-1",
  word: "casa",
  translation: "house",
  pronunciation: "/KAH-zah/",
  example: { pt: "A minha casa é grande.", en: "My house is big." },
  gender: "feminine" as const,
  category: "home-rooms",
};

export const Card: Story = { args: { data: sampleWord, variant: "card" } };
export const Row: Story = { args: { data: sampleWord, variant: "row" } };
export const Flashcard: Story = { args: { data: sampleWord, variant: "flashcard" } };
export const Inline: Story = { args: { data: sampleWord, variant: "inline" } };
export const WithFamiliarity: Story = { args: { data: { ...sampleWord, familiarity: "learning" as const }, variant: "card" } };
