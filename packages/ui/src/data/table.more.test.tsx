/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticalTable, type AnalyticalColumn } from "./table";

/* Wie in table.test.tsx: TanStack Virtual misst per offsetWidth/offsetHeight,
 * die in jsdom sonst 0 sind und das Rendern der Body-Zeilen verhindern. */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 600;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 800;
    },
  });
});

interface Row {
  sparte: string;
  betrag: number;
  name: string;
}
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

describe("AnalyticalTable group-bar interactions", () => {
  it("adds a grouping column via the '+ Gruppieren' menu", async () => {
    const user = userEvent.setup();
    const onGroupingChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", groupable: true },
          { accessorKey: "name", header: "Name", groupable: true },
          { accessorKey: "betrag", header: "Betrag", align: "end", aggregate: "sum" },
        ]}
        enableGrouping
        onGroupingChange={onGroupingChange}
        getRowId={(r) => r.name}
      />,
    );
    const bar = screen.getByRole("toolbar", { name: /gruppierung/i });
    // Zu Beginn keine Gruppierung -> Platzhalter und kein Group-Row.
    expect(within(bar).getByText("—")).toBeInTheDocument();
    await user.click(within(bar).getByRole("button", { name: /gruppieren/i }));
    await user.click(await screen.findByRole("menuitem", { name: "Sparte" }));
    expect(onGroupingChange).toHaveBeenCalledWith(["sparte"]);
    const groupRows = screen
      .getAllByRole("row")
      .filter((r) => r.dataset.group !== undefined);
    expect(groupRows).toHaveLength(2);
  });
});

describe("AnalyticalTable column-menu interactions", () => {
  it("reorders a column via the up/down buttons", async () => {
    const user = userEvent.setup();
    const onColumnOrderChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        enablePersonalization
        onColumnOrderChange={onColumnOrderChange}
        getRowId={(r) => r.name}
      />,
    );
    const headersBefore = screen
      .getAllByRole("columnheader")
      .map((h) => h.textContent ?? "");
    // Default-Reihenfolge endet mit "Betrag".
    expect(headersBefore[headersBefore.length - 1]).toMatch(/Betrag/);

    await user.click(screen.getByRole("button", { name: /spalten/i }));
    // "Betrag" (letzte Spalte) eine Position nach oben schieben.
    await user.click(await screen.findByRole("button", { name: /betrag nach oben/i }));
    expect(onColumnOrderChange).toHaveBeenCalled();
    // Popover schließen, damit die Tabelle wieder zugänglich ist.
    await user.keyboard("{Escape}");

    const headersAfter = screen
      .getAllByRole("columnheader")
      .map((h) => h.textContent ?? "");
    expect(headersAfter[headersAfter.length - 1]).not.toMatch(/Betrag/);
  });

  it("pins and unpins a column via the menu pin buttons", async () => {
    const user = userEvent.setup();
    const onColumnPinningChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", width: "120px", canPin: true },
          { accessorKey: "name", header: "Name" },
        ]}
        enablePersonalization
        onColumnPinningChange={onColumnPinningChange}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("button", { name: /spalten/i }));
    const pinLeft = await screen.findByRole("button", { name: /sparte links pinnen/i });
    await user.click(pinLeft);
    expect(onColumnPinningChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ left: ["sparte"] }),
    );
    // Popover schließen und Header prüfen.
    await user.keyboard("{Escape}");
    expect(screen.getByRole("columnheader", { name: "Sparte" })).toHaveAttribute(
      "data-pinned",
      "left",
    );

    // Erneut öffnen und das Pinning wieder aufheben.
    await user.click(screen.getByRole("button", { name: /spalten/i }));
    await user.click(
      await screen.findByRole("button", { name: /sparte links pinnen/i }),
    );
    await user.keyboard("{Escape}");
    expect(screen.getByRole("columnheader", { name: "Sparte" })).not.toHaveAttribute(
      "data-pinned",
    );
  });
});

