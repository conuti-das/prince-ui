import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/status.css";

const meta = {
  title: "Components/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Trennlinie auf Basis von react-aria-components `Separator`. Eine 1px-Linie in der System-Trennfarbe; unterstützt horizontale und vertikale Ausrichtung über `orientation`.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  args: { orientation: "horizontal" },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <p style={{ margin: "0 0 12px" }}>Oben</p>
      <Separator {...args} />
      <p style={{ margin: "12px 0 0" }}>Unten</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 24 }}>
      <span>Bearbeiten</span>
      <Separator orientation="vertical" />
      <span>Duplizieren</span>
      <Separator orientation="vertical" />
      <span>Löschen</span>
    </div>
  ),
};
