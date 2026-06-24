import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectItem } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Auswahl auf Basis von react-aria-components `Select` mit ListBox-Popover. Die Optionen werden als `SelectItem` (ListBoxItem) übergeben; Tastatur-Navigation, Auswahl und Positionierung des Popovers stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Sparte",
    placeholder: "Bitte wählen",
  },
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Select label="Sparte" placeholder="Bitte wählen" defaultSelectedKey="strom">
      <SelectItem id="strom">Strom</SelectItem>
      <SelectItem id="gas">Gas</SelectItem>
      <SelectItem id="wasser">Wasser</SelectItem>
    </Select>
  ),
};
