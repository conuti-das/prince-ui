import { useState } from "react";
import {
  BpmnViewer,
  type HistoryActivityInstance,
  type Incident,
  type BpmnElementClick,
} from "@conuti-das/prince-ui-bpmn";
import { BPMN_VIEWER_XML } from "./demo-data";

const HISTORY: HistoryActivityInstance[] = [
  { id: "h1", activityId: "Start", activityName: "UTILMD eingegangen", startTime: "2026-06-01T08:00:00Z", endTime: "2026-06-01T08:00:01Z" },
  { id: "h2", activityId: "Pruefen", activityName: "Eingang prüfen", startTime: "2026-06-01T08:01:00Z", endTime: "2026-06-01T08:05:00Z" },
  { id: "h3", activityId: "GW", activityName: "Plausibel?", startTime: "2026-06-01T08:05:01Z", endTime: "2026-06-01T08:05:02Z" },
  { id: "h4", activityId: "Anreichern", activityName: "Daten anreichern", startTime: "2026-06-01T08:06:00Z" },
];

const INCIDENTS: Incident[] = [
  { id: "i1", incidentType: "failedJob", activityId: "Anreichern", incidentMessage: "Stammdaten-Service nicht erreichbar" },
];

/**
 * BpmnViewer mit Historie, Incident und Klick-Event — entspricht den Stories
 * „Mit Historie + Incident" und „Klick-Event".
 */
export default function BpmnViewerDemo() {
  const [clicked, setClicked] = useState<BpmnElementClick | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ font: "var(--prn-text-footnote)", color: "var(--prn-label-2)" }}>
        Zuletzt geklickt: {clicked ? `${clicked.elementId} (${clicked.elementType})` : "—"}
      </div>
      <div style={{ height: 460 }}>
        <BpmnViewer
          xml={BPMN_VIEWER_XML}
          activityHistory={HISTORY}
          incidents={INCIDENTS}
          runtimeActiveActivityIds={["Senden"]}
          onElementClick={setClicked}
        />
      </div>
    </div>
  );
}
