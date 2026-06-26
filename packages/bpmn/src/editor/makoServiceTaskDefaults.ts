/**
 * MaKo-Default für neue ServiceTasks.
 *
 * In den MaKo-LF-Prozessen sind faktisch alle ServiceTasks als Camunda-7
 * External Task mit Topic `phpCoreFunction` implementiert. Beim Anlegen eines
 * ServiceTask setzen wir diese Implementierung daher automatisch, damit der
 * Modellierer sie nicht jedes Mal von Hand nachträgt.
 */

export const PHP_TOPIC = "phpCoreFunction";

interface Element {
  type: string;
  businessObject: {
    get?: (name: string) => unknown;
    [k: string]: unknown;
  };
}

interface Modeling {
  updateProperties(element: Element, properties: Record<string, unknown>): void;
}

function currentType(bo: Element["businessObject"]): unknown {
  return typeof bo.get === "function" ? bo.get("camunda:type") : bo["type"];
}

/** Setzt camunda:type=external + camunda:topic=phpCoreFunction auf einem
 *  ServiceTask, sofern noch kein Type gesetzt ist. */
export function applyExternalTaskDefault(el: Element, modeling: Modeling): void {
  if (el.type !== "bpmn:ServiceTask") return;
  if (currentType(el.businessObject)) return; // bereits implementiert
  modeling.updateProperties(el, {
    "camunda:type": "external",
    "camunda:topic": PHP_TOPIC,
  });
}

interface EventBus {
  on(event: string, priority: number, cb: (e: unknown) => void): void;
}

/** Hängt sich an die Erstellung von Shapes und wendet den Default auf
 *  ServiceTasks an. */
export function registerServiceTaskDefaults(
  eventBus: EventBus,
  modeling: Modeling,
): void {
  eventBus.on("commandStack.shape.create.postExecuted", 1500, (e) => {
    const shape = (e as { context?: { shape?: Element } }).context?.shape;
    if (shape) applyExternalTaskDefault(shape, modeling);
  });
}
