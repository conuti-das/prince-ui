import type { Meta, StoryObj } from "@storybook/react";
import { NumberField } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/numeric.css";

const meta = {
  title: "Components/NumberField",
  component: NumberField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Zahlenfeld auf Basis von react-aria-components `NumberField` mit Stepper-Buttons. Formatierung, Min/Max/Step und Tastatur-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    minValue: { control: "number" },
    maxValue: { control: "number" },
    step: { control: "number" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Menge",
    defaultValue: 10,
  },
} satisfies Meta<typeof NumberField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Currency: Story = {
  args: {
    label: "Betrag",
    defaultValue: 19.5,
    step: 0.5,
    formatOptions: { style: "currency", currency: "EUR" },
  },
};
