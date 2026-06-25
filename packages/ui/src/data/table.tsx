import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type GroupingState,
  type ExpandedState,
  type VisibilityState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ColumnFiltersState,
  type FilterFn,
  type AggregationFn,
  type Row,
  type RowData,
  type Column,
  type Table,
  type TableOptions,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { DialogTrigger } from "react-aria-components";
import { Checkbox, Button, TextField } from "../primitives/forms";
import { Menu, MenuItem, Popover } from "../primitives/overlays";
import { cx } from "../utils";
import { Icon } from "../icons/icons";
import "./data.css";
import "./table.css";

/* Spalten-Metadaten (Ausrichtung/Breite) typsicher an TanStack koppeln. */
interface ColMeta {
  align?: "start" | "end";
  vAlign?: "top" | "middle" | "bottom";
  width?: string;
  minWidth?: number;
  maxWidth?: number;
  isSelect?: boolean;
  isTree?: boolean;
  headerTooltip?: string;
  headerLabel?: string;
  cellLabel?: string;
  responsivePopIn?: boolean;
  responsiveMinWidth?: number;
  popinDisplay?: "block" | "inline";
  autoResizable?: boolean;
  /** Custom-Filter-Render-Slot (per-Spalte). */
  renderFilter?: (info: {
    value: string;
    setValue: (v: string | undefined) => void;
  }) => ReactNode;
  /** Custom-Header-Popover-Inhalt (per-Spalte). */
  renderHeaderPopover?: () => ReactNode;
}
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> extends ColMeta {}
}

/* ---------------- Spalten-Definition (Prince-API) ----------------
 * Schlanke, deklarative Spalten-Beschreibung. Intern in TanStack
 * ColumnDef übersetzt — Konsumenten brauchen TanStack nicht zu kennen. */

export type AggregateType =
  | "sum"
  | "count"
  | "avg"
  | "min"
  | "max"
  | "minMax"
  | "median"
  | "unique"
  | "uniqueCount";

export type SortType = "alphanumeric" | "basic" | "datetime";

export type ColumnFilterType = "text" | "exactText" | "exactTextCase" | "equals";

export interface AnalyticalColumn<T> {
  /** Stabile ID. Default: `accessorKey` falls gesetzt. */
  id?: string;
  /** Spaltenüberschrift. */
  header: ReactNode;
  /** Feldname für den Standard-Wert (typsicher gegen T). Unterstützt nested paths "info.hobby". */
  accessorKey?: (keyof T & string) | string;
  /** Eigener Wert-Resolver (überschreibt accessorKey für die Anzeige). */
  accessor?: (row: T) => unknown;
  /** Eigenes Zell-Rendering. */
  cellRender?: (row: T) => ReactNode;
  /** Feste/Initial-Breite, z. B. `120px`, `1fr`, `minmax(120px, 1fr)`. Default `1fr`. */
  width?: string;
  /** Mindestbreite in px (für Resizing/minmax). */
  minWidth?: number;
  /** Maximalbreite in px. */
  maxWidth?: number;
  /** Ausrichtung. `end` aktiviert tabular-nums (für Zahlen). */
  align?: "start" | "end";
  /** Vertikale Ausrichtung der Zelle. */
  vAlign?: "top" | "middle" | "bottom";
  /** Sortierung erlauben (Default true). */
  sortable?: boolean;
  /** Sortierung pro Spalte deaktivieren (Alias zu sortable:false). */
  disableSortBy?: boolean;
  /** Sortier-Typ. */
  sortType?: SortType;
  /** Bei erstem Klick absteigend statt aufsteigend sortieren (B2). */
  sortDescFirst?: boolean;
  /** Sortier-Richtung invertieren (asc↔desc), z. B. für Rang/Score (B2). */
  sortInverted?: boolean;
  /** Filterung pro Spalte erlauben (Default: globales `filterable`). */
  filterable?: boolean;
  /** Filterung pro Spalte deaktivieren. */
  disableFilters?: boolean;
  /** Spalte aus dem globalen Filter ausnehmen (B3). */
  disableGlobalFilter?: boolean;
  /** Filter-Vergleichsfunktion. Default "text". */
  filter?: ColumnFilterType;
  /** Eigener Filter-Render-Slot im Header-Popover (überschreibt das TextField). */
  Filter?: (info: {
    value: string;
    setValue: (v: string | undefined) => void;
  }) => ReactNode;
  /** Freier Custom-Popover-Inhalt am Spaltenkopf (B1.5). */
  Popover?: () => ReactNode;
  /** Spalte darf gruppiert werden. */
  groupable?: boolean;
  /** Resizing pro Spalte deaktivieren. */
  disableResizing?: boolean;
  /** Doppelklick auf den Resizer passt die Breite an den Inhalt an (B6). */
  autoResizable?: boolean;
  /** Drag&Drop-Reorder pro Spalte deaktivieren. */
  disableDragAndDrop?: boolean;
  /** Aggregation je Gruppe für diese Spalte. */
  aggregate?:
    | AggregateType
    | ((values: unknown[], rows: T[]) => unknown);
  /** Vorberechnung des Aggregat-Werts vor der Aggregation (B4). */
  aggregateValue?: (row: T) => unknown;
  /** Eigenes Rendering des Aggregat-Werts. */
  aggregatedCellRender?: (info: { value: unknown; rows: T[] }) => ReactNode;
  /** Darf ausgeblendet werden (Default true). */
  canHide?: boolean;
  /** Darf gepinnt werden (Default false). */
  canPin?: boolean;
  /** Initiale Pin-Seite. */
  defaultPinned?: "left" | "right";
  /** Tooltip am Spaltenkopf. */
  headerTooltip?: string;
  /** Barrierefreies Label für die Spalte (überschreibt header für a11y). */
  headerLabel?: string;
  /** Barrierefreies Label pro Zelle. */
  cellLabel?: string;
  /** Klappt diese Spalte in die erste Zelle, wenn die Tabelle schmal wird. */
  responsivePopIn?: boolean;
  /** Tabellenbreite (px), unter der diese Spalte zur Pop-In wird. */
  responsiveMinWidth?: number;
  /** Anzeigeform im Pop-In. */
  popinDisplay?: "block" | "inline";
}

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "row" | "rowOnly" | "rowSelector";
export type VisibleRowCountMode = "fixed" | "auto" | "autoWithEmptyRows";
export type ValueState = "none" | "information" | "positive" | "critical" | "negative";
export type NoDataReason = "empty" | "filtered";
export type SubComponentsBehavior = "expandable" | "visible";
export type ScaleWidthMode = "default" | "smart" | "grow";

export interface AnalyticalTableProps<T> {
  /** Datenzeilen. */
  data: T[];
  /** Spalten-Beschreibung. */
  columns: AnalyticalColumn<T>[];
  /** Eindeutige Zeilen-ID (für Selektion/Keys). Default: Array-Index. */
  getRowId?: (row: T, index: number) => string;

  /* ---- Selektion (B5) ---- */
  /** Selektionsmodus. */
  selectionMode?: SelectionMode;
  /** Selektionsverhalten: row = ganze Zeile selektiert + onRowClick; rowSelector = nur über Checkbox. */
  selectionBehavior?: SelectionBehavior;
  /** Alias auf selectionMode="multiple" (rückwärtskompatibel). */
  selectable?: boolean;
  /** Kontrollierte Auswahl (Set ausgewählter Row-IDs). */
  selectedKeys?: Set<string>;
  /** Callback bei Auswahländerung. */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Selektions-Event. */
  onRowSelect?: (info: { row: T; selected: boolean; selectedKeys: Set<string> }) => void;
  /** Aktion bei Zeilen-Aktivierung (Klick/Enter/Space) — rückwärtskompatibel. */
  onRowAction?: (row: T) => void;
  /** Klick-Event auf eine Zeile (mit Event-Objekt). */
  onRowClick?: (info: { row: T; event: ReactMouseEvent }) => void;
  /** Rechtsklick-Kontextmenü auf eine Zeile. */
  onRowContextMenu?: (info: { row: T; event: ReactMouseEvent }) => void;

  /* ---- Sortierung (B2) ---- */
  /** Globales Sortier-Flag (Default true für Spalten ohne explizites sortable). */
  sortable?: boolean;
  /** Kontrollierte Sortierung. */
  sorting?: { id: string; desc: boolean }[];
  /** Anfangs-Sortierung (unkontrolliert). */
  defaultSorting?: { id: string; desc: boolean }[];
  /** Callback bei Sortier-Änderung (controlled-Pattern). */
  onSortingChange?: (sorting: { id: string; desc: boolean }[]) => void;
  /** Sort-Event. */
  onSort?: (sorting: { id: string; desc: boolean }[]) => void;
  /** Multi-Sort via Shift-Klick. */
  enableMultiSort?: boolean;

  /* ---- Filterung (B3) ---- */
  /** Spaltenfilter global aktivieren (Header-Popover). */
  filterable?: boolean;
  /** Globaler Filter über alle Zeilen. */
  globalFilterValue?: string;
  /** Callback bei Filter-Änderung (Spaltenfilter). */
  onFilter?: (filters: { id: string; value: string }[]) => void;

