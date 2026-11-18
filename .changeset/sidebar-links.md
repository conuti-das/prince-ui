---
"@conuti-das/prince-ui": minor
---

Sidebar für App-Navigation:
- `SidebarItem.href` macht den Eintrag zu einem React-Aria-`Link` (`<a href>`): Strg-/⌘-Klick öffnet einen
  neuen Tab, Client-Routing über React-Arias `RouterProvider`. Ohne `href` bleibt der Eintrag ein Knopf.
- Der aktive Eintrag trägt `aria-current="page"` (bisher nur `data-active`).
- `aria-label` an `Sidebar` (Default „Seitenleiste") und `data-testid` an `Sidebar` und `SidebarItem`.