describe("AnalyticalTable sorting / selection / row action", () => {
  it("toggles sorting when a sortable header is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        getRowId={(r) => r.name}
      />,
    );
    const header = screen.getByRole("columnheader", { name: /Betrag/ });
    expect(header).toHaveAttribute("aria-sort", "none");
    await user.click(header);
    const firstSort = header.getAttribute("aria-sort");
    expect(["ascending", "descending"]).toContain(firstSort);
    await user.click(header);
    const secondSort = header.getAttribute("aria-sort");
    expect(["ascending", "descending"]).toContain(secondSort);
    expect(secondSort).not.toBe(firstSort);
  });

  it("fires onRowAction and toggles selection via checkboxes", async () => {
    const user = userEvent.setup();
    const onRowAction = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        selectable
        onSelectionChange={onSelectionChange}
        onRowAction={onRowAction}
        getRowId={(r) => r.name}
      />,
    );
    // Eine Datenzeile aktivieren (data-key kennzeichnet Datenzeilen).
    const dataRows = screen
      .getAllByRole("row")
      .filter((r) => r.dataset.key !== undefined && !r.dataset.group);
    await user.click(dataRows[0]!);
    expect(onRowAction).toHaveBeenCalledTimes(1);

    // Erste Zeilen-Checkbox umschalten.
    const rowCheckbox = screen.getAllByRole("checkbox", { name: /zeile auswählen/i })[0]!;
    await user.click(rowCheckbox);
    expect(onSelectionChange).toHaveBeenCalled();
  });
});

/* ---------------------------------------------------------------------------
 * Neue SAP-Paritäts-Features
 * ------------------------------------------------------------------------- */

describe("AnalyticalTable filtering (B3)", () => {
  it("filters rows via a per-column header filter", async () => {
    const user = userEvent.setup();
    const onFilter = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", filterable: true },
          { accessorKey: "name", header: "Name" },
        ]}
        onFilter={onFilter}
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getAllByRole("row").filter((r) => r.dataset.key)).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: /spalte filtern/i }));
    const input = await screen.findByRole("textbox", { name: /filterwert/i });
    await user.type(input, "Gas");
    expect(onFilter).toHaveBeenCalled();
    // Popover schließen, damit die Grid-Zeilen wieder zugänglich sind.
    await user.keyboard("{Escape}");
    const visible = screen.getAllByRole("row").filter((r) => r.dataset.key);
    expect(visible).toHaveLength(1);
  });

  it("applies globalFilterValue across columns", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        globalFilterValue="Strom"
        getRowId={(r) => r.name}
      />,
    );
    const visible = screen.getAllByRole("row").filter((r) => r.dataset.key);
    expect(visible).toHaveLength(2);
  });
});

describe("AnalyticalTable controlled sorting + onSort (B2)", () => {
  it("fires onSort and onSortingChange when a header is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    const onSortingChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        onSort={onSort}
        onSortingChange={onSortingChange}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("columnheader", { name: /Betrag/ }));
    const sortArg = onSort.mock.calls[onSort.mock.calls.length - 1]![0];
    expect(sortArg).toEqual([{ id: "betrag", desc: expect.any(Boolean) }]);
    expect(onSortingChange).toHaveBeenCalled();
  });

  it("supports multi-sort via shift-click with sort-index badges", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        enableMultiSort
        onSort={onSort}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("columnheader", { name: /Sparte/ }));
    await user.keyboard("{Shift>}");
    await user.click(screen.getByRole("columnheader", { name: /Betrag/ }));
    await user.keyboard("{/Shift}");
    const last = onSort.mock.calls[onSort.mock.calls.length - 1]![0];
    expect(last).toHaveLength(2);
  });
});

