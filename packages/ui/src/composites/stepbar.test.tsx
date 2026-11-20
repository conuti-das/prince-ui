import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { StepBar, type Step } from "./stepbar";

const STUFEN: Step[] = [
  { id: "angelegt", label: "Angelegt", detail: "19.11., 14:02", state: "done" },
  { id: "freigabe", label: "Freigegeben", detail: "Vier-Augen", state: "done" },
  { id: "laeuft", label: "Läuft", detail: "412 von 1 000", state: "current", "data-testid": "stufe-laeuft" },
  { id: "abschluss", label: "Abgeschlossen", state: "upcoming" },
];

describe("StepBar (Stufenleiste)", () => {
  it("geordnete Liste mit Namen; je Stufe Name, Detail und Zustand als Text; aktuelle Stufe mit aria-current", () => {
    render(<StepBar aria-label="Stufen des Auftrags" steps={STUFEN} data-testid="stufen" />);
    const liste = screen.getByRole("list", { name: "Stufen des Auftrags" });
    expect(liste.tagName).toBe("OL");
    const items = within(liste).getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-state"))).toEqual(["done", "done", "current", "upcoming"]);
    expect(items[0]).toHaveTextContent("Angelegt19.11., 14:02erledigt");
    expect(screen.getByTestId("stufe-laeuft")).toHaveAttribute("aria-current", "step");
    expect(items.filter((li) => li.hasAttribute("aria-current"))).toHaveLength(1);
    expect(items[3]).toHaveTextContent("folgt");
  });

  it("Zeichen statt Nummer bei erledigt, Problem, abgelehnt; Nummer sonst (dekorativ)", () => {
    const { container } = render(<StepBar aria-label="Weg" steps={[
      { id: "a", label: "A", state: "done" }, { id: "b", label: "B", state: "problem" }, { id: "c", label: "C", state: "rejected" }, { id: "d", label: "D", state: "upcoming" },
    ]} />);
    const marken = [...container.querySelectorAll(".prn-step-marke")];
    expect(marken.every((m) => m.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(marken.map((m) => (m.querySelector("svg") ? "icon" : m.textContent))).toEqual(["icon", "icon", "icon", "4"]);
    expect(screen.getByText("mit Problem")).toBeInTheDocument();
    expect(screen.getByText("abgelehnt")).toBeInTheDocument();
  });

  it("Texte übersetzbar (stateLabels, stateLabel je Stufe); kompakt: Zustand nur für Vorleseprogramme", () => {
    const { rerender } = render(<StepBar aria-label="Weg" stateLabels={{ current: "in Arbeit" }} steps={[
      { id: "a", label: "A", state: "current" }, { id: "b", label: "B", state: "warning", stateLabel: "überfällig" },
    ]} />);
    expect(screen.getByText("in Arbeit")).toBeInTheDocument();
    expect(screen.getByText("überfällig")).toBeInTheDocument();
    rerender(<StepBar aria-label="Weg" density="compact" steps={STUFEN} />);
    expect(screen.queryByText("19.11., 14:02")).not.toBeInTheDocument();
    expect(screen.getAllByText("erledigt")[0]).toHaveClass("prn-step-sr");
  });

  it("CSS: keine Leitfarbe, keine Knöpfe; Umbruch statt Rollen", () => {
    const css = readFileSync(resolve(process.cwd(), "src/composites/stepbar.css"), "utf8");
    expect(css).not.toMatch(/--prn-(accent|action|link)/);
    expect(css).not.toMatch(/overflow(-x)?:\s*(auto|scroll)/);
    expect(css.match(/\.prn-stepbar \{([^}]*)\}/)![1]).toMatch(/flex-wrap:\s*wrap/);
  });
});
