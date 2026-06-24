import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Schalter auf Basis von react-aria-components `Switch`. Toggle-Verhalten, Tastatur- und Disabled-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    children: { control: "text" },
    isSelected: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: {
    children: "Auto-Refresh",
    isSelected: true,
    isDisabled: false,
  },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
