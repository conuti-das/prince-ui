# prince-ui-tokens

## 0.4.0

### Minor Changes

- 7cd49b0: 3-Mode-Theming: Hell/Dunkel als neue Default-Optik, Cu als CONUTI-CI-Mode.

  - `prince-ui-tokens`: `tokens.css` neu strukturiert. `:root` ist jetzt **Dunkel**
    (Default + Fallback), `@media (prefers-color-scheme: light)` und `[data-theme="light"]`
    liefern **Hell**, `[data-theme="cu"]` das frühere CONUTI-CI-Styling
    (CI-Grün #A0D22B, Inter-Font, grünes Bento-Mesh). Hell/Dunkel nutzen System-Schrift,
    System-Farben und Akzentgrün (#34C759 / #30D158) als Akzent.
    Default folgt dem OS, fällt aber auf Dark zurück.
  - `prince-ui`: `setTheme` akzeptiert nun `"cu"`; neuer Typ `PrinceTheme` und Helfer
    `getTheme()`. `PRINCE_UI_VERSION` = 0.4.0.

- 3005ab1: Hell-Feinschliff + Liquid-Glass-Stilschicht.

  **Feinschliff (Grün-Akzent bleibt):**

  - Card-Radius 16 → 20px („pillowy"), Body 16 → 17px, Metric-Weight 800 → 700 (Bold).
  - Light: App-BG flach (`#f2f2f7`) statt Verlauf, Default-Schatten flacher (Grouped-Look).

  **Liquid Glass (nur Optik über React Aria, kein Verhaltensumbau):**

  - Neue `--prn-glass-*`-Tokens, abgeleitet aus den mode-spezifischen Flächen → wirken automatisch in Light/Dark/Cu.
  - Neue Stilschicht `.prn-glass` + Varianten `-bar/-sidebar/-overlay/-card/-floating` mit `@supports`-Gate und Fallback auf opak; respektiert `prefers-reduced-transparency` und `prefers-reduced-motion`. Optionaler `--prn-glass-tint` für Branding.
  - Neuer `<GlassSurface variant tintColor as>`-Wrapper.
  - Opt-in `glass`-Prop auf `Toolbar`, `Sidebar`, `Popover` (nur className, keine RA-Logik berührt).
