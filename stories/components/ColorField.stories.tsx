import type { Meta, StoryObj } from "@storybook/react";
import { ColorField } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/color.css";

const meta = {
  title: "Components/ColorField",
  component: ColorField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Eingabefeld für Hex-Farbwerte auf Basis von react-aria-components `ColorField`. Parsing, Validierung und Fokus-Ring stammen aus React Aria; das Feld nutzt die geteilten `prn-field`/`prn-input`-Klassen.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Akzentfarbe",
    placeholder: "Hex, z. B. #34C759",
    isDisabled: false,
  },
} satisfies Meta<typeof ColorField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = {
  args: { label: "Markenfarbe", defaultValue: "#3478F6" },
};

export const WithDescription: Story = {
  args: {
    label: "Hintergrund",
    description: "Hex-Wert eingeben, z. B. #1C1C1E.",
    defaultValue: "#1C1C1E",
  },
};
