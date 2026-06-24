import type { Meta, StoryObj } from "@storybook/react";
import { Button, DialogTrigger, Modal, setTheme } from "../packages/ui/src/index";
import "../packages/ui/src/primitives/forms.css";

/**
 * „Geerbte" Komponenten: prince-ui baut vollständig auf
 * `react-aria-components` (RAC) auf. Jede prince-ui-Komponente ist ein dünner,
 * Prince-gestylter Wrapper um ein RAC-Primitive (oder ein direkter Re-Export).
 * Diese Seite macht sichtbar, was aus dem Framework kommt.
 */
const meta: Meta = {
  title: "Foundations/React Aria (geerbt)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

/** prince-ui-Komponente → zugrunde liegendes react-aria-components-Primitive. */
const MAP: { apl: string; rac: string; note: string }[] = [
  { apl: "Button", rac: "Button", note: "Press-Events, Fokus-Ring, Disabled" },
  { apl: "TextField / SearchField", rac: "TextField / SearchField", note: "Label, Description, Validation" },
  { apl: "Checkbox / Switch", rac: "Checkbox / Switch", note: "Indeterminate, Selektion" },
  { apl: "Select / SelectItem", rac: "Select / ListBoxItem", note: "Popover-Listbox, Tastatur" },
  { apl: "Modal", rac: "Dialog + Modal", note: "Fokus-Trap, Escape, Fokus-Rückgabe" },
  { apl: "DialogTrigger", rac: "DialogTrigger", note: "1:1 Re-Export (kein Wrapper)" },
  { apl: "Menu / MenuItem", rac: "MenuTrigger + Menu", note: "Roving-Tabindex, Aktionen" },
  { apl: "Popover", rac: "Popover", note: "Platzierung, Außen-Klick, Dismiss" },
  { apl: "Tooltip", rac: "TooltipTrigger + Tooltip", note: "Delay, Hover/Focus" },
  { apl: "SegmentedControl / Segment", rac: "ToggleButtonGroup / ToggleButton", note: "Single-Select-Segmente" },
  { apl: "Tabs / TabBar / Tab / TabPanel", rac: "Tabs / TabList / Tab / TabPanel", note: "ARIA-Tabs, Tastatur" },
];

const cell: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid var(--prn-separator, rgba(120,120,128,0.2))",
  textAlign: "left",
  verticalAlign: "top",
};

/** Überblick: welche prince-ui-Komponente erbt von welchem RAC-Primitive. */
export const Overview: Story = {
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <p style={{ color: "var(--prn-label-2)", marginTop: 0 }}>
        Alle interaktiven prince-ui-Komponenten erben Verhalten, Fokus-Management und
        Barrierefreiheit von <code>react-aria-components</code>. prince-ui liefert nur die
        Prince-Optik (Tokens, CSS) obendrauf.
      </p>
      <table style={{ borderCollapse: "collapse", width: "100%", color: "var(--prn-label)" }}>
        <thead>
          <tr>
            <th style={{ ...cell, fontWeight: 600 }}>prince-ui</th>
            <th style={{ ...cell, fontWeight: 600 }}>react-aria-components (geerbt)</th>
            <th style={{ ...cell, fontWeight: 600 }}>vom Framework übernommen</th>
          </tr>
        </thead>
        <tbody>
          {MAP.map((r) => (
            <tr key={r.apl}>
              <td style={{ ...cell, fontWeight: 500 }}>{r.apl}</td>
              <td style={{ ...cell, fontFamily: "var(--prn-font-mono, ui-monospace, monospace)" }}>{r.rac}</td>
              <td style={{ ...cell, color: "var(--prn-label-2)" }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/** Der einzige 1:1-Re-Export: DialogTrigger kommt unverändert aus React Aria. */
export const PureReExport_DialogTrigger: Story = {
  name: "Re-Export: DialogTrigger",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      <p style={{ color: "var(--prn-label-2)", margin: 0 }}>
        <code>DialogTrigger</code> wird unverändert aus <code>react-aria-components</code>
        re-exportiert (<code>export {"{"} DialogTrigger {"}"}</code>). Es koppelt einen
        Trigger an ein Overlay (hier ein prince-ui <code>Modal</code>).
      </p>
      <div>
        <DialogTrigger>
          <Button>Dialog öffnen</Button>
          <Modal title="Geerbtes Verhalten">
            <p style={{ color: "var(--prn-label-2)", margin: 0 }}>
              Fokus-Trap, Escape-zum-Schließen und Fokus-Rückgabe stammen 1:1 aus React Aria.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="filled" slot="close">Fertig</Button>
            </div>
          </Modal>
        </DialogTrigger>
      </div>
    </div>
  ),
};

/** Helfer-Export (keine Komponente): setTheme schaltet das Theme am <html>. */
export const Helper_setTheme: Story = {
  name: "Helper: setTheme()",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480 }}>
      <p style={{ color: "var(--prn-label-2)", margin: 0 }}>
        <code>setTheme("light" | "dark" | null)</code> setzt/entfernt
        <code> data-theme</code> am <code>&lt;html&gt;</code>. <code>null</code> = System.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <Button variant="tinted" onPress={() => setTheme("light")}>Light</Button>
        <Button variant="tinted" onPress={() => setTheme("dark")}>Dark</Button>
        <Button variant="plain" onPress={() => setTheme(null)}>System</Button>
      </div>
    </div>
  ),
};
