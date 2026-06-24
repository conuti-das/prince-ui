import { describe, it, expect } from "vitest";
import { parseBpmnElements, typeTone, BPMN_TYPE_LABEL } from "./parseBpmnElements";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d">
  <bpmn:collaboration id="C">
    <bpmn:participant id="P" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1">
    <bpmn:laneSet>
      <bpmn:lane id="L1" name="Sachbearbeitung">
        <bpmn:flowNodeRef>Start_1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_1</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="Start_1" name="Eingang" />
    <bpmn:userTask id="Task_1" name="Prüfen" />
    <bpmn:exclusiveGateway id="GW_1" />
    <bpmn:endEvent id="End_1" name="Fertig" />
  </bpmn:process>
</bpmn:definitions>`;

describe("parseBpmnElements", () => {
  it("parses all flow elements with names and lanes", () => {
    const els = parseBpmnElements(XML);
    const byId = Object.fromEntries(els.map((e) => [e.id, e]));
    expect(byId["Start_1"]).toMatchObject({ type: "startEvent", name: "Eingang", lane: "Sachbearbeitung" });
    expect(byId["Task_1"]).toMatchObject({ type: "userTask", name: "Prüfen", lane: "Sachbearbeitung" });
    expect(byId["GW_1"]).toMatchObject({ type: "exclusiveGateway", name: "" });
    expect(byId["End_1"]).toMatchObject({ type: "endEvent", name: "Fertig" });
  });
});

describe("typeTone", () => {
  it("maps element types to prince-ui badge tones", () => {
    expect(typeTone("startEvent")).toBe("green");
    expect(typeTone("endEvent")).toBe("red");
    expect(typeTone("userTask")).toBe("blue");
    expect(typeTone("exclusiveGateway")).toBe("orange");
    expect(typeTone("subProcess")).toBe("neutral");
  });
});

describe("BPMN_TYPE_LABEL", () => {
  it("has German labels", () => {
    expect(BPMN_TYPE_LABEL.userTask).toBe("User Task");
    expect(BPMN_TYPE_LABEL.exclusiveGateway).toBe("Gateway (XOR)");
  });
});
