import { describe, it, expect } from "vitest";
import type { HistoryActivityInstance, Incident } from "../types";
import {
  buildActivityMap,
  findMultiExecutionIds,
  isFlowNode,
  isSequenceFlow,
  matchActivity,
  hasIncident,
  deriveStatus,
  isSequenceFlowExecuted,
  computeElementStatuses,
  computeExecutedFlows,
  STATUS_TOKEN,
  type DiagramElementLike,
} from "./status";

const act = (p: Partial<HistoryActivityInstance>): HistoryActivityInstance => ({
  id: p.id ?? p.activityId ?? "x",
  activityId: p.activityId ?? p.id ?? "x",
  ...p,
});

describe("buildActivityMap", () => {
  it("indexes by activityId, id and lowercased name", () => {
    const map = buildActivityMap([
      act({ id: "h1", activityId: "Task_1", activityName: "Prüfen" }),
    ]);
    expect(map.get("Task_1")).toBeTruthy();
    expect(map.get("h1")).toBeTruthy();
    expect(map.get("prüfen")).toBeTruthy();
  });
});

describe("findMultiExecutionIds", () => {
  it("detects activityIds that occur more than once", () => {
    const ids = findMultiExecutionIds([
      act({ activityId: "A" }),
      act({ activityId: "A" }),
      act({ activityId: "B" }),
    ]);
    expect(ids.has("A")).toBe(true);
    expect(ids.has("B")).toBe(false);
  });
});

describe("isFlowNode / isSequenceFlow", () => {
  it("classifies tasks, events, gateways, call activities", () => {
    expect(isFlowNode({ id: "x", type: "bpmn:UserTask" })).toBe(true);
    expect(isFlowNode({ id: "x", type: "bpmn:StartEvent" })).toBe(true);
    expect(isFlowNode({ id: "x", type: "bpmn:ExclusiveGateway" })).toBe(true);
    expect(isFlowNode({ id: "x", type: "bpmn:CallActivity" })).toBe(true);
    expect(isFlowNode({ id: "x", type: "bpmn:SequenceFlow" })).toBe(false);
  });
  it("uses businessObject.$type as fallback", () => {
    expect(isFlowNode({ id: "x", businessObject: { $type: "bpmn:ServiceTask" } })).toBe(true);
  });
  it("identifies sequence flows", () => {
    expect(isSequenceFlow({ id: "x", type: "bpmn:SequenceFlow" })).toBe(true);
    expect(isSequenceFlow({ id: "x", type: "bpmn:UserTask" })).toBe(false);
  });
});

describe("matchActivity", () => {
  const map = buildActivityMap([
    act({ id: "h1", activityId: "Task_1", activityName: "Eingang prüfen" }),
    act({ id: "h2", activityId: "Call_1", activityName: "Subprozess X" }),
  ]);
  it("matches directly by id", () => {
    expect(matchActivity({ id: "Task_1" }, map)?.activityId).toBe("Task_1");
  });
  it("matches case-insensitively", () => {
    expect(matchActivity({ id: "task_1" }, map)?.activityId).toBe("Task_1");
  });
  it("matches CallActivity by name", () => {
    const el: DiagramElementLike = {
      id: "Unmatched_Call",
      type: "bpmn:CallActivity",
      businessObject: { name: "Subprozess X" },
    };
    expect(matchActivity(el, map)?.activityId).toBe("Call_1");
  });
  it("returns null for unknown element", () => {
    expect(matchActivity({ id: "Nope" }, map)).toBeNull();
  });
});

describe("hasIncident", () => {
  const incidents: Incident[] = [
    { id: "i1", activityId: "Task_2", failedActivityId: "Task_2" },
  ];
  it("matches by activityId or failedActivityId", () => {
    expect(hasIncident(["Task_2"], incidents)).toBe(true);
    expect(hasIncident(["Task_9"], incidents)).toBe(false);
    expect(hasIncident([null, undefined], incidents)).toBe(false);
  });
});

