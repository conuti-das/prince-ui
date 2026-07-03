# prince-ui-bo4e

## 0.4.2

### Patch Changes

- Republish für prince-ui 0.12.0 (neue `Timeline`-Komponente): exakter Peer `@conuti-das/prince-ui` auf 0.12.0 aktualisiert. Keine funktionalen Änderungen am Editor.

## 0.4.1

### Patch Changes

- CDocView auf kompakte Größe (s) umgestellt (Detailgrad-SegmentedControl, Tabs, Editier-Felder via `PrinceSizeProvider`).

## 0.4.0

### Minor Changes

- Sub-Felder neu erstellter Komponenten werden aufgelöst, Beispiel-Prefill und eine vereinheitlichte BO4E-Generierungspipeline (gen-bo4e ersetzt gen-structure). Inkl. Schema-Merge-Hilfen und NestedValue-Verbesserungen.

## 0.3.0

### Minor Changes

- 72e9cdf: Edit-Mode (Milestone 2, Slice 4): schema-getriebenes Bearbeiten in der „Alle Details"-Sicht.

  - `EditableValue` — Enum→Select, Boolean→Switch, Zahl→NumberField, ISO-Datum→DateField (Anzeige Europe/Berlin, Rückgabe ISO-UTC), sonst TextField.
  - `FullDetail` mit `editable`-Modus inkl. „+ Feld hinzufügen" für im Schema vorhandene, noch nicht gesetzte Felder.
  - `SmartObjectCard` mit Bearbeiten/Fertig-Umschalter.
  - Datums-Round-Trip-Helfer `isoToBerlin`/`berlinToIso`.

## 0.2.0

### Minor Changes

- 2481455: Neues Paket `prince-ui-bo4e`: Smart-Viewer für BO4E-cDoc (Milestone 1).

  - Schema-Core: `loadBo4eSchema`/`resolveField`, Datumsanzeige in Europe/Berlin mit UTC-Popover, Gültigkeits-Engine, Auffälligkeiten-Scanner, injizierbare Resolver (BDEW-Code→Name u. a.).
  - Smart-View-Bausteine: `IdentityHeader`, `EnumIcon`/`EnumBadge`, `ValidityRange`, `AddressBlock`, `ContactLine`, `CodeResolved`, `SchemaField`, `MarktpartnerRow`, `FullDetail`, `SmartObjectCard`, `SmartObjectView`.
  - `SydocView` mit Richtungs-/Gruppen-Tabs (Gruppenschlüssel ≠ boTyp), Auffälligkeiten-Leiste und „+ Alle Details"-Vollsicht.

  `prince-ui`: zusätzliche monochrome Icons (phone, clock, link, arrow-down-right, arrow-up-right, droplet, file-text) für die Smart-Views.

### Patch Changes

- Updated dependencies [2481455]
  - prince-ui@0.9.1
