import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlassSurface } from "./glass";

describe("GlassSurface", () => {
  it("renders its children", () => {
    render(<GlassSurface>Inhalt</GlassSurface>);
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("applies the base material class and the default 'card' variant", () => {
    render(<GlassSurface data-testid="g">x</GlassSurface>);
    const el = screen.getByTestId("g");
    expect(el).toHaveClass("prn-glass");
    expect(el).toHaveClass("prn-glass-card");
  });

  it("uses the requested variant", () => {
    render(
      <GlassSurface variant="bar" data-testid="g">
        x
      </GlassSurface>,
    );
    expect(screen.getByTestId("g")).toHaveClass("prn-glass-bar");
    expect(screen.getByTestId("g")).not.toHaveClass("prn-glass-card");
  });

  it("merges a custom className without dropping the base classes", () => {
    render(
      <GlassSurface className="extra" data-testid="g">
        x
      </GlassSurface>,
    );
    const el = screen.getByTestId("g");
    expect(el).toHaveClass("prn-glass");
    expect(el).toHaveClass("extra");
  });

  it("exposes tintColor as the --prn-glass-tint custom property", () => {
    render(
      <GlassSurface tintColor="rgba(0,122,255,0.12)" data-testid="g">
        x
      </GlassSurface>,
    );
    expect(screen.getByTestId("g").style.getPropertyValue("--prn-glass-tint")).toBe(
      "rgba(0,122,255,0.12)",
    );
  });

  it("renders a custom element via `as` (no extra wrapper)", () => {
    render(
      <GlassSurface as="section" data-testid="g">
        x
      </GlassSurface>,
    );
    expect(screen.getByTestId("g").tagName).toBe("SECTION");
  });

  it("forwards arbitrary DOM props (purely presentational, no behavior added)", () => {
    render(
      <GlassSurface aria-label="Glasfläche" data-testid="g">
        x
      </GlassSurface>,
    );
    expect(screen.getByTestId("g")).toHaveAttribute("aria-label", "Glasfläche");
  });
});
