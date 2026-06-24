# prince-ui

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
