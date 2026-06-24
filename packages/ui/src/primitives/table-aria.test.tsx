import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, TableHeader, TableBody, Column, Row, Cell } from "./table-aria";

interface Mp {
  id: string;
  name: string;
  rolle: string;
}

const DATA: Mp[] = [
  { id: "mp-1", name: "Stadtwerke Musterstadt", rolle: "Lieferant" },
  { id: "mp-2", name: "EnergieNetz AG", rolle: "Netzbetreiber" },
  { id: "mp-3", name: "GasVersorgung GmbH", rolle: "MSB" },
];

function SampleTable(props: { selectionMode?: "single" | "multiple"; onSelectionChange?: (k: unknown) => void; "aria-label"?: string }) {
  return (
    <Table aria-label={props["aria-label"] ?? "Marktpartner"} selectionMode={props.selectionMode} onSelectionChange={props.onSelectionChange}>
      <TableHeader>
        <Column id="name" isRowHeader>
          Marktpartner
        </Column>
        <Column id="rolle">Rolle</Column>
      </TableHeader>
      <TableBody items={DATA}>
        {(row) => (
          <Row id={row.id}>
            <Cell>{row.name}</Cell>
            <Cell>{row.rolle}</Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

describe("table-aria primitive", () => {
  it("renders columns and rows as a grid", () => {
    render(<SampleTable />);
    const table = screen.getByRole("grid", { name: "Marktpartner" });
    expect(table).toHaveClass("prn-table");
    expect(screen.getByRole("columnheader", { name: "Marktpartner" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Stadtwerke Musterstadt" })).toBeInTheDocument();
    // 1 Header-Zeile + 3 Daten-Zeilen
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("static cell content is rendered", () => {
    render(<SampleTable />);
    expect(screen.getByText("EnergieNetz AG")).toBeInTheDocument();
    expect(screen.getByText("Netzbetreiber")).toBeInTheDocument();
  });

  it("supports row selection via checkbox column", async () => {
    const onSelectionChange = vi.fn();
    render(<SampleTable selectionMode="multiple" onSelectionChange={onSelectionChange} />);
    // Mit selectionMode rendern die Zeilen eine Auswahl-Checkbox.
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
    // Erste Zeilen-Checkbox (nach der „Alle"-Checkbox im Header) anklicken.
    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1]!;
    const rowCheckbox = within(firstDataRow).getByRole("checkbox");
    await userEvent.click(rowCheckbox);
    expect(onSelectionChange).toHaveBeenCalled();
    expect(firstDataRow).toHaveAttribute("aria-selected", "true");
  });

  it("marks sortable columns with aria-sort", () => {
    render(
      <Table aria-label="Sortierbar" sortDescriptor={{ column: "name", direction: "ascending" }} onSortChange={() => {}}>
        <TableHeader>
          <Column id="name" isRowHeader allowsSorting>
            Marktpartner
          </Column>
        </TableHeader>
        <TableBody items={DATA}>
          {(row) => (
            <Row id={row.id}>
              <Cell>{row.name}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>,
    );
    const header = screen.getByRole("columnheader", { name: /Marktpartner/ });
    expect(header).toHaveAttribute("aria-sort", "ascending");
  });
});
