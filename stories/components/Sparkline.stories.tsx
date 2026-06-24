import type { Meta, StoryObj } from "@storybook/react";
import { Sparkline } from "../../packages/ui/src/index";

const trend = [12, 18, 9, 22, 17, 28, 24, 33, 29, 41, 38, 47];
const dip = [40, 38, 41, 30, 22, 25, 18, 12, 15, 9];

const meta = {
  title: "Components/Sparkline",
  component: Sparkline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Kompakte, geglättete Trendlinie ohne Achsen — gedacht für KPI-Kacheln. Reines SVG ohne Chart-Library, responsiv über `viewBox`. Linienfarbe per `color` (Default `--prn-chart-1`); bei leerem `data` wird automatisch ein kompakter Leerzustand gezeigt.",
      },
    },
  },
  argTypes: {
    data: { control: "object" },
    color: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
    className: { control: "text" },
  },
  args: { data: trend },
} satisfies Meta<typeof Sparkline>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ height: 40, width: 220 }}>
      <Sparkline {...args} />
    </div>
  ),
};

export const Example: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Panel title="Trend (steigend)">
        <div style={{ height: 40 }}>
          <Sparkline data={trend} />
        </div>
      </Panel>
      <Panel title="Fallend, eigene Farbe">
        <div style={{ height: 40 }}>
          <Sparkline data={dip} color="var(--prn-red)" />
        </div>
      </Panel>
      <Panel title="Leer">
        <Sparkline data={[]} />
      </Panel>
    </div>
  ),
};

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 220,
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
