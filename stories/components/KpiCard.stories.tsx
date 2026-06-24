import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Kennzahlen-Kachel mit Label, großem Wert und optionalem farbig getöntem Delta inklusive Trend-Pfeil.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "text" },
    delta: { control: "text" },
    trend: { control: "inline-radio", options: ["up", "down", "flat"] },
    icon: { control: "text" },
  },
  args: {
    label: "Transaktionen",
    value: "12.480",
    delta: "+8,2 %",
    trend: "up",
    icon: "⚡",
  },
} satisfies Meta<typeof KpiCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Grid: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
      <KpiCard label="Transaktionen" value="12.480" delta="+8,2 %" trend="up" icon="⚡" />
      <KpiCard label="Fehlerquote" value="1,3 %" delta="-0,4 pp" trend="down" icon="⚠" />
      <KpiCard label="Offen" value="37" delta="±0" trend="flat" icon="◷" />
      <KpiCard label="Ø Laufzeit" value="2,4 s" delta="−0,2 s" trend="up" icon="⤓" />
    </div>
  ),
};
