/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticalTable, type AnalyticalColumn } from "./table";

/* TanStack Virtual misst per offsetWidth/offsetHeight — in jsdom immer 0.
 * Ohne messbare Höhe rendert der Virtualizer keine Body-Zeilen, daher hier
 * stubben, damit Gruppen-/Datenzeilen im Test sichtbar werden. */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() { return 600; },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() { return 800; },
  });
});

interface Row { sparte: string; betrag: number; name: string }
const DATA: Row[] = [
  { sparte: "Strom", betrag: 10, name: "A" },
  { sparte: "Strom", betrag: 30, name: "B" },
  { sparte: "Gas", betrag: 5, name: "C" },
];
const COLS: AnalyticalColumn<Row>[] = [
  { accessorKey: "sparte", header: "Sparte", groupable: true },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "betrag", header: "Betrag", align: "end", aggregate: "sum" },
];

describe("AnalyticalTable grouping", () => {
  it("renders one group row per distinct group value with a sum aggregate", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        enableGrouping
        defaultGrouping={["sparte"]}
        getRowId={(r) => r.name}
      />,
    );
    const groupRows = screen.getAllByRole("row").filter((r) => r.dataset.group !== undefined);
    expect(groupRows).toHaveLength(2); // Strom, Gas
    const strom = groupRows.find((r) => within(r).queryByText(/Strom/));
    expect(strom).toBeTruthy();
    expect(within(strom!).getByText("40")).toBeInTheDocument(); // 10 + 30
  });

  it("shows a group-by bar chip and removes grouping on chip dismiss", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable aria-label="Posten" data={DATA} columns={COLS}
        enableGrouping defaultGrouping={["sparte"]} getRowId={(r) => r.name} />,
    );
    const bar = screen.getByRole("toolbar", { name: /gruppierung/i });
    expect(within(bar).getByText("Sparte")).toBeInTheDocument();
    await user.click(within(bar).getByRole("button", { name: /sparte entfernen/i }));
    const groupRows = screen.queryAllByRole("row").filter((r) => r.dataset.group !== undefined);
    expect(groupRows).toHaveLength(0);
  });
});

describe("AnalyticalTable personalization", () => {
  it("hides a column via the personalization menu", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable aria-label="Posten" data={DATA} columns={COLS}
        enablePersonalization getRowId={(r) => r.name} />,
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /spalten/i }));
    await user.click(screen.getByRole("checkbox", { name: /name/i }));
    expect(screen.queryByRole("columnheader", { name: "Name" })).not.toBeInTheDocument();
  });

  it("pins a column sticky-left via defaultPinned", () => {
    const cols: AnalyticalColumn<Row>[] = [
      { accessorKey: "sparte", header: "Sparte", width: "120px", canPin: true, defaultPinned: "left" },
      { accessorKey: "name", header: "Name" },
    ];
    render(<AnalyticalTable aria-label="P" data={DATA} columns={cols} enablePersonalization getRowId={(r) => r.name} />);
    const head = screen.getByRole("columnheader", { name: "Sparte" });
    expect(head).toHaveAttribute("data-pinned", "left");
  });
});
