---
"prince-ui-bo4e": minor
"prince-ui": patch
---

Neues Paket `prince-ui-bo4e`: Smart-Viewer für BO4E-cDoc (Milestone 1).

- Schema-Core: `loadBo4eSchema`/`resolveField`, Datumsanzeige in Europe/Berlin mit UTC-Popover, Gültigkeits-Engine, Auffälligkeiten-Scanner, injizierbare Resolver (BDEW-Code→Name u. a.).
- Smart-View-Bausteine: `IdentityHeader`, `EnumIcon`/`EnumBadge`, `ValidityRange`, `AddressBlock`, `ContactLine`, `CodeResolved`, `SchemaField`, `MarktpartnerRow`, `FullDetail`, `SmartObjectCard`, `SmartObjectView`.
- `SydocView` mit Richtungs-/Gruppen-Tabs (Gruppenschlüssel ≠ boTyp), Auffälligkeiten-Leiste und „+ Alle Details"-Vollsicht.

`prince-ui`: zusätzliche monochrome Icons (phone, clock, link, arrow-down-right, arrow-up-right, droplet, file-text) für die Smart-Views.
