import type { Meta, StoryObj } from "@storybook/react";
import { Amount } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Amount",
  component: Amount,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Lokalisiert formatierter Geldbetrag (Intl.NumberFormat) mit optionaler Währung, Vorzeichen und positiv/negativ-Färbung.",
      },
    },
  },
  argTypes: {
    value: { control: "number" },
    currency: { control: "text" },
    locale: { control: "text" },
    minimumFractionDigits: { control: "number" },
    maximumFractionDigits: { control: "number" },
    colored: { control: "boolean" },
    signed: { control: "boolean" },
  },
  args: {
    value: 1234567.89,
    currency: "EUR",
    colored: false,
    signed: false,
  },
} satisfies Meta<typeof Amount>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 280 }}>
      <Amount value={1234567.89} currency="EUR" />
      <Amount value={-842.5} currency="EUR" colored signed />
      <Amount value={1280.4} colored signed />
      <Amount value={0} currency="EUR" colored />
      <Amount value={98.765} maximumFractionDigits={2} />
    </div>
  ),
};
