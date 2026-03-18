import type { Meta, StoryObj } from "@storybook/react";
import { GrammarBlock } from "@/components/blocks/content/grammar-block";

const meta: Meta<typeof GrammarBlock> = {
  title: "Content/GrammarBlock",
  component: GrammarBlock,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof GrammarBlock>;

const articlesData = {
  topicSlug: "articles",
  topicTitle: "Definite Articles",
  topicTitlePt: "Artigos Definidos",
  rules: [
    {
      rule: "Portuguese has four definite articles based on gender and number",
      rulePt: "O português tem quatro artigos definidos",
      examples: [
        { pt: "o livro", en: "the book (masculine singular)" },
        { pt: "a casa", en: "the house (feminine singular)" },
        { pt: "os livros", en: "the books (masculine plural)" },
        { pt: "as casas", en: "the houses (feminine plural)" },
      ],
    },
  ],
  tips: ["Unlike English, Portuguese uses articles before possessives: 'o meu livro' (the my book)"],
  tipsPt: ["Ao contrário do inglês, o português usa artigos antes dos possessivos"],
};

export const Expanded: Story = { args: { data: articlesData, variant: "expanded" } };
export const InlineVariant: Story = { args: { data: articlesData, variant: "inline" } };
export const Summary: Story = { args: { data: articlesData, variant: "summary" } };
