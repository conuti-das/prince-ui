import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareBar } from "./sharebar";

describe("ShareBar", () => {
  it("Bild mit allen Werten im Namen, Teile anteilig, Legende mit Wort und Zahl", () => {
    const { container } = render(<ShareBar aria-label="Posten" total={1200} parts={[{ id: "ok", label: "ausgeführt", value: 380, tone: "green" }, { id: "f", label: "Fehler", value: 22, tone: "red" }, { id: "s", label: "übersprungen", value: 0 }]} caption="402 von 1.200" />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Posten: ausgeführt 380, Fehler 22, übersprungen 0, 798 offen von 1.200");
    const ok = container.querySelector('[data-part="ok"]') as HTMLElement;
    expect(ok.style.width).toBe(`${(380 / 1200) * 100}%`);
    expect(container.querySelector('[data-part="s"]')).toBeNull();
    expect(screen.getByText("ausgeführt")).toBeInTheDocument();
    expect(screen.queryByText("übersprungen")).toBeNull();
    expect(screen.getByText("402 von 1.200")).toBeInTheDocument();
  });
  it("showZero, ohne Legende, Höhe begrenzt", () => {
    const { container, rerender } = render(<ShareBar aria-label="x" height={30} showZero parts={[{ id: "a", label: "A", value: 0 }]} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect((container.querySelector(".prn-sharebar-track") as HTMLElement).style.height).toBe("12px");
    rerender(<ShareBar aria-label="x" legend={false} parts={[{ id: "a", label: "A", value: 1 }]} />);
    expect(screen.queryByText("A")).toBeNull();
  });
});
