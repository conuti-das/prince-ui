import "@testing-library/jest-dom/vitest";
import { beforeAll, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticalTable, type AnalyticalColumn } from "./table";

interface Z { id: string; name: string; offen: boolean }
const daten: Z[] = [{ id: "a", name: "Senden", offen: true }, { id: "b", name: "Prüfen", offen: false }];
const spalten: AnalyticalColumn<Z>[] = [{ id: "name", header: "Schritt", accessorKey: "name" }];

/* TanStack Virtual misst in jsdom 0 – wie in table.test.tsx stubben, damit Body-Zeilen rendern */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", { configurable: true, get() { return 600; } });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get() { return 800; } });
});

describe("AnalyticalTable rowActions", () => {
  it("rendert Aktionen am Zeilenende, Klick löst nur die Aktion aus, nicht onRowAction", async () => {
    const onRowAction = vi.fn();
    const wiederholen = vi.fn();
    render(
      <AnalyticalTable<Z> data={daten} columns={spalten} getRowId={(z) => z.id} onRowAction={onRowAction}
        rowActions={(z) => [{ id: "wdh", label: "Wiederholen", icon: "bolt", onAction: () => wiederholen(z.id), hidden: !z.offen, "data-testid": "wdh" }]} />,
    );
    const knoepfe = screen.getAllByTestId("wdh");
    expect(knoepfe).toHaveLength(1); // Zeile b: verborgen (Platzhalter)
    expect(knoepfe[0]).toHaveAccessibleName("Wiederholen");
    await userEvent.click(knoepfe[0]!);
    expect(wiederholen).toHaveBeenCalledWith("a");
    expect(onRowAction).not.toHaveBeenCalled();
  });

  it("Enter auf dem Aktionsknopf löst nur die Aktion aus", async () => {
    const onRowAction = vi.fn();
    const aktion = vi.fn();
    render(<AnalyticalTable<Z> data={daten} columns={spalten} getRowId={(z) => z.id} onRowAction={onRowAction} rowActions={() => [{ id: "x", label: "Öffnen", onAction: aktion }]} />);
    const knopf = screen.getAllByRole("button", { name: "Öffnen" })[0]!;
    knopf.focus();
    await userEvent.keyboard("{Enter}");
    expect(aktion).toHaveBeenCalledOnce();
    expect(onRowAction).not.toHaveBeenCalled();
  });

  it("Aktionsspalte mit unsichtbarem Namen im Kopf; Text-Aktion ohne Icon, gesperrte Aktion", () => {
    render(<AnalyticalTable<Z> data={daten} columns={spalten} getRowId={(z) => z.id} rowActionsLabel="Aktionen der Zeile"
      rowActions={(z) => [{ id: "t", label: "Übernehmen", onAction: () => {}, disabled: !z.offen }]} />);
    expect(screen.getByRole("columnheader", { name: "Aktionen der Zeile" })).toBeInTheDocument();
    const zeilen = screen.getAllByRole("row").slice(1);
    expect(within(zeilen[0]!).getByRole("button", { name: "Übernehmen" })).toBeEnabled();
    expect(within(zeilen[1]!).getByRole("button", { name: "Übernehmen" })).toBeDisabled();
  });
});