describe("deriveStatus", () => {
  const el: DiagramElementLike = { id: "Task_1", type: "bpmn:UserTask" };
  it("incident wins over everything", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t", endTime: "t" }), {
      incidents: [{ id: "i", activityId: "Task_1" }],
    });
    expect(r?.status).toBe("incident");
  });
  it("runtime-active beats history", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t", endTime: "t" }), {
      incidents: [],
      runtimeActiveActivityIds: new Set(["Task_1"]),
    });
    expect(r?.status).toBe("active");
  });
  it("completed when start+end and not canceled", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t", endTime: "t" }), { incidents: [] });
    expect(r?.status).toBe("completed");
  });
  it("flags multi-execution on completed", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t", endTime: "t" }), {
      incidents: [],
      multiExecutionIds: new Set(["Task_1"]),
    });
    expect(r?.isMultiExecution).toBe(true);
  });
  it("active when started but not ended", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t" }), { incidents: [] });
    expect(r?.status).toBe("active");
  });
  it("canceled when started and cancelTime set", () => {
    const r = deriveStatus(el, act({ activityId: "Task_1", startTime: "t", cancelTime: "t" }), { incidents: [] });
    expect(r?.status).toBe("canceled");
  });
  it("returns null when not executed", () => {
    expect(deriveStatus(el, null, { incidents: [] })).toBeNull();
  });
});

describe("isSequenceFlowExecuted", () => {
  const map = buildActivityMap([
    act({ activityId: "A", startTime: "1", endTime: "2" }),
    act({ activityId: "B", startTime: "3" }),
    act({ activityId: "C", startTime: "1", cancelTime: "2" }),
  ]);
  it("true when source finished and target started", () => {
    const flow: DiagramElementLike = {
      id: "f1",
      type: "bpmn:SequenceFlow",
      businessObject: { sourceRef: { id: "A" }, targetRef: { id: "B" } },
    };
    expect(isSequenceFlowExecuted(flow, map)).toBe(true);
  });
  it("false when source canceled", () => {
    const flow: DiagramElementLike = {
      id: "f2",
      type: "bpmn:SequenceFlow",
      businessObject: { sourceRef: { id: "C" }, targetRef: { id: "B" } },
    };
    expect(isSequenceFlowExecuted(flow, map)).toBe(false);
  });
  it("false without source/target refs", () => {
    expect(isSequenceFlowExecuted({ id: "f3", businessObject: {} }, map)).toBe(false);
  });
});

describe("computeElementStatuses", () => {
  const elements: DiagramElementLike[] = [
    { id: "Start", type: "bpmn:StartEvent" },
    { id: "Task_1", type: "bpmn:UserTask" },
    { id: "Task_2", type: "bpmn:ServiceTask" },
    { id: "f1", type: "bpmn:SequenceFlow", businessObject: { sourceRef: { id: "Start" }, targetRef: { id: "Task_1" } } },
  ];
  const activities = [
    act({ activityId: "Start", startTime: "1", endTime: "2" }),
    act({ activityId: "Task_1", startTime: "2" }),
  ];
  it("maps statuses for flow nodes only", () => {
    const r = computeElementStatuses(elements, activities, {
      incidents: [{ id: "i", activityId: "Task_2" }],
    });
    const byId = Object.fromEntries(r.map((e) => [e.elementId, e]));
    expect(byId["Start"]?.status).toBe("completed");
    expect(byId["Start"]?.token).toBe(STATUS_TOKEN.completed);
    expect(byId["Task_1"]?.status).toBe("active");
    // Task_2 has an incident even without a history entry
    expect(byId["Task_2"]?.status).toBe("incident");
    // no sequence flow entries
    expect(byId["f1"]).toBeUndefined();
  });
  it("honors runtimeActiveActivityIds option", () => {
    const r = computeElementStatuses(elements, activities, {
      runtimeActiveActivityIds: ["Task_2"],
    });
    expect(r.find((e) => e.elementId === "Task_2")?.status).toBe("active");
  });
});

describe("computeExecutedFlows", () => {
  it("returns executed sequence flow ids", () => {
    const elements: DiagramElementLike[] = [
      { id: "f1", type: "bpmn:SequenceFlow", businessObject: { sourceRef: { id: "A" }, targetRef: { id: "B" } } },
      { id: "f2", type: "bpmn:SequenceFlow", businessObject: { sourceRef: { id: "B" }, targetRef: { id: "Z" } } },
    ];
    const activities = [
      act({ activityId: "A", startTime: "1", endTime: "2" }),
      act({ activityId: "B", startTime: "3" }),
    ];
    expect(computeExecutedFlows(elements, activities)).toEqual(["f1"]);
  });
});
