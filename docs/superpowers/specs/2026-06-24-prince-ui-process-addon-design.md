# prince-ui Prozess-Add-on — Design-Spec

**Datum:** 2026-06-24
**Status:** Freigegeben (Brainstorming abgeschlossen, vor writing-plans)
**Umfang:** Drei neue Pakete im prince-ui-Monorepo (`prince-ui-bpmn`, `prince-ui-dmn`, `prince-ui-forms`) mit sechs Deliverables: BPMN-Viewer, BPMN-Editor, DMN-Tabelleneditor (einstiegsfreundlich), DMN-Expertenmodus, Forms-Renderer, Forms-Builder.

---

## 1. Ziel & Kontext

finops und maco-process-studio nutzen heute BPMN/DMN/Forms über externe Bibliotheken (`bpmn-js`, `dmn-js`, `@bpmn-io/form-js`), gemischt mit anderen Web-Components und teilweise bereits mit `prince-ui@0.3.0`. Es existieren **funktionierende, aber app-gekoppelte Prototypen** aller sechs Deliverables in `maco-process-studio/frontend` plus ein read-only BPMN-Status-Viewer in finops.

**Diese Arbeit extrahiert, generalisiert und veredelt diese Prototypen** zu wiederverwendbaren prince-ui-Komponenten:

- **Systemnaher Look:** Flow und Elemente folgen den prince-ui-Designprinzipien (Klarheit, Zurückhaltung, weiche Tiefe, Token-getrieben, Light/Dark gleichwertig).
- **Wiedererkennung:** Die **Original-bpmn.io-Icons** (`bpmn-font`) bleiben in Palette, Context-Pad, Replace-Menü und Element-Markern erhalten.
- **Engine vs. nativ:** Wo bpmn.io eine Engine mitbringt (Layout, Serialisierung, FEEL, Validierung) → wrappen und stylen. Wo es nur strukturiertes DOM/Tabelle/Formular ist → nativ in prince-ui auf Basis der bestehenden Primitives/`AnalyticalTable`.

### Referenz-Codebasen (read-only, nur als Vorlage)
- `~/dev/MacoAi/finops/frontend/src/components/ProcessInstances/BpmnDiagram.tsx` — Status/Historie-Highlighting (~1400 Z., fragiles imperatives SVG-Recoloring, an ein externes Theme-Attribut gekoppelt). **Wird durch ① abgelöst.**
- `~/dev/MacoAi/finops/frontend/src/components/bpmn/InteractiveBpmnViewer.tsx` — schlanker NavigatedViewer + Klick-Events.
- `~/dev/MacoAi/maco-process-studio/frontend/src/components/BpmnEditor/*` — Modeler + properties-panel + bpmnlint + camunda-moddle + `ErrorPanel`/`lintConfig`/`lintHints`/`BpmnTableView`.
- `~/dev/MacoAi/maco-process-studio/frontend/src/components/DmnView/*` — `DmnEditor` (Umschalter), `DmnExpertEditor` (dmn-js), `DmnTableEditor` (handgebaute HTML-Tabelle, lossy), `useDmnModel.ts` (+Test), `useFeelLinter.ts`, `FeelPlayground.tsx`, `PruefiAutocomplete.tsx`.
- `~/dev/MacoAi/maco-process-studio/frontend/src/components/FormView/FormEditor.tsx` — `@bpmn-io/form-js` Editor-Wrapper.
- `~/dev/MacoAi/maco-process-studio/frontend/src/lib/diagramTheme.ts` — `getDiagramColors()`/`onThemeChange()`.

---

## 2. Entschiedene Eckpunkte (aus Brainstorming)

