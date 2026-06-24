import type { Meta, StoryObj } from "@storybook/react";
import { ColorWheel } from "../../packages/ui/src/index";
import { parseColor } from "react-aria-components";
import "../../packages/ui/src/primitives/color-pickers.css";

const meta = {
  title: "Components/ColorWheel",
  component: ColorWheel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Farbtonrad auf Basis von react-aria-components `ColorWheel` (mit `ColorWheelTrack` und `ColorThumb`). Der Farbton (Hue) wird auf einer kreisförmigen Spur eingestellt.",
      },
    },
  },
  argTypes: {
    outerRadius: { control: { type: "range", min: 60, max: 140, step: 2 } },
    innerRadius: { control: { type: "range", min: 40, max: 120, step: 2 } },
    isDisabled: { control: "boolean" },
  },
  args: {
    outerRadius: 100,
    innerRadius: 74,
    isDisabled: false,
    defaultValue: parseColor("hsl(30, 100%, 50%)"),
    "aria-label": "Farbton",
  },
} satisfies Meta<typeof ColorWheel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Compact: Story = {
  args: { outerRadius: 72, innerRadius: 52, defaultValue: parseColor("hsl(280, 100%, 55%)") },
};
