import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusGlyph, StatusGlyphRow } from "./status-glyph";

describe("StatusGlyphRow", () => {
  it("is one image with the full text; glyphs are decorative and carry tone, variant and id", () => {
    render(
      <StatusGlyphRow
        aria-label="Versand: zugestellt, Bestätigung: ausstehend, Prüfung: negativ, Frist: keine"
        data-testid="slots"
        items={[
          { id: "v", icon: "check", tone: "positive" },
          { id: "b", icon: "hourglass", tone: "critical" },
          { id: "t", icon: "x", tone: "negative", variant: "filled" },
          { id: "f", variant: "empty" },
        ]}
      />,
    );
    const reihe = screen.getByRole("img", { name: /Versand: zugestellt/ });
    expect(reihe).toHaveAttribute("data-testid", "slots");
    const zeichen = reihe.querySelectorAll(".prn-glyph");
    expect(zeichen).toHaveLength(4);
    zeichen.forEach((z) => expect(z).toHaveAttribute("aria-hidden", "true"));
    expect(zeichen[0]).toHaveAttribute("data-tone", "positive");
    expect(zeichen[0]).toHaveAttribute("data-id", "v");
    expect(zeichen[2]).toHaveAttribute("data-variant", "filled");
    expect(zeichen[3]).toHaveAttribute("data-variant", "empty");
    expect(zeichen[3]).toHaveAttribute("data-tone", "neutral");
    expect(zeichen[3]?.querySelector("svg")).toBeNull();
    expect(zeichen[0]?.querySelector("svg")).not.toBeNull();
  });

  it("has a fixed size (default 22 px, icon scaled) and is not focusable", () => {
    const { container } = render(<StatusGlyph icon="check" tone="positive" size={18} />);
    const g = container.querySelector(".prn-glyph") as HTMLElement;
    expect(g.style.width).toBe("18px");
    expect(g.style.height).toBe("18px");
    expect(g.querySelector("svg")).toHaveAttribute("width", "10");
    expect(g).not.toHaveAttribute("tabindex");
    const { container: c2 } = render(<StatusGlyph />);
    expect((c2.querySelector(".prn-glyph") as HTMLElement).style.width).toBe("22px");
  });
});
