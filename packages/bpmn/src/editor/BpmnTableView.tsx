/**
 * Tabellenansicht für BPMN-Prozessschritte (prince-ui).
 * Parst das BPMN-XML client-seitig (pure `parseBpmnElements`) und zeigt alle
 * Flow-Elemente als `AnalyticalTable` mit `SearchField` + `Badge` an.
 * Portiert aus maco `BpmnEditor/BpmnTableView.tsx` (UI5 → prince-ui).
 */
import { useMemo, useState } from "react";
import { AnalyticalTable, Badge, SearchField, type AnalyticalColumn } from "prince-ui";
import {
  parseBpmnElements,
  typeTone,
  BPMN_TYPE_LABEL,
  type BpmnTableElement,
} from "./parseBpmnElements";
import "./editor.css";

export interface BpmnTableViewProps {
  /** BPMN 2.0 XML. */
  xml: string;
  /** Sichtbare Zeilen (Höhe der Tabelle). Default 30. */
  visibleRows?: number;
  /** Klassennamen-Override. */
  className?: string;
}

interface BpmnRow extends BpmnTableElement {
  idx: number;
}

export function BpmnTableView({ xml, visibleRows = 30, className }: BpmnTableViewProps) {
  const [search, setSearch] = useState("");

  const elements = useMemo(() => parseBpmnElements(xml), [xml]);

  const filtered = useMemo(() => {
    if (!search.trim()) return elements;
    const q = search.toLowerCase();
    return elements.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (BPMN_TYPE_LABEL[e.type] ?? e.type).toLowerCase().includes(q) ||
        e.lane.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q),
    );
  }, [elements, search]);

  const columns = useMemo<AnalyticalColumn<BpmnRow>[]>(
    () => [
      {
        header: "#",
        accessorKey: "idx",
        width: "56px",
        disableFilters: true,
        cellRender: (row) => <span className="prn-bpmn-muted">{row.idx}</span>,
      },
      {
        header: "Typ",
        accessorKey: "type",
        width: "168px",
        cellRender: (row) => (
          <Badge tone={typeTone(row.type)}>{BPMN_TYPE_LABEL[row.type] ?? row.type}</Badge>
        ),
      },
      {
        header: "Name / Bezeichnung",
        accessorKey: "name",
        cellRender: (row) =>
          row.name ? <span>{row.name}</span> : <span className="prn-bpmn-muted">—</span>,
      },
      {
        header: "Lane / Rolle",
        accessorKey: "lane",
        cellRender: (row) => <span className="prn-bpmn-muted">{row.lane}</span>,
      },
      {
        header: "ID",
        accessorKey: "id",
        cellRender: (row) => <span className="prn-bpmn-mono">{row.id}</span>,
      },
    ],
    [],
  );

  const tableData = useMemo<BpmnRow[]>(
    () => filtered.map((el, idx) => ({ ...el, idx: idx + 1 })),
    [filtered],
  );

  return (
    <div className={["prn-bpmn-table", className].filter(Boolean).join(" ")}>
      <div className="prn-bpmn-table-bar">
        <SearchField
          aria-label="Elemente durchsuchen"
          placeholder="Suche nach Name, Typ, Lane, ID…"
          value={search}
          onChange={setSearch}
        />
        <span className="prn-bpmn-muted prn-bpmn-table-count">
          {filtered.length} / {elements.length} Elemente
        </span>
      </div>
      <div className="prn-bpmn-table-body">
        <AnalyticalTable
          data={tableData}
          columns={columns}
          visibleRows={visibleRows}
          alternateRowColor
          selectionMode="none"
        />
      </div>
    </div>
  );
}

export default BpmnTableView;
