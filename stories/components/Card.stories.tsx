import type { Meta, StoryObj } from "@storybook/react";
import { Card, Badge } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Glas-Container mit optionalem Titel-Header, freiem Header-Slot rechts und konfigurierbarem Innenabstand.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    padding: { control: "inline-radio", options: ["none", "compact", "regular", "spacious"] },
  },
  args: { title: "Übersicht", padding: "regular" },
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Card {...args}>
      <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label-2)", margin: 0 }}>
        Glas-Container mit Titel-Header und regulärem Innenabstand.
      </p>
    </Card>
  ),
};

export const WithHeaderSlot: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 }}>
      <Card title="Übersicht">
        <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label-2)", margin: 0 }}>
          Glas-Container mit Titel-Header und regulärem Innenabstand.
        </p>
      </Card>
      <Card title="Letzte Transaktionen" header={<Badge tone="green">Live</Badge>} padding="compact">
        <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label-2)", margin: 0 }}>
          Header-Slot rechts (hier ein Badge), kompaktes Padding.
        </p>
      </Card>
    </div>
  ),
};
