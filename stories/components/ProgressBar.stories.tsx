import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/status.css";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Fortschrittsbalken auf Basis von react-aria-components `ProgressBar`. Der Wert wird als Prozentbreite gerendert; ohne Wert (`isIndeterminate`) läuft ein animierter Streifen. Label und ARIA-Werttext stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    value: { control: { type: "range", min: 0, max: 100 } },
    showValue: { control: "boolean" },
    isIndeterminate: { control: "boolean" },
  },
  args: { label: "Upload", value: 60, showValue: true, isIndeterminate: false },
} satisfies Meta<typeof ProgressBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Steps: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <ProgressBar label="Gestartet" value={10} />
      <ProgressBar label="Halb fertig" value={50} />
      <ProgressBar label="Fast fertig" value={90} />
    </div>
  ),
};

export const Indeterminate: Story = {
  args: { label: "Synchronisiere…", isIndeterminate: true },
};
