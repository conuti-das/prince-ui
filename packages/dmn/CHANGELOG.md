# prince-ui-dmn

## 1.0.1

### Patch Changes

- Updated dependencies [2481455]
  - prince-ui@0.9.1

## 1.0.0

### Minor Changes

- 6203cd4: Neues Prozess-Add-on: drei Pakete für BPMN, DMN und Forms im prince-ui-Look.

  - **prince-ui-bpmn**: `BpmnViewer` (read-only mit deklarativem Status-/Historie-Highlighting
    über diagram-js-Overlays/Marker, Camunda-7-Shapes) und `BpmnEditor` (bpmn-js-Modeler im
    prince-ui-Look via Custom-Renderer, Original-Icons der Diagramm-Bibliothek, Properties-Panel, bpmnlint,
    camunda-moddle, AnalyticalTable-Ansicht). Theming über `--prn-*`/`data-theme`.
  - **prince-ui-dmn**: `DmnTableEditor` (einstiegsfreundlich auf prince-ui AnalyticalTable mit
    Inline-Edit, voller Umfang inkl. Spaltenpflege, verlustfreie dmn-moddle-Serialisierung,
    FEEL-Lint) und `DmnExpertEditor` (dmn-js-Modeler, gethemt) plus `DmnEditor`-Umschalter.
  - **prince-ui-forms**: `FormRenderer` (schema-getrieben auf prince-ui-Feldern, form-js-kompatibel,
    Camunda-Task-Form-Mapping + Submit-Variablenformat) und `FormBuilder` (nativer Drag&Drop-Builder
    mit Live-Vorschau, `@bpmn-io/form-js` als Experten-Fallback).

  Persistenz/Selektion/KI als Props/Slots, Domänenlogik (z. B. Prüfidentifikatoren) als optionales Plugin.

- Prozess-Editoren: Benutzbarkeit, Dark-Mode-Lesbarkeit & optischer Feinschliff.

  **BPMN-Editor**

  - Canvas füllt jetzt die volle Editor-Höhe (vorher auf ~150px kollabiert);
    komplette Palette sichtbar; Diagramm zentriert mit Rand.
  - Kein „Springen" mehr beim Bearbeiten (ResizeObserver-Re-Fit entfernt;
    Lint-Leiste als Overlay statt im Layout-Flow).
  - Properties-Panel im Dark/CU korrekt eingefärbt (echtes `--color-*`-Mapping
    für `@bpmn-io/properties-panel` v3 statt wirkungsloser `--bio-*`-Variablen);
    irrelevante Camunda-Gruppen ausgeblendet.
  - Palette/Context-Pad/Append-Popup token-getrieben (prince-ui-Look, alle Themes).
  - Optik-Renderer: System-Font auf SVG-Labels, weiche Schatten/Hairlines, dünnere
    Connectoren; Renderer auch im Viewer registriert; Attribution der Diagramm-Bibliothek bleibt sichtbar.
  - Neu: **Minimap**, **Suchfeld** (Toolbar + ⌘/Strg+F), **Element-Templates**
    (`elementTemplates`-Prop). Auto-Resize/Auto-Place aktiv.

  **DMN**

  - Experten-Editor: fehlendes dmn-js-Layout-CSS importiert (Kollaps behoben);
    vollständige Dark/CU-Theming-Schicht (alle `--color-*`-Primitive); DRD-Shapes
    über korrekten Renderer-Key; großzügige Höhe.
  - Tabellen-Editor: Spaltentitel & Decision-Name **inline editierbar**;
    Zell-/Header-/Popup-Clipping behoben (Eingabe in neuen Zellen möglich);
    Kontrast in allen Themes korrigiert (echte Tokens statt nicht existierender
    Fallbacks); leere Pflicht-/Befüll-Zellen visuell markiert.

  **Forms**

  - Renderer: Datumsfeld auf prince-ui `DatePicker` (de-DE, prince-ui-Optik) statt
    nativem `<input type=date>`.
  - Builder: monochrome SVG-Icons statt Emojis; form-js-Experten-Editor lädt das
    korrekte Paket (`@bpmn-io/form-js-editor`) + CSS und zeigt bei fehlgeschlagenem
    Render einen klaren Hinweis (Verweis auf Designer).

  **prince-ui (Patch)**

  - Checkbox-Häkchen-SVG abgesichert (`fill="none"`, feste Größe), damit fehlendes
    CSS nie ein Vollflächen-Dreieck erzeugt.

### Patch Changes

- Updated dependencies [7cd49b0]
- Updated dependencies [c8f5c49]
- Updated dependencies [f569c8b]
- Updated dependencies
- Updated dependencies [3005ab1]
- Updated dependencies [897e696]
- Updated dependencies
  - prince-ui-tokens@0.4.0
  - prince-ui@0.9.0
