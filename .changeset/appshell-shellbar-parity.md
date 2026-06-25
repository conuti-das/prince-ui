---
"prince-ui": minor
---

AppShell mit voller ShellBar-Funktion (UI5-äquivalent) + Responsive.

Die `AppShell`-Shell-Bar bekommt den UI5-ShellBar-Funktionsumfang (prince-ui-Naming):
- `subtitle`, Titel-Dropdown via `menuItems` + `onMenuItemClick`
- `logo` + `onLogoClick`
- Aktions-`items` (`{id,icon,label,count,onClick}`) mit Overflow-„…"-Menü
- `notifications` + `notificationsCount` + `onNotificationsClick` (Glocke+Badge)
- `productSwitch` + `onProductSwitchClick` (Grid)
- `user` + `onProfileClick`, `startButton`, kollabierbare `search`

**Responsiv (CSS-Breakpoints):**
- iPad/Tablet ≤1024: `subtitle` aus, `items` → Overflow.
- Phone ≤767: Suche → Icon (aufklappbar als Zeile), Sidebar als Off-canvas-Overlay
  (startet eingeklappt via `matchMedia`), sekundäre Chrome (`actions`/`productSwitch`)
  ausgeblendet, damit die Bar nicht überläuft.

Neue Icons: `grid`, `more`, `chevron-down`. Alles bestehende (`title`/`user`/`actions`) bleibt kompatibel.
