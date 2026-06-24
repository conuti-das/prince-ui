import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { Selection } from "react-aria-components";
import { Table, TableHeader, TableBody, Column, Row, Cell } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/table-aria.css";

/* ---------------- Demo-Daten (MaKo / Marktpartner-Flavor) ---------------- */

interface Marktpartner {
  id: string;
  name: string;
  rolle: "Lieferant" | "Netzbetreiber" | "MSB";
  sparte: "Strom" | "Gas";
  nachrichten: number;
}

const MARKTPARTNER: Marktpartner[] = [
  { id: "9900123010", name: "Stadtwerke Musterstadt", rolle: "Lieferant", sparte: "Strom", nachrichten: 1284 },
  { id: "9900123011", name: "EnergieNetz AG", rolle: "Netzbetreiber", sparte: "Strom", nachrichten: 842 },
  { id: "9900123012", name: "GasVersorgung GmbH", rolle: "Lieferant", sparte: "Gas", nachrichten: 511 },
  { id: "9900123013", name: "Netz Nord eG", rolle: "Netzbetreiber", sparte: "Gas", nachrichten: 376 },
  { id: "9900123014", name: "Messstellen Süd", rolle: "MSB", sparte: "Strom", nachrichten: 198 },
];

const meta = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Schlankes Tabellen-Primitive auf Basis von react-aria-components `Table` (mit `TableHeader`, `TableBody`, `Column`, `Row`, `Cell`). " +
          "Liefert Tastaturnavigation, optionale Zeilenauswahl (`selectionMode`) inklusive Auswahl-Checkboxen sowie sortierbare Spalten (`Column allowsSorting`); für große Daten-Grids gibt es separat die `AnalyticalTable`.",
      },
    },
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
    stickyHeader: { control: "boolean" },
  },
  args: { selectionMode: "none", stickyHeader: false },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Table {...args} aria-label="Marktpartner">
      <TableHeader>
        <Column id="name" isRowHeader>
          Marktpartner
        </Column>
        <Column id="rolle">Rolle</Column>
        <Column id="sparte">Sparte</Column>
        <Column id="nachrichten">
          <span style={{ display: "block", textAlign: "right" }}>Nachrichten</span>
        </Column>
      </TableHeader>
      <TableBody items={MARKTPARTNER}>
        {(mp) => (
          <Row id={mp.id}>
            <Cell>{mp.name}</Cell>
            <Cell>{mp.rolle}</Cell>
            <Cell>{mp.sparte}</Cell>
            <Cell>
              <span style={{ display: "block", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {mp.nachrichten.toLocaleString("de-DE")}
              </span>
            </Cell>
          </Row>
        )}
      </TableBody>
    </Table>
  ),
};

export const WithSelection: Story = {
  render: () => {
    const [selected, setSelected] = useState<Selection>(new Set(["9900123011"]));
    return (
      <Table
        aria-label="Marktpartner mit Auswahl"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <TableHeader>
          <Column id="name" isRowHeader>
            Marktpartner
          </Column>
          <Column id="rolle">Rolle</Column>
          <Column id="sparte">Sparte</Column>
        </TableHeader>
        <TableBody items={MARKTPARTNER}>
          {(mp) => (
            <Row id={mp.id}>
              <Cell>{mp.name}</Cell>
              <Cell>{mp.rolle}</Cell>
              <Cell>{mp.sparte}</Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    );
  },
};

export const Sortable: Story = {
  render: () => {
    const [sort, setSort] = useState<{ column: string; direction: "ascending" | "descending" }>({
      column: "nachrichten",
      direction: "descending",
    });
    const rows = [...MARKTPARTNER].sort((a, b) => {
      const col = sort.column as keyof Marktpartner;
      const cmp = a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0;
      return sort.direction === "ascending" ? cmp : -cmp;
    });
    return (
      <Table
        aria-label="Sortierbare Marktpartner"
        sortDescriptor={sort}
        onSortChange={(d) => setSort({ column: String(d.column), direction: d.direction })}
      >
        <TableHeader>
          <Column id="name" isRowHeader allowsSorting>
            Marktpartner
          </Column>
          <Column id="rolle" allowsSorting>
            Rolle
          </Column>
          <Column id="nachrichten" allowsSorting>
            Nachrichten
          </Column>
        </TableHeader>
        <TableBody items={rows}>
          {(mp) => (
            <Row id={mp.id}>
              <Cell>{mp.name}</Cell>
              <Cell>{mp.rolle}</Cell>
              <Cell>
              <span style={{ display: "block", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {mp.nachrichten.toLocaleString("de-DE")}
              </span>
            </Cell>
            </Row>
          )}
        </TableBody>
      </Table>
    );
  },
};
