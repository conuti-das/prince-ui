/// <reference types="@testing-library/jest-dom/vitest" />
/**
 * Verhaltens-Tests fürs Editor-Redesign:
 *  - B10: Speichern nur bei Änderungen aktiv (Command-Stack-Dirty).
 *  - B11: Properties-Panel schließbar (X) und durch Selektion wieder offen.
 *  - B9 : Klick auf eine Tabellenzeile meldet die Element-ID (öffnet Properties).
 *
 * bpmn-js wird wie im Smoke-Test gestubbt; zusätzlich fangen wir die
 * eventBus-Handler ein, um Command-Stack-/Selection-Events zu simulieren.
 */
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, cleanup, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* TanStack Virtual misst per offsetHeight/offsetWidth — in jsdom immer 0.
 * Ohne messbare Höhe rendert der Virtualizer keine Body-Zeilen (B9-Test). */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get() {
      return 600;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get() {
      return 800;
    },
  });
});

const handlers: Record<string, ((e: unknown) => void)[]> = {};
const selectSpy = vi.fn();
const ELEMENTS: Record<string, { id: string; businessObject: { name?: string } }> = {
  Start_1: { id: "Start_1", businessObject: { name: "Start" } },
};

vi.mock("bpmn-js/lib/Modeler", () => ({
  default: class {
    importXML() {
      return Promise.resolve({ warnings: [] });
    }
    saveXML() {
      return Promise.resolve({ xml: "<x/>" });
    }
    destroy() {}
    get(service: string) {
      if (service === "eventBus") {
        return {
          on(ev: string, cb: (e: unknown) => void) {
            (handlers[ev] ??= []).push(cb);
          },
        };
      }
      if (service === "canvas") {
        return {
          zoom() {},
          viewbox: () => ({ scale: 1 }),
          scroll() {},
          scrollToElement() {},
        };
      }
      if (service === "selection") return { select: selectSpy };
      if (service === "elementRegistry") return { get: (id: string) => ELEMENTS[id] };
      // elementTemplates.set / minimap.open / Fallback
      return { set() {}, open() {}, on() {}, get: () => undefined, zoom() {}, scrollToElement() {} };
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
vi.mock("diagram-js-minimap", () => ({ default: {} }));
vi.mock("bpmn-js-element-templates", () => ({
  ElementTemplatesPropertiesProviderModule: {},
  CloudElementTemplatesPropertiesProviderModule: {},
}));
vi.mock("camunda-bpmn-moddle/resources/camunda.json", () => ({ default: {} }));
vi.mock("bpmnlint/rules/label-required", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-complex-gateway", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-disconnected", () => ({ default: {} }));
vi.mock("bpmnlint/rules/no-implicit-split", () => ({ default: {} }));

import { BpmnEditor } from "./BpmnEditor";
import { BpmnTableView } from "./BpmnTableView";

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

function fire(ev: string, payload?: unknown) {
  act(() => {
    (handlers[ev] ?? []).forEach((h) => h(payload));
  });
}

beforeEach(() => {
  for (const k of Object.keys(handlers)) delete handlers[k];
  selectSpy.mockClear();
});

describe("BpmnEditor Redesign-Verhalten", () => {
  it("Speichern ist ohne Änderungen deaktiviert und nach einer Änderung aktiv (B10)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<BpmnEditor defaultValue={MINIMAL_BPMN} height={400} onSave={() => {}} />);

    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    // Direkt nach Mount: keine Änderungen → disabled.
    expect(saveBtn).toBeDisabled();

    // Warten bis der Modeler initialisiert ist und den Handler registriert hat.
    await waitFor(() => expect(handlers["commandStack.changed"]?.length).toBeTruthy());

    fire("commandStack.changed");
    expect(saveBtn).toBeEnabled();

    cleanup();
    errSpy.mockRestore();
  });

  it("Reimport eines anderen Artefakts setzt den Dirty-State zurück (B10)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <BpmnEditor value={MINIMAL_BPMN} height={400} onSave={() => {}} />,
    );
    const saveBtn = screen.getByRole("button", { name: "Speichern" });
    await waitFor(() => expect(handlers["commandStack.changed"]?.length).toBeTruthy());

    fire("commandStack.changed");
    expect(saveBtn).toBeEnabled();

    // Anderer controlled value → Reimport → dirty muss wieder false sein.
    rerender(
      <BpmnEditor
        value={MINIMAL_BPMN.replace("Start_1", "Start_2")}
        height={400}
        onSave={() => {}}
      />,
    );
    await waitFor(() => expect(saveBtn).toBeDisabled());

    cleanup();
    errSpy.mockRestore();
  });

  it("Properties-Panel lässt sich schließen und öffnet bei Selektion wieder (B11)", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<BpmnEditor defaultValue={MINIMAL_BPMN} height={400} />);

    const panel = container.querySelector(".prn-bpmn-editor-properties") as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.style.display).not.toBe("none");

    await userEvent.click(
      screen.getByRole("button", { name: "Eigenschaften-Panel schließen" }),
    );
    expect(panel.style.display).toBe("none");

    // Selektion eines Elements öffnet das Panel wieder.
    await waitFor(() => expect(handlers["selection.changed"]?.length).toBeTruthy());
    fire("selection.changed", { newSelection: [ELEMENTS.Start_1] });
    expect(panel.style.display).not.toBe("none");

    cleanup();
    errSpy.mockRestore();
  });
});

describe("BpmnTableView Row-Select (B9)", () => {
  it("Klick auf eine Zeile meldet die Element-ID", () => {
    const onRowSelect = vi.fn();
    const { container } = render(
      <BpmnTableView xml={MINIMAL_BPMN} onRowSelect={onRowSelect} />,
    );
    const row = container.querySelector(
      ".prn-table-row:not(.prn-table-row-empty)",
    ) as HTMLElement;
    expect(row).toBeTruthy();
    fireEvent.click(row);
    expect(onRowSelect).toHaveBeenCalledWith("Start_1");
  });
});
