import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DmnExpertEditor } from "../../packages/dmn/src/index";

/**
 * ⑥ DmnExpertEditor — dmn-js-Modeler (DRD + decision-table + literal),
 * gethemt über die prince-ui-Token-Bridge.
 *
 * Hinweis: dmn-js ist ein **optionaler Peer** und wird lazy via dynamic import
 * geladen. Ist dmn-js@^17 nicht installiert, zeigt der Canvas eine Fehlermeldung.
 */

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
             xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
             id="def_Expert" name="Experten-Demo"
             namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="Decision_1" name="Rabattstufe">
    <decisionTable id="DT_1" hitPolicy="UNIQUE">
      <input id="in_umsatz" label="Jahresumsatz">
        <inputExpression id="ie_umsatz" typeRef="number"><text>umsatz</text></inputExpression>
      </input>
      <output id="out_rabatt" label="Rabatt" name="rabatt" typeRef="number"/>
      <rule id="r1">
        <inputEntry id="r1i"><text>&lt; 1000</text></inputEntry>
        <outputEntry id="r1o"><text>0</text></outputEntry>
      </rule>
      <rule id="r2">
        <inputEntry id="r2i"><text>[1000..5000]</text></inputEntry>
        <outputEntry id="r2o"><text>5</text></outputEntry>
      </rule>
      <rule id="r3">
        <inputEntry id="r3i"><text>&gt; 5000</text></inputEntry>
        <outputEntry id="r3o"><text>10</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
  <dmndi:DMNDI>
    <dmndi:DMNDiagram>
      <dmndi:DMNShape dmnElementRef="Decision_1">
        <dc:Bounds height="80" width="180" x="160" y="100" />
      </dmndi:DMNShape>
    </dmndi:DMNDiagram>
  </dmndi:DMNDI>
</definitions>`;

const meta: Meta<typeof DmnExpertEditor> = {
  title: "Components/DmnExpertEditor",
  component: DmnExpertEditor,
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj<typeof DmnExpertEditor>;

export const Default: Story = {
  render: () => {
    const [, setXml] = useState(SAMPLE_XML);
    return (
      <div style={{ height: "80vh" }}>
        <DmnExpertEditor
          defaultValue={SAMPLE_XML}
          onChange={setXml}
          onSave={(xml) => {
            // eslint-disable-next-line no-console
            console.log("save", xml.length);
          }}
        />
      </div>
    );
  },
};

export const Dark: Story = {
  parameters: { theme: "dark" },
  render: () => (
    <div data-theme="dark" style={{ height: "80vh" }}>
      <DmnExpertEditor defaultValue={SAMPLE_XML} colorScheme="dark" />
    </div>
  ),
};
