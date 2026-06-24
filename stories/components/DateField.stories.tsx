import type { Meta, StoryObj } from "@storybook/react";
import { parseDate } from "@internationalized/date";
import { DateField } from "../../packages/ui/src/primitives/datefields";
import "../../packages/ui/src/primitives/datefields.css";

const meta = {
  title: "Components/DateField",
  component: DateField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Datumsfeld auf Basis von react-aria-components `DateField`. Die Eingabe erfolgt segmentweise (Tag/Monat/Jahr) über `DateInput` und `DateSegment`; Platzhalter, Fokus und Tastatursteuerung stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    isDisabled: { control: "boolean" },
    isInvalid: { control: "boolean" },
  },
  args: { label: "Datum", isDisabled: false },
} satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = {
  render: () => (
    <DateField
      label="Lieferdatum"
      defaultValue={parseDate("2026-06-24")}
      description="Tag, Monat und Jahr separat editierbar."
    />
  ),
};

export const Invalid: Story = {
  render: () => (
    <DateField label="Geburtsdatum" isInvalid errorMessage="Bitte ein gültiges Datum wählen." />
  ),
};
