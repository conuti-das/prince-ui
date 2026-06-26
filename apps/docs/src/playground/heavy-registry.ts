import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Lazy-Registry für die Schwer-Editoren (bpmn/dmn/forms/bo4e).
 *
 * Diese Komponenten sind zu komplex für den generischen `<Playground>` (kein
 * Control-Schema) und zu groß, um sie eager in jede Seite zu ziehen. Statt sie
 * über `react-live` (`<Example>`) als Quelltext laufen zu lassen — die Demo-Daten
 * sind hunderte Zeilen XML/JSON — werden sie hier als lazy-Wrapper bereitgestellt
 * und in den MDX-Seiten über `<EditorExample name="…" />` gemountet.
 *
 * Jeder Wrapper importiert das jeweilige Editor-Paket dynamisch und backt die
 * passenden Demo-Daten (aus den Storybook-Stories übernommen) ein. Die Editor-
 * CSS-Assets (diagram-js/bpmn-js/dmn-js/form-js) werden von den Komponenten-
 * Modulen selbst importiert (`./viewer.css`, `./editor.css`, …) und landen über
 * den Vite-CSS-Graph automatisch im Bundle, sobald der Chunk geladen wird.
 */
export type HeavyComponent = LazyExoticComponent<ComponentType<Record<string, never>>>;

export const heavyRegistry: Record<string, HeavyComponent> = {
  BpmnViewer: lazy(() => import("../heavy/BpmnViewerDemo")),
  BpmnEditor: lazy(() => import("../heavy/BpmnEditorDemo")),
  DmnExpertEditor: lazy(() => import("../heavy/DmnExpertEditorDemo")),
  DmnTableEditor: lazy(() => import("../heavy/DmnTableEditorDemo")),
  FormBuilder: lazy(() => import("../heavy/FormBuilderDemo")),
  FormRenderer: lazy(() => import("../heavy/FormRendererDemo")),
  Bo4eCDocView: lazy(() => import("../heavy/Bo4eCDocViewDemo")),
};

export function resolveHeavyComponent(name: string): HeavyComponent | null {
  return heavyRegistry[name] ?? null;
}