| Entscheidung | Wahl |
|---|---|
| Paketstruktur | **3 Pakete**: `prince-ui-bpmn`, `prince-ui-dmn`, `prince-ui-forms` |
| Reihenfolge | **Alle 6 jetzt durchplanen**, danach parallele Umsetzung |
| Datenvertrag | **Camunda-7-Shapes direkt** als exportierte Typen (`HistoryActivityInstance`, `Incident`, Task-Form-Schema …) |
| DMN-Tabelle ⑤ | **Voller Umfang auf AnalyticalTable** + Inline-Edit + dmn-moddle (verlustfrei) |
| Forms-Editor ④ | **Nativer prince-ui-Builder**, form-js als Experten-Fallback |
| Kopplung | **Persistenz/Selektion/KI als Props/Slots**, Domäne (Prüfi) als optionales Plugin |

---

## 3. Architektur

### 3.1 Paket-Layout
Jedes Paket liegt unter `packages/*` (vom `pnpm-workspace.yaml`-Glob automatisch erfasst) und folgt 1:1 dem `packages/ui`-Muster:

- `package.json`: `type: module`, `sideEffects: ["*.css"]`, exports `"."` (types+import) + `"./styles.css"` → `./dist/index.css`, scripts `build: tsup` / `typecheck` / `test: vitest run`.
- `tsup.config.ts` (1:1 von `packages/ui`): ESM-only, `dts: true`, `treeshake`, `external: react/react-dom`, Entry `src/index.ts`.
- `vitest.config.ts` + `test/setup.ts` (ResizeObserver/scrollTo-Stubs).
- Stories in Root-`stories/components/` (Storybook erfasst global).
- Changeset je PR.

**Dependencies:**

| Paket | peerDependencies | dependencies | optionalDependencies / Peer |
|---|---|---|---|
| `prince-ui-bpmn` | `react`, `react-dom` (>=18 <20), `prince-ui`, `prince-ui-tokens` | `bpmn-js@^18`, `diagram-js@^15`, `bpmn-font@^0.12`, `bpmn-js-properties-panel@^5`, `@bpmn-io/properties-panel@^3`, `bpmnlint@^11`, `bpmn-js-bpmnlint@^0.24`, `camunda-bpmn-moddle@^7` | – |
| `prince-ui-dmn` | dito | `dmn-moddle@^11` (für ⑤ verlustfreie Serialisierung) | `dmn-js@^17` (Peer, nur ⑥ Expertenmodus) |
| `prince-ui-forms` | dito | – (nativer Builder/Renderer) | `@bpmn-io/form-js@^1.21` (Peer, nur ④ Experten-Fallback / form-js-kompatibles Schema) |

`prince-ui`/`prince-ui-tokens` sind als `workspace:*` verlinkt. Schwere Engines (`bpmn-js`, `dmn-js`, `form-js`) werden in Konsumenten **lazy via dynamic import** geladen (Code-Splitting) — Muster aus `BpmnEditor.tsx:133-143` übernehmen.

### 3.2 Theme-Bridge (geteiltes Muster, je Paket kolokiert — kein 4. Paket)
- **SVG-Diagramme (bpmn-js, dmn-js DRD):** Theming läuft **nicht** über CSS, sondern über die Renderer-Config der Library. Ein `getDiagramColors()`-Äquivalent liest **`--prn-*`-Tokens** am `:root` (statt eines externen Theme-Attributs) und liefert `{ defaultFillColor, defaultStrokeColor, defaultLabelColor }` an `bpmnRenderer`/`textRenderer`. Theme-Wechsel über `MutationObserver` auf `data-theme` → Modeler/Viewer-Remount (`themeTick`-Muster).
- **Systemnaher Flow:** Ein Custom-Renderer (`additionalModules`, `super(eventBus, 1500)`) erbt vom `BpmnRenderer`, delegiert für unveränderte Typen und passt nur Stroke/Fill/Radius/Schatten an (Task-Rundung, Hairline-Verbinder). Geometrie/Hit-Boxes/Bendpoints bleiben unangetastet.
- **HTML-Teile (Properties-Panel, dmn-decision-table, form-js):** Restyle-Layer **per Token-CSS** (nicht `!important`-Hacks). Carbon-/Catppuccin-Hardcodes (`FeelPlayground` `#1e1e2e`/`#cdd6f4`) durch `--prn-*` ersetzen.

