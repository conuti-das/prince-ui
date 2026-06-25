---
"prince-ui": minor
---

Monochrome Icons statt Emoji.

- Neues **`Icon`**-Set: monochrome Linien-SVGs (`currentColor`, lucide-kompatible
  Optik, kein externer Dependency, theme-fähig in Light/Dark/CU). `Icon`-Komponente
  mit `name`/`size`/`title` (dekorativ `aria-hidden`, mit `title` als `img`).
- Komponenten-interne Emoji ersetzt: `ObjectPage`-Pin (📌/📍 → `pin`/`pin-off`),
  `AppShell`-Toggle (☰ → `menu`), `AnalyticalTable`-Spaltenmenü (⚙ → `settings`).
- Stories durchgängig auf monochrome `Icon`s umgestellt (Glass, AppShell, Sidebar,
  List, KpiCard, EmptyState) — keine bunten Emoji mehr im Storybook.
