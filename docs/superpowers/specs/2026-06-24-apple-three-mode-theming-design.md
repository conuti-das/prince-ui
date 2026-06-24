# Prince UI — 3-Mode-Theming (Apple Light/Dark + CU)

**Datum:** 2026-06-24 · **Status:** umgesetzt (prince-ui 0.4.0 / prince-ui-tokens 0.2.0)

## Ziel

Das bisherige „Community Styling" (CONUTI-Grün) wird zu einem eigenen Mode **CU**.
Daneben gibt es neu **Light** und **Dark** im **originalen Apple-Look** (SF-Fonts,
Apple-System-Farben, Apple-Grün als Akzent). **Default = Dark.**

## Theme-Logik (`packages/tokens/src/tokens.css`)

| Selektor | Mode |
|---|---|
| `:root` | Apple **Dark** (Default + Fallback) |
| `@media (prefers-color-scheme: light) :root:not([data-theme])` | Apple **Light** |
| `:root[data-theme="light"]` | Apple **Light** (erzwungen) |
| `:root[data-theme="dark"]` | Apple **Dark** (erzwungen) |
| `:root[data-theme="cu"]` | **CU** — CONUTI Community (CI-Grün, Inter, grünes Bento-Mesh) |

Ohne `data-theme` folgt es dem OS, fällt aber auf **Dark** zurück. `data-theme`
gewinnt immer. Entscheidung: „System folgen, Fallback Dark".

## Paletten (Kern)

- **Apple Dark:** Flächen `#1c1c1e`/`#2c2c2e`/`#3a3a3c`; Weiß-Labels; Akzent
  **Apple-Grün #30D158**; Semantik = Apple System Colors (Dark); SF-Fonts.
- **Apple Light:** grouped `#f2f2f7` / elevated `#ffffff`; Schwarz-Labels; Akzent
  **Apple-Grün #34C759**; Semantik = Apple System Colors (Light).
- **CU:** der frühere Dark-Block 1:1 (Akzent #A0D22B, Inter-Font, grünes Bento-Mesh).

Akzent-Entscheidung: „Apple-Look + grüner Akzent als Default-Apple-Tint"
(Apple-Grün statt System-Blau — nativ und farblich nah an CONUTI).

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
- **maco-process-studio** — eigene Apple-Token-Schicht (`src/ui/theme.css`): CU teilt
  sich die Dark-App-Chrome (`[data-theme="cu"]` an Dark-Selektoren gehängt), grüne
  Akzente liefert prince-ui. Theme-Liste um „Community / CU" ergänzt. Default Dark.
- **finops** — `UiModeContext`: `Appearance` um `'cu'`, CU→prince `'cu'` auf dunkler
  Chrome, Default `appearance='dark'` (vorher `auto`), Picker-Option „CU".
  Hinweis: finops' Default-**Shell** bleibt Fiori; CU/Dark/Light greifen im Apple-Modus.
