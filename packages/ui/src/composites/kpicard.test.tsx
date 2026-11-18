import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KpiCard } from "./composites";

describe("KpiCard Grundlage, Einheit, Zustandswort, Nebenwerte, Inhalt", () => {
  it("rendert alle neuen Teile und Name/testid an der Fläche", () => {
    render(<KpiCard label="Klärfälle" value="12" unit="Fälle" subtitle="offen · alle Mandanten" status="3 überfällig" tone="negative"
      sideValues={[{ label: "Meine", value: "4" }, { label: "Frei", value: "8", tone: "critical" }]} aria-label="Klärfälle: 12, 3 überfällig" data-testid="kz">
      <div data-testid="diagramm" />
    </KpiCard>);
    const k = screen.getByTestId("kz");
    expect(k).toHaveAccessibleName("Klärfälle: 12, 3 überfällig");
    expect(screen.getByText("offen · alle Mandanten")).toBeInTheDocument();
    expect(screen.getByText("Fälle")).toHaveClass("prn-kpi-unit");
    expect(screen.getByText("3 überfällig")).toHaveAttribute("data-tone", "negative");
    expect(screen.getByText("Frei").nextElementSibling).toHaveTextContent("8");
    expect(screen.getByTestId("diagramm")).toBeInTheDocument();
  });

  it("klickbar mit Name und testid am Knopf", async () => {
    const onPress = vi.fn();
    render(<KpiCard label="Störungen" value="2" onPress={onPress} aria-label="Störungen öffnen" data-testid="kz" />);
    await userEvent.click(screen.getByRole("button", { name: "Störungen öffnen" }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(screen.getByTestId("kz").tagName).toBe("BUTTON");
  });

  it("höchstens drei Nebenwerte", () => {
    render(<KpiCard label="x" value="1" sideValues={[1, 2, 3, 4].map((n) => ({ label: `L${n}`, value: n }))} />);
    expect(screen.queryByText("L4")).toBeNull();
    expect(screen.getByText("L3")).toBeInTheDocument();
  });
});
