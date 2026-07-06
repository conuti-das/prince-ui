# Component Contracts — `prince-ui`

Verbindliche Prop-APIs. App-Sessions (Wave 3) codieren gegen diese Signaturen;
Änderungen nur per PR an dieser Datei + Re-Sync der Konsumenten.

## Wave 1 — L1 Primitives (React Aria)

### Forms (`primitives/forms`)
| Komponente | Wesentliche Props |
|---|---|
| `Button` | `variant?: "filled" \| "tinted" \| "plain"` (Default `filled`), + alle React-Aria `Button`-Props (`onPress`, `isDisabled`, …) |
| `TextField` | `label?`, `description?`, `errorMessage?`, `placeholder?`, + RAC `TextField` (`value`, `onChange`, `isInvalid`, …) |
| `SearchField` | `label?`, `placeholder?`, + RAC `SearchField` (`value`, `onChange`, `onClear`, …) |
| `Checkbox` | `children?` (Label), + RAC `Checkbox` (`isSelected`, `onChange`, `isIndeterminate`, …) |
| `Switch` | `children?` (Label), + RAC `Switch` (`isSelected`, `onChange`, …) |
| `Select<T>` | `label?`, `placeholder?`, `children` (Items), + RAC `Select` (`selectedKey`, `onSelectionChange`, …) |
| `SelectItem` | RAC `ListBoxItem` (`id`, `textValue`, …) |

### Overlays (`primitives/overlays`)
| Komponente | Wesentliche Props |
|---|---|
| `Modal` | `isOpen?`, `onOpenChange?`, `title?`, `isDismissable?` (Default true), `children`. Fokus-Trap/Escape/Fokus-Rückgabe via React Aria. |
| `DialogTrigger` | Re-Export aus RAC (deklaratives Öffnen). |
| `Menu` | `trigger` (z. B. `<Button>`), `children` (`MenuItem`s). |
| `MenuItem` | RAC `MenuItem` (`onAction`, `id`, …). |
| `Popover` | RAC `Popover` (`placement`, …). |
| `Tooltip` | `trigger`, `children`, `delay?` (Default 600). |

### Navigation (`primitives/navigation`)
| Komponente | Wesentliche Props |
|---|---|
| `SegmentedControl` | `selectedKeys`/`onSelectionChange` (single), `disallowEmptySelection?` (Default true). |
| `Segment` | `id`, + RAC `ToggleButton`. |
| `Tabs` / `TabBar` / `Tab` / `TabPanel` | RAC `Tabs`-Familie (`selectedKey`, `onSelectionChange`). |

### Theming
- `setTheme("light" \| "dark" \| "cu-dark" \| "cu-light" \| "cu" \| null)` — setzt/entfernt `data-theme` am `<html>`. `"cu-*"` = CONUTI-CI (Cabinet Grotesk, electric blue), `"cu"` = Alias auf `"cu-dark"`.
- CSS-Import: `prince-ui-tokens/tokens.css` **und** `prince-ui/styles.css`.

## Wave 2 — L2-Komposita + Charts + L3-Datenschicht