describe("AnalyticalTable selectionMode (B5)", () => {
  it("single mode allows only one selected row at a time", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
        getRowId={(r) => r.name}
      />,
    );
    const radios = screen.getAllByRole("radio", { name: /zeile auswählen/i });
    expect(radios).toHaveLength(3);
    await user.click(radios[0]!);
    await user.click(radios[1]!);
    const lastKeys = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ]![0] as Set<string>;
    expect(lastKeys.size).toBe(1);
  });

  it("selectionBehavior=row selects on row click and fires onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        selectionMode="multiple"
        selectionBehavior="row"
        onRowClick={onRowClick}
        onSelectionChange={onSelectionChange}
        getRowId={(r) => r.name}
      />,
    );
    const dataRow = screen.getAllByRole("row").find((r) => r.dataset.key)!;
    await user.click(dataRow);
    expect(onRowClick).toHaveBeenCalled();
    expect(onSelectionChange).toHaveBeenCalled();
  });
});

describe("AnalyticalTable context menu (B13)", () => {
  it("fires onRowContextMenu on right click", async () => {
    const user = userEvent.setup();
    const onRowContextMenu = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        onRowContextMenu={onRowContextMenu}
        getRowId={(r) => r.name}
      />,
    );
    const dataRow = screen.getAllByRole("row").find((r) => r.dataset.key)!;
    await user.pointer({ keys: "[MouseRight]", target: dataRow });
    expect(onRowContextMenu).toHaveBeenCalled();
  });
});

describe("AnalyticalTable column resizing (B6)", () => {
  it("renders a resize separator per resizable column", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", width: "120px" },
          { accessorKey: "name", header: "Name", width: "120px", disableResizing: true },
        ]}
        enableColumnResizing
        getRowId={(r) => r.name}
      />,
    );
    const separators = screen.getAllByRole("separator", { name: /spaltenbreite/i });
    // Nur eine Spalte ist resizable (Name ist disableResizing).
    expect(separators).toHaveLength(1);
  });
});

describe("AnalyticalTable tree-table (B8)", () => {
  interface TreeRow {
    name: string;
    betrag: number;
    subRows?: TreeRow[];
  }
  const TREE: TreeRow[] = [
    { name: "Parent", betrag: 100, subRows: [{ name: "Child", betrag: 40 }] },
  ];
  it("renders a tree chevron and expands sub-rows on click", async () => {
    const user = userEvent.setup();
    const onRowExpandChange = vi.fn();
    render(
      <AnalyticalTable<TreeRow>
        aria-label="Tree"
        data={TREE}
        columns={[
          { accessorKey: "name", header: "Name" },
          { accessorKey: "betrag", header: "Betrag", align: "end" },
        ]}
        isTreeTable
        onRowExpandChange={onRowExpandChange}
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.queryByText("Child")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /aufklappen/i }));
    expect(onRowExpandChange).toHaveBeenCalledWith(
      expect.objectContaining({ expanded: true }),
    );
    expect(screen.getByText("Child")).toBeInTheDocument();
  });
});

describe("AnalyticalTable infinite scroll (B9) + onTableScroll (B7)", () => {
  it("fires onLoadMore when scrolled near the bottom", () => {
    const onLoadMore = vi.fn();
    const onTableScroll = vi.fn();
    const { container } = render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        infiniteScroll
        infiniteScrollThreshold={20}
        onLoadMore={onLoadMore}
        onTableScroll={onTableScroll}
        getRowId={(r) => r.name}
      />,
    );
    const scroll = container.querySelector(".prn-table-scroll") as HTMLElement;
    Object.defineProperty(scroll, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(scroll, "clientHeight", { configurable: true, value: 400 });
    scroll.scrollTop = 590; // remaining = 1000 - 590 - 400 = 10 <= 20
    scroll.dispatchEvent(new Event("scroll", { bubbles: true }));
    expect(onTableScroll).toHaveBeenCalled();
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });
});

