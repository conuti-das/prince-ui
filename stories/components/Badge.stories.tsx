import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Kompaktes Status-Label in verschiedenen Farbtönen (neutral, grün, rot, orange, blau, teal, grau).",
      },
    },
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["neutral", "green", "red", "orange", "blue", "teal", "gray"],
    },
    children: { control: "text" },
  },
  args: { tone: "green", children: "Erfolgreich" },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="green">Erfolgreich</Badge>
      <Badge tone="red">Fehler</Badge>
      <Badge tone="orange">Wartet</Badge>
      <Badge tone="blue">Info</Badge>
      <Badge tone="teal">Aktiv</Badge>
      <Badge tone="gray">Entwurf</Badge>
    </div>
  ),
};
