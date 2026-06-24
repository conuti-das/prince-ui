import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDate } from "@internationalized/date";
import { RangeCalendar } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/calendar.css";

const meta = {
  title: "Components/RangeCalendar",
  component: RangeCalendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Zeitraum-Kalender auf Basis von react-aria-components `RangeCalendar`. Gleicher Aufbau wie `Calendar` (Heading, Navigations-`Button`s, `CalendarGrid`), jedoch mit zusammenhängender Bereichshervorhebung: Start- und Endtag in Akzentfarbe (`[data-selection-start]`/`[data-selection-end]`), dazwischenliegende Tage getönt.",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    autoFocus: { control: "boolean" },
  },
  args: { isDisabled: false, isReadOnly: false },
} satisfies Meta<typeof RangeCalendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <RangeCalendar
      {...args}
      aria-label="Zeitraum"
      defaultValue={{ start: new CalendarDate(2026, 6, 10), end: new CalendarDate(2026, 6, 16) }}
    />
  ),
};

export const Week: Story = {
  name: "Eine Woche",
  render: () => (
    <RangeCalendar
      aria-label="Woche"
      defaultValue={{ start: new CalendarDate(2026, 6, 1), end: new CalendarDate(2026, 6, 7) }}
    />
  ),
};

export const WithMinMax: Story = {
  name: "Mit Min/Max-Grenzen",
  render: () => (
    <RangeCalendar
      aria-label="Begrenzter Zeitraum"
      defaultValue={{ start: new CalendarDate(2026, 6, 10), end: new CalendarDate(2026, 6, 16) }}
      minValue={new CalendarDate(2026, 6, 5)}
      maxValue={new CalendarDate(2026, 6, 25)}
    />
  ),
};
