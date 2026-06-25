import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { List, ListRow, Badge, Amount, Icon } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Gruppierte Liste im systemnahen Stil. Die einzelnen Zeilen werden über `ListRow` (mit Leading-Icon, Titel, Untertitel und Trailing-Slot) gerendert; pressbare Zeilen nutzen React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    inset: { control: "boolean" },
  },
  args: { label: "Marktpartner", inset: false },
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [active, setActive] = useState("a");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
        <List {...args}>
          <ListRow
            leading={<Icon name="building" />}
            title="Stadtwerke München"
            subtitle="9900123000007 · LF"
            trailing={<Badge tone="green">OK</Badge>}
            onPress={() => setActive("a")}
            isActive={active === "a"}
          />
          <ListRow
            leading={<Icon name="building" />}
            title="Netze BW"
            subtitle="9900456000003 · VNB"
            trailing={<Badge tone="orange">Wartet</Badge>}
            onPress={() => setActive("b")}
            isActive={active === "b"}
          />
          <ListRow
            leading={<Icon name="building" />}
            title="E.ON Energie"
            subtitle="Deaktiviert"
            trailing="›"
            onPress={() => {}}
            isDisabled
          />
        </List>
      </div>
    );
  },
};

export const StaticRows: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <List label="Statisch (nicht pressbar)" inset>
        <ListRow title="Sparte" trailing="Strom" />
        <ListRow title="Prozess" trailing="UTILMD" />
        <ListRow title="Betrag" trailing={<Amount value={-129.9} currency="EUR" colored signed />} />
      </List>
    </div>
  ),
};

export const RowVariants: Story = {
  name: "ListRow-Varianten",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <List label="ListRow im Detail">
        <ListRow leading={<Icon name="user" />} title="Mit Untertitel" subtitle="Sekundäre Zeile" trailing="›" />
        <ListRow title="Nur Titel + Trailing" trailing={<Badge tone="blue">Info</Badge>} />
        <ListRow title="Pressbar & aktiv" onPress={() => {}} isActive />
        <ListRow title="Deaktiviert" onPress={() => {}} isDisabled />
      </List>
    </div>
  ),
};
