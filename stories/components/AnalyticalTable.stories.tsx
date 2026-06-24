import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AnalyticalTable,
  type AnalyticalColumn,
  type ValueState,
} from "../../packages/ui/src/index";
import "../../packages/ui/src/data/data.css";

/* ---------------- Demo-Datenmodell (MaKo-Flavor) ---------------- */

interface Tx {
  id: string;
  partner: string;
  partnerName: string;
  typ: string;
  sparte: "Strom" | "Gas";
  betrag: number;
  status: "OK" | "Fehler" | "Wartet";
  zeit: string;
  subRows?: Tx[];
}

const NAMES = ["Stadtwerke Musterstadt", "EnergieNetz AG", "GasVersorgung GmbH", "Lieferant Süd", "Netz Nord eG"];
const TYPEN = ["UTILMD", "MSCONS", "APERAK", "INVOIC", "ORDERS"];

function makeRow(i: number): Tx {
  const status: Tx["status"] = i % 7 === 0 ? "Fehler" : i % 5 === 0 ? "Wartet" : "OK";
  return {
    id: `TX-${(10000 + i).toString()}`,
    partner: `99001230${(10 + (i % 90)).toString()}`,
    partnerName: NAMES[i % NAMES.length]!,
    typ: TYPEN[i % TYPEN.length]!,
    sparte: i % 2 === 0 ? "Strom" : "Gas",
    betrag: Math.round((((i * 137) % 9000) + 100) * 100) / 100,
    status,
    zeit: `2026-06-${(10 + (i % 18)).toString().padStart(2, "0")} 0${i % 9}:${(i % 6) * 10 || "00"}`,
  };
}

function makeData(n: number): Tx[] {
  return Array.from({ length: n }, (_, i) => makeRow(i));
}

/** Baum-Daten: Marktpartner → Transaktionen. */
function makeTree(): Tx[] {
  return NAMES.map((name, g) => ({
    ...makeRow(g),
    id: `MP-${g}`,
    partnerName: name,
    typ: "—",
    subRows: Array.from({ length: 3 }, (_, j) => makeRow(g * 10 + j + 1)),
  }));
}

const fmtEUR = (v: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(v);

function StatusPill({ status }: { status: Tx["status"] }) {
  const tone = status === "OK" ? "positive" : status === "Fehler" ? "negative" : "critical";
  return (
    <span className="prn-status-badge" data-tone={tone}>
      <span className="prn-status-dot" aria-hidden />
      {status}
    </span>
  );
}

const statusToValueState = (r: Tx): ValueState =>
  r.status === "OK" ? "positive" : r.status === "Fehler" ? "negative" : "critical";

function useTxColumns(): AnalyticalColumn<Tx>[] {
  return useMemo(
    () => [
      { header: "ID", accessorKey: "id", width: "120px" },
      { header: "Marktpartner", accessorKey: "partnerName", width: "minmax(180px, 1.4fr)", groupable: true },
      { header: "Typ", accessorKey: "typ", width: "110px", groupable: true },
      { header: "Sparte", accessorKey: "sparte", width: "100px", groupable: true },
      {
        header: "Betrag",
        accessorKey: "betrag",
        align: "end",
        width: "140px",
        aggregate: "sum",
        cellRender: (r) => fmtEUR(r.betrag),
        aggregatedCellRender: ({ value }) => <strong>{fmtEUR(Number(value) || 0)}</strong>,
      },
      {
        header: "Status",
        accessorKey: "status",
        width: "120px",
        groupable: true,
        cellRender: (r) => <StatusPill status={r.status} />,
      },
      { header: "Zeit", accessorKey: "zeit", width: "150px" },
    ],
    [],
  );
}

const meta = {
  title: "Components/AnalyticalTable",
  component: AnalyticalTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Analytische Tabelle mit deklarativer Spalten-API (`AnalyticalColumn`). SAP-UI5-Paritäts-Funktionsumfang: Sortierung (inkl. `enableMultiSort`), Spalten-Filterung (`filterable`) + globaler Filter, Gruppierung & Aggregation (sum/avg/median/min/max/count/unique…), Selektion (`selectionMode` none/single/multiple, `selectionBehavior`), Spalten-Resizing & Drag-Reorder, Personalisierung (Sichtbarkeit/Reihenfolge/Pinning), Tree-Table (`isTreeTable`/`subRowsKey`), Infinite-Scroll, Zebra & Row-Highlight, responsive Pop-In, Lade-/Leer-/Overlay-Zustände, `header`/`extension`-Slots, Grid-Tastaturnavigation und ARIA-Grid-Rollen. Intern auf TanStack Table, ohne dass Konsumenten TanStack kennen müssen.",
      },
    },
  },
  argTypes: {
    selectable: { control: "boolean" },
    isLoading: { control: "boolean" },
    skeletonRows: { control: "number" },
    maxHeight: { control: "number" },
    rowHeight: { control: "number" },
    enableGrouping: { control: "boolean" },
    enablePersonalization: { control: "boolean" },
    filterable: { control: "boolean" },
    enableMultiSort: { control: "boolean" },
    alternateRowColor: { control: "boolean" },
    isTreeTable: { control: "boolean" },
  },
} satisfies Meta<typeof AnalyticalTable<Tx>>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const data = useMemo(() => makeData(40), []);
    const columns = useTxColumns();
    return <AnalyticalTable aria-label="Transaktionen" data={data} columns={columns} getRowId={(r) => r.id} />;
  },
};

