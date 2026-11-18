---
"@conuti-das/prince-ui": patch
---

`Tree`: Zustände der Zeile (Hover, Auswahl, Fokus-Ring, gesperrt) und der gedrehte Pfeil bei aufgeklappten Einträgen greifen wieder – React Aria legt die Zeile in eine Zelle (`display: contents`), die Kind-Selektoren trafen sie nie. `Disclosure`: der Pfeil dreht sich beim Aufklappen (`aria-expanded` statt des nicht gesetzten `data-expanded` am Knopf).
