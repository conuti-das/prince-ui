import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/numeric.css";

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Slider auf Basis von react-aria-components `Slider` (Track, Fill, Thumb, Output). Wertanzeige, Min/Max/Step und Tastatur-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    minValue: { control: "number" },
    maxValue: { control: "number" },
    step: { control: "number" },
    isDisabled: { control: "boolean" },
    showValue: { control: "boolean" },
  },
  args: {
    label: "Lautstärke",
    defaultValue: 40,
    minValue: 0,
    maxValue: 100,
    showValue: true,
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Percent: Story = {
  args: {
    label: "Auslastung",
    defaultValue: 0.6,
    minValue: 0,
    maxValue: 1,
    step: 0.01,
    formatOptions: { style: "percent" },
  },
};
