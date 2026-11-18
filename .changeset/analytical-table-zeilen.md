---
"@conuti-das/prince-ui": minor
---

AnalyticalTable:
- Enter/Leertaste auf einer Zelle aktivieren die Zeile wie ein Klick (`onRowAction`, Auswahl bei
  `selectionBehavior` `row`/`rowOnly`) – bisher ging das nur per Maus, obwohl `onRowAction` „Klick/Enter/Space“
  versprach. Steuerelemente in der Zelle behalten ihre Tasten.
- `getRowProps(row)` setzt `data-*`-Attribute an jede Datenzeile (z. B. `data-testid`).
