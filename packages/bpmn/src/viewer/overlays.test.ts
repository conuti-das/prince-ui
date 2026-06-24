import { describe, it, expect } from "vitest";
import {
  statusMarker,
  allStatusMarkers,
  buildStatusOverlay,
  MULTI_EXECUTION_MARKER,
  FLOW_EXECUTED_MARKER,
  STATUS_OVERLAY_POSITION,
} from "./overlays";

describe("statusMarker", () => {
  it("derives a stable class name per status", () => {
    expect(statusMarker("active")).toBe("prn-bpmn-status-active");
    expect(statusMarker("incident")).toBe("prn-bpmn-status-incident");
  });
});

describe("allStatusMarkers", () => {
  it("includes every status plus the multi-execution marker", () => {
    const markers = allStatusMarkers();
    expect(markers).toContain("prn-bpmn-status-active");
    expect(markers).toContain("prn-bpmn-status-completed");
    expect(markers).toContain("prn-bpmn-status-incident");
    expect(markers).toContain("prn-bpmn-status-canceled");
    expect(markers).toContain(MULTI_EXECUTION_MARKER);
  });
});

describe("buildStatusOverlay", () => {
  it("creates an accessible status dot", () => {
    const node = buildStatusOverlay("completed");
    expect(node.className).toContain("prn-bpmn-overlay-completed");
    expect(node.getAttribute("aria-label")).toBe("Abgeschlossen");
    expect(node.getAttribute("role")).toBe("img");
  });
});

describe("constants", () => {
  it("exposes flow + position constants", () => {
    expect(FLOW_EXECUTED_MARKER).toBe("prn-bpmn-flow-executed");
    expect(STATUS_OVERLAY_POSITION).toEqual({ top: -6, right: -6 });
  });
});