describe("AnalyticalTable highlights (B10)", () => {
  it("applies zebra and row-highlight data attributes", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        alternateRowColor
        withRowHighlight
        highlightField={(r) => (r.betrag > 20 ? "negative" : "positive")}
        getRowId={(r) => r.name}
      />,
    );
    const rows = screen.getAllByRole("row").filter((r) => r.dataset.key);
    expect(rows.some((r) => r.getAttribute("data-highlight") === "negative")).toBe(true);
    expect(rows.some((r) => r.dataset.zebra !== undefined)).toBe(true);
  });

  /* Regression: Zusatz-„Spalten" (Select-Checkbox, withRowHighlight-Band,
   * withNavigationHighlight-Pfeil) müssen in Header UND jeder Datenzeile als
   * konsistente Grid-Tracks berücksichtigt werden. Andernfalls verrutscht der
   * Body um eine Zelle (ID landet in Marktpartner) und die Zeilenhöhe verdoppelt
   * sich. Header- und Body-Track-Anzahl müssen exakt übereinstimmen und der
   * grid-template-columns-Track-Anzahl entsprechen. */
  it("keeps header and body grid tracks consistent with select + highlight + nav", () => {
    render(
      <AnalyticalTable
        aria-label="Tracks"
        data={DATA}
        columns={COLS}
        selectable
        withRowHighlight
        highlightField={() => "positive"}
        withNavigationHighlight
        markNavigatedRow={() => true}
        getRowId={(r) => r.name}
      />,
    );

    const grid = document.querySelector(".prn-table-grid") as HTMLElement;
    expect(grid).toBeTruthy();

    // grid-template-columns: Highlight-Track + Select + 3 Datenspalten + Nav = 6
    const template = grid.style.gridTemplateColumns.trim();
    const trackCount = template.split(/\s+/).filter(Boolean).length;
    expect(trackCount).toBe(6);

    // Header: Highlight-Platzhalter + Select-Header + 3 Spalten-Header + Nav = 6
    const head = grid.querySelector(".prn-table-head") as HTMLElement;
    const headChildren = head.children.length;
    expect(headChildren).toBe(trackCount);

    // Jede Datenzeile rendert dieselbe Anzahl direkter Grid-Kinder:
    // Highlight-Band-Span + Select-Zelle + 3 Datenzellen + Nav-Zelle = 6
    const bodyRows = Array.from(grid.querySelectorAll<HTMLElement>(".prn-table-row")).filter(
      (r) => (r as HTMLElement).dataset.key,
    );
    expect(bodyRows.length).toBeGreaterThan(0);
    for (const row of bodyRows) {
      expect(row.children.length).toBe(trackCount);
    }

    // Das Highlight-Band ist das ERSTE Grid-Kind jeder Zeile (führender Track),
    // gefolgt von der Select-Zelle — sonst landen Datenwerte in der falschen Spalte.
    const first = bodyRows[0]!;
    expect(first.children[0]).toHaveClass("prn-row-highlight");
    expect(first.children[1]).toHaveClass("prn-td-select");
    // Die Navigations-Zelle ist das LETZTE Grid-Kind.
    expect(first.children[first.children.length - 1]).toHaveClass("prn-td-nav");
  });

  /* Regression: Pop-In-Spalten werden NICHT als eigene Zelle gerendert und dürfen
   * daher auch keinen eigenen Grid-Track erhalten — sonst gibt es mehr Tracks als
   * Zellen und der Body verschiebt sich (ID-Spalte bleibt leer). */
  it("excludes popped-in columns from grid tracks so header and body stay aligned", () => {
    const cols: AnalyticalColumn<Row>[] = [
      { accessorKey: "name", header: "Name", width: "120px" },
      { accessorKey: "sparte", header: "Sparte", width: "100px", responsivePopIn: true, responsiveMinWidth: 9999 },
      { accessorKey: "betrag", header: "Betrag", width: "100px" },
    ];
    render(
      <AnalyticalTable
        aria-label="PopInTracks"
        data={DATA}
        columns={cols}
        tableWidth={300}
        getRowId={(r) => r.name}
      />,
    );
    const grid = document.querySelector(".prn-table-grid") as HTMLElement;
    const trackCount = grid.style.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length;
    // Sparte ist eingeklappt → nur 2 gerenderte Spalten → 2 Tracks.
    expect(trackCount).toBe(2);
    const head = grid.querySelector(".prn-table-head") as HTMLElement;
    expect(head.children.length).toBe(trackCount);
    const bodyRows = Array.from(grid.querySelectorAll<HTMLElement>(".prn-table-row")).filter(
      (r) => (r as HTMLElement).dataset.key,
    );
    for (const row of bodyRows) {
      expect(row.children.length).toBe(trackCount);
    }
  });
});

