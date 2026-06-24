# prince-ui

Ein React-Komponenten- und Design-Token-System auf Basis von **React Aria** —
Barrierefreiheit ist eingebaut, nicht nachträglich. Theming über CSS-Custom-
Properties (`--prn-*`) mit Light/Dark via `data-theme` am `<html>`.

Live-Doku (Storybook): https://conuti-das.github.io/prince-ui/

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
