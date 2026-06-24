import type { Meta, StoryObj } from "@storybook/react";
import { BarChart } from "../../packages/ui/src/index";

const bars = [
  { label: "Mo", value: 320 },
  { label: "Di", value: 540 },
  { label: "Mi", value: 410 },
  { label: "Do", value: 680 },
  { label: "Fr", value: 590 },
  { label: "Sa", value: 210 },
  { label: "So", value: 140 },
];

const meta = {
  title: "Components/BarChart",
  component: BarChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Vertikale Balken mit gerundeten Köpfen aus reinem SVG. `data` ist eine Liste aus `{ label, value }`; `color` setzt die Balkenfarbe (Default `--prn-chart-1`) und `showLabels` blendet die x-Achsenbeschriftung ein/aus. Bei leerem `data` wird automatisch der Leerzustand gezeigt.",
      },
    },
  },
  argTypes: {
    data: { control: "object" },
    color: { control: "text" },
    showLabels: { control: "boolean" },
    width: { control: "number" },
    height: { control: "number" },
    className: { control: "text" },
  },
  args: { data: bars, showLabels: true },
} satisfies Meta<typeof BarChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Panel title="BarChart">
      <BarChart {...args} />
    </Panel>
  ),
};

export const Example: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Panel title="Transaktionen / Tag">
        <BarChart data={bars} />
      </Panel>
      <Panel title="eigene Farbe, ohne Labels">
        <BarChart data={bars} color="var(--prn-chart-4)" showLabels={false} />
      </Panel>
    </div>
  ),
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 360,
        maxWidth: "100%",
        padding: 16,
        borderRadius: "var(--prn-radius-card)",
        background: "var(--prn-bg-elevated)",
        border: "var(--prn-card-border)",
        boxShadow: "var(--prn-shadow)",
      }}
    >
      <div style={{ font: "var(--prn-text-subhead)", color: "var(--prn-label-2)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
