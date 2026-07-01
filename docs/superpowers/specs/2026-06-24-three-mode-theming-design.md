# Prince UI — 3-Mode-Theming (Hell/Dunkel + Cu)

**Datum:** 2026-06-24 · **Status:** umgesetzt (prince-ui 0.4.0 / prince-ui-tokens 0.2.0)

## Ziel

Das bisherige „CONUTI-CI-Styling" (CONUTI-Grün) wird zu einem eigenen Mode **Cu**.
Daneben gibt es neu **Light** und **Dark** im **systemnahen Prince-Look** (System-Schrift,
System-Farben, Akzentgrün als Akzent). **Default = Dark.**

## Theme-Logik (`packages/tokens/src/tokens.css`)

| Selektor | Mode |
|---|---|
| `:root` | **Dunkel** (Default + Fallback) |
| `@media (prefers-color-scheme: light) :root:not([data-theme])` | **Hell** |
| `:root[data-theme="light"]` | **Hell** (erzwungen) |
| `:root[data-theme="dark"]` | **Dunkel** (erzwungen) |
| `:root[data-theme="cu"]` | **Cu** — CONUTI-CI (CI-Grün, Inter, grünes Bento-Mesh) |

Ohne `data-theme` folgt es dem OS, fällt aber auf **Dark** zurück. `data-theme`
gewinnt immer. Entscheidung: „System folgen, Fallback Dark".

## Paletten (Kern)

- **Dunkel:** Flächen `#1c1c1e`/`#2c2c2e`/`#3a3a3c`; Weiß-Labels; Akzent
  **Akzentgrün #30D158**; Semantik = System-Farben (Dark); System-Schrift.
- **Hell:** grouped `#f2f2f7` / elevated `#ffffff`; Schwarz-Labels; Akzent
  **Akzentgrün #34C759**; Semantik = System-Farben (Light).
- **Cu:** der frühere Dark-Block 1:1 (Akzent #A0D22B, Inter-Font, grünes Bento-Mesh).

Akzent-Entscheidung: „Prince-Look + grüner Akzent als Default-Tint"
(Akzentgrün statt System-Blau — nativ und farblich nah an CONUTI).

## API (`packages/ui/src/index.ts`)

- `type PrinceTheme = "light" | "dark" | "cu"`
- `setTheme(theme: PrinceTheme | null)` — `null` = System folgen
- `getTheme(): PrinceTheme | null` — neu
- `PRINCE_UI_VERSION = "0.4.0"`

## Verteilung (Phase 2)

Konsumenten vendoren gepackte `.tgz` (`file:vendor/prince-ui/*.tgz`).
Eingespielt in `finops/frontend`, `roadmap/frontend`, `maco-process-studio/frontend`:
neue tgz vendored, `package.json`-Refs gebumpt (prince-ui 0.4.0, tokens 0.2.0),
`npm install`, **Default Dark** + 3-Wege-Switch (Light/Dark/Cu).

App-spezifische Anbindung:
- **roadmap** — `src/lib/theme.tsx`: `ThemeMode` um `'cu'` erweitert, Cycle
  dark→light→cu→auto, Toggle-Icon `sparkles`. Default war bereits Dark.
- **maco-process-studio** — eigene Token-Schicht (`src/ui/theme.css`): Cu teilt
  sich die Dark-App-Chrome (`[data-theme="cu"]` an Dark-Selektoren gehängt), grüne
  Akzente liefert prince-ui. Theme-Liste um „CONUTI-CI / Cu" ergänzt. Default Dark.
- **finops** — `UiModeContext`: `Appearance` um `'cu'`, Cu→prince `'cu'` auf dunkler
  Chrome, Default `appearance='dark'` (vorher `auto`), Picker-Option „Cu".
  Hinweis: finops' Default-**Shell** bleibt Fiori; Cu/Dark/Light greifen im Prince-Modus.
