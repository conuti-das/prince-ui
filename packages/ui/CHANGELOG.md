# prince-ui

## 0.9.1

### Patch Changes

- 2481455: Neues Paket `prince-ui-bo4e`: Smart-Viewer für BO4E-cDoc (Milestone 1).

  - Schema-Core: `loadBo4eSchema`/`resolveField`, Datumsanzeige in Europe/Berlin mit UTC-Popover, Gültigkeits-Engine, Auffälligkeiten-Scanner, injizierbare Resolver (BDEW-Code→Name u. a.).
  - Smart-View-Bausteine: `IdentityHeader`, `EnumIcon`/`EnumBadge`, `ValidityRange`, `AddressBlock`, `ContactLine`, `CodeResolved`, `SchemaField`, `MarktpartnerRow`, `FullDetail`, `SmartObjectCard`, `SmartObjectView`.
  - `SydocView` mit Richtungs-/Gruppen-Tabs (Gruppenschlüssel ≠ boTyp), Auffälligkeiten-Leiste und „+ Alle Details"-Vollsicht.

  `prince-ui`: zusätzliche monochrome Icons (phone, clock, link, arrow-down-right, arrow-up-right, droplet, file-text) für die Smart-Views.

## 0.9.0

### Minor Changes

- 7cd49b0: 3-Mode-Theming: Hell/Dunkel als neue Default-Optik, Cu als CONUTI-CI-Mode.

  - `prince-ui-tokens`: `tokens.css` neu strukturiert. `:root` ist jetzt **Dunkel**
    (Default + Fallback), `@media (prefers-color-scheme: light)` und `[data-theme="light"]`
    liefern **Hell**, `[data-theme="cu"]` das frühere CONUTI-CI-Styling
    (CI-Grün #A0D22B, Inter-Font, grünes Bento-Mesh). Hell/Dunkel nutzen System-Schrift,
    System-Farben und Akzentgrün (#34C759 / #30D158) als Akzent.
    Default folgt dem OS, fällt aber auf Dark zurück.
  - `prince-ui`: `setTheme` akzeptiert nun `"cu"`; neuer Typ `PrinceTheme` und Helfer
    `getTheme()`. `PRINCE_UI_VERSION` = 0.4.0.

- c8f5c49: AppShell + erweitertes Glas-Opt-in.

  - Neue **`AppShell`**-Komponente: App-App-Hülle (Shell-Bar mit
    Logo/Titel/Suche/Aktionen/User + Menü-Toggle, Sidebar, scrollbarer Content).
    Glas auf Shell-Bar + Sidebar per Default; auf schmalen Screens wird die
    Sidebar zum Off-canvas-Overlay mit Scrim. Kontrolliert/unkontrolliert
    einklappbar, A11y (`<header>`/`<nav>`/`<main>`, `aria-expanded`/`-controls`).
  - **`glass`-Opt-in** zusätzlich auf `Modal`, `Menu`, `ObjectPage` (Title/Top-Header)
    und `AnalyticalTable` (nur Toolbar, nicht die dichten Zeilen).
  - Stories: Components/AppShell (Default + Opaque).

- f569c8b: AppShell mit voller ShellBar-Funktion (UI5-äquivalent) + Responsive.

  Die `AppShell`-Shell-Bar bekommt den UI5-ShellBar-Funktionsumfang (prince-ui-Naming):

  - `subtitle`, Titel-Dropdown via `menuItems` + `onMenuItemClick`
  - `logo` + `onLogoClick`
  - Aktions-`items` (`{id,icon,label,count,onClick}`) mit Overflow-„…"-Menü
  - `notifications` + `notificationsCount` + `onNotificationsClick` (Glocke+Badge)
  - `productSwitch` + `onProductSwitchClick` (Grid)
  - `user` + `onProfileClick`, `startButton`, kollabierbare `search`

  **Responsiv (CSS-Breakpoints):**

  - iPad/Tablet ≤1024: `subtitle` aus, `items` → Overflow.
  - Phone ≤767: Suche → Icon (aufklappbar als Zeile), Sidebar als Off-canvas-Overlay
    (startet eingeklappt via `matchMedia`), sekundäre Chrome (`actions`/`productSwitch`)
    ausgeblendet, damit die Bar nicht überläuft.

  Neue Icons: `grid`, `more`, `chevron-down`. Alles bestehende (`title`/`user`/`actions`) bleibt kompatibel.

- Neue **Launchpad**-Komponente: App-App-/Card-Dashboard
  (Fiori-analog, reduziert: Launchpad → Section → Card). Polymorphe Cards
  (`nav`/`kpi`/`trend`/`list`/`custom`), optionales Drag-Reorder (react-aria
  GridList), Drill-down-Popup mit Voll-Visualisierung. Monochrome Icons,
  theme-fähig in Light/Dark/Cu.
- 3005ab1: Hell-Feinschliff + Liquid-Glass-Stilschicht.

  **Feinschliff (Grün-Akzent bleibt):**

  - Card-Radius 16 → 20px („pillowy"), Body 16 → 17px, Metric-Weight 800 → 700 (Bold).
  - Light: App-BG flach (`#f2f2f7`) statt Verlauf, Default-Schatten flacher (Grouped-Look).

  **Liquid Glass (nur Optik über React Aria, kein Verhaltensumbau):**

  - Neue `--prn-glass-*`-Tokens, abgeleitet aus den mode-spezifischen Flächen → wirken automatisch in Light/Dark/Cu.
  - Neue Stilschicht `.prn-glass` + Varianten `-bar/-sidebar/-overlay/-card/-floating` mit `@supports`-Gate und Fallback auf opak; respektiert `prefers-reduced-transparency` und `prefers-reduced-motion`. Optionaler `--prn-glass-tint` für Branding.
  - Neuer `<GlassSurface variant tintColor as>`-Wrapper.
  - Opt-in `glass`-Prop auf `Toolbar`, `Sidebar`, `Popover` (nur className, keine RA-Logik berührt).

- 897e696: Monochrome Icons statt Emoji.

  - Neues **`Icon`**-Set: monochrome Linien-SVGs (`currentColor`, lucide-kompatible
    Optik, kein externer Dependency, theme-fähig in Light/Dark/Cu). `Icon`-Komponente
    mit `name`/`size`/`title` (dekorativ `aria-hidden`, mit `title` als `img`).
  - Komponenten-interne Emoji ersetzt: `ObjectPage`-Pin (📌/📍 → `pin`/`pin-off`),
    `AppShell`-Toggle (☰ → `menu`), `AnalyticalTable`-Spaltenmenü (⚙ → `settings`).
  - Stories durchgängig auf monochrome `Icon`s umgestellt (Glass, AppShell, Sidebar,
    List, KpiCard, EmptyState) — keine bunten Emoji mehr im Storybook.

### Patch Changes

- Prozess-Editoren: Benutzbarkeit, Dark-Mode-Lesbarkeit & Feinschliff.

  **BPMN-Editor**

  - Canvas füllt jetzt die volle Editor-Höhe (vorher auf ~150px kollabiert);
    komplette Palette sichtbar; Diagramm zentriert mit Rand.
  - Kein „Springen" mehr beim Bearbeiten (ResizeObserver-Re-Fit entfernt;
    Lint-Leiste als Overlay statt im Layout-Flow).
  - Properties-Panel im Dark/Cu korrekt eingefärbt (echtes `--color-*`-Mapping
    für `@bpmn-io/properties-panel` v3 statt wirkungsloser `--bio-*`-Variablen);
    irrelevante Camunda-Gruppen ausgeblendet.
  - Palette/Context-Pad/Append-Popup token-getrieben (Prince-Look, alle Themes).
  - Prince-Renderer: System-Font auf SVG-Labels, weiche Schatten/Hairlines, dünnere
    Connectoren; Renderer auch im Viewer registriert; bpmn.io-Wasserzeichen aus.
  - Neu: **Minimap**, **Suchfeld** (Toolbar + ⌘/Strg+F), **Element-Templates**
    (`elementTemplates`-Prop). Auto-Resize/Auto-Place aktiv.

  **DMN**

  - Experten-Editor: fehlendes dmn-js-Layout-CSS importiert (Kollaps behoben);
    vollständige Dark/Cu-Theming-Schicht (alle `--color-*`-Primitive); DRD-Shapes
    über korrekten Renderer-Key; großzügige Höhe.
  - Tabellen-Editor: Spaltentitel & Decision-Name **inline editierbar**;
    Zell-/Header-/Popup-Clipping behoben (Eingabe in neuen Zellen möglich);
    Kontrast in allen Themes korrigiert (echte Tokens statt nicht existierender
    Fallbacks); leere Pflicht-/Befüll-Zellen visuell markiert.

  **Forms**

  - Renderer: Datumsfeld auf prince-ui `DatePicker` (de-DE, Prince-Optik) statt
    nativem `<input type=date>`.
  - Builder: monochrome SVG-Icons statt Emojis; form-js-Experten-Editor lädt das
    korrekte Paket (`@bpmn-io/form-js-editor`) + CSS und zeigt bei fehlgeschlagenem
    Render einen klaren Hinweis (Verweis auf Designer).

  **prince-ui (Patch)**

  - Checkbox-Häkchen-SVG abgesichert (`fill="none"`, feste Größe), damit fehlendes
    CSS nie ein Vollflächen-Dreieck erzeugt.

- Updated dependencies [7cd49b0]
- Updated dependencies [3005ab1]
  - prince-ui-tokens@0.4.0

## 0.3.0

### Minor Changes

- 1f31cac: Lücken aus dem ersten App-Konsumenten (finops) geschlossen: KpiCard `tone`/`onPress`/`accent`,
  Amount akzeptiert Strings + `dimDecimals`, neues Token `--prn-bg-elevated-translucent` + Card
  `translucent` (Glas), Sidebar `collapsible`/`defaultCollapsed`, neues read-only `DescriptionList`/`Field`.

## 0.2.0

### Minor Changes

- SAP-UI5-Parität für AnalyticalTable und ObjectPage (rückwärtskompatibel, additiv).

  **AnalyticalTable** — auf den SAP-UI5-webcomponents-react-Funktionsumfang gebracht:
  Spalten- & Global-Filter, Sortierung inkl. Multi-Sort, `selectionMode` (none/single/
  multiple) + `selectionBehavior`, Column-Resizing + Auto-Resize + Drag&Drop-Reorder,
  Tree-Table (`isTreeTable`/`subRowsKey`), Infinite-Scroll, Zebra/Row-/Navigation-Highlight,
  responsive Pop-In, Sub-Components (`renderRowSubComponent`), Lade-/Overlay-/NoData-Detail,
  `header`/`extension`-Slots, Grid-Tastaturnavigation + ARIA-Grid-Rollen, zusätzliche
  Aggregate (minMax/median/unique/uniqueCount) sowie Erweiterbarkeit über `reactTableOptions`
  und `onTableReady`.

  **ObjectPage** — zu einem echten Floorplan re-architektiert: komponierbare
  `ObjectPageSection`/`ObjectPageSubSection`, Anchor-/Tab-Bar mit Scroll-Spy, `mode`
  default/iconTabBar, kollabierbarer Snapping-Header mit Pin und imperativer
  `toggleHeaderArea`-API (`forwardRef`), Title-Slots (breadcrumbs/header/subHeader/snapped\*/
  actionsBar/navigationBar/KPIs), Bild/Avatar, Floating-Footer und Placeholder. Die bisherige
  deklarative API (`title`/`subtitle`/`status`/`kpis`/`sections`) bleibt als Adapter erhalten.

  Enthält außerdem zwei Layout-Bugfixes (grid-template-columns-Synchronisierung der
  Highlight-/Nav-Spalten; Anchor-Bar `flex-shrink`) sowie die korrekte CONTRACTS.md.

- 202fc77: W1 — Forms/Inputs: neue Prince-gestylte Komponenten auf React-Aria-Basis: `RadioGroup`/`Radio`, `CheckboxGroup`, `NumberField` (mit Steppern), `Slider`, `ComboBox`/`ComboBoxItem`, `Form` und `FieldError`. Jeweils mit Tests und Storybook-Seiten.
- 0d04aec: W2–W5 — volle React-Aria-Parität in Prince-Optik: ~30 neue Komponenten.
  Collections (ListBox, GridList, TagGroup, Breadcrumbs, Link, Disclosure, Tree, Table),
  Date & Time (DateField, TimeField, Calendar, RangeCalendar, DatePicker, DateRangePicker),
  Color (ColorField, ColorSwatch, ColorSwatchPicker, ColorArea, ColorSlider, ColorWheel, ColorPicker),
  Status & Misc (ProgressBar, Meter, Separator, Group, Toast/ToastRegion, DropZone, FileTrigger).
  Jeweils mit Tests und Storybook-Seiten.
- 624a561: Wave 1 — L1-Primitives auf React Aria: Button, TextField, SearchField, Checkbox,
  Switch, Select/SelectItem, Modal/DialogTrigger, Menu/MenuItem, Popover, Tooltip,
  SegmentedControl/Segment, Tabs. Fokus-Management/Tastatur-Nav/ARIA über React Aria
  (ersetzt handgeschriebene Focus-Traps). CSS gebündelt nach styles.css.
- 92c174c: Datenschicht: AnalyticalTable bekommt Multi-Level-Gruppierung (mit Aggregation und
  Group-Bar) und Spalten-Personalisierung inkl. Pinning. Neuer `useFilterState`-Hook
  für persistente FilterBar-Zustände (localStorage). Erste Vitest-Test-Suite (~80%).
- ba15e69: Wave 2 — L2-Komposita (Card, KpiCard, Badge, Amount, List/ListRow, Sidebar,
  Toolbar, EmptyState, Notice), Charts als eigene SVG (Sparkline, AreaChart,
  BarChart, DonutChart, ChartEmpty) und die L3-Datenschicht auf TanStack + React
  Aria (AnalyticalTable mit Sort/Auswahl/Virtualisierung, FilterBar, ObjectPage).
