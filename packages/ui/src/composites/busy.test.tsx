import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { BusyArea, Spinner } from "./busy";

afterEach(() => vi.useRealTimers());

describe("Spinner", () => {
  it("ist ein Status mit zugänglichem Text, sichtbar nur mit showLabel", () => {
    const { rerender } = render(<Spinner label="Klärfälle werden geladen" />);
    expect(screen.getByRole("status")).toHaveTextContent("Klärfälle werden geladen");
    expect(screen.getByText("Klärfälle werden geladen")).toHaveClass("prn-spinner-sr");
    rerender(<Spinner label="Lädt" showLabel size="l" />);
    expect(screen.getByText("Lädt")).toHaveClass("prn-spinner-label");
    expect(screen.getByRole("status")).toHaveAttribute("data-size", "l");
  });
});

describe("BusyArea", () => {
  it("setzt aria-busy und inert sofort, zeigt den Spinner erst nach delay", () => {
    vi.useFakeTimers();
    render(<BusyArea busy delay={300} data-testid="bereich"><button>Zeile</button></BusyArea>);
    const b = screen.getByTestId("bereich");
    expect(b).toHaveAttribute("aria-busy", "true");
    expect(b.querySelector(".prn-busyarea-content")).toHaveAttribute("inert");
    expect(screen.queryByRole("status")).toBeNull();
    act(() => { vi.advanceTimersByTime(300); });
    expect(screen.getByRole("status")).toHaveTextContent("Wird geladen");
  });

  it("ohne busy: kein Overlay, kein aria-busy, Inhalt bedienbar", () => {
    render(<BusyArea busy={false} data-testid="bereich"><button>Zeile</button></BusyArea>);
    expect(screen.getByTestId("bereich")).not.toHaveAttribute("aria-busy");
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByTestId("bereich").querySelector(".prn-busyarea-content")).not.toHaveAttribute("inert");
  });

  it("delay 0 zeigt sofort", () => {
    render(<BusyArea busy delay={0} label="Speichert"><span /></BusyArea>);
    expect(screen.getByRole("status")).toHaveTextContent("Speichert");
  });
});
