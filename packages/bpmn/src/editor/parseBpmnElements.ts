/**
 * Pure BPMN-XML-Parser für die Tabellenansicht.
 * Liest alle Flow-Elemente (Tasks, Gateways, Events, …) + Lane-Zuordnung aus
 * dem XML. Reines DOMParser-Parsing — getestet ohne bpmn-js.
 */

const BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";

export const BPMN_ELEMENT_TYPES = [
  "startEvent",
  "endEvent",
  "serviceTask",
  "userTask",
  "sendTask",
  "receiveTask",
  "manualTask",
  "businessRuleTask",
  "scriptTask",
  "task",
  "exclusiveGateway",
  "parallelGateway",
  "inclusiveGateway",
  "eventBasedGateway",
  "complexGateway",
  "intermediateCatchEvent",
  "intermediateThrowEvent",
  "boundaryEvent",
  "subProcess",
  "callActivity",
] as const;

export const BPMN_TYPE_LABEL: Record<string, string> = {
  startEvent: "Start",
  endEvent: "Ende",
  serviceTask: "Service Task",
  userTask: "User Task",
  sendTask: "Send Task",
  receiveTask: "Receive Task",
  manualTask: "Manuell",
  businessRuleTask: "Business Rule",
  scriptTask: "Script",
  task: "Task",
  exclusiveGateway: "Gateway (XOR)",
  parallelGateway: "Gateway (AND)",
  inclusiveGateway: "Gateway (OR)",
  eventBasedGateway: "Gateway (Event)",
  complexGateway: "Gateway (komplex)",
  intermediateCatchEvent: "Ereignis (catch)",
  intermediateThrowEvent: "Ereignis (throw)",
  boundaryEvent: "Grenzereignis",
  subProcess: "Teilprozess",
  callActivity: "Call Activity",
};

export interface BpmnTableElement {
  id: string;
  type: string;
  name: string;
  lane: string;
}

/** prince-ui-Badge-Ton je Elementtyp. */
export function typeTone(
  type: string,
): "blue" | "green" | "red" | "orange" | "neutral" {
  if (type.includes("Gateway")) return "orange";
  if (type === "startEvent") return "green";
  if (type === "endEvent") return "red";
  if (type.includes("Task")) return "blue";
  return "neutral";
}

/** Parst alle Flow-Elemente aus dem BPMN-XML (mit Lane-Zuordnung). */
export function parseBpmnElements(xml: string): BpmnTableElement[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const laneMap: Record<string, string> = {};
  const lanes = doc.getElementsByTagNameNS(BPMN_NS, "lane");
  for (let i = 0; i < lanes.length; i++) {
    const lane = lanes[i];
    if (!lane) continue;
    const laneName = lane.getAttribute("name") ?? "";
    const refs = lane.getElementsByTagNameNS(BPMN_NS, "flowNodeRef");
    for (let j = 0; j < refs.length; j++) {
      const refId = refs[j]?.textContent?.trim() ?? "";
      if (refId) laneMap[refId] = laneName;
    }
  }

  const elements: BpmnTableElement[] = [];
  for (const type of BPMN_ELEMENT_TYPES) {
    const nodes = doc.getElementsByTagNameNS(BPMN_NS, type);
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i];
      if (!el) continue;
      const id = el.getAttribute("id") ?? "";
      if (id) {
        elements.push({
          id,
          type,
          name: el.getAttribute("name") ?? "",
          lane: laneMap[id] ?? "",
        });
      }
    }
  }
  return elements;
}
