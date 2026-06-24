/**
 * dmn-moddle@11 bringt keine eigenen Typdeklarationen mit. Wir typisieren nur
 * den Default-Export (die `simple()`-Factory) minimal; die konkreten
 * Moddle-Element-Shapes werden in `model/dmn-model.ts` lokal modelliert.
 */
declare module "dmn-moddle" {
  const DmnModdle: (packages?: unknown, options?: unknown) => unknown;
  export default DmnModdle;
}

/**
 * Optionale Peer-/Erweiterungs-Module, die im DmnExpertEditor ausschließlich
 * per `dynamic import` geladen werden (dmn-js + Properties-Panel). Sie sind
 * kein harter Dep dieses Pakets — die Deklarationen halten nur `tsc` ruhig.
 */
declare module "dmn-js/lib/Modeler" {
  const Modeler: new (options: Record<string, unknown>) => unknown;
  export default Modeler;
}
declare module "@bpmn-io/properties-panel" {
  export const PropertiesPanelModule: unknown;
  const _default: unknown;
  export default _default;
}
declare module "dmn-js-properties-panel" {
  export const DmnPropertiesPanelModule: unknown;
  export const CamundaPropertiesProviderModule: unknown;
  const _default: unknown;
  export default _default;
}
declare module "camunda-dmn-moddle/resources/camunda.json" {
  const schema: unknown;
  export default schema;
}
