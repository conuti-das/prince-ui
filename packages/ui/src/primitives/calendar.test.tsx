import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { Calendar, RangeCalendar } from "./calendar";

describe("calendar primitives", () => {
  it("Calendar renders a grid with the selected day", () => {
    render(<Calendar aria-label="Termin" defaultValue={new CalendarDate(2026, 6, 15)} />);
    expect(screen.getByRole("application", { name: /Termin/ })).toBeInTheDocument();
    // Der gewählte Tag ist als gridcell mit gesetztem aria-selected vorhanden.
    const selected = screen.getByRole("gridcell", { selected: true });
    expect(selected).toHaveTextContent("15");
  });

  it("Calendar exposes today's date as a gridcell", () => {
    render(<Calendar aria-label="Heute" defaultValue={today(getLocalTimeZone())} />);
    // Der heutige Tag trägt data-today und ist über sein aria-label adressierbar.
    const cell = screen.getByRole("button", { name: /^Today,/ });
    expect(cell).toHaveAttribute("data-today", "true");
  });

  it("Calendar fires onChange when a day is clicked", async () => {
    const onChange = vi.fn();
    render(
      <Calendar aria-label="Auswahl" defaultValue={new CalendarDate(2026, 6, 15)} onChange={onChange} />,
    );
    // Vollständiges aria-label vermeidet Mehrdeutigkeit mit der Jahreszahl.
    await userEvent.click(screen.getByRole("button", { name: "Saturday, June 20, 2026" }));
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("Calendar can navigate to the next month", async () => {
    render(<Calendar aria-label="Navi" defaultValue={new CalendarDate(2026, 6, 15)} />);
    await userEvent.click(screen.getByRole("button", { name: "Nächster Monat" }));
    // Die Überschrift (heading) zeigt den neuen Monat.
    expect(screen.getByRole("heading")).toHaveTextContent(/Juli|July/);
  });

  it("RangeCalendar renders and selects a range on click", async () => {
    const onChange = vi.fn();
    render(
      <RangeCalendar
        aria-label="Zeitraum"
        defaultValue={{ start: new CalendarDate(2026, 6, 10), end: new CalendarDate(2026, 6, 14) }}
        onChange={onChange}
      />,
    );
    expect(screen.getByRole("application", { name: /Zeitraum/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thursday, June 18, 2026" }));
    await userEvent.click(screen.getByRole("button", { name: "Monday, June 22, 2026" }));
    expect(onChange).toHaveBeenCalled();
  });
});
