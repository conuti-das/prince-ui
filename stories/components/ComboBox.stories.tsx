import type { Meta, StoryObj } from "@storybook/react";
import { ComboBox, ComboBoxItem } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/ComboBox",
  component: ComboBox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte ComboBox auf Basis von react-aria-components `ComboBox`: ein durchsuchbares Auswahlfeld, das ein Texteingabefeld mit einem ListBox-Popover kombiniert. Die Optionen werden als `ComboBoxItem` (ListBoxItem) übergeben; React Aria übernimmt das Filtern der Optionen anhand der Eingabe, Tastatur-Navigation, Auswahl und die Positionierung des Popovers.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
    allowsCustomValue: { control: "boolean" },
  },
  args: {
    label: "Marktrolle",
    placeholder: "Suchen…",
  },
} satisfies Meta<typeof ComboBox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ComboBox {...args}>
      <ComboBoxItem id="lieferant">Lieferant</ComboBoxItem>
      <ComboBoxItem id="netzbetreiber">Netzbetreiber</ComboBoxItem>
      <ComboBoxItem id="messstellenbetreiber">Messstellenbetreiber</ComboBoxItem>
      <ComboBoxItem id="bilanzkoordinator">Bilanzkoordinator</ComboBoxItem>
      <ComboBoxItem id="bilanzkreisverantwortlicher">Bilanzkreisverantwortlicher</ComboBoxItem>
    </ComboBox>
  ),
};
