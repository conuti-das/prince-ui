import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDate } from "@internationalized/date";
import { DatePicker } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/datepicker.css";

const meta = {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Datumswähler auf Basis von react-aria-components `DatePicker`. Die Trigger-Pille zeigt editierbare Datums-Segmente (`DateInput`/`DateSegment`) plus einen Button, der ein `Popover` mit einem `Calendar` (Grid via `CalendarGrid`/`CalendarCell`) öffnet.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
  },
  args: { label: "Datum", isDisabled: false, isReadOnly: false },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { defaultValue: new CalendarDate(2026, 6, 24) },
};

export const MitBeschreibung: Story = {
  args: {
    label: "Lieferdatum",
    description: "Frühestmögliches Belieferungsdatum.",
    defaultValue: new CalendarDate(2026, 7, 1),
  },
};

export const Ungueltig: Story = {
  args: {
    label: "Stichtag",
    isInvalid: true,
    errorMessage: "Bitte ein gültiges Datum wählen.",
  },
};
