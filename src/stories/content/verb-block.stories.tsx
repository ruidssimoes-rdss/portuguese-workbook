import type { Meta, StoryObj } from "@storybook/react";
import { VerbBlock } from "@/components/blocks/content/verb-block";

const meta: Meta<typeof VerbBlock> = {
  title: "Content/VerbBlock",
  component: VerbBlock,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof VerbBlock>;

const serData = {
  verb: "ser",
  verbTranslation: "to be (permanent)",
  tense: "Present",
  tenseLabel: "Presente",
  conjugations: [
    { pronoun: "eu", form: "sou" },
    { pronoun: "tu", form: "és" },
    { pronoun: "ele/ela", form: "é" },
    { pronoun: "nós", form: "somos" },
    { pronoun: "eles/elas", form: "são" },
  ],
  verbSlug: "ser",
};

export const Collapsed: Story = { args: { data: serData, variant: "collapsed" } };
export const Expanded: Story = { args: { data: serData, variant: "expanded" } };
export const Drill: Story = { args: { data: serData, variant: "drill" } };
