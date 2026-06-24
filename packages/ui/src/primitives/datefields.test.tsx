import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseDate, parseTime } from "@internationalized/date";
import { DateField, TimeField } from "./datefields";

describe("datefields primitives", () => {
  it("DateField renders its label and segments from a defaultValue", () => {
    render(<DateField label="Datum" defaultValue={parseDate("2026-06-24")} />);
    // Gruppe trägt das Label.
    expect(screen.getByRole("group", { name: "Datum" })).toBeInTheDocument();
    // Jedes Segment ist ein spinbutton.
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.length).toBeGreaterThanOrEqual(3);
  });

  it("DateField shows a validation error message", () => {
    render(<DateField label="Datum" isInvalid errorMessage="Pflichtfeld" />);
    expect(screen.getByText("Pflichtfeld")).toBeInTheDocument();
  });

  it("DateField lets the user change a segment with the keyboard", async () => {
    const onChange = vi.fn();
    render(
      <DateField
        label="Datum"
        defaultValue={parseDate("2026-06-24")}
        onChange={onChange}
      />,
    );
    const segments = screen.getAllByRole("spinbutton");
    await userEvent.click(segments[0]!);
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenCalled();
  });

  it("TimeField renders its label and segments from a defaultValue", () => {
    render(<TimeField label="Uhrzeit" defaultValue={parseTime("14:30")} />);
    expect(screen.getByRole("group", { name: "Uhrzeit" })).toBeInTheDocument();
    const segments = screen.getAllByRole("spinbutton");
    expect(segments.length).toBeGreaterThanOrEqual(2);
  });

  it("TimeField changes a segment with the keyboard", async () => {
    const onChange = vi.fn();
    render(
      <TimeField
        label="Uhrzeit"
        defaultValue={parseTime("14:30")}
        onChange={onChange}
      />,
    );
    const segments = screen.getAllByRole("spinbutton");
    await userEvent.click(segments[0]!);
    await userEvent.keyboard("{ArrowUp}");
    expect(onChange).toHaveBeenCalled();
  });
});
