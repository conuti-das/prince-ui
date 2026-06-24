import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar, ListRow } from "../../packages/ui/src/index";
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
          "Seitenleiste im macOS-Stil mit Gruppen, Einträgen (Icon, Label, optionalem Trailing-Counter) sowie optionalem Header- und Footer-Slot.",
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
                { id: "monitor", label: "Transaktionen", icon: "📊", trailing: "248" },
                { id: "ebd", label: "EBD-Prüfung", icon: "🧭" },
                { id: "edifact", label: "EDIFACT", icon: "📨", trailing: "12" },
              ],
            },
            {
              label: "Verwaltung",
              items: [
                { id: "partner", label: "Marktpartner", icon: "🏢" },
                { id: "settings", label: "Einstellungen", icon: "⚙️" },
              ],
            },
          ]}
          footer={<ListRow leading="👤" title="Daniel" subtitle="Administrator" />}
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