### 3.3 Original-Icons
`bpmn-font/dist/css/bpmn-embedded.css` (Font als Data-URI, kein separates Asset) einbinden. Klassen `bpmn-icon-*` in Palette/Context-Pad/Replace-Menü/Property-Buttons. **Der Flow selbst nutzt keinen Icon-Font** (reines SVG) → unabhängig vom prince-ui-Styling.

### 3.4 Datenvertrag (Camunda-7-Shapes)
Pro Paket ein `types.ts` mit den kanonischen Camunda-7-Typen als Props (Quelle: finops `models.py`/`api.ts`):
- `HistoryActivityInstance` (activityId, activityName, activityType, start/end/cancelTime, durationInMillis, executionId, calledProcessInstanceId).
- `Incident` (incidentType, activityId, failedActivityId, incidentMessage, rootCauseIncidentId).
- `HistoryVariableInstance`, `Task` (inkl. formKey), Task-Form-Schema (`TaskFormField`: key, label, type `textfield|number|checkbox|select|textarea`, validation, values).
- Decision-Shapes (`HistoricDecisionInstance`) für DMN-Auswertungsanzeige (optional).

### 3.5 Kopplung — Slots/Props statt eingebauter Backends
Editoren erhalten Persistenz und App-Orchestrierung als Callbacks/Slots:
- `value`/`defaultValue` (XML bzw. Schema) + `onChange` + `onSave(serialized) => Promise<void>` (controlled/uncontrolled-Muster wie prince-ui).
- `onElementSelect`, `onDirtyChange`, optionale `toolbarSlot`/`actionsSlot` (z. B. für KI-„Fix"-Button).
- Domänen-Erweiterungen (Prüfi-Autocomplete) als **optionales Plugin**: `cellPlugins?` / `feelSuggestionsProvider?` — Default ohne MaCo-Abhängigkeit.

---

## 4. Deliverables

### ① `<BpmnViewer>` — `prince-ui-bpmn`
**Zweck:** read-only Anzeige + Status/Historie-Highlighting (löst finops `BpmnDiagram.tsx` ab).
**Ansatz:** kapselt `bpmn-js/lib/NavigatedViewer`. Status **deklarativ über Overlays + diagram-js-Marker** statt SVG-`getBBox`-Manipulation. Activity↔Element-Matching (case-insensitive, Name-Matching für CallActivities) als getestete Hilfsfunktion portiert.
**Props (Skizze):**
```
xml: string
activityHistory?: HistoryActivityInstance[]
incidents?: Incident[]
runtimeActiveActivityIds?: string[]
colorScheme?: "auto" | "light" | "dark"   // default auto via data-theme
onElementClick?(e: { elementId; elementType; businessObject; screenPosition }): void
fitOnResize?: boolean
```
**Status→Token:** aktiv = `--prn-blue`, abgeschlossen = `--prn-green` (Mehrfachdurchlauf heller), Incident/Fehler = `--prn-red`, abgebrochen = `--prn-orange`. Sequenzfluss grün, wenn Quelle beendet ∧ Ziel gestartet.
**Akzeptanz:** rendert valides BPMN-XML; Overlays für gemischte History+runtime-active+incident-Sets; Dark-Mode an `data-theme`; Klick liefert Element-Daten; keine imperative SVG-Recoloring-Logik mehr.

### ② `<BpmnEditor>` — `prince-ui-bpmn`
**Zweck:** vollwertiger Editor im prince-ui-Look.
**Ansatz:** `bpmn-js/lib/Modeler` + extrahiertes `BpmnPropertiesPanelModule`/`CamundaPlatformPropertiesProviderModule` + `lintModule` (bpmnlint) + `moddleExtensions: { camunda }`. prince-ui-Optik-Layer (§3.2). Eigene Palette/Context-Pad-Provider mit Original-Icons. `BpmnTableView` (AnalyticalTable) als Tabellen-Umschaltung inklusive.
**Übernommen aus maco:** `lintConfig` (4 Regeln: label-required, no-disconnected, no-implicit-split, no-complex-gateway), `lintHints` (dt. Erklärungen), `ErrorPanel` (Klick→Element, optionaler KI-Fix-Slot). Linter-Ergebnisse via `linting.completed`-Event → `LintIssue[]`.
**Props (Skizze):** `value`/`defaultValue`/`onChange`/`onSave`, `lintRules?`, `onElementSelect?`, `actionsSlot?`, `colorScheme?`, `propertiesPanel?: boolean`.
**Akzeptanz:** voller Modeling-Umfang (Palette, Context-Pad, Resize, Bendpoints, Undo, camunda-Properties); prince-ui-Look ohne Funktionsverlust; Original-Icons sichtbar; bpmnlint-Strip + ErrorPanel; `saveXML({format:true})`; Light/Dark.
**Abhängigkeit:** nutzt den Renderer/Theme-Layer aus ①.

### ⑤ `<DmnTableEditor>` — `prince-ui-dmn`
**Zweck:** einstiegsfreundliche, pflegeleichte Entscheidungstabelle mit **vollem Umfang**.
**Ansatz:** Neubau auf prince-ui **`AnalyticalTable`** + neue **Inline-Edit-Engine** (Edit-Mode, Commit/Cancel via Enter/Tab/Escape, Validierung pro Zelle über `cellRender`). **Verlustfreie Serialisierung über `dmn-moddle`** (nicht der lossy XML-Patch des Prototyps).
**Funktionsumfang:**
- Hit-Policy-Auswahl (UNIQUE/FIRST/PRIORITY/ANY/COLLECT/RULE ORDER/OUTPUT ORDER, inkl. COLLECT-Aggregation).
- **Spalten anlegen/ändern/löschen** (Input/Output, Label, `typeRef`, `inputValues`) — farblich getrennt (Input = `--prn-blue`-Kante, Output = `--prn-green`-Kante).
- Regeln hinzufügen/löschen/umordnen; Inline-FEEL-Editing.
- FEEL-Editor (`FeelPlayground` portiert, Token-gefärbt) mit Live-Lint (`useFeelLinter` portiert) — ungültige Zellen rot.
- Annotation-Spalte.
- Umschalter zum Expertenmodus ⑥.
**Logik-Kern:** `useDmnModel`-Äquivalent neu gegen `dmn-moddle` (parse → `DmnTableModel`, serialize zurück, **inkl. Spaltenänderungen**). Tests aus `useDmnModel.test.ts` als Basis erweitern.
**Plugin-Slot:** `cellPlugins` (z. B. Prüfi-Autocomplete für `expression === 'pruefidentifikator'`) — optional, kein MaCo-Default.
**Akzeptanz:** vollständige DMN-Decision-Table erzeug- und editierbar inkl. Spalten; Round-trip XML→Modell→XML verlustfrei; FEEL-Lint; Light/Dark/prince-ui-Look; ⌘S-Save-Callback.

### ⑥ `<DmnExpertEditor>` — `prince-ui-dmn`
**Zweck:** voller dmn-js-Funktionsumfang als Backup/Expertenmodus.
**Ansatz:** `dmn-js/lib/Modeler` (DRD + decision-table + literal-expression). DRD-SVG über §3.2 gethemt; HTML-Views per Token-CSS. **dmn-js-Properties-Panel ergänzen** (fehlt im Prototyp). Umschalter Tabelle↔Experte (`DmnEditor`-Äquivalent).
**Props:** `value`/`onChange`/`onSave`, `colorScheme?`, `view?: "drd"|"table"|"literal"`.
**Akzeptanz:** alle drei Views funktionsfähig; gethemt; Save via `saveXML`; teilt das `DmnTableModel`/dmn-moddle-Fundament mit ⑤, damit Umschalten verlustfrei ist.
**Abhängigkeit:** `dmn-js` als optionaler Peer; teilt Modell mit ⑤.

### ③ `<FormRenderer>` — `prince-ui-forms`
**Zweck:** Task-Formulare schema-getrieben in prince-ui-Optik rendern (löst Fremd-Primitive in finops `UserTaskFormDialog.tsx` ab).
**Ansatz:** **Schema→Feld-Mapper** auf prince-ui-Primitives (`TextField`, `NumberField`, `Select`, `ComboBox`, `Checkbox`/`CheckboxGroup`, `RadioGroup`, `Switch`, `DatePicker`, statischer Text/Separator). `Form`-Validierung + `FieldError`. Read-only-Render über `DescriptionList`/`Field`. **Schema bleibt form-js-kompatibel** (`{ type, components: [...] }`).
**Props:** `schema`, `data`, `onSubmit({ data, errors })`, `readOnly?`, `submitVariableFormat?` (Default Camunda `{ name: { value, type } }`).
**Akzeptanz:** deckt die Camunda-`TaskFormField`-Typen + gängige form-js-Feldtypen ab; Validierung (required/min/max/pattern); bedingte Sichtbarkeit (`conditional.hide`); submit liefert Camunda-Variablenformat; voll A11y.

### ④ `<FormBuilder>` — `prince-ui-forms`
**Zweck:** eleganter, einstiegsfreundlicher Drag&Drop-Builder mit vollem Funktionsumfang.
**Ansatz:** nativer Builder auf prince-ui — Palette (Feldtypen) + Canvas (Drop/Reorder, `Tree`/`GridList`-basiert) + Eigenschafts-Panel (Label/key/Validierung/Optionen). **Live-Vorschau über `<FormRenderer>`**. Erzeugt **form-js-kompatibles Schema**. Für FEEL-Conditions/Expression/Tables/Spezialfelder **`@bpmn-io/form-js` FormEditor als Experten-Fallback** (Token-restyled), analog zum BPMN/DMN-Muster (nativ + Experte).
**Props:** `value`/`defaultValue`/`onChange`/`onSave`, `mode?: "design"|"expert"`, `fieldTypes?` (erweiterbar).
**Akzeptanz:** Standard-Feldtypen per Drag&Drop anlegbar; Eigenschaften editierbar; Vorschau live; Schema form-js-rund-trip-fähig; Experten-Fallback erreichbar; Light/Dark/prince-ui-Look.

---

## 5. Querschnittsthemen

- **Theme-Detection vereinheitlichen:** überall `data-theme` + `--prn-*` (nicht Ã¼ber externe Theme-Attribute).
- **Hardcodes entfernen:** `FeelPlayground`-Catppuccin, form-js-Carbon-CSS, Properties-Panel-`!important` → Token-CSS.
- **Motion:** ausschließlich `--prn-ease-out/-spring/-standard` + `--prn-dur-*`; `prefers-reduced-motion` respektieren.
- **A11y:** React-Aria-Primitives, `onPress`, `is*`-Booleans, 44px-Trefferflächen, Fokus-Ringe.
- **Tests:** je Komponente `*.test.tsx` (Testing-Library, jsdom); Logik-Kerne (`useDmnModel`, `useFeelLinter`, Activity-Matching, Schema-Mapper) mit dedizierten Unit-Tests. Coverage-Thresholds 80/70/80/80 wie `packages/ui`.
- **Storybook:** je Komponente eine Story in `stories/components/` mit MaKo-Flavor-Demodaten, Light/Dark-Toolbar.
- **CONTRACTS:** API-Konventionen einhalten (`variant`/`tone`, controlled+`default*`+`on*Change`, `className`-Override via `cx()`, `label/description/errorMessage`).
- **Release:** Changeset je Paket; `release.yml` (`workflow_dispatch`, `changeset publish`) erfasst neue Pakete automatisch.

---

## 6. Dekomposition für parallele Umsetzung

**Phase 0 — Fundament (blockt den Rest, klein halten):**
1. Drei Paketgerüste (`package.json`/`tsup`/`vitest`/`test/setup`/`src/index.ts`) nach `packages/ui`-Vorbild.
2. `prince-ui-tokens`/`prince-ui` als `workspace:*` verlinken; `pnpm-workspace.yaml` deckt `packages/*` bereits ab.
3. Geteilte Theme-Bridge (`getDiagramColors`/`onThemeChange` gegen `--prn-*`/`data-theme`) je Paket kolokiert.
4. `bpmn-font`-Einbindung (embedded) in `prince-ui-bpmn`.
5. `types.ts` (Camunda-7-Shapes) je Paket.

**Phase 1 — 6 parallele Streams** (Abhängigkeiten):
- Stream A: ① BpmnViewer → ② BpmnEditor nutzt A's Renderer/Theme-Layer (A→B sequenziell innerhalb `prince-ui-bpmn`).
- Stream B: ⑤ DmnTableEditor (Logik-Kern `useDmnModel`/dmn-moddle) → ⑥ DmnExpertEditor teilt Modell (B→C sequenziell innerhalb `prince-ui-dmn`).
- Stream C: ③ FormRenderer → ④ FormBuilder nutzt ③ als Vorschau (C→D sequenziell innerhalb `prince-ui-forms`).

→ Drei Pakete parallel; innerhalb jedes Pakets Viewer/Renderer vor Editor/Builder. Jedes Deliverable bekommt in der Umsetzung einen eigenen Implementierungsplan (writing-plans).

---

## 7. Risiken & offene Punkte

1. **dmn-moddle-Round-trip:** verlustfreie Spalten-Serialisierung ist anspruchsvoller als der lossy Prototyp — früh mit Tests absichern (mehrere Decisions, Annotationen, DRD-Verknüpfungen bleiben erhalten).
2. **Kein echter FEEL-Parser:** `useFeelLinter` ist regex-/heuristisch — valide FEEL außerhalb der Whitelist wird abgelehnt. Als „Lint-Hinweis" (nicht-blockierend) kennzeichnen; echter FEEL-Parser (`feelin`) als spätere Option.
3. **Canvas-Sizing:** bpmn-js/dmn-js-Canvas nie in auto-höhende Container wickeln (Race) — Komponenten bringen eigene Höhe/`ResizeObserver` mit (maco `DESIGN.md`-Leitplanke).
4. **form-js-Fallback-Look:** Carbon-CSS vollständig zu übertünchen ist begrenzt — Experten-Fallback bewusst als „funktional, nicht pixelgleich" kommunizieren.
5. **Matching activityId↔Element** ist heuristisch (CallActivity-Namematching) — als getestete, dokumentierte Funktion isolieren.
6. **bpmn-js/dmn-js Versionen:** finops bpmn-js 18.8/effektiv 18.12, maco dmn-js 17, form-js 1.21 — Peer-Ranges großzügig (`^18`/`^17`/`^1.21`), beim Einbau gegen installierte Versionen verifizieren.

---

## 8. Nicht im Umfang (YAGNI)

- Eigener FEEL-Parser/-Interpreter (Lint bleibt heuristisch).
- Pixelgleiches prince-ui-Theming des gewrappten form-js-Editors.
- DMN-Auswertung/Deploy in den Editoren (bleibt App-/Camunda-Sache; Editoren liefern nur Save-Callbacks).
- ProcessFlow (reactflow) — separates Thema, nicht Teil dieses Add-ons.
- Backend-Änderungen (z. B. DMN-XML-Endpoint in finops) — App-seitig, nicht im Paket.
