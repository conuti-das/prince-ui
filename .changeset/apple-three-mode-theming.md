---
"prince-ui-tokens": minor
"prince-ui": minor
---

3-Mode-Theming: Apple Light/Dark als neue Default-Optik, CU als CONUTI-Community-Mode.

- `prince-ui-tokens`: `tokens.css` neu strukturiert. `:root` ist jetzt **Apple Dark**
  (Default + Fallback), `@media (prefers-color-scheme: light)` und `[data-theme="light"]`
  liefern **Apple Light**, `[data-theme="cu"]` das frühere CONUTI-Community-Styling
  (CI-Grün #A0D22B, Inter-Font, grünes Bento-Mesh). Apple-Modes nutzen SF-Fonts,
  Apple-System-Farben und Apple-Grün (#34C759 / #30D158) als Akzent.
  Default folgt dem OS, fällt aber auf Dark zurück.
- `prince-ui`: `setTheme` akzeptiert nun `"cu"`; neuer Typ `PrinceTheme` und Helfer
  `getTheme()`. `PRINCE_UI_VERSION` = 0.4.0.
