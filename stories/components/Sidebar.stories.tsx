import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar, ListRow, Icon } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Seitenleiste im systemnahen Stil mit Gruppen, Einträgen (Icon, Label, optionalem Trailing-Counter) sowie optionalem Header- und Footer-Slot.",
      },
    },
  },
  argTypes: {
    header: { control: "text" },
  },
  args: { header: "FinOps MaKo" },
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const [sel, setSel] = useState("monitor");
    return (
      <div
        style={{
          height: 420,
          display: "flex",
          border: "1px solid var(--prn-separator)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <Sidebar
          {...args}
          selectedKey={sel}
          onSelect={setSel}
          groups={[
            {
              label: "Monitoring",
              items: [
                { id: "monitor", label: "Transaktionen", icon: <Icon name="chart" />, trailing: "248" },
                { id: "ebd", label: "EBD-Prüfung", icon: <Icon name="compass" /> },
                { id: "edifact", label: "EDIFACT", icon: <Icon name="mail" />, trailing: "12" },
              ],
            },
            {
              label: "Verwaltung",
              items: [
                { id: "partner", label: "Marktpartner", icon: <Icon name="building" /> },
                { id: "settings", label: "Einstellungen", icon: <Icon name="settings" /> },
              ],
            },
          ]}
          footer={<ListRow leading={<Icon name="user" />} title="Daniel" subtitle="Administrator" />}
        />
        <div
          style={{
            flex: 1,
            padding: 20,
            font: "var(--prn-text-body)",
            color: "var(--prn-label-2)",
          }}
        >
          Aktiv: <strong style={{ color: "var(--prn-label)" }}>{sel}</strong>
        </div>
      </div>
    );
  },
};
