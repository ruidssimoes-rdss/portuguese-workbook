import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#FFFFFF" },
        { name: "subtle", value: "#FAFAFA" },
        { name: "muted", value: "#F3F4F6" },
      ],
    },
    layout: "centered",
  },
};

export default preview;
