import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDate } from "@internationalized/date";
import { DateRangePicker } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/datepicker.css";

const meta = {
  title: "Components/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Zeitraumwähler auf Basis von react-aria-components `DateRangePicker`. Zwei Datums-Felder (`DateInput` mit Slots `start`/`end`) sind durch einen Trenner verbunden; der Button öffnet ein `Popover` mit einem `RangeCalendar`, das den ausgewählten Bereich zusammenhängend hervorhebt.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
  },
  args: { label: "Zeitraum", isDisabled: false, isReadOnly: false },
} satisfies Meta<typeof DateRangePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    defaultValue: {
      start: new CalendarDate(2026, 6, 1),
      end: new CalendarDate(2026, 6, 24),
    },
  },
};

export const Abrechnungszeitraum: Story = {
  args: {
    label: "Abrechnungszeitraum",
    description: "Beginn und Ende der Lieferperiode.",
    defaultValue: {
      start: new CalendarDate(2026, 1, 1),
      end: new CalendarDate(2026, 12, 31),
    },
  },
};
