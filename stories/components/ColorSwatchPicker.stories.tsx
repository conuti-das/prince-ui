import type { Meta, StoryObj } from "@storybook/react";
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
} from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/color.css";

const meta = {
  title: "Components/ColorSwatchPicker",
  component: ColorSwatchPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Farbauswahl auf Basis von react-aria-components `ColorSwatchPicker`. Stellt eine Reihe von `ColorSwatchPickerItem`-Feldern dar (jeweils mit innerer `ColorSwatch`); die Auswahl wird mit einem Akzent-Ring hervorgehoben. Tastatur-Navigation und Auswahl stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    layout: { control: "inline-radio", options: ["grid", "stack"] },
  },
  args: {
    layout: "grid",
  },
} satisfies Meta<typeof ColorSwatchPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

const colors = ["#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#3478F6", "#AF52DE"];

export const Playground: Story = {
  render: (args) => (
    <ColorSwatchPicker {...args} defaultValue="#3478F6" aria-label="Farbe wählen">
      {colors.map((c) => (
        <ColorSwatchPickerItem key={c} color={c} />
      ))}
    </ColorSwatchPicker>
  ),
};

export const Stack: Story = {
  render: () => (
    <ColorSwatchPicker layout="stack" defaultValue="#34C759" aria-label="Status">
      <ColorSwatchPickerItem color="#FF3B30" />
      <ColorSwatchPickerItem color="#FF9500" />
      <ColorSwatchPickerItem color="#34C759" />
    </ColorSwatchPicker>
  ),
};

export const WithAlpha: Story = {
  render: () => (
    <ColorSwatchPicker defaultValue="#3478F6" aria-label="Mit Transparenz">
      <ColorSwatchPickerItem color="#3478F6" />
      <ColorSwatchPickerItem color="#3478F6C0" />
      <ColorSwatchPickerItem color="#3478F680" />
      <ColorSwatchPickerItem color="#3478F640" />
    </ColorSwatchPicker>
  ),
};
