/**
 * Ambient-Deklarationen für die untypisierten bpmn.io-/bpmnlint-Module, die der
 * Editor/Viewer per Dynamic Import lädt. Halten den Paket-Entry typsauber, ohne
 * fremde @types-Pakete zu installieren.
 */
declare module "bpmn-js/lib/NavigatedViewer" {
  const NavigatedViewer: new (options: Record<string, unknown>) => {
    importXML(xml: string): Promise<{ warnings: string[] }>;
    destroy(): void;
    get(service: string): unknown;
  };
  export default NavigatedViewer;
}

declare module "bpmn-js/lib/Modeler" {
  const Modeler: new (options: Record<string, unknown>) => {
    importXML(xml: string): Promise<{ warnings: string[] }>;
    saveXML(opts?: { format?: boolean }): Promise<{ xml: string }>;
    destroy(): void;
    get(service: string): unknown;
  };
  export default Modeler;
}

declare module "bpmn-js/lib/draw/BpmnRenderer" {
  const BpmnRenderer: new (...args: unknown[]) => unknown;
  export default BpmnRenderer;
}

declare module "bpmn-js-properties-panel" {
  export const BpmnPropertiesPanelModule: unknown;
  export const BpmnPropertiesProviderModule: unknown;
  export const CamundaPlatformPropertiesProviderModule: unknown;
}

declare module "bpmn-js-bpmnlint" {
  const lintModule: unknown;
  export default lintModule;
}

declare module "diagram-js-minimap" {
  const MinimapModule: unknown;
  export default MinimapModule;
}

declare module "bpmn-js-element-templates" {
  export const ElementTemplatesPropertiesProviderModule: unknown;
  export const CloudElementTemplatesPropertiesProviderModule: unknown;
}

declare module "camunda-bpmn-moddle/resources/camunda.json" {
  const camunda: Record<string, unknown>;
  export default camunda;
}

declare module "bpmnlint/rules/label-required" {
  const rule: unknown;
  export default rule;
}
declare module "bpmnlint/rules/no-complex-gateway" {
  const rule: unknown;
  export default rule;
}
declare module "bpmnlint/rules/no-disconnected" {
  const rule: unknown;
  export default rule;
}
declare module "bpmnlint/rules/no-implicit-split" {
  const rule: unknown;
  export default rule;
}
