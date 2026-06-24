import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  DmnTableEditor,
  DmnEditor,
  type DmnCellPlugin,
} from "../../packages/dmn/src/index";
import "../../packages/ui/src/data/data.css";

/* ---------------- Demo-DMN (MaKo-Flavor) ---------------- */

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="def_AdressErmittlung" name="Adress-Ermittlung"
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_Marktrolle" name="Marktrolle ermitteln">
    <decisionTable id="DT_Marktrolle" hitPolicy="UNIQUE">
      <input id="in_pruefi" label="Prüfidentifikator">
        <inputExpression id="ie_pruefi" typeRef="string"><text>pruefidentifikator</text></inputExpression>
        <inputValues id="iv_pruefi"><text>"11001","11002","11003"</text></inputValues>
      </input>
      <input id="in_sparte" label="Sparte">
        <inputExpression id="ie_sparte" typeRef="string"><text>sparte</text></inputExpression>
        <inputValues id="iv_sparte"><text>"Strom","Gas"</text></inputValues>
      </input>
      <output id="out_rolle" label="Marktrolle" name="marktrolle" typeRef="string"/>
      <rule id="rule_1">
        <inputEntry id="r1_pruefi"><text>"11001"</text></inputEntry>
        <inputEntry id="r1_sparte"><text>"Strom"</text></inputEntry>
        <outputEntry id="r1_rolle"><text>"LF"</text></outputEntry>
        <annotationEntry><text>Lieferantenwechsel Strom</text></annotationEntry>
      </rule>
      <rule id="rule_2">
        <inputEntry id="r2_pruefi"><text>"11002"</text></inputEntry>
        <inputEntry id="r2_sparte"><text>"Gas"</text></inputEntry>
        <outputEntry id="r2_rolle"><text>"NB"</text></outputEntry>
      </rule>
      <rule id="rule_3">
        <inputEntry id="r3_pruefi"><text>"11003"</text></inputEntry>
        <inputEntry id="r3_sparte"><text>-</text></inputEntry>
        <outputEntry id="r3_rolle"><text>"MSB"</text></outputEntry>
        <annotationEntry><text>Messstellenbetrieb, spartenübergreifend</text></annotationEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;

const meta: Meta<typeof DmnTableEditor> = {
  title: "Components/DmnTableEditor",
  component: DmnTableEditor,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DmnTableEditor>;

/* Voller Editor (uncontrolled) mit Save-Callback. */
export const Default: Story = {
  render: () => (
    <div style={{ height: "80vh" }}>
      <DmnTableEditor
        defaultValue={SAMPLE_XML}
        title="E_0405 — Marktrolle ermitteln"
        subtitle="LF · 2026-04-01"
        onSave={(xml) => {
          // eslint-disable-next-line no-console
          console.log("save", xml.length, "Zeichen");
        }}
        onSwitchToExpert={() => {
          // eslint-disable-next-line no-alert
          alert("→ Experten-Modus (siehe DmnEditor-Story)");
        }}
      />
    </div>
  ),
};

/* Controlled — XML wird live aus onChange in den State zurückgespiegelt. */
export const Controlled: Story = {
  render: () => {
    const [xml, setXml] = useState(SAMPLE_XML);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "80vh" }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <DmnTableEditor
            value={xml}
            onChange={setXml}
            title="Controlled"
            subtitle={`${xml.length} Zeichen`}
          />
        </div>
        <pre
          style={{
            maxHeight: "8rem",
            overflow: "auto",
            margin: 0,
            padding: "0.5rem",
            fontSize: "0.7rem",
            background: "var(--prn-bg-elevated)",
            borderTop: "1px solid var(--prn-separator)",
          }}
        >
          {xml.slice(0, 600)}…
        </pre>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div style={{ height: "80vh" }}>
      <DmnTableEditor defaultValue={SAMPLE_XML} title="Nur-Lesen" readOnly />
    </div>
  ),
};

/* Domänen-Plugin: Prüfi-Spalte bekommt ein Dropdown statt Freitext. */
const pruefiPlugin: DmnCellPlugin = {
  matches: (col) => col.expression.toLowerCase() === "pruefidentifikator",
  renderEditor: ({ value, onChange, onCommit, onCancel }) => (
    <select
      autoFocus
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === "Enter") onCommit();
        if (e.key === "Escape") onCancel();
      }}
      style={{ width: "100%", fontFamily: "var(--prn-font-mono)" }}
    >
      <option value="">–</option>
      <option value='"11001"'>11001 — LF-Wechsel</option>
      <option value='"11002"'>11002 — NB-Meldung</option>
      <option value='"11003"'>11003 — MSB</option>
    </select>
  ),
};

export const WithCellPlugin: Story = {
  render: () => (
    <div style={{ height: "80vh" }}>
      <DmnTableEditor
        defaultValue={SAMPLE_XML}
        title="Mit Prüfi-Plugin"
        subtitle="cellPlugins-Slot (kein MaCo-Default)"
        cellPlugins={[pruefiPlugin]}
      />
    </div>
  ),
};

/* Umschalter Tabelle ↔ Experte (teilt dasselbe XML). */
export const WithModeSwitch: StoryObj<typeof DmnEditor> = {
  render: () => {
    const [xml, setXml] = useState(SAMPLE_XML);
    return (
      <div style={{ height: "80vh" }}>
        <DmnEditor
          value={xml}
          onChange={setXml}
          title="E_0405 — Umschalter"
          subtitle="Tabelle ↔ Experte"
          onSave={(x) => {
            // eslint-disable-next-line no-console
            console.log("save", x.length);
          }}
        />
      </div>
    );
  },
};
