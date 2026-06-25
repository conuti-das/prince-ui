---
"prince-ui": minor
---

AppShell + erweitertes Glas-Opt-in.

- Neue **`AppShell`**-Komponente: Apple-orientierte App-Hülle (Shell-Bar mit
  Logo/Titel/Suche/Aktionen/User + Menü-Toggle, Sidebar, scrollbarer Content).
  Glas auf Shell-Bar + Sidebar per Default; auf schmalen Screens wird die
  Sidebar zum Off-canvas-Overlay mit Scrim. Kontrolliert/unkontrolliert
  einklappbar, A11y (`<header>`/`<nav>`/`<main>`, `aria-expanded`/`-controls`).
- **`glass`-Opt-in** zusätzlich auf `Modal`, `Menu`, `ObjectPage` (Title/Top-Header)
  und `AnalyticalTable` (nur Toolbar, nicht die dichten Zeilen).
- Stories: Components/AppShell (Default + Opaque).
