import type { Meta, StoryObj } from "@storybook/react";
import { ColorPicker, ColorArea, ColorSlider, ColorField } from "../../packages/ui/src/index";
import { parseColor } from "react-aria-components";
import "../../packages/ui/src/primitives/color-pickers.css";

const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Farbwähler auf Basis von react-aria-components `ColorPicker`. Der Trigger zeigt einen `ColorSwatch` mit Label; im `Popover` synchronisieren `ColorArea`, ein Hue-`ColorSlider` und ein `ColorField` denselben Farbwert. Über `children` lässt sich das Popover-Layout frei zusammenstellen.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
  },
  args: {
    label: "Markenfarbe",
    defaultValue: parseColor("hsl(82, 72%, 55%)"),
  },
} satisfies Meta<typeof ColorPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const CustomLayout: Story = {
  render: () => (
    <ColorPicker label="Akzent" defaultValue={parseColor("hsl(150, 70%, 45%)")}>
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" className="prn-colorpicker-area" />
      <ColorSlider colorSpace="hsb" channel="hue" label="Farbton" />
      <ColorSlider colorSpace="hsb" channel="saturation" label="Sättigung" />
      <ColorField label="Hex" />
    </ColorPicker>
  ),
};
