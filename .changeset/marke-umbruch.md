---
"@conuti-das/prince-ui": patch
---

`Badge` bricht auch ohne `wrap` um, wenn Platz für eine zweite Zeile ist: unter dem Text einer Zeile (`ListRow trailingPlacement="below"`) und in schmalen Tabellen (`AnalyticalTable scaleWidthMode="fit"`). Dort brechen auch `CellStack`-Werte um (höchstens zwei Zeilen). Die Tabelle trägt dafür `data-scale-width-mode="fit"`.
