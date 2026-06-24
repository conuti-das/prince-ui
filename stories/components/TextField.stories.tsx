import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/TextField",
  component: TextField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Textfeld auf Basis von react-aria-components `TextField` (Label, Input, Description, FieldError). Label-Verknüpfung, Validierung und Fokus-Ring stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    description: { control: "text" },
    isDisabled: { control: "boolean" },
    isRequired: { control: "boolean" },
  },
  args: {
    label: "Marktpartner",
    placeholder: "z. B. 9900123000007",
    isDisabled: false,
    isRequired: false,
  },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    label: "Marktpartner",
    placeholder: "z. B. 9900123000007",
    description: "13-stellige Codenummer des Marktpartners (DVGW/BDEW).",
  },
};