export const Example: Story = {
  render: () => {
    const data = useMemo(() => makeData(40), []);
    const columns = useTxColumns();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [last, setLast] = useState<string>("—");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ font: "var(--prn-text-footnote)", color: "var(--prn-label-2)" }}>
          Ausgewählt: {selected.size} · Zuletzt geöffnet: {last}
        </div>
        <AnalyticalTable
          aria-label="Transaktionen"
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
          onRowAction={(r) => setLast(r.id)}
        />
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const columns = useTxColumns();
    return <AnalyticalTable aria-label="Lädt" data={[]} columns={columns} isLoading />;
  },
};

export const Empty: Story = {
  render: () => {
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Leer"
        data={[]}
        columns={columns}
        emptyTitle="Keine Transaktionen"
        emptyDescription="Passe die Filter an oder erweitere den Zeitraum."
      />
    );
  },
};

/* ---------------- Neue Paritäts-Features ---------------- */

export const FilteringAndGlobalSearch: Story = {
  name: "Filtering + Global Search",
  render: () => {
    const data = useMemo(() => makeData(60), []);
    const columns = useTxColumns();
    const [q, setQ] = useState("");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          aria-label="Globale Suche"
          placeholder="Globale Suche über alle Spalten…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid var(--prn-separator)", maxWidth: 360 }}
        />
        <AnalyticalTable
          aria-label="Filterbare Transaktionen"
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          filterable
          globalFilterValue={q}
          onFilter={(f) => console.log("onFilter", f)}
        />
      </div>
    );
  },
};

export const SortingMulti: Story = {
  name: "Sorting (Multi-Sort via Shift)",
  render: () => {
    const data = useMemo(() => makeData(40), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Sortierbare Transaktionen"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        enableMultiSort
        defaultSorting={[{ id: "sparte", desc: false }, { id: "betrag", desc: true }]}
        onSort={(s) => console.log("onSort", s)}
      />
    );
  },
};

export const SelectionModes: Story = {
  render: () => {
    const data = useMemo(() => makeData(20), []);
    const columns = useTxColumns();
    const [mode, setMode] = useState<"single" | "multiple">("single");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          selectionMode:
          <select value={mode} onChange={(e) => setMode(e.target.value as "single" | "multiple")}>
            <option value="single">single</option>
            <option value="multiple">multiple</option>
          </select>
        </label>
        <AnalyticalTable
          aria-label="Selektion"
          data={data}
          columns={columns}
          getRowId={(r) => r.id}
          selectionMode={mode}
          selectionBehavior="row"
          onRowSelect={(info) => console.log("onRowSelect", info.row.id, info.selected)}
        />
      </div>
    );
  },
};

export const GroupingAggregation: Story = {
  name: "Grouping + Aggregation",
  render: () => {
    const data = useMemo(() => makeData(60), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Gruppierte Transaktionen"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        enableGrouping
        defaultGrouping={["sparte"]}
        onGroup={(g) => console.log("onGroup", g)}
      />
    );
  },
};

export const Personalization: Story = {
  name: "Personalization (Visibility/Order/Pinning)",
  render: () => {
    const data = useMemo(() => makeData(40), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Personalisierbar"
        data={data}
        columns={columns.map((c, i) => ({ ...c, canPin: i < 3, canHide: true }))}
        getRowId={(r) => r.id}
        enablePersonalization
        onColumnsReorder={(o) => console.log("reorder", o)}
      />
    );
  },
};

export const ResizeAndReorder: Story = {
  name: "Column Resize + Drag Reorder",
  render: () => {
    const data = useMemo(() => makeData(30), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Resize & Reorder"
        data={data}
        columns={columns.map((c) => ({ ...c, autoResizable: true }))}
        getRowId={(r) => r.id}
        enableColumnResizing
        enableColumnReorder
        onColumnsReorder={(o) => console.log("reorder", o)}
        onAutoResize={(info) => console.log("autoResize", info)}
      />
    );
  },
};

