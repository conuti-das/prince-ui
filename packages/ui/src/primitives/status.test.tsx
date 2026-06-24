import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar, Meter, Separator, Group } from "./status";

describe("status primitives", () => {
  it("ProgressBar renders with value and aria attributes", () => {
    render(<ProgressBar label="Upload" value={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuetext", "60%");
    expect(screen.getByText("Upload")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("ProgressBar is indeterminate without a value", () => {
    render(<ProgressBar label="Lädt" isIndeterminate />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("Meter renders with value and reflects its band color", () => {
    const { container } = render(<Meter label="Speicher" value={90} bands />);
    const meter = container.querySelector(".prn-meter");
    expect(meter).toHaveAttribute("aria-valuenow", "90");
    expect(container.querySelector(".prn-meter-fill")).toHaveAttribute("data-band", "high");
  });

  it("Separator has role separator", () => {
    render(<Separator />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("Separator passes through its orientation", () => {
    render(<Separator orientation="vertical" />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("Group renders its children with role group", () => {
    render(
      <Group aria-label="Aktionen">
        <button type="button">A</button>
        <button type="button">B</button>
      </Group>,
    );
    const group = screen.getByRole("group", { name: "Aktionen" });
    expect(group).toBeInTheDocument();
    expect(group).toContainElement(screen.getByRole("button", { name: "A" }));
  });
});
