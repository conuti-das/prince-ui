import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Button auf Basis von react-aria-components `Button`. Press-Events, Fokus-Ring und Disabled-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "tinted", "plain"] },
    isDisabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: { variant: "filled", isDisabled: false, children: "Button" },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Button variant="filled">Gefüllt</Button>
      <Button variant="tinted">Getönt</Button>
      <Button variant="plain">Schlicht</Button>
      <Button variant="filled" isDisabled>Deaktiviert</Button>
    </div>
  ),
};
