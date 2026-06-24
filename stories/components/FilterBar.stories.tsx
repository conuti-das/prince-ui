import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  FilterBar,
  FilterField,
  type ActiveFilter,
  Button,
  Select,
  SelectItem,
  SearchField,
} from "../../packages/ui/src/index";
import "../../packages/ui/src/data/data.css";

const meta = {
  title: "Components/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Filterleiste für Listen-/Tabellenansichten. Direkt sichtbare Felder werden als `children` (jeweils ein `FilterField`) übergeben; selten genutzte Felder wandern via `moreFields` in einen Überlauf-Popover. Aktive Filter erscheinen als entfernbare Chips (`activeFilters` + `onRemoveFilter`/`onClearAll`), rechts lassen sich `actions` (z. B. \"Anwenden\") platzieren. `FilterField` ist die domänenfreie Label-+-Control-Hülle und nimmt beliebige Eingabe-Controls (Select, SearchField, …) als children auf.",
      },
    },
  },
  argTypes: {
    moreLabel: { control: "text" },
    "aria-label": { control: "text" },
  },
} satisfies Meta<typeof FilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [active, setActive] = useState<ActiveFilter[]>([
      { id: "sparte", label: "Sparte", value: "Strom" },
      { id: "status", label: "Status", value: "Fehler" },
    ]);
    return (
      <FilterBar
        moreFields={
          <>
            <FilterField label="Typ">
              <Select placeholder="Alle" aria-label="Typ">
                <SelectItem id="utilmd">UTILMD</SelectItem>
                <SelectItem id="mscons">MSCONS</SelectItem>
                <SelectItem id="aperak">APERAK</SelectItem>
              </Select>
            </FilterField>
            <FilterField label="Marktpartner">
              <SearchField placeholder="MP-ID…" aria-label="Marktpartner" />
            </FilterField>
          </>
        }
        activeFilters={active}
        onRemoveFilter={(id) => setActive((a) => a.filter((f) => f.id !== id))}
        onClearAll={() => setActive([])}
        actions={<Button variant="filled">Anwenden</Button>}
      >
        <FilterField label="Suche">
          <SearchField placeholder="Transaktion suchen…" aria-label="Suche" />
        </FilterField>
        <FilterField label="Sparte">
          <Select placeholder="Alle" aria-label="Sparte" defaultSelectedKey="strom">
            <SelectItem id="strom">Strom</SelectItem>
            <SelectItem id="gas">Gas</SelectItem>
          </Select>
        </FilterField>
        <FilterField label="Status">
          <Select placeholder="Alle" aria-label="Status">
            <SelectItem id="ok">OK</SelectItem>
            <SelectItem id="fehler">Fehler</SelectItem>
            <SelectItem id="wartet">Wartet</SelectItem>
          </Select>
        </FilterField>
      </FilterBar>
    );
  },
};

export const Example = Playground;

/** Einzelnes `FilterField` mit Label + Control — die Bausteine der FilterBar. */
export const FilterFieldExample: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
      <FilterField label="Sparte">
        <Select placeholder="Alle" aria-label="Sparte">
          <SelectItem id="strom">Strom</SelectItem>
          <SelectItem id="gas">Gas</SelectItem>
        </Select>
      </FilterField>
      <FilterField label="Suche">
        <SearchField placeholder="Transaktion suchen…" aria-label="Suche" />
      </FilterField>
    </div>
  ),
};
