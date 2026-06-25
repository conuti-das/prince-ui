---
"prince-ui-tokens": minor
"prince-ui": minor
---

Apple-Light-Feinschliff + Liquid-Glass-Stilschicht.

**Apple-Feinschliff (Grün-Akzent bleibt):**
- Card-Radius 16 → 20px (Apple-„pillowy"), Body 16 → 17px, Metric-Weight 800 → 700 (Apple-Bold).
- Light: App-BG flach (`#f2f2f7`) statt Verlauf, Default-Schatten flacher (Apple-Grouped-Look).

**Liquid Glass (nur Optik über React Aria, kein Verhaltensumbau):**
- Neue `--prn-glass-*`-Tokens, abgeleitet aus den mode-spezifischen Flächen → wirken automatisch in Light/Dark/CU.
- Neue Stilschicht `.prn-glass` + Varianten `-bar/-sidebar/-overlay/-card/-floating` mit `@supports`-Gate und Fallback auf opak; respektiert `prefers-reduced-transparency` und `prefers-reduced-motion`. Optionaler `--prn-glass-tint` für Branding.
- Neuer `<GlassSurface variant tintColor as>`-Wrapper.
- Opt-in `glass`-Prop auf `Toolbar`, `Sidebar`, `Popover` (nur className, keine RA-Logik berührt).
