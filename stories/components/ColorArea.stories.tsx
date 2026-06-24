import type { Meta, StoryObj } from "@storybook/react";
import { ColorArea } from "../../packages/ui/src/index";
import { parseColor } from "react-aria-components";
import "../../packages/ui/src/primitives/color-pickers.css";

const meta = {
  title: "Components/ColorArea",
  component: ColorArea,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Farbfeld auf Basis von react-aria-components `ColorArea` (mit `ColorThumb`). Zwei Farbkanäle werden gegen einen 2D-Gradienten eingestellt; der Thumb ist ein weißer Ring.",
      },
    },
  },
  argTypes: {
    xChannel: { control: "select", options: ["saturation", "brightness", "hue", "red", "green", "blue"] },
    yChannel: { control: "select", options: ["brightness", "saturation", "hue", "red", "green", "blue"] },
    isDisabled: { control: "boolean" },
  },
  args: {
    xChannel: "saturation",
    yChannel: "brightness",
    isDisabled: false,
    defaultValue: parseColor("hsb(220, 70%, 90%)"),
    "aria-label": "Sättigung und Helligkeit",
  },
} satisfies Meta<typeof ColorArea>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const RedGreen: Story = {
  args: {
    xChannel: "red",
    yChannel: "green",
    defaultValue: parseColor("#c84040"),
    "aria-label": "Rot und Grün",
  },
};
