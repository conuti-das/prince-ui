import type { Meta, StoryObj } from "@storybook/react";
import { SearchField } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Suchfeld auf Basis von react-aria-components `SearchField`. Clear-Verhalten (Escape/Submit) und Fokus-Ring stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    isDisabled: { control: "boolean" },
  },
  args: {
    label: "Suche",
    placeholder: "Transaktion suchen…",
    isDisabled: false,
  },
} satisfies Meta<typeof SearchField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
