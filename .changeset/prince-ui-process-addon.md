---
"prince-ui-bpmn": minor
"prince-ui-dmn": minor
"prince-ui-forms": minor
---

Neues Prozess-Add-on: drei Pakete für BPMN, DMN und Forms im prince-ui-Look.

- **prince-ui-bpmn**: `BpmnViewer` (read-only mit deklarativem Status-/Historie-Highlighting
  über diagram-js-Overlays/Marker, Camunda-7-Shapes) und `BpmnEditor` (bpmn-js-Modeler im
  Apple-Look via Custom-Renderer, Original-bpmn.io-Icons, Properties-Panel, bpmnlint,
  camunda-moddle, AnalyticalTable-Ansicht). Theming über `--prn-*`/`data-theme`.
- **prince-ui-dmn**: `DmnTableEditor` (einstiegsfreundlich auf prince-ui AnalyticalTable mit
  Inline-Edit, voller Umfang inkl. Spaltenpflege, verlustfreie dmn-moddle-Serialisierung,
  FEEL-Lint) und `DmnExpertEditor` (dmn-js-Modeler, gethemt) plus `DmnEditor`-Umschalter.
- **prince-ui-forms**: `FormRenderer` (schema-getrieben auf prince-ui-Feldern, form-js-kompatibel,
  Camunda-Task-Form-Mapping + Submit-Variablenformat) und `FormBuilder` (nativer Drag&Drop-Builder
  mit Live-Vorschau, `@bpmn-io/form-js` als Experten-Fallback).

Persistenz/Selektion/KI als Props/Slots, Domänenlogik (z. B. Prüfidentifikatoren) als optionales Plugin.
