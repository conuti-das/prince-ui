import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate } from "@internationalized/date";
import { DatePicker, DateRangePicker } from "./datepicker";

describe("datepicker primitives", () => {
  it("DatePicker renders its label and date segments with a defaultValue", () => {
    render(<DatePicker label="Lieferdatum" defaultValue={new CalendarDate(2026, 6, 24)} />);
    expect(screen.getByText("Lieferdatum")).toBeInTheDocument();
    // RAC rendert pro Segment ein spinbutton-Element.
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });

  it("DatePicker opens the calendar grid via the trigger button", async () => {
    render(<DatePicker label="Datum" defaultValue={new CalendarDate(2026, 6, 24)} />);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Kalender öffnen/ }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
    // Der ausgewählte Tag ist im Kalender adressierbar.
    expect(screen.getByRole("button", { name: /24/ })).toBeInTheDocument();
  });

  it("DateRangePicker renders start and end segments with a defaultValue", () => {
    render(
      <DateRangePicker
        label="Zeitraum"
        defaultValue={{
          start: new CalendarDate(2026, 6, 1),
          end: new CalendarDate(2026, 6, 24),
        }}
      />,
    );
    expect(screen.getByText("Zeitraum")).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });

  it("DateRangePicker opens the range calendar grid via the trigger button", async () => {
    render(
      <DateRangePicker
        label="Zeitraum"
        defaultValue={{
          start: new CalendarDate(2026, 6, 1),
          end: new CalendarDate(2026, 6, 24),
        }}
      />,
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Kalender öffnen/ }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
  });
});
