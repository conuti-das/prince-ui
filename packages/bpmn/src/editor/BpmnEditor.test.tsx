/// <reference types="@testing-library/jest-dom/vitest" />
/**
 * Smoke-Test: BpmnEditor mountet ohne Crash (guarded).
 * Wie beim Viewer lädt bpmn-js asynchron; jsdom liefert kein vollständiges SVG.
 * Wir prüfen die Komponenten-Hülle (Toolbar, Canvas, Properties-Container).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// bpmn-js' Modeler pulls in transitive modules with extensionless imports that
// node's ESM resolver cannot load under vitest/jsdom (it can't render SVG anyway).
// We stub the heavy engine imports so the smoke test exercises only the React shell.
const makeService = () => ({
  zoom() {},
  scrollToElement() {},
  on() {},
  get() {
    return undefined;
  },
});
vi.mock("bpmn-js/lib/Modeler", () => ({
  default: class {
    importXML() {
      return Promise.resolve({ warnings: [] });
    }
    saveXML() {
      return Promise.resolve({ xml: "<x/>" });
    }
    destroy() {}
    get() {
      return makeService();
    }
  },
}));
vi.mock("bpmn-js/lib/draw/BpmnRenderer", () => ({ default: class {} }));
vi.mock("bpmn-js-properties-panel", () => ({
  BpmnPropertiesPanelModule: {},
  BpmnPropertiesProviderModule: {},
  CamundaPlatformPropertiesProviderModule: {},
}));
vi.mock("bpmn-js-bpmnlint", () => ({ default: {} }));
vi.mock("camunda-bpmn-moddle/resources/camunda.json", () => ({ default: {} }));
vi.mock("bpmnlint/rules/label-required", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-complex-gateway", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-disconnected", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-implicit-split", () => ({ default: {} }));

import { BpmnEditor } from "./BpmnEditor";

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

describe("BpmnEditor (smoke)", () => {
  it("renders the editor shell without crashing", () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container, unmount } = render(
      <div style={{ width: 800, height: 500 }}>
        <BpmnEditor defaultValue={MINIMAL_BPMN} height={500} onSave={() => {}} />
      </div>,
    );
    expect(container.querySelector(".prn-bpmn-editor")).toBeTruthy();
    expect(container.querySelector(".prn-bpmn-canvas")).toBeTruthy();
    expect(container.querySelector(".prn-bpmn-editor-properties")).toBeTruthy();
    // view toggle + save button render
    expect(screen.getByText("Diagramm")).toBeInTheDocument();
    expect(screen.getByText("Tabelle")).toBeInTheDocument();
    expect(screen.getByText("Speichern")).toBeInTheDocument();
    expect(() => {
      cleanup();
      unmount();
    }).not.toThrow();
    errSpy.mockRestore();
  });

  it("hides the properties container when propertiesPanel is false", () => {
    const { container } = render(
      <BpmnEditor defaultValue={MINIMAL_BPMN} height={400} propertiesPanel={false} />,
    );
    expect(container.querySelector(".prn-bpmn-editor-properties")).toBeNull();
  });
});
