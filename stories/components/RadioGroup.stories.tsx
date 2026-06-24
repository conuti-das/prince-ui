import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, Radio } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/choice.css";

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte RadioGroup auf Basis von react-aria-components `RadioGroup`. Die einzelnen Optionen sind `Radio`-Komponenten (RAC `Radio`). Selektion, Tastatur-Navigation, Fokus-Ring und Disabled-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    isDisabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: { label: "Sparte", orientation: "vertical", isDisabled: false },
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="strom">Strom</Radio>
      <Radio value="gas">Gas</Radio>
      <Radio value="wasser">Wasser</Radio>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  args: { label: "Sparte", orientation: "horizontal" },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="strom">Strom</Radio>
      <Radio value="gas">Gas</Radio>
      <Radio value="wasser">Wasser</Radio>
    </RadioGroup>
  ),
};