describe("AnalyticalTable loading / empty (B12)", () => {
  it("shows a busy indicator when alwaysShowBusyIndicator is set", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        loading
        alwaysShowBusyIndicator
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getByRole("status", { name: /lädt/i })).toBeInTheDocument();
  });

  it("renders NoDataComponent with filtered reason when a filter hides all rows", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        globalFilterValue="zzz-nichts"
        NoDataComponent={({ reason }) => <div>Grund: {reason}</div>}
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getByText("Grund: filtered")).toBeInTheDocument();
  });
});

describe("AnalyticalTable aggregates (B4)", () => {
  it("computes uniqueCount and median aggregates", () => {
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", groupable: true },
          { accessorKey: "name", header: "Name", aggregate: "uniqueCount" },
          { accessorKey: "betrag", header: "Betrag", align: "end", aggregate: "median" },
        ]}
        enableGrouping
        defaultGrouping={["sparte"]}
        getRowId={(r) => r.name}
      />,
    );
    const groupRows = screen.getAllByRole("row").filter((r) => r.dataset.group !== undefined);
    const strom = groupRows.find((r) => within(r).queryByText(/Strom/))!;
    // Strom: name uniqueCount = 2 (A, B); betrag median von [10,30] = 20
    expect(within(strom).getByText("2")).toBeInTheDocument();
    expect(within(strom).getByText("20")).toBeInTheDocument();
  });
});

describe("AnalyticalTable header / extension / a11y (B14)", () => {
  it("renders a visible header title and extension slot, and grid ARIA roles", () => {
    render(
      <AnalyticalTable
        data={DATA}
        columns={COLS}
        header="Buchungsposten"
        extension={<div>Toolbar-Slot</div>}
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getByText("Buchungsposten")).toBeInTheDocument();
    expect(screen.getByText("Toolbar-Slot")).toBeInTheDocument();
    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("aria-labelledby", "prn-table-title");
    expect(grid).toHaveAttribute("aria-colcount");
  });

  it("supports keyboard cell navigation with arrow keys (roving tabindex)", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        getRowId={(r) => r.name}
      />,
    );
    const cells = screen.getAllByRole("gridcell");
    const first = cells.find((c) => c.getAttribute("data-rowidx") === "0" && c.getAttribute("data-colidx") === "0")!;
    first.focus();
    expect(first).toHaveAttribute("tabindex", "0");
    await user.keyboard("{ArrowRight}");
    const next = screen.getAllByRole("gridcell").find(
      (c) => c.getAttribute("data-rowidx") === "0" && c.getAttribute("data-colidx") === "1",
    )!;
    expect(next).toHaveAttribute("tabindex", "0");
  });
});

describe("AnalyticalTable extensibility (B14.4)", () => {
  it("exposes the TanStack instance via onTableReady", () => {
    const onTableReady = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Posten"
        data={DATA}
        columns={COLS}
        onTableReady={onTableReady}
        getRowId={(r) => r.name}
      />,
    );
    expect(onTableReady).toHaveBeenCalledTimes(1);
    const instance = onTableReady.mock.calls[0]![0];
    expect(typeof instance.getRowModel).toBe("function");
  });
});

/* ---------------------------------------------------------------------------
 * Bugfixes + neue SAP-Paritäts-Features (Runde 3)
 * ------------------------------------------------------------------------- */

