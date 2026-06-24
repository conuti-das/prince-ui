import type { Meta, StoryObj } from "@storybook/react";
import { AreaChart, ChartEmpty } from "../../packages/ui/src/index";

const trend = [12, 18, 9, 22, 17, 28, 24, 33, 29, 41, 38, 47];

const meta = {
  title: "Components/AreaChart",
  component: AreaChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Flächenchart mit Gradient-Füllung unter einer geglätteten Linie. `data` akzeptiert entweder reine Werte (gleichmäßig verteilt) oder explizite `{ x, y }`-Punkte. Mit `showAxes` werden Achsen + horizontale Gridlinien eingeblendet; `color` setzt die Akzentfarbe (Default `--prn-chart-1`). Bei leerem `data` rendert die Komponente automatisch `ChartEmpty` — derselbe Leerzustand wird auch standalone genutzt.",
      },
    },
  },
  argTypes: {
    data: { control: "object" },
    showAxes: { control: "boolean" },
    color: { control: "text" },
    width: { control: "number" },
    height: { control: "number" },
    className: { control: "text" },
  },
  args: { data: trend, showAxes: false },
} satisfies Meta<typeof AreaChart>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Panel title="AreaChart">
      <AreaChart {...args} />
    </Panel>
  ),
};

export const Example: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Panel title="ohne Achsen">
        <AreaChart data={trend} />
      </Panel>
      <Panel title="mit Achsen + Grid">
        <AreaChart data={trend} showAxes />
      </Panel>
      <Panel title="(x,y)-Punkte, Akzentfarbe">
        <AreaChart
          showAxes
          color="var(--prn-chart-2)"
          data={[
            { x: 0, y: 5 },
            { x: 1, y: 9 },
            { x: 2, y: 7 },
            { x: 4, y: 18 },
            { x: 7, y: 14 },
            { x: 9, y: 26 },
          ]}
        />
      </Panel>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Panel title="AreaChart — leeres data → ChartEmpty">
        <AreaChart data={[]} />
      </Panel>
      <Panel title="ChartEmpty — eigene Meldung">
        <ChartEmpty message="Keine Transaktionen im Zeitraum" />
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
