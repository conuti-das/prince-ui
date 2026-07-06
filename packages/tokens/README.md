# prince-ui-tokens

Die Prince-Designsprache als CSS-Custom-Properties — eine Quelle für alle Apps.
Konsolidiert aus finops (`--prn-*`) und roadmap (Typo-/Motion-Skala).

## Nutzung

```ts
import "prince-ui-tokens/tokens.css";
```

Ohne `data-theme` folgt es dem OS (System-Light → Hell, sonst **Dunkel** als
Fallback). Erzwungen am `<html>`:

```html
<html data-theme="dark">   <!-- Hell/Dunkel: neutrale System-Themes -->
<html data-theme="light">
<html data-theme="cu-dark">  <!-- CONUTI-CI (Cabinet Grotesk, electric blue #4F9EE8) -->
<html data-theme="cu-light"> <!-- heller CONUTI-Scope -->
<html data-theme="cu">       <!-- Alias auf cu-dark (Rückwärtskompatibilität) -->
```

Die CU-Themes ziehen die Hausschrift **Cabinet Grotesk** (self-hosted, siehe
`fonts.css`) und quadratische Radien; Hell/Dunkel bleiben beim System-Font-Stack.

## Token-Gruppen

- **Typografie:** `--prn-font`, `--prn-font-mono`, `--prn-font-rounded`, `--prn-text-*`
- **Flächen:** `--prn-bg`, `--prn-bg-elevated`, `--prn-bg-head`, `--prn-bg-bar`, `--prn-fill*`
- **Text:** `--prn-label`, `--prn-label-2/3/4`
- **Linien:** `--prn-separator`, `--prn-hairline`, `--prn-border`
- **Akzent (Grün · CU: electric blue):** `--prn-accent`, `--prn-accent-strong/hover/pressed/soft`, `--prn-on-accent`
- **Semantik:** `--prn-green/red/orange/yellow/blue/teal/neutral`, `--prn-tint-*`
- **Charts:** `--prn-chart-1..8`
- **Radien:** `--prn-radius-xs..xl`, `--prn-radius-card/pill`
- **Schatten/Glas:** `--prn-shadow*`, `--prn-blur*`, `--prn-card-*`
- **Bewegung:** `--prn-ease-*`, `--prn-dur-*`
- **Maße:** `--prn-space`, `--prn-hit`

## Helfer-Klassen

`.prn-tnum` (tabular-nums), `.prn-skeleton` (Shimmer). Plus globaler
`:focus-visible`-Ring und `prefers-reduced-motion`-Abschaltung.
