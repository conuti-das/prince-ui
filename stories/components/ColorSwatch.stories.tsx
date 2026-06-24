import type { Meta, StoryObj } from "@storybook/react";
import { ColorSwatch } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/color.css";

const meta = {
  title: "Components/ColorSwatch",
  component: ColorSwatch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Farbvorschau auf Basis von react-aria-components `ColorSwatch`. Zeigt eine Farbe als abgerundetes Quadrat mit `--prn-separator`-Rand; bei Alpha-Farben scheint ein Schachbrett-Muster durch.",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
  },
  args: {
    color: "#3478F6",
  },
} satisfies Meta<typeof ColorSwatch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Palette: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <ColorSwatch color="#FF3B30" aria-label="Rot" />
      <ColorSwatch color="#34C759" aria-label="Grün" />
      <ColorSwatch color="#3478F6" aria-label="Blau" />
      <ColorSwatch color="#FF9500" aria-label="Orange" />
    </div>
  ),
};

export const WithAlpha: Story = {
  args: { color: "#3478F680" },
};
