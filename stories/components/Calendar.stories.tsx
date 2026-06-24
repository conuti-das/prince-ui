import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { Calendar } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/calendar.css";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Monatskalender auf Basis von react-aria-components `Calendar`. Aufgebaut aus `Heading` + Navigations-`Button`s, `CalendarGrid` mit `CalendarGridHeader`/`CalendarHeaderCell`, `CalendarGridBody` und runden `CalendarCell`-Tagen (Auswahl in Akzentfarbe, heutiger Tag mit Ring, Tage außerhalb des Monats gedimmt).",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    autoFocus: { control: "boolean" },
  },
  args: { isDisabled: false, isReadOnly: false },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Calendar {...args} aria-label="Datum" defaultValue={today(getLocalTimeZone())} />,
};

export const PreselectedDay: Story = {
  name: "Vorausgewählter Tag",
  render: () => <Calendar aria-label="Termin" defaultValue={new CalendarDate(2026, 6, 15)} />,
};

export const WithMinMax: Story = {
  name: "Mit Min/Max-Grenzen",
  render: () => (
    <Calendar
      aria-label="Begrenzter Zeitraum"
      defaultValue={new CalendarDate(2026, 6, 15)}
      minValue={new CalendarDate(2026, 6, 5)}
      maxValue={new CalendarDate(2026, 6, 25)}
    />
  ),
};
