/**
 * Smoke-Test: BpmnViewer mountet ohne Crash (guarded).
 * bpmn-js braucht echtes DOM/SVG, das jsdom nur teilweise liefert — daher kein
 * voller Render-Assert, sondern: rendert den Container, kein Throw beim Mount/Unmount.
 */
import { describe, it, expect, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { BpmnViewer } from "./BpmnViewer";

const MINIMAL_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Defs_1"
  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="Start_1" name="Start" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="Diag_1">
    <bpmndi:BPMNPlane id="Plane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1">
        <dc:Bounds x="100" y="100" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

describe("BpmnViewer (smoke)", () => {
  it("renders its container without crashing", () => {
    // bpmn-js loads asynchronously; jsdom may not finish import — we only assert
    // the component shell renders and unmount stays clean.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container, unmount } = render(
      <div style={{ width: 600, height: 400 }}>
        <BpmnViewer xml={MINIMAL_BPMN} height={400} />
      </div>,
    );
    expect(container.querySelector(".prn-bpmn-viewer")).toBeTruthy();
    expect(container.querySelector(".prn-bpmn-canvas")).toBeTruthy();
    expect(() => {
      cleanup();
      unmount();
    }).not.toThrow();
    errSpy.mockRestore();
  });

  it("renders zoom controls by default and hides them when disabled", () => {
    const { container, rerender } = render(
      <BpmnViewer xml={MINIMAL_BPMN} height={300} />,
    );
    expect(container.querySelector(".prn-bpmn-zoom")).toBeTruthy();
    rerender(<BpmnViewer xml={MINIMAL_BPMN} height={300} showZoomControls={false} />);
    expect(container.querySelector(".prn-bpmn-zoom")).toBeNull();
  });
});
