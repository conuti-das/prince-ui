import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Card, CellStack, EmptyState, KpiGrid } from "./composites";
import { AnalyticalTable, type AnalyticalColumn } from "../data/table";

describe("data-* an Card, EmptyState, KpiGrid, CellStack", () => {
  it("reicht data-* an das äußere Element durch, andere Props nicht", () => {
    render(<>
      <Card title="Aufgaben" count={3} subtitle="heute fällig" data-testid="karte" data-art="aufgaben">x</Card>
      <EmptyState title="Keine Daten" data-testid="leer" />
      <KpiGrid columns={4} data-testid="raster"><span>a</span></KpiGrid>
      <CellStack primary="Lieferbeginn" secondary="50970000019" mono wrap data-testid="zelle" />
    </>);
    expect(screen.getByTestId("karte")).toHaveAttribute("data-art", "aufgaben");
    expect(screen.getByTestId("karte").querySelector(".prn-card-count")).toHaveTextContent("3");
    expect(screen.getByText("heute fällig")).toHaveClass("prn-card-subtitle");
    expect(screen.getByTestId("leer")).toHaveClass("prn-empty");
    expect(screen.getByTestId("raster")).toHaveAttribute("data-columns", "4");
    expect(screen.getByTestId("zelle")).toHaveAttribute("data-wrap", "");
    expect(screen.getByText("50970000019")).toHaveAttribute("data-mono", "");
  });
  it("Card ohne count/subtitle bleibt wie bisher (h3 direkt im Kopf)", () => {
    render(<Card title="Titel" data-testid="k">x</Card>);
    expect(screen.getByTestId("k").querySelector(".prn-card-head > h3.prn-card-title")).not.toBeNull();
  });
  it("CellStack ohne Zweitwert rendert nur den Hauptwert", () => {
    render(<CellStack primary="A" data-testid="z" />);
    expect(screen.getByTestId("z").children).toHaveLength(1);
  });
});

interface Z { id: string; name: string; art: string }
const SPALTEN: AnalyticalColumn<Z>[] = [{ id: "name", header: "Name", width: "2fr", cellRender: (z) => z.name }, { id: "art", header: "Art", width: "200px", cellRender: (z) => z.art }];
const DATEN: Z[] = [{ id: "1", name: "Eins", art: "a" }, { id: "2", name: "Zwei", art: "b" }];

describe("AnalyticalTable fit und growing", () => {
  it("scaleWidthMode fit: jede Spalte minmax(0, …), fr bleibt Gewicht", () => {
    render(<AnalyticalTable data={DATEN} columns={SPALTEN} getRowId={(z) => z.id} accessibleName="T" scaleWidthMode="fit" />);
    expect((screen.getByRole("grid") as HTMLElement).style.gridTemplateColumns).toBe("minmax(0, 2fr) minmax(0, 1fr)");
  });
  it("growing: Stand und Mehr laden mit Offset; ohne Rest kein Knopf", () => {
    const mehr = vi.fn();
    const { rerender } = render(<AnalyticalTable data={DATEN} columns={SPALTEN} getRowId={(z) => z.id} accessibleName="T" growing={{ total: 1200, onLoadMore: mehr, moreTestId: "mehr" }} />);
    expect(screen.getByText("2 von 1.200 geladen")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("mehr"));
    expect(mehr).toHaveBeenCalledWith(2);
    rerender(<AnalyticalTable data={DATEN} columns={SPALTEN} getRowId={(z) => z.id} accessibleName="T" growing={{ total: 2, onLoadMore: mehr, moreTestId: "mehr" }} />);
    expect(screen.getByText("2 geladen")).toBeInTheDocument();
    expect(screen.queryByTestId("mehr")).toBeNull();
  });
});
