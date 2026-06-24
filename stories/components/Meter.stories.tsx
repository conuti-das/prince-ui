import type { Meta, StoryObj } from "@storybook/react";
import { Meter } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/status.css";

const meta = {
  title: "Components/Meter",
  component: Meter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Füllstandsanzeige auf Basis von react-aria-components `Meter`. Stellt eine Menge innerhalb eines bekannten Bereichs dar. Mit `bands` färbt sich die Füllung nach Auslastung (grün → orange → rot).",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    value: { control: { type: "range", min: 0, max: 100 } },
    showValue: { control: "boolean" },
    bands: { control: "boolean" },
  },
  args: { label: "Speicher", value: 72, showValue: true, bands: true },
} satisfies Meta<typeof Meter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Bands: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <Meter label="Niedrig" value={30} bands />
      <Meter label="Mittel" value={70} bands />
      <Meter label="Hoch" value={95} bands />
    </div>
  ),
};

export const Accent: Story = {
  args: { label: "Akku", value: 48, bands: false },
};
