import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBlock } from "@/components/blocks/content/progress-block";

const meta: Meta<typeof ProgressBlock> = {
  title: "Content/ProgressBlock",
  component: ProgressBlock,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof ProgressBlock>;

export const Bar: Story = { args: { data: { current: 12, max: 18, label: "A1 Progress", sublabel: "12 / 18 complete" }, variant: "bar" } };
export const BarFull: Story = { args: { data: { current: 18, max: 18, label: "A1 Complete" }, variant: "bar" } };
export const Ring: Story = { args: { data: { current: 78, max: 100, label: "Overall Accuracy" }, variant: "ring" } };
export const Stat: Story = { args: { data: { current: 342, max: 840, label: "Words Learned", unit: "words", trend: "up" as const }, variant: "stat" } };
export const Streak: Story = { args: { data: { current: 5, max: 30, label: "Day Streak", sublabel: "Best: 14 days" }, variant: "streak" } };