  /* ---- Loading / Empty (B12) ---- */
  /** Ladezustand. */
  loading?: boolean;
  /** Alias auf loading (rückwärtskompatibel). */
  isLoading?: boolean;
  /** Verzögerung in ms, bevor der Ladeindikator erscheint. */
  loadingDelay?: number;
  /** BusyIndicator statt Skeleton anzeigen. */
  alwaysShowBusyIndicator?: boolean;
  /** Halbtransparentes Overlay über vorhandenen Daten. */
  showOverlay?: boolean;
  /** Anzahl Skeleton-Zeilen (Default 8). */
  skeletonRows?: number;
  /** Leerzustands-Titel (rückwärtskompatibel). */
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Text im Leerzustand (`noDataText`). */
  noDataText?: ReactNode;
  /** Eigene Leerzustands-Komponente. */
  NoDataComponent?: (info: { reason: NoDataReason }) => ReactNode;

  /* ---- Zeilen-Rendering & Höhe (B7) ---- */
  /** Geschätzte Zeilenhöhe für die Virtualisierung (Default 44). */
  rowHeight?: number;
  /** Höhe der Kopfzeile (px). */
  headerRowHeight?: number;
  /** Anzahl sichtbarer Zeilen → bestimmt die Tabellenhöhe. */
  visibleRows?: number;
  /** Mindestzeilenzahl (Leerzeilen-Auffüllung). */
  minRows?: number;
  /** Höhenmodus. */
  visibleRowCountMode?: VisibleRowCountMode;
  /** Overscan der Virtualisierung (Default 10). */
  overscanCount?: number;
  /** Scroll-Event des Viewports. */
  onTableScroll?: (info: { scrollTop: number; scrollLeft: number }) => void;
  /** Max. Höhe des Scroll-Viewports (Fallback, wenn keine visibleRows). Default `480px`. */
  maxHeight?: number | string;

  /* ---- Tree-Table (B8) ---- */
  /** Aktiviert hierarchische Zeilen. */
  isTreeTable?: boolean;
  /** Feld, das Kindzeilen enthält (Default "subRows"). */
  subRowsKey?: string;
  /** Callback bei Expand/Collapse einer Zeile. */
  onRowExpandChange?: (info: { row: T; expanded: boolean }) => void;

  /* ---- Infinite Scroll (B9) ---- */
  /** Aktiviert Nachladen beim Scrollen. */
  infiniteScroll?: boolean;
  /** Abstand (px) vom Ende, ab dem onLoadMore feuert (Default 20). */
  infiniteScrollThreshold?: number;
  /** Callback zum Nachladen. */
  onLoadMore?: () => void;

  /* ---- Highlights & Navigation (B10) ---- */
  /** Zebra-Streifen. */
  alternateRowColor?: boolean;
  /** Farbband links je Zeile (ValueState). */
  withRowHighlight?: boolean;
  /** Feld, das die ValueState pro Zeile liefert. */
  highlightField?: (row: T) => ValueState;
  /** Navigations-Pfeil-Spalte aktivieren. */
  withNavigationHighlight?: boolean;
  /** Markiert die navigierte Zeile (true = Pfeil hervorgehoben). */
  markNavigatedRow?: (row: T) => boolean;

  /* ---- Responsive Pop-In (B11) ---- */
  /** Aktuelle Tabellenbreite (px) für Pop-In-Berechnung (Test-/SSR-Hilfe). */
  tableWidth?: number;

  /* ---- Header / Extension / A11y (B14) ---- */
  /** Sichtbarer Tabellen-Titel (auch accessible name). */
  header?: ReactNode;
  /** Bereich über der Tabelle (Toolbar/FilterBar). */
  extension?: ReactNode;
  /** Transluzente Glas-Optik auf der Tabellen-Toolbar (NICHT auf den dichten Zeilen). */
  glass?: boolean;
  /** Barrierefreies Label der Tabelle. */
  accessibleName?: string;
  /** ID eines Elements als aria-labelledby. */
  accessibleNameRef?: string;
  className?: string;
  /** Barrierefreies Label (rückwärtskompatibel). */
  "aria-label"?: string;

  /* ---- Spaltengröße & -reihenfolge (B6) ---- */
  /** Column-Resizing global aktivieren. */
  enableColumnResizing?: boolean;
  /** Manuell gesetzte Spaltenbreiten bei Container-Resize behalten (B6). */
  retainColumnWidth?: boolean;
  /** Breiten-Skalierungsmodus (B6). */
  scaleWidthMode?: ScaleWidthMode;
  /** Callback bei Auto-Resize (Doppelklick auf Resizer einer `autoResizable`-Spalte). */
  onAutoResize?: (info: { columnId: string; width: number }) => void;
  /** Drag&Drop-Reorder aktivieren. */
  enableColumnReorder?: boolean;
  /** Callback bei Reorder per Drag&Drop. */
  onColumnsReorder?: (order: string[]) => void;

  /* ---- Gruppierung (B4) ---- */
  /** Aktiviert Gruppierung + Group-Bar. */
  enableGrouping?: boolean;
  /** Kontrollierte Gruppierung (geordnete Spalten-IDs). */
  grouping?: string[];
  /** Unkontrollierte Anfangs-Gruppierung. */
  defaultGrouping?: string[];
  /** Callback bei Änderung der Gruppierung. */
  onGroupingChange?: (grouping: string[]) => void;
  /** Group-Event. */
  onGroup?: (grouping: string[]) => void;

  /* ---- Personalisierung ---- */
  /** Aktiviert Spalten-Personalisierung (⚙-Menü: Sichtbarkeit/Reihenfolge/Pinning). */
  enablePersonalization?: boolean;
  /** Kontrollierte Spaltensichtbarkeit. */
  columnVisibility?: Record<string, boolean>;
  /** Unkontrollierte Anfangs-Sichtbarkeit. */
  defaultColumnVisibility?: Record<string, boolean>;
  /** Callback bei Sichtbarkeitsänderung. */
  onColumnVisibilityChange?: (v: Record<string, boolean>) => void;
  /** Kontrollierte Spaltenreihenfolge. */
  columnOrder?: string[];
  /** Unkontrollierte Anfangs-Reihenfolge. */
  defaultColumnOrder?: string[];
  /** Callback bei Reihenfolgeänderung. */
  onColumnOrderChange?: (o: string[]) => void;
  /** Kontrolliertes Spalten-Pinning. */
  columnPinning?: { left?: string[]; right?: string[] };
  /** Unkontrolliertes Anfangs-Pinning. */
  defaultColumnPinning?: { left?: string[]; right?: string[] };
  /** Callback bei Pinning-Änderung. */
  onColumnPinningChange?: (p: { left?: string[]; right?: string[] }) => void;

  /* ---- Sub-Components (B13.1) ---- */
  /** Rendert eine Unterkomponente unter einer Zeile. */
  renderRowSubComponent?: (info: { row: T }) => ReactNode;
  /** Verhalten der Unterkomponente: ausklappbar (Chevron) oder immer sichtbar. */
  subComponentsBehavior?: SubComponentsBehavior;

  /* ---- Erweiterbarkeit (B14.4) ---- */
  /** Wird in useReactTable hineingemerged (Escape-Hatch). */
  reactTableOptions?: Partial<TableOptions<T>>;
  /** Liefert die TanStack-Tabellen-Instanz nach oben. */
  onTableReady?: (table: Table<T>) => void;
}

const SELECT_COL_ID = "__select__";
const NAV_COL_ID = "__nav__";

/* Feste Track-Breiten für die Zusatzspalten. Bewusst ohne CSS-var(…, fallback),
 * damit der grid-template-columns-String je ein einzelnes Token pro Track bleibt
 * (Track-Konsistenz lässt sich so verlässlich prüfen). */
const HIGHLIGHT_TRACK = "3px";
const NAV_TRACK = "36px";

/* Gepinnte Spalten brauchen px-Breiten für korrekte Sticky-Offsets.
 * Non-px-Breiten werden einmalig gewarnt und nicht sticky gemacht. */
let warnedNonPxPin = false;

function pinStyle<T>(
  column: Column<T, unknown>,
): { pinned: "left" | "right" | undefined; style: CSSProperties | undefined } {
  const pinned = column.getIsPinned();
  if (!pinned) return { pinned: undefined, style: undefined };
  const width = column.columnDef.meta?.width;
  const isPx = typeof width === "string" && /^\d+(\.\d+)?px$/.test(width.trim());
  if (!isPx) {
    if (!warnedNonPxPin && typeof console !== "undefined") {
      warnedNonPxPin = true;
      console.warn(
        `[AnalyticalTable] Gepinnte Spalte "${column.id}" benötigt eine px-Breite (width: "120px"); Sticky wird übersprungen.`,
      );
    }
    return { pinned, style: undefined };
  }
  const style: CSSProperties = { position: "sticky", zIndex: 2 };
  if (pinned === "left") style.left = column.getStart("left");
  else style.right = column.getAfter("right");
  return { pinned, style };
}

/* Sicherer Merge von reactTableOptions in die Basis-Optionen.
 * - `state` wird tief gemerged (interner State bleibt, opts ergänzen additiv).
 * - interne `on*Change`-Handler werden NICHT überschrieben (sonst bricht der
 *   kontrollierte State); ist in opts ein eigener Handler gesetzt, wird er
 *   zusätzlich nach dem internen aufgerufen (Komposition statt Überschreiben).
 * - alle übrigen Felder: opts gewinnt (echter Escape-Hatch).
 */