export const TreeTable: Story = {
  render: () => {
    const data = useMemo(() => makeTree(), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Baum"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        isTreeTable
        subRowsKey="subRows"
        onRowExpandChange={(i) => console.log("expand", i.row.id, i.expanded)}
      />
    );
  },
};

export const InfiniteScroll: Story = {
  render: () => {
    const [data, setData] = useState<Tx[]>(() => makeData(30));
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Infinite Scroll"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        visibleRows={10}
        infiniteScroll
        infiniteScrollThreshold={5}
        onLoadMore={() =>
          setData((prev) => (prev.length >= 200 ? prev : [...prev, ...makeData(20).map((r, i) => ({ ...r, id: `${r.id}-${prev.length + i}` }))]))
        }
      />
    );
  },
};

export const HighlightsAndZebra: Story = {
  name: "Highlights + Zebra + Navigation",
  render: () => {
    const data = useMemo(() => makeData(30), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Highlights"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        alternateRowColor
        withRowHighlight
        highlightField={statusToValueState}
        withNavigationHighlight
        markNavigatedRow={(r) => r.status === "Fehler"}
      />
    );
  },
};

export const ResponsivePopIn: Story = {
  name: "Responsive Pop-In",
  render: () => {
    const data = useMemo(() => makeData(20), []);
    const columns: AnalyticalColumn<Tx>[] = useMemo(
      () => [
        { header: "ID", accessorKey: "id", width: "120px" },
        { header: "Marktpartner", accessorKey: "partnerName", width: "minmax(180px, 1.4fr)" },
        { header: "Typ", accessorKey: "typ", width: "110px", responsivePopIn: true, responsiveMinWidth: 700 },
        { header: "Sparte", accessorKey: "sparte", width: "100px", responsivePopIn: true, responsiveMinWidth: 600 },
        { header: "Betrag", accessorKey: "betrag", align: "end", width: "140px", cellRender: (r) => fmtEUR(r.betrag) },
        { header: "Zeit", accessorKey: "zeit", width: "150px", responsivePopIn: true, responsiveMinWidth: 800 },
      ],
      [],
    );
    return (
      <div style={{ maxWidth: 520, resize: "horizontal", overflow: "auto", border: "1px dashed var(--prn-separator)", padding: 8 }}>
        <AnalyticalTable aria-label="Pop-In" data={data} columns={columns} getRowId={(r) => r.id} />
      </div>
    );
  },
};

export const LoadingOverlay: Story = {
  name: "Loading Overlay (data + busy)",
  render: () => {
    const data = useMemo(() => makeData(20), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Overlay"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        loading
        showOverlay
        alwaysShowBusyIndicator
      />
    );
  },
};

export const HeaderAndExtension: Story = {
  name: "Header + Extension slot",
  render: () => {
    const data = useMemo(() => makeData(30), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Mit Header"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        header="Transaktionen (Juni 2026)"
        extension={
          <div style={{ display: "flex", gap: 8, padding: "4px 0" }}>
            <span className="prn-status-badge" data-tone="info">
              <span className="prn-status-dot" aria-hidden /> Live
            </span>
            <span style={{ color: "var(--prn-label-2)" }}>{data.length} Einträge</span>
          </div>
        }
      />
    );
  },
};

export const RowSubComponents: Story = {
  name: "Row Sub-Components (B13)",
  render: () => {
    const data = useMemo(() => makeData(20), []);
    const columns = useTxColumns();
    return (
      <AnalyticalTable
        aria-label="Sub-Components"
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        subComponentsBehavior="expandable"
        renderRowSubComponent={({ row }) => (
          <div style={{ display: "flex", gap: 24, font: "var(--prn-text-footnote)", color: "var(--prn-label-2)" }}>
            <span>Partner-ID: {row.partner}</span>
            <span>Typ: {row.typ}</span>
            <span>Zeit: {row.zeit}</span>
            <span>Betrag: {fmtEUR(row.betrag)}</span>
          </div>
        )}
      />
    );
  },
};

export const KitchenSink: Story = {
  render: () => {
    const data = useMemo(() => makeData(80), []);
    const columns = useTxColumns();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    return (
      <AnalyticalTable
        aria-label="Kitchen Sink"
        header="Alle Features kombiniert"
        data={data}
        columns={columns.map((c, i) => ({ ...c, canPin: i < 3 }))}
        getRowId={(r) => r.id}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        filterable
        enableMultiSort
        enableGrouping
        enablePersonalization
        alternateRowColor
        withRowHighlight
        highlightField={statusToValueState}
        visibleRows={12}
      />
    );
  },
};