describe("AnalyticalTable responsive pop-in (B11) — BUGFIX MED-1", () => {
  const popCols: AnalyticalColumn<Row>[] = [
    { accessorKey: "name", header: "Name", width: "120px" },
    { accessorKey: "sparte", header: "Sparte", width: "100px", responsivePopIn: true, responsiveMinWidth: 600 },
    { accessorKey: "betrag", header: "Betrag", width: "100px", responsivePopIn: true, responsiveMinWidth: 800 },
  ];

  it("keeps pop-in columns visible above the threshold", () => {
    render(
      <AnalyticalTable
        aria-label="PopIn"
        data={DATA}
        columns={popCols}
        tableWidth={1000}
        getRowId={(r) => r.name}
      />,
    );
    // Über allen Schwellen: alle drei Header sichtbar, keine Pop-In-Items.
    expect(screen.getByRole("columnheader", { name: "Sparte" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Betrag" })).toBeInTheDocument();
    expect(document.querySelectorAll(".prn-popin")).toHaveLength(0);
  });

  it("pops columns into the first cell when width drops below the threshold", () => {
    render(
      <AnalyticalTable
        aria-label="PopIn"
        data={DATA}
        columns={popCols}
        tableWidth={500}
        getRowId={(r) => r.name}
      />,
    );
    // < 600 und < 800 → beide Pop-In-Spalten eingeklappt, Header verschwunden.
    expect(screen.queryByRole("columnheader", { name: "Sparte" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Betrag" })).not.toBeInTheDocument();
    // Pop-In-Container in jeder Datenzeile vorhanden.
    expect(document.querySelectorAll(".prn-popin").length).toBeGreaterThan(0);
    // Das Pop-In-Label trägt den Spaltentitel.
    expect(document.querySelector(".prn-popin-label")?.textContent).toMatch(/Sparte|Betrag/);
  });
});

describe("AnalyticalTable onRowSelect.selectedKeys (B5) — BUGFIX", () => {
  it("delivers the authoritative selectedKeys set (not empty) in multiple mode", async () => {
    const user = userEvent.setup();
    const onRowSelect = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Sel"
        data={DATA}
        columns={COLS}
        selectionMode="multiple"
        selectionBehavior="row"
        onRowSelect={onRowSelect}
        getRowId={(r) => r.name}
      />,
    );
    const dataRows = screen.getAllByRole("row").filter((r) => r.dataset.key && !r.dataset.group);
    await user.click(dataRows[0]!); // A
    await user.click(dataRows[1]!); // B
    const last = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1]![0];
    expect(last.selected).toBe(true);
    expect(last.selectedKeys).toBeInstanceOf(Set);
    // Beide Zeilen müssen im autoritativen Set enthalten sein.
    expect(last.selectedKeys.has("A")).toBe(true);
    expect(last.selectedKeys.has("B")).toBe(true);
    expect(last.selectedKeys.size).toBe(2);
  });

  it("returns only the new key in single mode", async () => {
    const user = userEvent.setup();
    const onRowSelect = vi.fn();
    render(
      <AnalyticalTable
        aria-label="Sel"
        data={DATA}
        columns={COLS}
        selectionMode="single"
        selectionBehavior="row"
        onRowSelect={onRowSelect}
        getRowId={(r) => r.name}
      />,
    );
    const dataRows = screen.getAllByRole("row").filter((r) => r.dataset.key && !r.dataset.group);
    await user.click(dataRows[0]!);
    const call = onRowSelect.mock.calls[onRowSelect.mock.calls.length - 1]![0];
    expect(call.selectedKeys.has("A")).toBe(true);
    expect(call.selectedKeys.size).toBe(1);
  });
});

describe("AnalyticalTable headerLabel (B1.4)", () => {
  it("exposes headerLabel as the columnheader aria-label", () => {
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "⚡", headerLabel: "Sparte (Energieart)" },
          { accessorKey: "name", header: "Name" },
        ]}
        getRowId={(r) => r.name}
      />,
    );
    // Über das aria-label adressierbar, obwohl der sichtbare Header "⚡" ist.
    expect(
      screen.getByRole("columnheader", { name: "Sparte (Energieart)" }),
    ).toBeInTheDocument();
  });
});

describe("AnalyticalTable headerRowHeight (B7.3)", () => {
  it("applies headerRowHeight to the header cells", () => {
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={COLS}
        headerRowHeight={72}
        getRowId={(r) => r.name}
      />,
    );
    const head = screen.getByRole("columnheader", { name: "Sparte" });
    expect(head.style.height).toBe("72px");
  });
});

