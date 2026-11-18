---
"@conuti-das/prince-ui": minor
---

AppShell für Anwendungen mit eigener Sprache und eigener Landmark:
- `labels` überschreibt die festen Texte (Startseite, Konto, Weitere Aktionen, Suche umschalten, Benachrichtigungen, Produkte).
- `contentAs="div"` – der Inhaltsbereich ist dann kein zweites `<main>`.
- `AppShellItem.expanded` (`aria-expanded`, z. B. für einen Hilfe-Knopf) und `AppShellItem["data-testid"]`; `toggleTestId` am Navigations-Umschalter.
