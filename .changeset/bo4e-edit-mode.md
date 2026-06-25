---
"prince-ui-bo4e": minor
---

Edit-Mode (Milestone 2, Slice 4): schema-getriebenes Bearbeiten in der „Alle Details"-Sicht.

- `EditableValue` — Enum→Select, Boolean→Switch, Zahl→NumberField, ISO-Datum→DateField (Anzeige Europe/Berlin, Rückgabe ISO-UTC), sonst TextField.
- `FullDetail` mit `editable`-Modus inkl. „+ Feld hinzufügen" für im Schema vorhandene, noch nicht gesetzte Felder.
- `SmartObjectCard` mit Bearbeiten/Fertig-Umschalter.
- Datums-Round-Trip-Helfer `isoToBerlin`/`berlinToIso`.
