import type { Meta, StoryObj } from "@storybook/react";
import { ListBox, ListBoxOption } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/collections.css";

const meta = {
  title: "Components/ListBox",
  component: ListBox,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Auswahlliste auf Basis von react-aria-components `ListBox`. Die Optionen werden als `ListBoxOption` (Wrapper über RAC `ListBoxItem`) übergeben; Tastatur-Navigation, Single-/Multi-Selektion und der Auswahlhaken stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
  },
  args: { selectionMode: "single" },
} satisfies Meta<typeof ListBox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <ListBox {...args} aria-label="Sparte" style={{ maxWidth: 280 }}>
      <ListBoxOption id="strom">Strom</ListBoxOption>
      <ListBoxOption id="gas">Gas</ListBoxOption>
      <ListBoxOption id="wasser">Wasser</ListBoxOption>
      <ListBoxOption id="fernwaerme">Fernwärme</ListBoxOption>
    </ListBox>
  ),
};

export const Mehrfachauswahl: Story = {
  render: () => (
    <ListBox
      aria-label="Sparten"
      selectionMode="multiple"
      defaultSelectedKeys={["strom", "gas"]}
      style={{ maxWidth: 280 }}
    >
      <ListBoxOption id="strom">Strom</ListBoxOption>
      <ListBoxOption id="gas">Gas</ListBoxOption>
      <ListBoxOption id="wasser">Wasser</ListBoxOption>
      <ListBoxOption id="fernwaerme">Fernwärme</ListBoxOption>
    </ListBox>
  ),
};
