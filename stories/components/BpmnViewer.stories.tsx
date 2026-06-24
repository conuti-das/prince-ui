import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { BpmnViewer } from "../../packages/bpmn/src/index";
import type {
  HistoryActivityInstance,
  Incident,
  BpmnElementClick,
} from "../../packages/bpmn/src/index";

/**
 * MaKo-Flavor-Demoprozess: Eingang prüfen → Daten anreichern → Antwort senden.
 */
const DEMO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Defs_Mako" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_UTILMD" isExecutable="false">
    <bpmn:startEvent id="Start" name="UTILMD eingegangen">
      <bpmn:outgoing>f1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Pruefen" name="Eingang prüfen">
      <bpmn:incoming>f1</bpmn:incoming>
      <bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:exclusiveGateway id="GW" name="Plausibel?">
      <bpmn:incoming>f2</bpmn:incoming>
      <bpmn:outgoing>f3</bpmn:outgoing>
      <bpmn:outgoing>f4</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Anreichern" name="Daten anreichern">
      <bpmn:incoming>f3</bpmn:incoming>
      <bpmn:outgoing>f5</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:sendTask id="Senden" name="APERAK senden">
      <bpmn:incoming>f5</bpmn:incoming>
      <bpmn:outgoing>f6</bpmn:outgoing>
    </bpmn:sendTask>
    <bpmn:endEvent id="Abgelehnt" name="Abgelehnt">
      <bpmn:incoming>f4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="Fertig" name="Verarbeitet">
      <bpmn:incoming>f6</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Pruefen" />
    <bpmn:sequenceFlow id="f2" sourceRef="Pruefen" targetRef="GW" />
    <bpmn:sequenceFlow id="f3" sourceRef="GW" targetRef="Anreichern" />
    <bpmn:sequenceFlow id="f4" sourceRef="GW" targetRef="Abgelehnt" />
    <bpmn:sequenceFlow id="f5" sourceRef="Anreichern" targetRef="Senden" />
    <bpmn:sequenceFlow id="f6" sourceRef="Senden" targetRef="Fertig" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diag">
    <bpmndi:BPMNPlane id="Plane" bpmnElement="Process_UTILMD">
      <bpmndi:BPMNShape id="Start_di" bpmnElement="Start"><dc:Bounds x="160" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Pruefen_di" bpmnElement="Pruefen"><dc:Bounds x="250" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_di" bpmnElement="GW" isMarkerVisible="true"><dc:Bounds x="405" y="173" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Anreichern_di" bpmnElement="Anreichern"><dc:Bounds x="510" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Senden_di" bpmnElement="Senden"><dc:Bounds x="670" y="158" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Abgelehnt_di" bpmnElement="Abgelehnt"><dc:Bounds x="412" y="300" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Fertig_di" bpmnElement="Fertig"><dc:Bounds x="830" y="180" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="f1_di" bpmnElement="f1"><di:waypoint x="196" y="198" /><di:waypoint x="250" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f2_di" bpmnElement="f2"><di:waypoint x="350" y="198" /><di:waypoint x="405" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f3_di" bpmnElement="f3"><di:waypoint x="455" y="198" /><di:waypoint x="510" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f4_di" bpmnElement="f4"><di:waypoint x="430" y="223" /><di:waypoint x="430" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f5_di" bpmnElement="f5"><di:waypoint x="610" y="198" /><di:waypoint x="670" y="198" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="f6_di" bpmnElement="f6"><di:waypoint x="770" y="198" /><di:waypoint x="830" y="198" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const HISTORY: HistoryActivityInstance[] = [
  { id: "h1", activityId: "Start", activityName: "UTILMD eingegangen", startTime: "2026-06-01T08:00:00Z", endTime: "2026-06-01T08:00:01Z" },
  { id: "h2", activityId: "Pruefen", activityName: "Eingang prüfen", startTime: "2026-06-01T08:01:00Z", endTime: "2026-06-01T08:05:00Z" },
  { id: "h3", activityId: "GW", activityName: "Plausibel?", startTime: "2026-06-01T08:05:01Z", endTime: "2026-06-01T08:05:02Z" },
  { id: "h4", activityId: "Anreichern", activityName: "Daten anreichern", startTime: "2026-06-01T08:06:00Z" },
];

const INCIDENTS: Incident[] = [
  { id: "i1", incidentType: "failedJob", activityId: "Anreichern", incidentMessage: "Stammdaten-Service nicht erreichbar" },
];

const meta = {
  title: "Components/BpmnViewer",
  component: BpmnViewer,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Read-only BPMN-Viewer (bpmn-js NavigatedViewer) mit deklarativem Status-Highlighting über diagram-js-Marker + Overlays. Aktiv = blau, abgeschlossen = grün, Incident = rot, abgebrochen = orange.",
      },
    },
  },
} satisfies Meta<typeof BpmnViewer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  render: () => (
    <div style={{ height: 460 }}>
      <BpmnViewer xml={DEMO_XML} />
    </div>
  ),
};

export const MitHistorie: Story = {
  name: "Mit Historie + Incident",
  render: () => (
    <div style={{ height: 460 }}>
      <BpmnViewer xml={DEMO_XML} activityHistory={HISTORY} incidents={INCIDENTS} />
    </div>
  ),
};

export const RuntimeAktiv: Story = {
  name: "Runtime-aktiv (blau)",
  render: () => (
    <div style={{ height: 460 }}>
      <BpmnViewer
        xml={DEMO_XML}
        activityHistory={HISTORY.slice(0, 3)}
        runtimeActiveActivityIds={["Senden"]}
      />
    </div>
  ),
};

export const MitKlick: Story = {
  name: "Klick-Event",
  render: () => {
    const [clicked, setClicked] = useState<BpmnElementClick | null>(null);
    return (
      <div style={{ height: 460, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ font: "var(--prn-text-footnote)", color: "var(--prn-label-2)" }}>
          Zuletzt geklickt: {clicked ? `${clicked.elementId} (${clicked.elementType})` : "—"}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <BpmnViewer xml={DEMO_XML} activityHistory={HISTORY} onElementClick={setClicked} />
        </div>
      </div>
    );
  },
};
