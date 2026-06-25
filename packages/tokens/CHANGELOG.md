# prince-ui-tokens

## 0.4.0

### Minor Changes

- 7cd49b0: 3-Mode-Theming: Prince Light/Dark als neue Default-Optik, CU als CONUTI-Community-Mode.

  - `prince-ui-tokens`: `tokens.css` neu strukturiert. `:root` ist jetzt **Prince Dark**
    (Default + Fallback), `@media (prefers-color-scheme: light)` und `[data-theme="light"]`
    liefern **Prince Light**, `[data-theme="cu"]` das frühere CONUTI-Community-Styling
    (CI-Grün #A0D22B, Inter-Font, grünes Bento-Mesh). Light/Dark nutzen den System-Font-Stack,
    System-Farben und einen Grün-Akzent (#34C759 / #30D158).
    Default folgt dem OS, fällt aber auf Dark zurück.
  - `prince-ui`: `setTheme` akzeptiert nun `"cu"`; neuer Typ `PrinceTheme` und Helfer
    `getTheme()`. `PRINCE_UI_VERSION` = 0.4.0.

- 3005ab1: Light-Feinschliff + Glas-Optik-Stilschicht.

  **Optischer Feinschliff (Grün-Akzent bleibt):**

  - Card-Radius 16 → 20px (weicher), Body 16 → 17px, Metric-Weight 800 → 700 (Bold).
  - Light: App-BG flach (`#f2f2f7`) statt Verlauf, Default-Schatten flacher (gruppierter Look).

  **Glas-Optik (nur Optik über React Aria, kein Verhaltensumbau):**

  - Neue `--prn-glass-*`-Tokens, abgeleitet aus den mode-spezifischen Flächen → wirken automatisch in Light/Dark/CU.
  - Neue Stilschicht `.prn-glass` + Varianten `-bar/-sidebar/-overlay/-card/-floating` mit `@supports`-Gate und Fallback auf opak; respektiert `prefers-reduced-transparency` und `prefers-reduced-motion`. Optionaler `--prn-glass-tint` für Branding.
  - Neuer `<GlassSurface variant tintColor as>`-Wrapper.
  - Opt-in `glass`-Prop auf `Toolbar`, `Sidebar`, `Popover` (nur className, keine RA-Logik berührt).