function mergeTableOptions<T>(
  base: TableOptions<T>,
  opts: Partial<TableOptions<T>>,
): TableOptions<T> {
  const merged: TableOptions<T> = { ...base, ...opts } as TableOptions<T>;
  // state tief mergen — interner State darf nicht verloren gehen.
  merged.state = { ...base.state, ...(opts.state ?? {}) };
  // on*Change-Handler komponieren: intern zuerst, dann opts-Handler.
  for (const key of Object.keys(opts) as (keyof TableOptions<T>)[]) {
    if (
      typeof key === "string" &&
      key.startsWith("on") &&
      key.endsWith("Change") &&
      typeof base[key] === "function" &&
      typeof opts[key] === "function"
    ) {
      const internal = base[key] as (...a: unknown[]) => void;
      const external = opts[key] as (...a: unknown[]) => void;
      (merged[key] as unknown) = (...args: unknown[]) => {
        internal(...args);
        external(...args);
      };
    }
  }
  return merged;
}

/* Nested-Path-Resolver für dotted accessorKey ("info.hobby"). */
function resolvePath(obj: unknown, path: string): unknown {
  if (!path.includes(".")) {
    return obj == null ? undefined : (obj as Record<string, unknown>)[path];
  }
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/* Zusätzliche Aggregat-Funktionen, die TanStack nicht eingebaut hat. */
const customAggFns: Record<string, AggregationFn<unknown>> = {
  minMax: (_columnId, leafRows) => {
    const nums = leafRows
      .map((r) => Number(r.getValue(_columnId)))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return "";
    return `${Math.min(...nums)}–${Math.max(...nums)}`;
  },
  median: (_columnId, leafRows) => {
    const nums = leafRows
      .map((r) => Number(r.getValue(_columnId)))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    if (nums.length === 0) return "";
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 ? nums[mid] : (nums[mid - 1]! + nums[mid]!) / 2;
  },
  unique: (_columnId, leafRows) => {
    const set = new Set(leafRows.map((r) => r.getValue(_columnId)));
    return Array.from(set).join(", ");
  },
  uniqueCount: (_columnId, leafRows) => {
    return new Set(leafRows.map((r) => r.getValue(_columnId))).size;
  },
};

/* Filter-Funktionen für Spaltenfilter. Generisch, damit sie zu FilterFn<T> passen. */
const exactTextFilter: FilterFn<any> = (row, columnId, value) =>
  String(row.getValue(columnId) ?? "").toLowerCase() === String(value).toLowerCase();
const exactTextCaseFilter: FilterFn<any> = (row, columnId, value) =>
  String(row.getValue(columnId) ?? "") === String(value);
const equalsFilter: FilterFn<any> = (row, columnId, value) =>
  // eslint-disable-next-line eqeqeq
  row.getValue(columnId) == value;

export function AnalyticalTable<T>(props: AnalyticalTableProps<T>) {
  const {
    data,
    columns,
    getRowId,
    selectionMode: selectionModeProp,
    selectionBehavior = "rowSelector",
    selectable = false,
    selectedKeys,
    onSelectionChange,
    onRowSelect,
    onRowAction,
    onRowClick,
    onRowContextMenu,
    sortable = true,
    sorting: sortingProp,
    defaultSorting,
    onSortingChange,
    onSort,
    enableMultiSort = false,
    filterable = false,
    globalFilterValue,
    onFilter,
    loading,
    isLoading = false,
    loadingDelay = 0,
    alwaysShowBusyIndicator = false,
    showOverlay = false,
    skeletonRows = 8,
    emptyTitle = "Keine Daten",
    emptyDescription,
    noDataText,
    NoDataComponent,
    rowHeight = 44,
    headerRowHeight,
    visibleRows,
    renderRowSubComponent,
    subComponentsBehavior = "expandable",
    minRows,
    visibleRowCountMode = "fixed",
    overscanCount = 10,
    onTableScroll,
    maxHeight = 480,
    isTreeTable = false,
    subRowsKey = "subRows",
    onRowExpandChange,
    infiniteScroll = false,
    infiniteScrollThreshold = 20,
    onLoadMore,
    alternateRowColor = false,
    withRowHighlight = false,
    highlightField,
    withNavigationHighlight = false,
    markNavigatedRow,
    tableWidth,
    header,
    extension,
    glass,
    accessibleName,
    accessibleNameRef,
    className,
    "aria-label": ariaLabel,
    enableColumnResizing = false,
    retainColumnWidth = false,
    scaleWidthMode = "default",
    onAutoResize,
    enableColumnReorder = false,
    onColumnsReorder,
    enableGrouping = false,
    grouping: groupingProp,
    defaultGrouping,
    onGroupingChange,
    onGroup,
    enablePersonalization = false,
    columnVisibility: columnVisibilityProp,
    defaultColumnVisibility,
    onColumnVisibilityChange,
    columnOrder: columnOrderProp,
    defaultColumnOrder,
    onColumnOrderChange,
    columnPinning: columnPinningProp,
    defaultColumnPinning,
    onColumnPinningChange,
    reactTableOptions,
    onTableReady,
  } = props;

  /* Selektionsmodus: selectable (legacy) → multiple. */
  const selectionMode: SelectionMode =
    selectionModeProp ?? (selectable ? "multiple" : "none");
  const showSelectColumn =
    selectionMode !== "none" && selectionBehavior !== "row" && selectionBehavior !== "rowOnly";

  const loadingActive = loading ?? isLoading;

  /* ---- Sorting (controlled/uncontrolled) ---- */
  const [internalSorting, setInternalSorting] = useState<SortingState>(
    (defaultSorting as SortingState) ?? [],
  );
  const sorting = (sortingProp as SortingState) ?? internalSorting;
  const setSorting = (next: SortingState) => {
    if (sortingProp === undefined) setInternalSorting(next);
    const out = next.map((s) => ({ id: s.id, desc: s.desc }));
    onSortingChange?.(out);
    onSort?.(out);
  };

  /* ---- Column filters ---- */
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const emitFilter = (next: ColumnFiltersState) => {
    onFilter?.(next.map((f) => ({ id: f.id, value: String(f.value ?? "") })));
  };

  /* Grouping-State (kontrolliert/unkontrolliert). */
  const [internalGrouping, setInternalGrouping] = useState<GroupingState>(defaultGrouping ?? []);
  const grouping = groupingProp ?? internalGrouping;
  const setGrouping = (next: GroupingState) => {
    if (groupingProp === undefined) setInternalGrouping(next);
    onGroupingChange?.(next);
    onGroup?.(next);
  };
  // Gruppen initial offen; Tree-Zeilen initial geschlossen (Ã¼bliches Verhalten).
  const [expanded, setExpanded] = useState<ExpandedState>(isTreeTable ? {} : true);

  /* Personalisierungs-State (kontrolliert/unkontrolliert). */
  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>(
    defaultColumnVisibility ?? {},
  );
  const columnVisibility = columnVisibilityProp ?? internalVisibility;
  const setColumnVisibility = (next: VisibilityState) => {
    if (columnVisibilityProp === undefined) setInternalVisibility(next);
    onColumnVisibilityChange?.(next);
  };

  const [internalOrder, setInternalOrder] = useState<ColumnOrderState>(defaultColumnOrder ?? []);
  const columnOrder = columnOrderProp ?? internalOrder;
  const setColumnOrder = (next: ColumnOrderState) => {
    if (columnOrderProp === undefined) setInternalOrder(next);
    onColumnOrderChange?.(next);
  };

  /* Column-Sizing für Resizing. */
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  /* Pinning-Defaults aus den Spalten ableiten, falls nicht explizit gesetzt. */
  const seededPinning = useMemo<ColumnPinningState>(() => {
    if (defaultColumnPinning) {
      return { left: defaultColumnPinning.left ?? [], right: defaultColumnPinning.right ?? [] };
    }
    const left: string[] = [];
    const right: string[] = [];
    for (const col of columns) {
      const id = col.id ?? col.accessorKey ?? String(col.header);
      if (col.defaultPinned === "left") left.push(id);
      else if (col.defaultPinned === "right") right.push(id);
    }
    return { left, right };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [internalPinning, setInternalPinning] = useState<ColumnPinningState>(seededPinning);
  const columnPinning = columnPinningProp
    ? { left: columnPinningProp.left ?? [], right: columnPinningProp.right ?? [] }
    : internalPinning;
  const setColumnPinning = (next: ColumnPinningState) => {
    if (columnPinningProp === undefined) setInternalPinning(next);
    onColumnPinningChange?.({ left: next.left, right: next.right });
  };

  /* Kontrollierte vs. unkontrollierte Auswahl. */
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection: RowSelectionState = useMemo(() => {
    if (selectedKeys === undefined) return internalSelection;
    const next: RowSelectionState = {};
    selectedKeys.forEach((k) => {
      next[k] = true;
    });
    return next;
  }, [selectedKeys, internalSelection]);

  /* Pop-In-Berechnung: gemessene Breite. */
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | undefined>(tableWidth);
  useEffect(() => {
    if (tableWidth !== undefined) {
      setMeasuredWidth(tableWidth);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    /* Sofortige Erstmessung — der ResizeObserver feuert sonst u. U. nie (kein
     * Resize nach Mount), wodurch measuredWidth `undefined` bliebe (MED-1). */
    const measure = (w: number) => {
      if (w > 0) setMeasuredWidth(w);
    };
    measure(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") return;
    let prevWidth = el.getBoundingClientRect().width;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect?.width ?? (e.target as HTMLElement).getBoundingClientRect().width;
        measure(w);
        /* retainColumnWidth=false (Ã¼blicher Default): manuell gesetzte Breiten beim
         * echten Container-Resize verwerfen, damit die Spalten neu skalieren. */
        if (!retainColumnWidth && w !== prevWidth) {
          setColumnSizing((prev) => (Object.keys(prev).length ? {} : prev));
        }
        prevWidth = w;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tableWidth, retainColumnWidth]);

  const effectiveWidth = tableWidth ?? measuredWidth;
  const hasPopIns = columns.some((c) => c.responsivePopIn);
  const popInColumnIds = useMemo(() => {
    if (!hasPopIns || effectiveWidth === undefined) return new Set<string>();
    const ids = new Set<string>();
    for (const col of columns) {
      if (!col.responsivePopIn) continue;
      const threshold = col.responsiveMinWidth ?? 600;
      if (effectiveWidth < threshold) ids.add(col.id ?? col.accessorKey ?? String(col.header));
    }
    return ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, effectiveWidth, hasPopIns]);

  /* Prince-Spalten → TanStack ColumnDef. */
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = [];

    if (showSelectColumn) {
      defs.push({
        id: SELECT_COL_ID,
        enableSorting: false,
        enableColumnFilter: false,
        enableResizing: false,
        meta: { align: "start", width: "44px", isSelect: true } satisfies ColMeta,
        header: ({ table }) => (
          <Checkbox
            aria-label="Alle Zeilen auswählen"
            isSelected={table.getIsAllRowsSelected()}
            isIndeterminate={table.getIsSomeRowsSelected()}
            onChange={(v) => table.toggleAllRowsSelected(v)}
          />
        ),
        cell: ({ row }) =>
          selectionMode === "single" ? (
            <input
              type="radio"
              aria-label="Zeile auswählen"
              checked={row.getIsSelected()}
              onChange={() => row.toggleSelected(true)}
            />
          ) : (
            <Checkbox
              aria-label="Zeile auswählen"
              isSelected={row.getIsSelected()}
              onChange={(v) => row.toggleSelected(v)}
            />
          ),
      });
    }

    columns.forEach((col, colIdx) => {
      const id = col.id ?? col.accessorKey ?? String(col.header);
      const accessorFn: ((row: T) => unknown) | undefined =
        col.accessor ??
        (col.accessorKey
          ? (row: T) => resolvePath(row, col.accessorKey as string)
          : undefined);

      const sortAllowed =
        col.sortable !== false &&
        col.disableSortBy !== true &&
        sortable !== false &&
        accessorFn !== undefined;

      const filterAllowed =
        (col.filterable ?? filterable) === true &&
        col.disableFilters !== true &&
        accessorFn !== undefined;

      const isTreeCol = isTreeTable && colIdx === 0;

      const aggSpec = col.aggregate;
      const isCustomNamedAgg =
        typeof aggSpec === "string" &&
        (aggSpec === "minMax" || aggSpec === "median" || aggSpec === "unique" || aggSpec === "uniqueCount");

      const def: ColumnDef<T> = {
        id,
        accessorFn: accessorFn ?? (() => undefined),
        header: () => col.header,
        enableSorting: sortAllowed,
        sortingFn: col.sortType ?? "auto",
        sortDescFirst: col.sortDescFirst,
        sortUndefined: col.sortInverted ? -1 : undefined,
        invertSorting: col.sortInverted ?? undefined,
        enableColumnFilter: filterAllowed,
        enableGlobalFilter: col.disableGlobalFilter ? false : undefined,
        filterFn:
          col.filter === "exactText"
            ? exactTextFilter
            : col.filter === "exactTextCase"
              ? exactTextCaseFilter
              : col.filter === "equals"
                ? equalsFilter
                : "includesString",
        enableHiding: col.canHide !== false,
        enablePinning: !!col.canPin,
        enableResizing: enableColumnResizing && col.disableResizing !== true,
        minSize: col.minWidth ?? 60,
        maxSize: col.maxWidth ?? Number.MAX_SAFE_INTEGER,
        meta: {
          align: col.align ?? "start",
          vAlign: col.vAlign,
          width: col.width ?? "1fr",
          minWidth: col.minWidth,
          maxWidth: col.maxWidth,
          isTree: isTreeCol,
          headerTooltip: col.headerTooltip,
          headerLabel: col.headerLabel,
          cellLabel: col.cellLabel,
          responsivePopIn: col.responsivePopIn,
          responsiveMinWidth: col.responsiveMinWidth,
          popinDisplay: col.popinDisplay,
          autoResizable: col.autoResizable,
          renderFilter: col.Filter,
          renderHeaderPopover: col.Popover,
        } satisfies ColMeta,
        cell: col.cellRender
          ? ({ row }) => col.cellRender!(row.original)
          : ({ getValue }) => {
              const v = getValue();
              return v === null || v === undefined ? "" : (v as ReactNode);
            },
      };

      if (aggSpec) {
        if (typeof aggSpec === "function") {
          def.aggregationFn = (_colId, leafRows) =>
            aggSpec(
              leafRows.map((r) => (col.aggregateValue ? col.aggregateValue(r.original) : r.getValue(id))),
              leafRows.map((r) => r.original),
            );
        } else if (col.aggregateValue) {
          // Vorberechneter Aggregat-Wert: aggregateValue je Zeile auflösen, dann
          // die (benannte) Aggregation darüber rechnen — ohne den Roh-Zellwert.
          const resolveAgg = col.aggregateValue;
          def.aggregationFn = (_colId, leafRows) => {
            const values = leafRows.map((r) => resolveAgg(r.original));
            const nums = values.map((v) => Number(v)).filter((n) => !Number.isNaN(n));
            switch (aggSpec) {
              case "sum":
                return nums.reduce((a, b) => a + b, 0);
              case "avg":
                return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : "";
              case "min":
                return nums.length ? Math.min(...nums) : "";
              case "max":
                return nums.length ? Math.max(...nums) : "";
              case "count":
                return leafRows.length;
              case "minMax":
                return nums.length ? `${Math.min(...nums)}–${Math.max(...nums)}` : "";
              case "median": {
                const s = [...nums].sort((a, b) => a - b);
                if (!s.length) return "";
                const mid = Math.floor(s.length / 2);
                return s.length % 2 ? s[mid] : (s[mid - 1]! + s[mid]!) / 2;
              }
              case "unique":
                return Array.from(new Set(values)).join(", ");
              case "uniqueCount":
                return new Set(values).size;
              default:
                return nums.reduce((a, b) => a + b, 0);
            }
          };
        } else if (isCustomNamedAgg) {
          // resolved via aggregationFns map (customAggFns)
          def.aggregationFn = aggSpec as ColumnDef<T>["aggregationFn"];
        } else {
          def.aggregationFn = aggSpec === "avg" ? "mean" : (aggSpec as "sum" | "count" | "min" | "max");
        }
        def.aggregatedCell = ({ getValue, row }) => {
          const value = getValue();
          if (col.aggregatedCellRender) {
            return col.aggregatedCellRender({ value, rows: row.getLeafRows().map((r) => r.original) });
          }
          return value === null || value === undefined ? "" : (value as ReactNode);
        };
      }

      defs.push(def);
    });
    return defs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, showSelectColumn, selectionMode, sortable, filterable, enableColumnResizing, isTreeTable]);

  /* getSubRows für Tree-Tables. */
  const getSubRows = useMemo(() => {
    if (!isTreeTable) return undefined;
    return (row: T) => (row as Record<string, unknown>)[subRowsKey] as T[] | undefined;
  }, [isTreeTable, subRowsKey]);

  const baseOptions: TableOptions<T> = {
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
      grouping,
      expanded,
      columnVisibility,
      columnOrder,
      columnPinning,
      columnSizing,
      columnFilters,
      ...(globalFilterValue !== undefined ? { globalFilter: globalFilterValue } : {}),
    },
    aggregationFns: customAggFns as TableOptions<T>["aggregationFns"],
    globalFilterFn: "includesString",
    enableMultiSort,
    onSortingChange: (updater) =>
      setSorting(typeof updater === "function" ? updater(sorting) : updater),
    onColumnFiltersChange: (updater) => {
      setColumnFilters((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        emitFilter(next);
        return next;
      });
    },
    enableRowSelection: selectionMode !== "none",
    enableMultiRowSelection: selectionMode === "multiple",
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater;
      if (selectedKeys === undefined) setInternalSelection(next);
      const keys = new Set(Object.keys(next).filter((k) => next[k]));
      onSelectionChange?.(keys);
    },
    enableGrouping,
    onGroupingChange: (u) => setGrouping(typeof u === "function" ? u(grouping) : u),
    onExpandedChange: setExpanded,
    enableHiding: true,
    enablePinning: true,
    enableColumnResizing,
    columnResizeMode: "onChange",
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: (u) =>
      setColumnVisibility(typeof u === "function" ? u(columnVisibility) : u),
    onColumnOrderChange: (u) => setColumnOrder(typeof u === "function" ? u(columnOrder) : u),
    onColumnPinningChange: (u) => setColumnPinning(typeof u === "function" ? u(columnPinning) : u),
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  };

  const table = useReactTable<T>(
    reactTableOptions ? mergeTableOptions(baseOptions, reactTableOptions) : baseOptions,
  );

  /* Tabellen-Instanz nach oben reichen. */
  const readyRef = useRef(false);
  useEffect(() => {
    if (!readyRef.current && onTableReady) {
      readyRef.current = true;
      onTableReady(table);
    }
  }, [table, onTableReady]);

  const rows = table.getRowModel().rows;
  const leafColumns = table.getVisibleLeafColumns();

  /* Tatsächlich als Grid-Zellen gerenderte Spalten: Pop-In-Spalten werden NICHT
   * als eigene Zelle gerendert (sie wandern in die erste Zelle), dürfen also auch
   * keinen eigenen grid-template-columns-Track erhalten — sonst verschiebt sich
   * der gesamte Body um die Anzahl der Pop-In-Spalten. */
  const renderedLeafColumns = useMemo(
    () => leafColumns.filter((c) => !popInColumnIds.has(c.id)),
    [leafColumns, popInColumnIds],
  );

  /* grid-template-columns aus den Spalten-Breiten (mit Resizing/min/max).
   * EINZIGE Quelle der Wahrheit für die Grid-Tracks. Enthält in dieser Reihenfolge:
   *   [Highlight-Band-Track?] · gerenderte Daten-/Select-Spalten · [Navigations-Track?]
   * Header, Datenzeilen, Spacer, Group-/Empty-/SubComponent-Zeilen müssen exakt
   * diese Track-Zahl spannen (totalColumnCount), damit nichts verrutscht. */
  const gridTemplate = useMemo(() => {
    const tracks = renderedLeafColumns.map((c) => {
      const meta = c.columnDef.meta;
      const sized = columnSizing[c.id];
      if (enableColumnResizing && sized) return `${sized}px`;
      const base = meta?.width ?? "1fr";
      // scaleWidthMode "grow": Spalten füllen verfügbaren Platz (min..1fr).
      if (scaleWidthMode === "grow" && !meta?.isSelect) {
        const min = meta?.minWidth ? `${meta.minWidth}px` : base.includes("px") ? base : "120px";
        return `minmax(${min}, 1fr)`;
      }
      if (meta?.minWidth || meta?.maxWidth) {
        const min = meta.minWidth ? `${meta.minWidth}px` : "0";
        const max = meta.maxWidth ? `${meta.maxWidth}px` : base;
        return `minmax(${min}, ${max})`;
      }
      return base;
    });
    // Highlight-Band als eigener, schmaler führender Track (linkes Farbband).
    if (withRowHighlight) tracks.unshift(HIGHLIGHT_TRACK);
    // Navigations-Pfeil als eigener nachgestellter Track.
    if (withNavigationHighlight) tracks.push(NAV_TRACK);
    return tracks.join(" ");
  }, [renderedLeafColumns, columnSizing, enableColumnResizing, scaleWidthMode, withRowHighlight, withNavigationHighlight]);

  /* Gesamtzahl der Grid-Tracks — maßgeblich für ALLE volle-Breite-Spannen
   * (Spacer, Group-Row, Empty-Row, SubComponent, Busy/Empty). */
  const totalColumnCount =
    renderedLeafColumns.length + (withRowHighlight ? 1 : 0) + (withNavigationHighlight ? 1 : 0);

  /* Virtualisierung (vertikal). */
  const scrollRef = useRef<HTMLDivElement>(null);

  /* Auto-Resize: misst die breiteste sichtbare Zelle einer Spalte und setzt
   * die Spaltenbreite entsprechend (Doppelklick auf den Resizer, B6). */
  const handleAutoResize = useCallback(
    (columnId: string) => {
      const grid = scrollRef.current;
      if (!grid) return;
      const colIdx = table.getVisibleLeafColumns().findIndex((c) => c.id === columnId);
      if (colIdx < 0) return;
      const headerCell = grid.querySelector<HTMLElement>(
        `.prn-th:nth-of-type(${colIdx + 1})`,
      );
      const bodyCells = grid.querySelectorAll<HTMLElement>(`[data-colidx="${colIdx}"]`);
      let max = 0;
      const consider = (el: HTMLElement | null) => {
        if (!el) return;
        const w = Math.max(el.scrollWidth, el.getBoundingClientRect().width);
        if (w > max) max = w;
      };
      consider(headerCell);
      bodyCells.forEach((c) => consider(c));
      // Mindestbreite respektieren + kleiner Innenabstand.
      const col = table.getColumn(columnId);
      const minSize = col?.columnDef.minSize ?? 60;
      const width = Math.max(minSize, Math.round(max) + 16);
      setColumnSizing((prev) => ({ ...prev, [columnId]: width }));
      onAutoResize?.({ columnId, width });
    },
    [table, onAutoResize],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: overscanCount,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]!.start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1]!.end : 0;

  /* Logische (ARIA-/Keyboard-)Spaltenzahl: tatsächlich gerenderte Daten-/Select-
   * Zellen. Das dekorative Highlight-Band zählt hier NICHT mit (aria-hidden). */
  const colCount = renderedLeafColumns.length;

  /* Höhe aus visibleRows ableiten. */
  const computedMaxHeight = useMemo<number | string>(() => {
    if (visibleRows && visibleRowCountMode !== "auto") {
      return visibleRows * rowHeight;
    }
    return typeof maxHeight === "number" ? maxHeight : maxHeight;
  }, [visibleRows, visibleRowCountMode, rowHeight, maxHeight]);

  /* Leerzeilen (minRows / autoWithEmptyRows). */
  const emptyRowCount = useMemo(() => {
    if (loadingActive || rows.length === 0) return 0;
    const target =
      visibleRowCountMode === "autoWithEmptyRows"
        ? visibleRows ?? 0
        : minRows ?? 0;
    return Math.max(0, target - rows.length);
  }, [loadingActive, rows.length, visibleRowCountMode, visibleRows, minRows]);

  /* Scroll-Handler: onTableScroll + Infinite Scroll. */
  const loadMoreLockRef = useRef(false);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    onTableScroll?.({ scrollTop: el.scrollTop, scrollLeft: el.scrollLeft });
    if (infiniteScroll && onLoadMore) {
      const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (remaining <= infiniteScrollThreshold) {
        if (!loadMoreLockRef.current) {
          loadMoreLockRef.current = true;
          onLoadMore();
        }
      } else {
        loadMoreLockRef.current = false;
      }
    }
  }, [onTableScroll, infiniteScroll, onLoadMore, infiniteScrollThreshold]);

  /* Grid-Tastaturnavigation: aktive Zelle (rovendes tabindex). */
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const navColumnCount = colCount + (withNavigationHighlight ? 1 : 0);

  /* Roving-Tabindex robust gegen Virtualisierung: Liegt die aktive Zeile außerhalb
   * des gerenderten Bereichs (z. B. weit weggescrollt), bekommt stattdessen die
   * erste gerenderte Zeile den tabindex=0 – der Grid-Body bleibt so immer per Tab
   * fokussierbar. */
  const renderedFirstIndex = virtualRows.length > 0 ? virtualRows[0]!.index : 0;
  const renderedLastIndex =
    virtualRows.length > 0 ? virtualRows[virtualRows.length - 1]!.index : 0;
  const activeRowRendered =
    activeCell.r >= renderedFirstIndex && activeCell.r <= renderedLastIndex;
  const tabbableRow = activeRowRendered ? activeCell.r : renderedFirstIndex;
  const onGridKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const key = e.key;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
      e.preventDefault();
      setActiveCell((prev) => {
        let { r, c } = prev;
        if (key === "ArrowUp") r = Math.max(0, r - 1);
        else if (key === "ArrowDown") r = Math.min(rows.length - 1, r + 1);
        else if (key === "ArrowLeft") c = Math.max(0, c - 1);
        else if (key === "ArrowRight") c = Math.min(navColumnCount - 1, c + 1);
        else if (key === "Home") c = 0;
        else if (key === "End") c = navColumnCount - 1;
        const target = scrollRef.current?.querySelector<HTMLElement>(
          `[data-rowidx="${r}"][data-colidx="${c}"]`,
        );
        target?.focus();
        return { r, c };
      });
    },
    [rows.length, navColumnCount],
  );

  /* Leerzustand-Grund: gefiltert vs. leer. */
  const hasActiveFilters = columnFilters.length > 0 || (globalFilterValue ?? "") !== "";
  const noDataReason: NoDataReason =
    data.length > 0 && hasActiveFilters ? "filtered" : "empty";

  /* Verzögertes Loading. */
  const [showLoading, setShowLoading] = useState(loadingActive && loadingDelay === 0);
  useEffect(() => {
    if (!loadingActive) {
      setShowLoading(false);
      return;
    }
    if (loadingDelay === 0) {
      setShowLoading(true);
      return;
    }
    const t = setTimeout(() => setShowLoading(true), loadingDelay);
    return () => clearTimeout(t);
  }, [loadingActive, loadingDelay]);

  const titleId = accessibleNameRef ?? (header ? "prn-table-title" : undefined);
  const computedAriaLabel = ariaLabel ?? accessibleName;

  const showSkeleton = showLoading && !alwaysShowBusyIndicator && !showOverlay;
  const showBusy = showLoading && alwaysShowBusyIndicator && !showOverlay;

  return (
    <div className={cx("prn-table", className)} ref={containerRef}>
      {header && (
        <div id={titleId} className="prn-table-title" role="heading" aria-level={2}>
          {header}
        </div>
      )}
      {extension && <div className="prn-table-extension">{extension}</div>}
      {(enableGrouping || enablePersonalization) && (
        <div className={cx("prn-table-toolbar", glass && "prn-glass prn-glass-bar")}>
          {enableGrouping && <GroupBar table={table} columns={columns} />}
          {enablePersonalization && (
            <ColumnMenu table={table} columns={columns} onColumnsReorder={onColumnsReorder} />
          )}
        </div>
      )}
      <div className="prn-table-viewport-wrap">
        <div
          ref={scrollRef}
          className="prn-table-scroll"
          onScroll={handleScroll}
          style={{ maxHeight: typeof computedMaxHeight === "number" ? `${computedMaxHeight}px` : computedMaxHeight }}
        >
          <div
            role="grid"
            aria-label={computedAriaLabel}
            aria-labelledby={titleId && !computedAriaLabel ? titleId : undefined}
            aria-rowcount={rows.length + 1}
            aria-colcount={navColumnCount}
            aria-busy={showBusy || undefined}
            className={cx(
              "prn-table-grid",
              alternateRowColor && "prn-table-zebra",
              withRowHighlight && "prn-table-has-highlight",
            )}
            style={{ gridTemplateColumns: gridTemplate }}
            onKeyDown={onGridKeyDown}
          >
            {/* ---- Kopf ---- */}
            <div role="row" aria-rowindex={1} className="prn-table-head">
              {/* Führender Platzhalter für das Highlight-Band — hält den Header
               * mit den Datenzeilen (die das Band als erste Zelle rendern) auf
               * derselben Track-Spur. aria-hidden, da rein dekorativ. */}
              {withRowHighlight && (
                <div className="prn-th prn-th-highlight" aria-hidden />
              )}
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header2, hIdx) => {
                  const meta = header2.column.columnDef.meta;
                  const canSort = header2.column.getCanSort();
                  const sorted = header2.column.getIsSorted();
                  const sortIndex = header2.column.getSortIndex();
                  const canFilter = header2.column.getCanFilter();
                  const canResize = header2.column.getCanResize();
                  const canReorder =
                    enableColumnReorder &&
                    header2.column.id !== SELECT_COL_ID &&
                    !columns.find(
                      (c) => (c.id ?? c.accessorKey ?? String(c.header)) === header2.column.id,
                    )?.disableDragAndDrop;
                  const pin = pinStyle(header2.column);
                  const popinHidden = popInColumnIds.has(header2.column.id);
                  if (popinHidden) return null;
                  return (
                    <div
                      key={header2.id}
                      role="columnheader"
                      aria-colindex={hIdx + 1}
                      className={cx("prn-th", meta?.isSelect && "prn-th-select")}
                      data-align={meta?.align}
                      data-pinned={pin.pinned}
                      style={
                        headerRowHeight !== undefined
                          ? { ...pin.style, minHeight: `${headerRowHeight}px`, height: `${headerRowHeight}px` }
                          : pin.style
                      }
                      title={meta?.headerTooltip}
                      aria-label={meta?.headerLabel}
                      draggable={canReorder || undefined}
                      onDragStart={
                        canReorder
                          ? (e) => e.dataTransfer.setData("text/plain", header2.column.id)
                          : undefined
                      }
                      onDragOver={canReorder ? (e) => e.preventDefault() : undefined}
                      onDrop={
                        canReorder
                          ? (e) => {
                              e.preventDefault();
                              const from = e.dataTransfer.getData("text/plain");
                              const to = header2.column.id;
                              if (!from || from === to) return;
                              const current = table.getAllLeafColumns().map((c) => c.id);
                              const fromIdx = current.indexOf(from);
                              const toIdx = current.indexOf(to);
                              if (fromIdx < 0 || toIdx < 0) return;
                              const next = [...current];
                              next.splice(fromIdx, 1);
                              next.splice(toIdx, 0, from);
                              table.setColumnOrder(next);
                              onColumnsReorder?.(next);
                            }
                          : undefined
                      }
                      data-sortable={canSort || undefined}
                      data-sorted={sorted ? "" : undefined}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : canSort
                              ? "none"
                              : undefined
                      }
                      tabIndex={canSort ? 0 : undefined}
                      onClick={
                        canSort
                          ? (e) => header2.column.toggleSorting(undefined, enableMultiSort && e.shiftKey)
                          : undefined
                      }
                      onKeyDown={
                        canSort
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                header2.column.toggleSorting(undefined, enableMultiSort && e.shiftKey);
                              }
                            }
                          : undefined
                      }
                    >
                      {!header2.isPlaceholder &&
                        flexRender(header2.column.columnDef.header, header2.getContext())}
                      {canSort && (
                        <span className="prn-th-sort" data-active={sorted ? "" : undefined} aria-hidden>
                          {sorted === "desc" ? "▾" : "▴"}
                          {enableMultiSort && sortIndex >= 0 && sorting.length > 1 && (
                            <sup className="prn-th-sortidx">{sortIndex + 1}</sup>
                          )}
                        </span>
                      )}
                      {canFilter && <ColumnFilter column={header2.column} />}
                      {meta?.renderHeaderPopover && (
                        <HeaderPopover render={meta.renderHeaderPopover} />
                      )}
                      {canResize && (
                        <span
                          className="prn-th-resizer"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label="Spaltenbreite ändern"
                          onMouseDown={header2.getResizeHandler()}
                          onTouchStart={header2.getResizeHandler()}
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={
                            meta?.autoResizable
                              ? (e) => {
                                  e.stopPropagation();
                                  handleAutoResize(header2.column.id);
                                }
                              : undefined
                          }
                          data-autoresizable={meta?.autoResizable ? "" : undefined}
                          data-resizing={header2.column.getIsResizing() ? "" : undefined}
                        />
                      )}
                    </div>
                  );
                }),
              )}
              {withNavigationHighlight && (
                <div role="columnheader" aria-colindex={navColumnCount} className="prn-th prn-th-nav" aria-label="Navigation" />
              )}
            </div>

            {/* ---- Körper ---- */}
            {showSkeleton ? (
              <SkeletonRows
                count={skeletonRows}
                leafColumns={leafColumns}
                popInIds={popInColumnIds}
                withRowHighlight={withRowHighlight}
                withNavigationHighlight={withNavigationHighlight}
              />
            ) : showBusy ? (
              <div className="prn-table-busy" role="row">
                <div className="prn-busy-indicator" role="status" aria-label="Lädt">
                  <span className="prn-busy-dot" />
                  <span className="prn-busy-dot" />
                  <span className="prn-busy-dot" />
                </div>
              </div>
            ) : rows.length === 0 ? (
              <div className="prn-table-empty" role="row">
                {NoDataComponent ? (
                  NoDataComponent({ reason: noDataReason })
                ) : (
                  <>
                    <div className="prn-table-empty-title">{noDataText ?? emptyTitle}</div>
                    {emptyDescription && <div className="prn-table-empty-desc">{emptyDescription}</div>}
                  </>
                )}
              </div>
            ) : (
              <>
                {paddingTop > 0 && <Spacer height={paddingTop} span={totalColumnCount} />}
                {virtualRows.map((vr) => {
                  const row = rows[vr.index];
                  if (!row) return null;
                  if (row.getIsGrouped()) {
                    return (
                      <GroupRow
                        key={row.id}
                        row={row}
                        rowIndex={vr.index}
                        gridSpan={totalColumnCount}
                        leafColumns={leafColumns}
                      />
                    );
                  }
                  return (
                    <TableRow
                      key={row.id}
                      table={table}
                      row={row}
                      rowIndex={vr.index}
                      rowAriaIndex={vr.index + 2}
                      activeCell={activeCell}
                      tabbableRow={tabbableRow}
                      setActiveCell={setActiveCell}
                      selectionMode={selectionMode}
                      selectionBehavior={selectionBehavior}
                      isTreeTable={isTreeTable}
                      onRowAction={onRowAction}
                      onRowClick={onRowClick}
                      onRowContextMenu={onRowContextMenu}
                      onRowSelect={onRowSelect}
                      onRowExpandChange={onRowExpandChange}
                      withRowHighlight={withRowHighlight}
                      highlightField={highlightField}
                      withNavigationHighlight={withNavigationHighlight}
                      markNavigatedRow={markNavigatedRow}
                      navColIndex={navColumnCount}
                      gridColumnCount={totalColumnCount}
                      popInIds={popInColumnIds}
                      columns={columns}
                      renderRowSubComponent={renderRowSubComponent}
                      subComponentsBehavior={subComponentsBehavior}
                    />
                  );
                })}
                {paddingBottom > 0 && <Spacer height={paddingBottom} span={totalColumnCount} />}
                {emptyRowCount > 0 &&
                  Array.from({ length: emptyRowCount }).map((_, i) => (
                    <div role="row" aria-hidden className="prn-table-row prn-table-row-empty" key={`empty-${i}`}>
                      {Array.from({ length: totalColumnCount }).map((__, c) => (
                        <div key={c} className="prn-td prn-td-empty" />
                      ))}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
        {showOverlay && loadingActive && (
          <div className="prn-table-overlay" role="status" aria-label="Lädt">
            <div className="prn-busy-indicator">
              <span className="prn-busy-dot" />
              <span className="prn-busy-dot" />
              <span className="prn-busy-dot" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Hilfstypen / Subkomponenten ---------------- */

function Spacer({ height, span }: { height: number; span: number }) {
  return <div aria-hidden style={{ gridColumn: `1 / ${span + 1}`, height }} />;
}

/* Spalten-Filter-Popover im Header. */
function ColumnFilter<T>({ column }: { column: Column<T, unknown> }) {
  const value = (column.getFilterValue() as string) ?? "";
  const renderFilter = column.columnDef.meta?.renderFilter;
  const setValue = (v: string | undefined) => column.setFilterValue(v || undefined);
  return (
    <span className="prn-th-filter" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DialogTrigger>
        <Button
          variant="plain"
          aria-label="Spalte filtern"
          className={cx("prn-th-filter-btn", value && "prn-th-filter-btn-active")}
        >
          ⌕
        </Button>
        <Popover className="prn-th-filter-popover">
          <div className="prn-th-filter-body">
            {renderFilter ? (
              renderFilter({ value, setValue })
            ) : (
              <>
                <TextField
                  aria-label="Filterwert"
                  label="Filtern"
                  value={value}
                  onChange={(v) => setValue(v)}
                />
                {value && (
                  <Button variant="plain" onPress={() => column.setFilterValue(undefined)}>
                    Zurücksetzen
                  </Button>
                )}
              </>
            )}
          </div>
        </Popover>
      </DialogTrigger>
    </span>
  );
}

/* Freier Custom-Popover-Slot am Spaltenkopf (B1.5). */
function HeaderPopover({ render }: { render: () => ReactNode }) {
  return (
    <span className="prn-th-popover" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <DialogTrigger>
        <Button variant="plain" aria-label="Spalteninfo" className="prn-th-popover-btn">
          ⋯
        </Button>
        <Popover className="prn-th-popover-content">{render()}</Popover>
      </DialogTrigger>
    </span>
  );
}

interface TableRowProps<T> {
  table: Table<T>;
  row: Row<T>;
  rowIndex: number;
  rowAriaIndex: number;
  activeCell: { r: number; c: number };
  tabbableRow: number;
  setActiveCell: (c: { r: number; c: number }) => void;
  selectionMode: SelectionMode;
  selectionBehavior: SelectionBehavior;
  isTreeTable: boolean;
  onRowAction?: (row: T) => void;
  onRowClick?: (info: { row: T; event: ReactMouseEvent }) => void;
  onRowContextMenu?: (info: { row: T; event: ReactMouseEvent }) => void;
  onRowSelect?: (info: { row: T; selected: boolean; selectedKeys: Set<string> }) => void;
  onRowExpandChange?: (info: { row: T; expanded: boolean }) => void;
  withRowHighlight: boolean;
  highlightField?: (row: T) => ValueState;
  withNavigationHighlight: boolean;
  markNavigatedRow?: (row: T) => boolean;
  navColIndex: number;
  /** Gesamtzahl der Grid-Tracks (für volle-Breite-Spannen, z. B. SubComponent). */
  gridColumnCount: number;
  popInIds: Set<string>;
  columns: AnalyticalColumn<T>[];
  renderRowSubComponent?: (info: { row: T }) => ReactNode;
  subComponentsBehavior: SubComponentsBehavior;
}

function TableRow<T>({
  table,
  row,
  rowIndex,
  rowAriaIndex,
  activeCell,
  tabbableRow,
  setActiveCell,
  selectionMode,
  selectionBehavior,
  isTreeTable,
  onRowAction,
  onRowClick,
  onRowContextMenu,
  onRowSelect,
  onRowExpandChange,
  withRowHighlight,
  highlightField,
  withNavigationHighlight,
  markNavigatedRow,
  navColIndex,
  gridColumnCount,
  popInIds,
  columns,
  renderRowSubComponent,
  subComponentsBehavior,
}: TableRowProps<T>) {
  const [hovered, setHovered] = useState(false);
  const selectionSelectsRow =
    selectionMode !== "none" && (selectionBehavior === "row" || selectionBehavior === "rowOnly");
  const hasSubComponent = !!renderRowSubComponent;
  const subAlwaysVisible = hasSubComponent && subComponentsBehavior === "visible";
  const [subOpen, setSubOpen] = useState(subAlwaysVisible);
  const subVisible = subAlwaysVisible || subOpen;
  const interactive = !!onRowAction || !!onRowClick || selectionSelectsRow;

  const doSelect = () => {
    const wasSelected = row.getIsSelected();
    row.toggleSelected(!wasSelected);
    /* Autoritative Auswahl NACH dem Toggle aus dem Table-State berechnen, damit
     * onRowSelect das tatsächliche selectedKeys-Set erhält (vorher immer leer). */
    if (onRowSelect) {
      const selectedKeys = new Set<string>();
      if (selectionMode === "single") {
        // Single-Mode: vorherige Auswahl wird ersetzt.
        if (!wasSelected) selectedKeys.add(row.id);
      } else {
        for (const r of table.getSelectedRowModel().flatRows) selectedKeys.add(r.id);
        if (wasSelected) selectedKeys.delete(row.id);
        else selectedKeys.add(row.id);
      }
      onRowSelect({ row: row.original, selected: !wasSelected, selectedKeys });
    }
  };

  const handleClick = (e: ReactMouseEvent) => {
    onRowClick?.({ row: row.original, event: e });
    onRowAction?.(row.original);
    if (selectionSelectsRow) doSelect();
  };

  const highlight = withRowHighlight && highlightField ? highlightField(row.original) : undefined;
  const navigated = withNavigationHighlight && markNavigatedRow ? markNavigatedRow(row.original) : false;

  const rowElement = (
    <div
      role="row"
      aria-rowindex={rowAriaIndex}
      aria-selected={selectionMode !== "none" ? row.getIsSelected() : undefined}
      aria-expanded={hasSubComponent && !subAlwaysVisible ? subVisible : undefined}
      data-key={row.id}
      data-zebra={rowIndex % 2 === 1 ? "" : undefined}
      data-highlight={highlight}
      className="prn-table-row"
      data-interactive={interactive ? "" : undefined}
      data-selected={row.getIsSelected() ? "" : undefined}
      data-hovered={hovered ? "" : undefined}
      onMouseEnter={interactive ? () => setHovered(true) : undefined}
      onMouseLeave={interactive ? () => setHovered(false) : undefined}
      onClick={interactive ? handleClick : undefined}
      onContextMenu={
        onRowContextMenu
          ? (e) => {
              e.preventDefault();
              onRowContextMenu({ row: row.original, event: e });
            }
          : undefined
      }
    >
      {withRowHighlight && (
        <span className="prn-row-highlight" data-state={highlight ?? "none"} aria-hidden />
      )}
      {row
        .getVisibleCells()
        /* Pop-In-Spalten werden nicht als eigene Zelle gerendert — vorher
         * herausfiltern, damit der Zell-Index lückenlos den gerenderten
         * Grid-Tracks (und data-colidx für die Tastaturnavigation) entspricht. */
        .filter((cell) => !popInIds.has(cell.column.id))
        .map((cell, cellIdx) => {
        const meta = cell.column.columnDef.meta;
        const pin = pinStyle(cell.column);
        const isTreeCell = isTreeTable && meta?.isTree;
        const canExpand = isTreeCell && row.getCanExpand();
        const isActive = activeCell.r === rowIndex && activeCell.c === cellIdx;
        // Pop-In-Inhalte in der ersten gerenderten Zelle anhängen
        const popInCells =
          cellIdx === 0 && popInIds.size > 0
            ? row.getVisibleCells().filter((c) => popInIds.has(c.column.id))
            : [];
        return (
          <div
            key={cell.id}
            role="gridcell"
            aria-colindex={cellIdx + 1}
            data-rowidx={rowIndex}
            data-colidx={cellIdx}
            tabIndex={isActive ? 0 : -1}
            onFocus={() => setActiveCell({ r: rowIndex, c: cellIdx })}
            className={cx("prn-td", meta?.isSelect && "prn-td-select")}
            data-align={meta?.align}
            data-valign={meta?.vAlign}
            data-pinned={pin.pinned}
            aria-label={meta?.cellLabel}
            style={{ ...pin.style, ...(isTreeCell ? { paddingLeft: `${row.depth * 16 + 12}px` } : null) }}
            onKeyDown={
              canExpand
                ? (e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                      const next = !row.getIsExpanded();
                      row.toggleExpanded();
                      onRowExpandChange?.({ row: row.original, expanded: next });
                    }
                  }
                : undefined
            }
          >
            {canExpand && (
              <button
                type="button"
                className="prn-tree-chevron"
                aria-label={row.getIsExpanded() ? "Zusammenklappen" : "Aufklappen"}
                aria-expanded={row.getIsExpanded()}
                onClick={(e) => {
                  e.stopPropagation();
                  const next = !row.getIsExpanded();
                  row.toggleExpanded();
                  onRowExpandChange?.({ row: row.original, expanded: next });
                }}
              >
                {row.getIsExpanded() ? "▾" : "▸"}
              </button>
            )}
            {cellIdx === 0 && hasSubComponent && !subAlwaysVisible && (
              <button
                type="button"
                className="prn-tree-chevron prn-subcomponent-toggle"
                aria-label={subVisible ? "Details ausblenden" : "Details anzeigen"}
                aria-expanded={subVisible}
                onClick={(e) => {
                  e.stopPropagation();
                  setSubOpen((o) => !o);
                }}
              >
                {subVisible ? "▾" : "▸"}
              </button>
            )}
            <span className="prn-td-content">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
            {popInCells.length > 0 && (
              <span className="prn-popin">
                {popInCells.map((pc) => {
                  const pcMeta = pc.column.columnDef.meta;
                  const colDef = columns.find(
                    (c) => (c.id ?? c.accessorKey ?? String(c.header)) === pc.column.id,
                  );
                  return (
                    <span
                      key={pc.id}
                      className="prn-popin-item"
                      data-display={pcMeta?.popinDisplay ?? "block"}
                    >
                      <span className="prn-popin-label">{colDef?.header}:</span>{" "}
                      <span className="prn-popin-value">
                        {flexRender(pc.column.columnDef.cell, pc.getContext())}
                      </span>
                    </span>
                  );
                })}
              </span>
            )}
          </div>
        );
      })}
      {withNavigationHighlight && (
        <div
          role="gridcell"
          aria-colindex={navColIndex}
          className="prn-td prn-td-nav"
          data-navigated={navigated ? "" : undefined}
          aria-label={navigated ? "Navigiert" : undefined}
        >
          <span className="prn-nav-arrow" aria-hidden>›</span>
        </div>
      )}
    </div>
  );

  if (!hasSubComponent || !subVisible) return rowElement;

  return (
    <>
      {rowElement}
      <div
        role="row"
        className="prn-table-subrow"
        data-key={`${row.id}__sub`}
        data-subcomponent=""
      >
        <div role="gridcell" className="prn-td prn-subcomponent" style={{ gridColumn: `1 / ${gridColumnCount + 1}` }}>
          {renderRowSubComponent!({ row: row.original })}
        </div>
      </div>
    </>
  );
}

function GroupBar<T>({ table, columns }: { table: Table<T>; columns: AnalyticalColumn<T>[] }) {
  const grouping = table.getState().grouping;
  const labelFor = (id: string) => {
    const col = columns.find((c) => (c.id ?? c.accessorKey ?? String(c.header)) === id);
    return col ? col.header : id;
  };
  const groupable = columns
    .filter((c) => c.groupable)
    .map((c) => ({ id: c.id ?? c.accessorKey ?? String(c.header), header: c.header }))
    .filter((c) => !grouping.includes(c.id));
  return (
    <div className="prn-groupbar" role="toolbar" aria-label="Gruppierung">
      <span className="prn-groupbar-label">Gruppiert nach:</span>
      {grouping.length === 0 && <span className="prn-groupbar-empty">—</span>}
      {grouping.map((id) => (
        <span key={id} className="prn-group-chip">
          <span className="prn-group-chip-label">{labelFor(id)}</span>
          <button
            type="button"
            className="prn-group-chip-remove"
            aria-label={`${String(labelFor(id))} entfernen`}
            onClick={() => table.setGrouping((g) => g.filter((x) => x !== id))}
          >
            ×
          </button>
        </span>
      ))}
      {groupable.length > 0 && (
        <Menu trigger={<Button variant="plain">+ Gruppieren</Button>}>
          {groupable.map((c) => (
            <MenuItem key={c.id} onAction={() => table.setGrouping((g) => [...g, c.id])}>
              {c.header}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
}

/* ⚙-Menü: Spalten ein-/ausblenden, umsortieren, links/rechts pinnen. */
function ColumnMenu<T>({
  table,
  columns,
  onColumnsReorder,
}: {
  table: Table<T>;
  columns: AnalyticalColumn<T>[];
  onColumnsReorder?: (order: string[]) => void;
}) {
  const labelFor = (id: string): ReactNode => {
    const col = columns.find((c) => (c.id ?? c.accessorKey ?? String(c.header)) === id);
    return col ? col.header : id;
  };
  const leaf = table.getAllLeafColumns().filter((c) => c.id !== SELECT_COL_ID);
  const order = leaf.map((c) => c.id);
  const move = (id: string, dir: -1 | 1) => {
    const idx = order.indexOf(id);
    const next = idx + dir;
    if (next < 0 || next >= order.length) return;
    const reordered = [...order];
    [reordered[idx], reordered[next]] = [reordered[next]!, reordered[idx]!];
    table.setColumnOrder(reordered);
    onColumnsReorder?.(reordered);
  };
  return (
    <div className="prn-colmenu">
      <DialogTrigger>
        <Button variant="plain" aria-label="Spalten">
          <Icon name="settings" size={15} /> Spalten
        </Button>
        <Popover className="prn-colmenu-popover">
          <ul className="prn-colmenu-list" role="group" aria-label="Spalten anpassen">
            {leaf.map((col, i) => {
              const label = labelFor(col.id);
              const pinned = col.getIsPinned();
              return (
                <li key={col.id} className="prn-colmenu-row">
                  {col.getCanHide() ? (
                    <Checkbox isSelected={col.getIsVisible()} onChange={() => col.toggleVisibility()}>
                      {label}
                    </Checkbox>
                  ) : (
                    <span className="prn-colmenu-label">{label}</span>
                  )}
                  <span className="prn-colmenu-actions">
                    <button
                      type="button"
                      className="prn-colmenu-btn"
                      aria-label={`${String(label)} nach oben`}
                      disabled={i === 0}
                      onClick={() => move(col.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="prn-colmenu-btn"
                      aria-label={`${String(label)} nach unten`}
                      disabled={i === leaf.length - 1}
                      onClick={() => move(col.id, 1)}
                    >
                      ↓
                    </button>
                    {col.getCanPin() && (
                      <>
                        <button
                          type="button"
                          className="prn-colmenu-btn"
                          aria-label={`${String(label)} links pinnen`}
                          data-active={pinned === "left" ? "" : undefined}
                          onClick={() => col.pin(pinned === "left" ? false : "left")}
                        >
                          ⇤
                        </button>
                        <button
                          type="button"
                          className="prn-colmenu-btn"
                          aria-label={`${String(label)} rechts pinnen`}
                          data-active={pinned === "right" ? "" : undefined}
                          onClick={() => col.pin(pinned === "right" ? false : "right")}
                        >
                          ⇥
                        </button>
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </Popover>
      </DialogTrigger>
    </div>
  );
}

function GroupRow<T>({
  row,
  rowIndex,
  gridSpan,
  leafColumns,
}: {
  row: Row<T>;
  rowIndex: number;
  gridSpan: number;
  leafColumns: Column<T, unknown>[];
}) {
  const expanded = row.getIsExpanded();
  const groupingColumnId = row.groupingColumnId ?? "";
  return (
    <div
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-expanded={expanded}
      data-group=""
      data-depth={row.depth}
      data-index={rowIndex}
      className="prn-table-group"
      tabIndex={0}
      onClick={() => row.toggleExpanded()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          row.toggleExpanded();
        }
      }}
      style={{ gridColumn: `1 / ${gridSpan + 1}`, paddingLeft: `${row.depth * 16 + 12}px` }}
    >
      <span className="prn-group-chevron" aria-hidden>
        {expanded ? "▾" : "▸"}
      </span>
      <span className="prn-group-label">{String(row.getGroupingValue(groupingColumnId))}</span>
      <span className="prn-group-count">({row.subRows.length})</span>
      <span className="prn-group-aggs">
        {leafColumns
          .filter((c) => c.columnDef.aggregatedCell && c.id !== groupingColumnId)
          .map((c) => {
            const cell = row.getAllCells().find((cl) => cl.column.id === c.id);
            return cell ? (
              <span key={c.id} className="prn-group-agg">
                {flexRender(c.columnDef.aggregatedCell, cell.getContext())}
              </span>
            ) : null;
          })}
      </span>
    </div>
  );
}

function SkeletonRows<T>({
  count,
  leafColumns,
  popInIds,
  withRowHighlight,
  withNavigationHighlight,
}: {
  count: number;
  leafColumns: Column<T, unknown>[];
  popInIds: Set<string>;
  withRowHighlight: boolean;
  withNavigationHighlight: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, r) => (
        <div role="row" className="prn-table-row" key={`skel-${r}`} aria-hidden>
          {/* Highlight-Band-Track konsistent zu den echten Zeilen halten. */}
          {withRowHighlight && <span className="prn-row-highlight" data-state="none" aria-hidden />}
          {leafColumns
            .filter((c) => !popInIds.has(c.id))
            .map((c) => {
              const meta = c.columnDef.meta;
              return (
                <div
                  key={c.id}
                  className={cx("prn-td", meta?.isSelect && "prn-td-select")}
                  data-align={meta?.align}
                >
                  <span className="prn-skeleton prn-skel-line" />
                </div>
              );
            })}
          {/* Navigations-Track-Platzhalter. */}
          {withNavigationHighlight && <div className="prn-td prn-td-nav" />}
        </div>
      ))}
    </>
  );
}