describe("AnalyticalTable disableGlobalFilter per column (B3)", () => {
  it("matches a column included in the global filter (baseline)", () => {
    // "Strom" steht nur in der Spalte sparte; ohne Ausnahme matchen 2 Zeilen.
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte" },
          { accessorKey: "name", header: "Name" },
        ]}
        globalFilterValue="Strom"
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getAllByRole("row").filter((r) => r.dataset.key)).toHaveLength(2);
  });

  it("excludes a column from the global filter when disableGlobalFilter is set", () => {
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", disableGlobalFilter: true },
          { accessorKey: "name", header: "Name" },
        ]}
        globalFilterValue="Strom"
        getRowId={(r) => r.name}
      />,
    );
    // sparte ausgenommen → "Strom" matcht in keiner durchsuchten Spalte.
    expect(screen.queryAllByRole("row").filter((r) => r.dataset.key)).toHaveLength(0);
  });
});

describe("AnalyticalTable autoResizable + onAutoResize (B6)", () => {
  it("calls onAutoResize on double-click of an autoResizable resizer", async () => {
    const user = userEvent.setup();
    const onAutoResize = vi.fn();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", width: "120px", autoResizable: true },
          { accessorKey: "name", header: "Name", width: "120px", disableResizing: true },
        ]}
        enableColumnResizing
        onAutoResize={onAutoResize}
        getRowId={(r) => r.name}
      />,
    );
    const resizer = screen.getByRole("separator", { name: /spaltenbreite/i });
    expect(resizer).toHaveAttribute("data-autoresizable");
    await user.dblClick(resizer);
    expect(onAutoResize).toHaveBeenCalledTimes(1);
    expect(onAutoResize.mock.calls[0]![0]).toMatchObject({ columnId: "sparte" });
    expect(typeof onAutoResize.mock.calls[0]![0].width).toBe("number");
  });
});

describe("AnalyticalTable resize + reorder enabled (story MED-2)", () => {
  it("renders resizer handles AND draggable headers when both props are set", () => {
    // Spiegelt die Story 'ResizeAndReorder' (enableColumnResizing + enableColumnReorder).
    render(
      <AnalyticalTable
        aria-label="Resize & Reorder"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", width: "120px" },
          { accessorKey: "name", header: "Name", width: "120px" },
          { accessorKey: "betrag", header: "Betrag", width: "120px", align: "end" },
        ]}
        enableColumnResizing
        enableColumnReorder
        getRowId={(r) => r.name}
      />,
    );
    // Resizer landen im DOM (einer pro resizebarer Spalte).
    const resizers = screen.getAllByRole("separator", { name: /spaltenbreite/i });
    expect(resizers.length).toBe(3);
    // Header sind draggable.
    const draggable = screen
      .getAllByRole("columnheader")
      .filter((h) => h.getAttribute("draggable") === "true");
    expect(draggable.length).toBe(3);
  });
});

describe("AnalyticalTable renderRowSubComponent (B13.1)", () => {
  it("renders an expandable sub-component on toggle", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={COLS}
        renderRowSubComponent={({ row }) => <div>Detail-{row.name}</div>}
        getRowId={(r) => r.name}
      />,
    );
    // Expandable: zunächst nicht sichtbar.
    expect(screen.queryByText("Detail-A")).not.toBeInTheDocument();
    const toggles = screen.getAllByRole("button", { name: /details anzeigen/i });
    await user.click(toggles[0]!);
    expect(screen.getByText("Detail-A")).toBeInTheDocument();
  });

  it("renders the sub-component immediately when behavior=visible", () => {
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={COLS}
        renderRowSubComponent={({ row }) => <div>Detail-{row.name}</div>}
        subComponentsBehavior="visible"
        getRowId={(r) => r.name}
      />,
    );
    expect(screen.getByText("Detail-A")).toBeInTheDocument();
    expect(screen.getByText("Detail-B")).toBeInTheDocument();
  });
});

