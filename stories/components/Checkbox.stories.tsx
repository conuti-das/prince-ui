import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Checkbox auf Basis von react-aria-components `Checkbox`. Selektion, Indeterminate-State, Tastatur- und Disabled-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
  },
  args: {
    children: "Nur Fehler anzeigen",
    isSelected: false,
    isDisabled: false,
    isIndeterminate: false,
  },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Indeterminate: Story = {
  args: {
    children: "Teilweise ausgewählt",
    isIndeterminate: true,
  },
};
