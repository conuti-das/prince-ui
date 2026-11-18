---
"@conuti-das/prince-ui": patch
---

AppShell: Die Seitenleiste am Desktop nutzt kein `backdrop-filter` mehr. Darunter liegt nur der flache App-Hintergrund, der Blur änderte das Bild nicht, erzeugte in Chromium aber helle Rechtecke in der Leiste (sichtbar in cu-light). Farbe und Transparenz bleiben; das Off-canvas am Telefon behält das Glas.
