# Prince UI — 3-Mode-Theming (Prince Light/Dark + CU)

**Datum:** 2026-06-24 · **Status:** umgesetzt (prince-ui 0.4.0 / prince-ui-tokens 0.2.0)

## Ziel

Das bisherige „Community Styling" (CONUTI-Grün) wird zu einem eigenen Mode **CU**.
Daneben gibt es neu **Light** und **Dark** in einer systemnahen Optik (System-Font-Stack,
System-Farben, Grün als Akzent). **Default = Dark.**

## Theme-Logik (`packages/tokens/src/tokens.css`)

| Selektor | Mode |
|---|---|
| `:root` | Prince **Dark** (Default + Fallback) |
| `@media (prefers-color-scheme: light) :root:not([data-theme])` | Prince **Light** |
| `:root[data-theme="light"]` | Prince **Light** (erzwungen) |
| `:root[data-theme="dark"]` | Prince **Dark** (erzwungen) |
| `:root[data-theme="cu"]` | **CU** — CONUTI Community (CI-Grün, Inter, grünes Bento-Mesh) |

Ohne `data-theme` folgt es dem OS, fällt aber auf **Dark** zurück. `data-theme`
gewinnt immer. Entscheidung: „System folgen, Fallback Dark".

## Paletten (Kern)

- **Prince Dark:** Flächen `#1c1c1e`/`#2c2c2e`/`#3a3a3c`; Weiß-Labels; Akzent
  **Grün #30D158**; Semantik = System-Farben (Dark); System-Font-Stack.
- **Prince Light:** grouped `#f2f2f7` / elevated `#ffffff`; Schwarz-Labels; Akzent
  **Grün #34C759**; Semantik = System-Farben (Light).
- **CU:** der frühere Dark-Block 1:1 (Akzent #A0D22B, Inter-Font, grünes Bento-Mesh).

Akzent-Entscheidung: „systemnahe Optik + grüner Akzent als Default-Tint"
(Grün statt Blau — farblich nah an CONUTI).

## API (`packages/ui/src/index.ts`)

- `type PrinceTheme = "light" | "dark" | "cu"`
- `setTheme(theme: PrinceTheme | null)` — `null` = System folgen
- `getTheme(): PrinceTheme | null` — neu
- `PRINCE_UI_VERSION = "0.4.0"`

## Verteilung (Phase 2)

Konsumenten vendoren gepackte `.tgz` (`file:vendor/prince-ui/*.tgz`).
Eingespielt in `finops/frontend`, `roadmap/frontend`, `maco-process-studio/frontend`:
neue tgz vendored, `package.json`-Refs gebumpt (prince-ui 0.4.0, tokens 0.2.0),
`npm install`, **Default Dark** + 3-Wege-Switch (Light/Dark/CU).

App-spezifische Anbindung:
- **roadmap** — `src/lib/theme.tsx`: `ThemeMode` um `'cu'` erweitert, Cycle
  dark→light→cu→auto, Toggle-Icon `sparkles`. Default war bereits Dark.
- **maco-process-studio** — eigene Token-Schicht (`src/ui/theme.css`): CU teilt
  sich die Dark-App-Chrome (`[data-theme="cu"]` an Dark-Selektoren gehängt), grüne
  Akzente liefert prince-ui. Theme-Liste um „Community / CU" ergänzt. Default Dark.
- **finops** — `UiModeContext`: `Appearance` um `'cu'`, CU→prince `'cu'` auf dunkler
  Chrome, Default `appearance='dark'` (vorher `auto`), Picker-Option „CU".
  Hinweis: finops' Default-**Shell** bleibt die bestehende; CU/Dark/Light greifen im prince-ui-Modus.
