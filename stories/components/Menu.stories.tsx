import type { Meta, StoryObj } from "@storybook/react";
import { Menu, MenuItem, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Aktionsmenü auf Basis von react-aria-components `MenuTrigger`/`Menu` im Popover. Die Einträge werden als `MenuItem` übergeben; Tastatur-Navigation, Außen-Klick und Fokus-Handling stammen aus React Aria.",
      },
    },
  },
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Menu trigger={<Button variant="tinted">Menü ▾</Button>}>
      <MenuItem id="edit">Bearbeiten</MenuItem>
      <MenuItem id="dup">Duplizieren</MenuItem>
      <MenuItem id="del">Löschen</MenuItem>
    </Menu>
  ),
};
