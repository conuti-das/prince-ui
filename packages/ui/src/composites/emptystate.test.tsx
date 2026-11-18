import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./composites";

describe("EmptyState illustration und size", () => {
  it.each(["no-data", "no-results", "error", "done"] as const)("rendert die Illustration %s dekorativ", (art) => {
    const { container } = render(<EmptyState illustration={art} title="Keine Klärfälle" />);
    const svg = container.querySelector("svg.prn-empty-illustration")!;
    expect(svg).toHaveAttribute("data-illustration", art);
    expect(svg).toHaveAttribute("aria-hidden");
    expect(svg.childElementCount).toBeGreaterThan(1);
  });

  it("Illustration hat Vorrang vor dem Icon; Größe als data-size (Default m)", () => {
    const { container, rerender } = render(<EmptyState illustration="done" icon={<span data-testid="icon" />} title="Alles erledigt" />);
    expect(screen.queryByTestId("icon")).toBeNull();
    expect(container.firstChild).toHaveAttribute("data-size", "m");
    rerender(<EmptyState size="s" icon={<span data-testid="icon" />} title="Alles erledigt" />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute("data-size", "s");
  });
});
