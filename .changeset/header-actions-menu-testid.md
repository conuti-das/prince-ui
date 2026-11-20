---
"@conuti-das/prince-ui": patch
---

`HeaderActions menuTestId`: eigene testid für den Menüknopf „⋯“ (bestehende testids einer Seite bleiben beim Umbau erhalten); Default weiter `${data-testid}-menu`. Im Aktions-Slot von `DetailHeader` und `ObjectPage` bekommt die Leiste den freien Platz der Zeile (vorher maß sie nur ihren Inhalt und gab ins Menü Gewandertes nie zurück); der Menüknopf zählt beim Überlauf erst, wenn etwas ins Menü wandert.
