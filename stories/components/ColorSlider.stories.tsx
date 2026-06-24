import type { Meta, StoryObj } from "@storybook/react";
import { ColorSlider } from "../../packages/ui/src/index";
import { parseColor } from "react-aria-components";
import "../../packages/ui/src/primitives/color-pickers.css";

const meta = {
  title: "Components/ColorSlider",
  component: ColorSlider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Farbkanal-Schieber auf Basis von react-aria-components `ColorSlider` (mit `SliderTrack`, `SliderOutput`, `Label` und `ColorThumb`). Die Spur zeigt den Gradienten des jeweiligen Kanals.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    channel: { control: "select", options: ["hue", "saturation", "lightness", "brightness", "alpha"] },
    showValue: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Farbton",
    colorSpace: "hsl",
    channel: "hue",
    showValue: true,
    isDisabled: false,
    defaultValue: parseColor("hsl(210, 90%, 55%)"),
  },
} satisfies Meta<typeof ColorSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Channels: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 240 }}>
      <ColorSlider label="Farbton" colorSpace="hsl" channel="hue" defaultValue={parseColor("hsl(140, 80%, 50%)")} />
      <ColorSlider label="Sättigung" colorSpace="hsl" channel="saturation" defaultValue={parseColor("hsl(140, 80%, 50%)")} />
      <ColorSlider label="Helligkeit" colorSpace="hsl" channel="lightness" defaultValue={parseColor("hsl(140, 80%, 50%)")} />
    </div>
  ),
};
