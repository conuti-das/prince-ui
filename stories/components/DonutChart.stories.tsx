import type { Meta, StoryObj } from "@storybook/react";
import { DonutChart } from "../../packages/ui/src/index";

const donut = [
  { label: "Erfolgreich", value: 6420 },
  { label: "In Klärung", value: 1280 },
  { label: "Fehler", value: 340 },
  { label: "Storniert", value: 160 },
];

const meta = {
  title: "Components/DonutChart",
  component: DonutChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Ring-Diagramm aus SVG-Arcs mit optionalem zentralem Label und Legende. `segments` ist eine Liste aus `{ label, value, color? }`; je Segment kann eine eigene Farbe gesetzt werden, sonst greift die Palette `--prn-chart-1..8`. `centerLabel` rendert Text/Markup in der Ringmitte, `showLegend`, `size` und `thickness` steuern die Darstellung. Leeres `segments` (oder Gesamtsumme 0) ergibt den Leerzustand.",
      },
    },
  },
  argTypes: {
    segments: { control: "object" },
    showLegend: { control: "boolean" },
    size: { control: "number" },
    thickness: { control: "number" },
    className: { control: "text" },
  },
  args: { segments: donut, showLegend: true },
} satisfies Meta<typeof DonutChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Panel title="DonutChart">
      <DonutChart {...args} />
    </Panel>
  ),
};

export const Example: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Panel title="Status mit Legende">
        <DonutChart
          segments={donut}
          centerLabel={
            <>
              <strong>8.200</strong>
              <span style={{ font: "var(--prn-text-caption)", color: "var(--prn-label-2)" }}>gesamt</span>
            </>
          }
        />
      </Panel>
      <Panel title="eigene Segmentfarben">
        <DonutChart
          segments={[
            { label: "Strom", value: 62, color: "var(--prn-chart-1)" },
            { label: "Gas", value: 28, color: "var(--prn-chart-3)" },
            { label: "Wasser", value: 10, color: "var(--prn-chart-6)" },
          ]}
          centerLabel="100%"
        />
      </Panel>
    </div>
  ),
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 420,
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
