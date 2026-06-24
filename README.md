# prince-ui

Ein React-Komponenten- und Design-Token-System auf Basis von **React Aria** —
Barrierefreiheit ist eingebaut, nicht nachträglich. Theming über CSS-Custom-
Properties (`--prn-*`) mit Light/Dark via `data-theme` am `<html>`.

Live-Doku (Storybook): https://conuti-das.github.io/prince-ui/

## Designprinzipien

- **Klarheit zuerst.** Inhalt führt, Chrome tritt zurück. Lesbare Typo-Skala,
  großzügiger Weißraum, ruhige Flächen.
- **Zurückhaltung.** Die Oberfläche dient dem Inhalt: dezente Materialien, weiche
  Trennlinien, sparsamer Farbeinsatz — ein klarer Akzent (Lime/CONUTI-Grün) plus
  eindeutige semantische Farben (Erfolg / Warnung / Fehler / Info).
- **Tiefe & Hierarchie.** Ebenen, weiche Schatten und Vibrancy schaffen Struktur;
  Bewegung (Spring-/Ease-Kurven) erklärt Übergänge, statt zu dekorieren.
- **Barrierefreiheit ist Pflicht, nicht Option.** Auf **React Aria** gebaut:
  Fokus-Management, Tastaturbedienung, ARIA-Rollen und Screenreader-Unterstützung
  sind eingebaut. Mindest-Trefferflächen (44 px), sichtbare Fokus-Ringe, ausreichende
  Kontraste.
- **Light & Dark gleichwertig.** Beide Modi sind erstklassig, getrieben aus denselben
  Tokens via `data-theme`.
- **Token-getrieben, eine Quelle der Wahrheit.** Niemals rohe Hex-/Pixelwerte in
  Komponenten — alles fließt aus `--prn-*`. Konsistenz per Konstruktion, zentral
  anpassbar.
- **Komposition statt Konfiguration.** Kleine, kombinierbare Bausteine
  (Primitives → Komposita → Datenschicht) mit klaren, deklarativen APIs; Konsumenten
  müssen interne Libraries (TanStack u. a.) nicht kennen.
- **Vorhersehbar & getestet.** Jede Komponente mit Tests und Storybook-Beispiel;
  verbindliche APIs in [`CONTRACTS.md`](packages/ui/CONTRACTS.md).

## Pakete

| Paket | Zweck |
|---|---|
| [`prince-ui-tokens`](packages/tokens) | Design-Tokens (CSS-Custom-Properties), Single Source of Truth |
| [`prince-ui`](packages/ui) | React-Komponenten auf React Aria |

## Installation

```bash
npm install prince-ui prince-ui-tokens
# oder: pnpm add prince-ui prince-ui-tokens
```

## Nutzung

```tsx
import "prince-ui-tokens/tokens.css";
import "prince-ui/styles.css";
import { Button, AnalyticalTable, ObjectPage, setTheme } from "prince-ui";

setTheme("dark"); // "light" | "dark" | null (System)

export function App() {
  return <Button variant="filled">Los geht's</Button>;
}
```

Verbindliche Komponenten-APIs: siehe [`packages/ui/CONTRACTS.md`](packages/ui/CONTRACTS.md).

## Entwicklung

```bash
pnpm install
pnpm --filter prince-ui test      # Vitest
pnpm typecheck
pnpm build                        # Pakete bauen (tsup)
pnpm storybook                    # lokale Doku auf :6006
```

## Lizenz

[MIT](LICENSE)
