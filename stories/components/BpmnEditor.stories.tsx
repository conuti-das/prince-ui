import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../packages/ui/src/index";
import { BpmnEditor } from "../../packages/bpmn/src/index";

const DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
  id="Defs_Editor" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="Start" name="Antrag eingegangen">
      <bpmn:outgoing>f1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Pruefen" name="Antrag prüfen" camunda:assignee="sachbearbeiter">
      <bpmn:incoming>f1</bpmn:incoming>
      <bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="Ende" name="Abgeschlossen">
      <bpmn:incoming>f2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Pruefen" />
    <bpmn:sequenceFlow id="f2" sourceRef="Pruefen" targetRef="Ende" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diag">
    <bpmndi:BPMNPlane id="Plane" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Start_di" bpmnElement="Start"><dc:Bounds x="160" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Pruefen_di" bpmnElement="Pruefen"><dc:Bounds x="250" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Ende_di" bpmnElement="Ende"><dc:Bounds x="412" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="196" y="198" /><di:waypoint x="250" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f2_di" bpmnElement="f2"><di:waypoint x="350" y="198" /><di:waypoint x="412" y="198" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const meta = {
  title: "Components/BpmnEditor",
  component: BpmnEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Vollwertiger bpmn-js-Modeler im prince-ui-Look: Properties-Panel (camunda-moddle), bpmnlint mit ErrorPanel, Original-Icons der Diagramm-Bibliothek in Palette/Context-Pad, Tabellen-Umschaltung (AnalyticalTable), Save via saveXML({format:true}). value/defaultValue/onChange-Muster.",
      },
    },
  },
} satisfies Meta<typeof BpmnEditor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  render: () => (
    <div style={{ height: "calc(100vh - 32px)" }}>
      <BpmnEditor
        defaultValue={DEMO_XML}
        onSave={(xml) => console.log("[BpmnEditor] save", xml.length, "Zeichen")}
      />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [xml, setXml] = useState(DEMO_XML);
    return (
      <div style={{ height: "calc(100vh - 32px)" }}>
        <BpmnEditor
          value={xml}
          onChange={setXml}
          onSave={(x) => console.log("[BpmnEditor] save", x.length)}
        />
      </div>
    );
  },
};

export const MitKiFixSlot: Story = {
  name: "Mit KI-Fix-Slot + actionsSlot",
  render: () => (
    <div style={{ height: "calc(100vh - 32px)" }}>
      <BpmnEditor
        defaultValue={DEMO_XML}
        actionsSlot={<Button variant="tinted">KI-Assistent</Button>}
        onKiFix={(issues) => console.log("[BpmnEditor] KI-Fix für", issues.length, "Befunde")}
        onSave={() => {}}
      />
    </div>
  ),
};

export const OhnePropertiesPanel: Story = {
  name: "Ohne Properties-Panel",
  render: () => (
    <div style={{ height: "calc(100vh - 32px)" }}>
      <BpmnEditor defaultValue={DEMO_XML} propertiesPanel={false} />
    </div>
  ),
};