### Composites (`composites/composites`)
`Card` (title?, header?, padding, **`translucent?`** — Glas-Optik via
`--prn-bg-elevated-translucent` + `backdrop-filter: var(--prn-blur)`, in Light & Dark;
seit 0.3.1 **`onPress?`** — klickbar als react-aria `<button>` mit Hover-Lift, **`style?`** —
Inline-Styles für App-lokale Maße/Status-Border),
`KpiCard` (label, value, delta?, trend?, icon?, **`tone?: "positive"|"critical"|"negative"`**
— färbt den Wert, **`onPress?`** — klickbar als `<button>` mit Hover-Lift, **`accent?`** —
Vollflächen-Akzent-„Hero"-Kachel mit dunkler Schrift),
`Badge` (tone, seit 0.3.1 **`icon?`** — Leading-Icon-Slot; seit 0.3.2 **`variant?: "soft"|"solid"`**
+ **`color?`/`textColor?`** — beliebige Marken-/Team-Farbe), `Amount` (**`value: number | string`** — Zahl wird i18n-formatiert,
bereits formatierter String wird unverändert übernommen; currency?, locale?,
minimum/maximumFractionDigits?, colored?, signed?, **`dimDecimals?`** — optische
Abschwächung der Nachkommastellen), `List`/`ListRow`
(leading/title/subtitle/trailing, onPress?),
`Sidebar` (groups, selectedKey/onSelect) — `SidebarGroup` zusätzlich **`collapsible?`** /
**`defaultCollapsed?`** (aufklappbare Gruppe: Chevron + Tastatur via React-Aria-Button,
`aria-expanded`; Persistenz bleibt App-Sache),
`Toolbar` (leading/title/subtitle/actions), `EmptyState` (icon, title, description, action?),
`Notice` (tone: info|positive|critical|negative),
**`DescriptionList`** (children, `layout?: "stacked"|"inline"`) + **`Field`** (label,
value? | children) — schlankes read-only Label/Wert-Primitive (semantisches `<dl>`/`<dt>`/`<dd>`).

**Neues Token:** `--prn-bg-elevated-translucent` (Light + Dark, Blur-taugliches rgba) für
Glas-Cards (Bento). Ergänzt die `--prn-bg-elevated*`-Reihe.

### Charts (`charts/charts`) — eigene SVG
`Sparkline` (data:number[]), `AreaChart` (data, axes?), `BarChart` (data:{label,value}[]),
`DonutChart` (segments, centerLabel?), `ChartEmpty`, Helper `smoothPath`.

### Data (`data/*`) — TanStack + React Aria
- `AnalyticalTable<T>` — SAP-UI5-AnalyticalTable-Parität (Stand 2026-06-24, ~90 % Feature-Coverage).
  Kern: `data`, `columns: AnalyticalColumn<T>[]`, `getRowId`, Sort (Klick+Tastatur, aria-sort),
  Sticky-Header, Zeilen-Virtualisierung, Skeleton/Empty. Erweiterungen:
  - **Selektion (B5):** `selectionMode` none|single|multiple, `selectionBehavior` row|rowOnly|rowSelector,
    `selectedKeys`/`onSelectionChange`, `onRowSelect`, `onRowClick`, `onRowContextMenu`,
    `onRowAction` (Alias), `selectable` (Alias → multiple).
  - **Sortierung (B2):** `sortable`, `sorting`/`defaultSorting`/`onSortingChange`, `onSort`,
    `enableMultiSort` (Shift), pro Spalte `disableSortBy`/`sortType`.
  - **Filterung (B3):** `filterable` (Header-Popover), `globalFilterValue`, `onFilter`,
    pro Spalte `filterable`/`disableFilters`/`filter` (text|exactText|exactTextCase|equals).
  - **Gruppierung (B4):** `enableGrouping`, `grouping`/`defaultGrouping`/`onGroupingChange`/`onGroup`,
    pro Spalte `groupable`, `aggregate` (sum|count|avg|min|max|minMax|median|unique|uniqueCount|fn),
    `aggregatedCellRender`; Group-Bar + Aggregat je Gruppe.
  - **Spalten (B6):** Resizing (Drag) + `disableResizing`, Drag-Reorder + `onColumnsReorder` +
    `disableDragAndDrop`, Personalisierung (`enablePersonalization`, `columnVisibility`/`columnOrder`/
    `columnPinning` + default*/on*Change, `canHide`/`canPin`/`defaultPinned`), nested accessor-Pfade,
    `minWidth`/`maxWidth`/`width`/`align`/`vAlign`.
  - **Höhe/Rendering (B7):** `visibleRows`, `minRows`, `visibleRowCountMode` fixed|auto|autoWithEmptyRows,
    `rowHeight`/`headerRowHeight`/`maxHeight`, `overscanCount`, `onTableScroll`.
  - **Tree (B8):** `isTreeTable`, `subRowsKey`, `onRowExpandChange`.
  - **Infinite Scroll (B9):** `infiniteScroll`, `infiniteScrollThreshold`, `onLoadMore`.
  - **Highlights (B10):** `alternateRowColor`, `withRowHighlight`+`highlightField` (ValueState),
    `withNavigationHighlight`+`markNavigatedRow`.
  - **Pop-In (B11):** pro Spalte `responsivePopIn`/`responsiveMinWidth`/`popinDisplay`.
  - **Loading/Empty (B12):** `loading`/`isLoading`, `loadingDelay`, `alwaysShowBusyIndicator`,
    `showOverlay`, `noDataText`, `NoDataComponent` (reason empty|filtered), `skeletonRows`.
  - **Header/A11y/Erweiterbarkeit (B14):** `header`, `extension`, `accessibleName`/`accessibleNameRef`,
    Grid-Tastaturnavigation (Pfeile/Home/End, roving tabindex, aria-colindex/rowindex), ARIA-Grid-Rollen,
    `reactTableOptions`, `onTableReady(table)`.
  - Typen: `AggregateType`, `SortType`, `ColumnFilterType`, `SelectionMode`, `SelectionBehavior`,
    `VisibleRowCountMode`, `ValueState`, `NoDataReason`.
- `FilterBar` (children, `moreFields?`, `activeFilters`/`onRemoveFilter`/`onClearAll`,
  `actions?`) + `FilterField` (label + Control-Slot).
- `ObjectPage` — SAP-UI5-ObjectPage-Floorplan-Parität (Stand 2026-06-24, ~96 % Feature-Coverage),
  `forwardRef<ObjectPageHandle>`. Komposition: `ObjectPageSection` (id, titleText, hideTitleText,
  titleTextUppercase, wrapTitleText, titleTextLevel H1–H6, header) + `ObjectPageSubSection`
  (id, titleText, actions, hideTitleText), als `children`.
  - **Navigation (A1):** Anchor/Tab-Bar (role=tablist) + Scroll-Spy (IntersectionObserver),
    `mode` default|iconTabBar, `selectedSectionId`/`selectedSubSectionId`, `onSelectedSectionChange`,
    `onBeforeNavigate` (cancelable). Single-Section blendet Bar aus.
  - **Snapping-Header (A2):** `headerArea`, scroll-getriebenes Kollabieren, `headerPinned`/`hidePinButton`,
    `preserveHeaderStateOnClick`, imperative `toggleHeaderArea(snapped?)`, `onToggleHeaderArea`/`onPinButtonToggle`.
  - **Title (A3):** `breadcrumbs`, `header`/`subHeader`, `snappedHeader`/`snappedSubHeader`,
    `expandedContent`/`snappedContent`, `actionsBar`/`navigationBar`, `kpis`, `status`.
  - **Medien/Footer (A4):** `image`+`imageShapeCircle`, `footerArea`, `placeholder`.
  - **A11y (A6):** `accessibilityAttributes`, Heading-Level, Landmarks, Tablist-Tastatur.
  - **Legacy-Adapter:** altes `sections: {title, fields:{label,value,numeric?}[]}[]` + `title`/`subtitle`/
    `actions` bleiben rückwärtskompatibel. Typen: `ObjectPageMode`, `TitleTextLevel`, `ObjectPageHandle`,
    `ObjectPageSectionProps`, `ObjectPageSubSectionProps`, `ObjectPageAccessibilityAttributes`.

## W1 — Forms/Inputs (React Aria)

| Komponente | Wesentliche Props |
|---|---|
| `RadioGroup` | `label?`, `description?`, `errorMessage?`, `children` (`Radio`s), + RAC `RadioGroup` (`value`, `onChange`, `orientation`, `isInvalid`, `isDisabled`). |
| `Radio` | `children?` (Label), + RAC `Radio` (`value`, …). |
| `CheckboxGroup` | `label?`, `description?`, `errorMessage?`, `children` (`Checkbox`s), + RAC `CheckboxGroup` (`value`, `onChange`, …). |
| `NumberField` | `label?`, `description?`, `errorMessage?`, `placeholder?`, + RAC `NumberField` (`value`, `onChange`, `minValue`, `maxValue`, `step`, `formatOptions`). −/+ Stepper. |
| `Slider` | `label?`, `showValue?` (Default true), + RAC `Slider` (`value`, `onChange`, `minValue`, `maxValue`, `step`, `formatOptions`). Ein Thumb. |
| `ComboBox<T>` | `label?`, `placeholder?`, `description?`, `errorMessage?`, `children` (Items), + RAC `ComboBox` (`selectedKey`, `onSelectionChange`, `inputValue`, `onInputChange`, `allowsCustomValue`, `items`). |
| `ComboBoxItem` | RAC `ListBoxItem` (`id`, `textValue`, …). |
| `Form` | + RAC `Form` (`onSubmit`, `validationErrors`, …). Layout-Wrapper. |
| `FieldError` | + RAC `FieldError` (Server-/Validierungsmeldung im Feld-Kontext). Einziger öffentlicher Export. |

## W2 — Collections (React Aria)

| Komponente | Wesentliche Props |
|---|---|
| `ListBox`/`ListBoxOption` | RAC `ListBox`/`ListBoxItem` (`selectionMode`, `selectedKeys`, `onSelectionChange`). |
| `GridList`/`GridListItem` | RAC `GridList`/`GridListItem` (`selectionMode`, `onAction`; Items brauchen `textValue` bei Nicht-Text-Inhalt). |
| `TagGroup`/`Tag` | RAC `TagGroup`/`TagList`/`Tag` (`onRemove` am Group; `selectionMode`). |
| `Breadcrumbs`/`Breadcrumb` | RAC `Breadcrumbs<T>`/`Breadcrumb` (`onAction`; letzter = `data-current`). |
| `Link` | RAC `Link` (`href?`, `onPress`, `isDisabled`). |
| `Disclosure`/`DisclosureGroup` | `title` + `children`; RAC `Disclosure` (`isExpanded`/`defaultExpanded`/`onExpandedChange`), Group `allowsMultipleExpanded`/`expandedKeys`. |
| `Tree`/`TreeItem` | RAC `Tree`/`TreeItem`/`TreeItemContent` (`title`, `selectionMode`, expand via Chevron). |
| `Table`/`TableHeader`/`TableBody`/`Column`/`Row`/`Cell` | RAC `Table`-Primitive (präsentationell; getrennt von `AnalyticalTable`). |

## W3 — Date & Time (React Aria + @internationalized/date)

| Komponente | Wesentliche Props |
|---|---|
| `DateField`/`TimeField` | `label?`, `description?`, `errorMessage?`, + RAC (`value`, `onChange`, `minValue`, `maxValue`). |
| `Calendar`/`RangeCalendar` | RAC (`value`, `onChange`, `minValue`, `maxValue`, `isDateUnavailable`). |
| `DatePicker`/`DateRangePicker` | `label?`, + RAC (`value`, `onChange`); Popover mit Calendar. |

## W4 — Color (React Aria)

| Komponente | Wesentliche Props |
|---|---|
| `ColorField` | `label?`, `description?`, `errorMessage?`, + RAC `ColorField`. |
| `ColorSwatch` | RAC `ColorSwatch` (`color`). |
| `ColorSwatchPicker` | RAC `ColorSwatchPicker`(+Item) (`value`, `onChange`). |
| `ColorArea` | RAC `ColorArea` (`value`, `onChange`, `xChannel`, `yChannel`, `colorSpace`). |
| `ColorSlider` | `label?`, `showValue?`, + RAC `ColorSlider` (`channel`, `colorSpace`). |
| `ColorWheel` | `outerRadius?` (100), `innerRadius?` (74), + RAC `ColorWheel`. |
| `ColorPicker` | `label?`, `children?` (Popover-Inhalt), + RAC `ColorPicker` (`value`, `onChange`). |

## W5 — Status & Misc (React Aria)

| Komponente | Wesentliche Props |
|---|---|
| `ProgressBar` | `label?`, + RAC `ProgressBar` (`value`, `minValue`, `maxValue`, `isIndeterminate`). |
| `Meter` | `label?`, + RAC `Meter` (`value`, Farbbänder). |
| `Separator` | RAC `Separator` (`orientation`). |
| `Group` | RAC `Group` (labelbarer Container). |
| `ToastRegion` + `toastQueue` | RAC `Toast`/`ToastRegion` + `ToastQueue`; `toastQueue.add({ title, description?, variant? })`. |
| `DropZone` | RAC `DropZone` (`onDrop`, `[data-drop-target]`). |
| `FileTrigger` | RAC `FileTrigger` (`onSelect`, `acceptedFileTypes`, `allowsMultiple`). |
