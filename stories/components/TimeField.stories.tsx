import type { Meta, StoryObj } from "@storybook/react";
import { parseTime } from "@internationalized/date";
import { TimeField } from "../../packages/ui/src/primitives/datefields";
import "../../packages/ui/src/primitives/datefields.css";

const meta = {
  title: "Components/TimeField",
  component: TimeField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Uhrzeitfeld auf Basis von react-aria-components `TimeField`. Die Eingabe erfolgt segmentweise (Stunde/Minute) über `DateInput` und `DateSegment`; Platzhalter, Fokus und Tastatursteuerung stammen aus React Aria.",
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
  args: { label: "Uhrzeit", isDisabled: false },
} satisfies Meta<typeof TimeField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithValue: Story = {
  render: () => (
    <TimeField
      label="Startzeit"
      defaultValue={parseTime("14:30")}
      description="Stunde und Minute separat editierbar."
    />
  ),
};

export const Invalid: Story = {
  render: () => (
    <TimeField label="Abfahrt" isInvalid errorMessage="Bitte eine gültige Uhrzeit wählen." />
  ),
};
