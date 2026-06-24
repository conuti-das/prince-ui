import type { Meta, StoryObj } from "@storybook/react";
import { CheckboxGroup, Checkbox } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/choice.css";

const meta = {
  title: "Components/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte CheckboxGroup auf Basis von react-aria-components `CheckboxGroup`. Die Optionen sind `Checkbox`-Komponenten. Mehrfachauswahl, Tastatur- und Disabled-Handling stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: { label: "Optionen", isDisabled: false },
} satisfies Meta<typeof CheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <CheckboxGroup {...args}>
      <Checkbox value="strom">Strom</Checkbox>
      <Checkbox value="gas">Gas</Checkbox>
      <Checkbox value="wasser">Wasser</Checkbox>
    </CheckboxGroup>
  ),
};
