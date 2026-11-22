---
"@conuti-das/prince-ui": patch
---

`NumberField` mit `commitOnInput`: ein geleertes Feld meldet `NaN` schon beim Tippen (wie React Aria beim Verlassen). Ein optionales Zahlfeld bleibt damit leer, auch wenn gleich gesendet wird; „-“ allein meldet weiter nichts.
