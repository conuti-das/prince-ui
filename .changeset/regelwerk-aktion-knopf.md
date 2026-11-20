---
"@conuti-das/prince-ui": minor
"@conuti-das/prince-ui-tokens": minor
---

Regelwerk „Aktion, Hilfsaktion, Navigation, Ansicht“, Teil 1: Rollen-Token `--prn-action*` (Aktion) getrennt von `--prn-link*` (Link), damit die Leitfarbe der Aktion umgestellt werden kann; die CU-Themes setzen sie auf Deep Azure (CU hell `#061D95`, CU dunkel `#4C69EB`), Links und Ansichtssteuerung bleiben beim Akzent. `--prn-action-text` und `--prn-danger*` mit mindestens 4,5:1 Kontrast in allen Themes (hell und dunkel). `Button destructive` (Rolle „Rücknahme“: rot getönt, gefüllt rot nur im Bestätigungsdialog; `ConfirmDialog destructive` nutzt sie). Deaktivierte Knöpfe sind in jeder Variante neutral grau. Neu: `IconButton` – neutraler Icon-Knopf mit Pflicht-Namen, Tooltip und 44-px-Trefferfläche auf dem Telefon.
