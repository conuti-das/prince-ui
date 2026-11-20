import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterChip, ViewButton, ViewToolbar, ViewToolbarGroup, ViewToolbarSeparator, ZoomGroup } from "./view-toolbar";
import { SegmentedControl, Segment } from "./navigation";

const leer = () => {};

function Leiste(p: { onFilter?: (v: boolean) => void; canZoomIn?: boolean } = {}) {
  return (
    <ViewToolbar aria-label="Ansicht des Prozessbilds" data-testid="leiste">
      <ViewToolbarGroup aria-label="Hervorheben" wrap>
        <FilterChip count={3} mark={<i />} onChange={p.onFilter} data-testid="chip-fehler">Fehler</FilterChip>
        <FilterChip count={12}>begangen</FilterChip>
      </ViewToolbarGroup>
      <ViewToolbarSeparator />
      <SegmentedControl aria-label="Darstellung" defaultSelectedKeys={["diagramm"]}>
        <Segment id="diagramm">Diagramm</Segment>
        <Segment id="tabelle">Tabelle</Segment>
      </SegmentedControl>
      <ZoomGroup onZoomOut={leer} onZoomIn={leer} onFit={leer} canZoomIn={p.canZoomIn} info={{ label: "Bedienung", tooltip: "Klick auf einen Schritt zeigt die Variablen" }}>
        <ViewButton icon="route" onPress={leer} tooltip="Begangenen Weg und aktiven Schritt zeigen">Auf Pfad</ViewButton>
      </ZoomGroup>
    </ViewToolbar>
  );
}

describe("Werkzeugleiste der Ansicht", () => {
  it("Leiste mit Namen, Gruppen und fester Zoom-Reihenfolge: [Auf Pfad] · Einpassen · Verkleinern · Vergrößern · Info", () => {
    render(<Leiste />);
    const leiste = screen.getByRole("toolbar", { name: "Ansicht des Prozessbilds" });
    const zoom = within(leiste).getByRole("group", { name: "Zoom" });
    expect(zoom).toHaveAttribute("data-align", "end");
    expect(within(zoom).getAllByRole("button").map((b) => b.getAttribute("aria-label") ?? b.textContent)).toEqual(["Auf Pfad", "Einpassen", "Verkleinern", "Vergrößern", "Bedienung"]);
    expect(within(leiste).getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("neutral: Knöpfe der Ansicht sind grau (plain, eigene Klasse), nie gefüllt oder getönt", () => {
    render(<Leiste />);
    const leiste = screen.getByRole("toolbar");
    expect(within(leiste).getByRole("button", { name: "Auf Pfad" })).toHaveClass("prn-viewbutton");
    expect(within(leiste).getByRole("button", { name: "Verkleinern" })).toHaveClass("prn-iconbutton");
    expect(leiste.querySelectorAll("[data-variant=filled], [data-variant=tinted]")).toHaveLength(0);
  });

  it("Filter-Marke: Umschalter mit aria-pressed, Zahl im Namen", async () => {
    const onFilter = vi.fn();
    render(<Leiste onFilter={onFilter} />);
    const chip = screen.getByRole("button", { name: "Fehler 3" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(onFilter).toHaveBeenCalledWith(true);
  });

  it("Pfeiltasten wandern durch die Leiste (ein Tab-Stopp)", async () => {
    render(<Leiste />);
    await userEvent.tab();
    expect(screen.getByTestId("chip-fehler")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "begangen 12" })).toHaveFocus();
  });

  it("Zoom-Grenze: Vergrößern deaktiviert", () => {
    render(<Leiste canZoomIn={false} />);
    expect(screen.getByRole("button", { name: "Vergrößern" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Verkleinern" })).toBeEnabled();
  });

  it("CSS: rollt nie (Umbruch statt Rollbalken) und nutzt weder Leit- noch Linkfarbe", () => {
    const css = readFileSync(resolve(process.cwd(), "src/primitives/view-toolbar.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const vtb = css.match(/\.prn-vtb \{([^}]*)\}/)![1]!;
    expect(vtb).toMatch(/flex-wrap:\s*wrap/);
    expect(vtb).toMatch(/overflow:\s*visible/);
    expect(css).not.toMatch(/overflow(-x|-y)?:\s*(auto|scroll)/);
    expect(css).not.toMatch(/--prn-(accent|action|link)/);
  });
});