describe("AnalyticalTable custom Filter slot (B3) + Popover header slot (B1.5)", () => {
  it("renders a custom Filter render slot in the header popover", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          {
            accessorKey: "sparte",
            header: "Sparte",
            filterable: true,
            Filter: ({ setValue }) => (
              <button type="button" onClick={() => setValue("Gas")}>
                Nur Gas
              </button>
            ),
          },
          { accessorKey: "name", header: "Name" },
        ]}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("button", { name: /spalte filtern/i }));
    await user.click(await screen.findByRole("button", { name: "Nur Gas" }));
    await user.keyboard("{Escape}");
    expect(screen.getAllByRole("row").filter((r) => r.dataset.key)).toHaveLength(1);
  });

  it("renders a custom header Popover slot", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", Popover: () => <div>Spalten-Hilfe</div> },
          { accessorKey: "name", header: "Name" },
        ]}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("button", { name: /spalteninfo/i }));
    expect(await screen.findByText("Spalten-Hilfe")).toBeInTheDocument();
  });
});

describe("AnalyticalTable sortDescFirst / sortInverted (B2)", () => {
  it("sorts descending first when sortDescFirst is set", async () => {
    const user = userEvent.setup();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "betrag", header: "Betrag", align: "end", sortDescFirst: true },
          { accessorKey: "name", header: "Name" },
        ]}
        getRowId={(r) => r.name}
      />,
    );
    const header = screen.getByRole("columnheader", { name: /Betrag/ });
    await user.click(header);
    expect(header).toHaveAttribute("aria-sort", "descending");
  });
});

describe("AnalyticalTable aggregateValue resolver (B4)", () => {
  it("aggregates using aggregateValue instead of the raw cell value", () => {
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={[
          { accessorKey: "sparte", header: "Sparte", groupable: true },
          // Roh-Wert ist betrag; aggregateValue verdoppelt ihn vor der Summe.
          {
            accessorKey: "betrag",
            header: "Betrag",
            align: "end",
            aggregate: "sum",
            aggregateValue: (r) => r.betrag * 2,
          },
        ]}
        enableGrouping
        defaultGrouping={["sparte"]}
        getRowId={(r) => r.name}
      />,
    );
    const groupRows = screen.getAllByRole("row").filter((r) => r.dataset.group !== undefined);
    const strom = groupRows.find((r) => within(r).queryByText(/Strom/))!;
    // (10 + 30) * 2 = 80
    expect(within(strom).getByText("80")).toBeInTheDocument();
  });
});

describe("AnalyticalTable reactTableOptions merge (B14.4)", () => {
  it("preserves internal state/handlers and composes external onSortingChange", async () => {
    const user = userEvent.setup();
    const external = vi.fn();
    const onSort = vi.fn();
    render(
      <AnalyticalTable
        aria-label="P"
        data={DATA}
        columns={COLS}
        onSort={onSort}
        reactTableOptions={{ onSortingChange: external }}
        getRowId={(r) => r.name}
      />,
    );
    await user.click(screen.getByRole("columnheader", { name: /Betrag/ }));
    // Interner Handler bleibt erhalten (Sortierung greift + onSort feuert) ...
    expect(onSort).toHaveBeenCalled();
    const header = screen.getByRole("columnheader", { name: /Betrag/ });
    expect(["ascending", "descending"]).toContain(header.getAttribute("aria-sort"));
    // ... UND der externe Handler wird zusätzlich aufgerufen (Komposition).
    expect(external).toHaveBeenCalled();
  });
});

describe("AnalyticalTable nested accessor + minWidth (B1)", () => {
  interface Nested {
    id: string;
    info: { hobby: string };
  }
  it("resolves dotted accessor paths", () => {
    const data: Nested[] = [{ id: "1", info: { hobby: "Segeln" } }];
    render(
      <AnalyticalTable<Nested>
        aria-label="Nested"
        data={data}
        columns={[
          { accessorKey: "id", header: "ID" },
          { accessorKey: "info.hobby", header: "Hobby", minWidth: 100 },
        ]}
        getRowId={(r) => r.id}
      />,
    );
    expect(screen.getByText("Segeln")).toBeInTheDocument();
  });
});
