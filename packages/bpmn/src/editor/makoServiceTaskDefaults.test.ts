import { describe, it, expect, vi } from "vitest";
import { applyExternalTaskDefault, PHP_TOPIC } from "./makoServiceTaskDefaults";

describe("applyExternalTaskDefault", () => {
  it("setzt type=external und topic=phpCoreFunction auf neuem ServiceTask", () => {
    const updateProperties = vi.fn();
    const el = {
      type: "bpmn:ServiceTask",
      businessObject: { get: () => undefined },
    };
    applyExternalTaskDefault(el, { updateProperties });
    expect(updateProperties).toHaveBeenCalledTimes(1);
    const props = updateProperties.mock.calls[0]![1] as Record<string, unknown>;
    expect(props["camunda:type"]).toBe("external");
    expect(props["camunda:topic"]).toBe(PHP_TOPIC);
  });

  it("ignoriert Nicht-ServiceTasks", () => {
    const updateProperties = vi.fn();
    applyExternalTaskDefault(
      { type: "bpmn:Task", businessObject: { get: () => undefined } },
      { updateProperties },
    );
    expect(updateProperties).not.toHaveBeenCalled();
  });

  it("überschreibt einen bereits gesetzten Type nicht", () => {
    const updateProperties = vi.fn();
    applyExternalTaskDefault(
      { type: "bpmn:ServiceTask", businessObject: { get: () => "external" } },
      { updateProperties },
    );
    expect(updateProperties).not.toHaveBeenCalled();
  });
});
