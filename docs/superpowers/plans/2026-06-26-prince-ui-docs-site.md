# Prince-UI Doku-Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eine content-first Doku-Website im prince-ui-Look (Vite + React + MDX) mit interaktivem Inline-Playground, die Storybook ablöst und auf `conuti-das.github.io/prince-ui/` live geht.

**Architecture:** Neues Workspace-Paket `apps/docs`. Vite-Config wird aus `.storybook/main.ts` portiert (Preact-Dedupe, `jsx: automatic`), damit die Schwer-Editoren (bpmn/dmn/forms) client-seitig ohne SSR laufen. MDX-Seiten konsumieren wiederverwendbare Bausteine (`<Playground>`, `<PropsTable>`, `<Example>`). Props-Tabellen kommen aus einem Build-Zeit-Script (react-docgen-typescript). Suche via Pagefind, a11y via Playwright+axe im CI.

**Tech Stack:** Vite 5, React 18, `@mdx-js/rollup`, react-router-dom, react-live, react-docgen-typescript, Pagefind, Playwright + @axe-core/playwright, vitest.

**Spec:** [docs/superpowers/specs/2026-06-26-prince-ui-docs-site-design.md](../specs/2026-06-26-prince-ui-docs-site-design.md)

**Konventionen für jede Task:** Branch ist `feat/docs-site`. Commits klein und fokussiert. `pnpm` ist der Package-Manager. Alle `pnpm`-Befehle laufen aus dem Repo-Root, sofern nicht anders angegeben.

---

## Phase 0 — Workspace-Gerüst

### Task 0.1: `apps/docs`-Paket anlegen + Workspace registrieren

**Files:**
- Modify: `pnpm-workspace.yaml`
- Create: `apps/docs/package.json`
- Create: `apps/docs/tsconfig.json`

- [ ] **Step 1: Workspace-Glob erweitern**

`pnpm-workspace.yaml`:
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 2: `apps/docs/package.json` anlegen**

```json
{
  "name": "@conuti-das/prince-ui-docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.json --noEmit && node --import tsx scripts/extract-props.ts && vite build && pagefind --site dist",
    "preview": "vite preview",
    "extract-props": "node --import tsx scripts/extract-props.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@conuti-das/prince-ui": "workspace:*",
    "@conuti-das/prince-ui-tokens": "workspace:*",
    "@conuti-das/prince-ui-bpmn": "workspace:*",
    "@conuti-das/prince-ui-dmn": "workspace:*",
    "@conuti-das/prince-ui-forms": "workspace:*",
    "@conuti-das/prince-ui-bo4e": "workspace:*",
    "@internationalized/date": "3.12.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-aria-components": "1.19.0",
    "react-router-dom": "^6.27.0",
    "react-live": "^4.1.8"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.10.0",
    "@mdx-js/rollup": "^3.1.0",
    "@playwright/test": "^1.48.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.3",
    "pagefind": "^1.1.1",
    "preact": "^10.29.2",
    "react-docgen-typescript": "^2.2.2",
    "remark-gfm": "^4.0.0",
    "rehype-slug": "^6.0.0",
    "tsx": "^4.19.0",
    "vite": "^5.4.10",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 3: `apps/docs/tsconfig.json` anlegen**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["vite/client"],
    "noEmit": true
  },
  "include": ["src", "scripts", "content"]
}
```

- [ ] **Step 4: Installieren**

Run: `pnpm install`
Expected: lockfile aktualisiert, `@conuti-das/prince-ui-docs` als Workspace erkannt, kein Resolver-Fehler.

- [ ] **Step 5: Commit**

```bash
git add pnpm-workspace.yaml apps/docs/package.json apps/docs/tsconfig.json pnpm-lock.yaml
git commit -m "chore(docs): scaffold apps/docs workspace package"
```

---

## Phase 1 — Vite-Fundament & Chrome

### Task 1.1: Vite-Config (Port der Storybook-viteFinal) + MDX-Pipeline

**Files:**
- Create: `apps/docs/vite.config.ts`
- Create: `apps/docs/index.html`
- Create: `apps/docs/src/mdx-types.d.ts`

- [ ] **Step 1: `vite.config.ts` schreiben** (portiert `resolve.dedupe`, `esbuild.jsx`, `base` aus `.storybook/main.ts`)

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// base nur im Build setzen (Pages liegt unter /prince-ui/); lokal Root.
const base = process.env.DOCS_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug], providerImportSource: "@mdx-js/react" }) },
    react({ jsxRuntime: "automatic" }),
  ],
  resolve: {
    // form-js (Experten-Editor) rendert via Preact; zwei Preact-Versionen im Tree
    // brechen den Render-Kontext. Auf EINE Instanz zwingen (wie in .storybook/main.ts).
    dedupe: ["preact", "preact/hooks", "preact/jsx-runtime", "preact/compat"],
  },
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
});
```

- [ ] **Step 2: `index.html` anlegen**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>prince-ui</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: MDX-Typdeklaration**

`apps/docs/src/mdx-types.d.ts`:
```ts
declare module "*.mdx" {
  import type { ComponentType } from "react";
  export const frontmatter: Record<string, unknown>;
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
```

- [ ] **Step 4: Add @mdx-js/react dependency**

Run: `pnpm --filter @conuti-das/prince-ui-docs add @mdx-js/react`
Expected: dependency hinzugefügt.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/vite.config.ts apps/docs/index.html apps/docs/src/mdx-types.d.ts apps/docs/package.json pnpm-lock.yaml
git commit -m "feat(docs): vite config (storybook port) + mdx pipeline"
```

### Task 1.2: App-Shell, Theme-Decorator, i18n, Routing-Grundgerüst

**Files:**
- Create: `apps/docs/src/main.tsx`
- Create: `apps/docs/src/chrome/AppLayout.tsx`
- Create: `apps/docs/src/chrome/ThemeSwitcher.tsx`
- Create: `apps/docs/src/chrome/theme.css`
- Create: `apps/docs/content/index.mdx`

- [ ] **Step 1: `main.tsx`** — lädt Tokens-CSS + prince-ui styles, setzt I18nProvider(de-DE), Router

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { I18nProvider } from "react-aria-components";
import { MDXProvider } from "@mdx-js/react";
import "@conuti-das/prince-ui-tokens/tokens.css";
import "@conuti-das/prince-ui/styles.css";
import "./chrome/theme.css";
import { AppLayout } from "./chrome/AppLayout";
import { mdxComponents } from "./mdx/components";
import { routeObjects } from "./routes";

const router = createBrowserRouter(
  [{ element: <AppLayout />, children: routeObjects }],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider locale="de-DE">
      <MDXProvider components={mdxComponents}>
        <RouterProvider router={router} />
      </MDXProvider>
    </I18nProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 2: `chrome/theme.css`** — body auf prince-ui-Token-Hintergrund (analog `.storybook/preview.tsx`)

```css
body { margin: 0; background: var(--prn-bg); color: var(--prn-label); font-family: var(--prn-font); }
.docs-shell { display: grid; grid-template-columns: 260px minmax(0, 1fr) 220px; min-height: 100vh; }
.docs-main { max-width: 50rem; margin: 0 auto; padding: 2.5rem 2rem 6rem; width: 100%; box-sizing: border-box; }
.docs-toc { position: sticky; top: 2.5rem; align-self: start; padding: 2.5rem 1rem; font-size: 0.875rem; }
@media (max-width: 1100px) { .docs-shell { grid-template-columns: 240px minmax(0,1fr); } .docs-toc { display: none; } }
```

- [ ] **Step 3: `chrome/ThemeSwitcher.tsx`** — nutzt `setTheme` aus prince-ui (system/dark/light/cu)

```tsx
import { useState } from "react";
import { setTheme, type PrinceTheme } from "@conuti-das/prince-ui";

const OPTIONS: { value: PrinceTheme | "system"; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Prince Dark" },
  { value: "light", label: "Prince Light" },
  { value: "cu", label: "CU" },
];

export function ThemeSwitcher() {
  const [value, setValue] = useState<PrinceTheme | "system">("system");
  return (
    <select
      aria-label="Theme"
      value={value}
      onChange={(e) => {
        const v = e.target.value as PrinceTheme | "system";
        setValue(v);
        setTheme(v === "system" ? null : v);
      }}
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
```

- [ ] **Step 4: `chrome/AppLayout.tsx`** — Grid mit Sidebar (prince-ui dogfooden, hier zunächst schlichtes `<nav>`), `<Outlet/>`, TOC-Slot

```tsx
import { Outlet, Link } from "react-router-dom";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { navTree } from "../routes";

export function AppLayout() {
  return (
    <div className="docs-shell">
      <nav style={{ padding: "1.5rem 1rem", borderRight: "1px solid var(--prn-separator)" }}>
        <Link to="/" style={{ fontWeight: 700, color: "var(--prn-label)", textDecoration: "none" }}>prince-ui</Link>
        <div style={{ margin: "1rem 0" }}><ThemeSwitcher /></div>
        {navTree.map((group) => (
          <div key={group.title} style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: ".75rem", textTransform: "uppercase", color: "var(--prn-label-2)" }}>{group.title}</div>
            {group.items.map((it) => (
              <div key={it.path}><Link to={it.path} style={{ color: "var(--prn-label)", textDecoration: "none" }}>{it.title}</Link></div>
            ))}
          </div>
        ))}
      </nav>
      <main className="docs-main"><Outlet /></main>
      <aside className="docs-toc" id="on-this-page" />
    </div>
  );
}
```

- [ ] **Step 5: `content/index.mdx`** — Landing-Platzhalter (echte Landing in Phase 6)

```mdx
# prince-ui

Das gemeinsame React-Design-System auf Basis von React Aria.
```

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src apps/docs/content/index.mdx
git commit -m "feat(docs): app shell, theme switcher, i18n, layout"
```

### Task 1.3: Routen- & Nav-Generierung aus `content/`

**Files:**
- Create: `apps/docs/src/routes.tsx`
- Test: `apps/docs/src/routes.test.ts`

- [ ] **Step 1: Failing test schreiben** — `buildNav` gruppiert Glob-Pfade in Foundations/Components

`apps/docs/src/routes.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildNav } from "./routes";

describe("buildNav", () => {
  it("derives path and title from content file path", () => {
    const nav = buildNav({
      "/content/components/Button.mdx": {},
      "/content/foundations/colors.mdx": {},
    });
    const components = nav.find((g) => g.title === "Components");
    expect(components?.items).toContainEqual({ path: "/components/button", title: "Button" });
    const foundations = nav.find((g) => g.title === "Foundations");
    expect(foundations?.items).toContainEqual({ path: "/foundations/colors", title: "colors" });
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `pnpm --filter @conuti-das/prince-ui-docs exec vitest run src/routes.test.ts`
Expected: FAIL ("buildNav is not a function").

- [ ] **Step 3: `routes.tsx` implementieren** — `import.meta.glob` über `content/**/*.mdx`, `buildNav` rein/pure für Test

```tsx
import type { RouteObject } from "react-router-dom";

type NavGroup = { title: string; items: { path: string; title: string }[] };
const GROUP_LABEL: Record<string, string> = { components: "Components", foundations: "Foundations" };

export function buildNav(modules: Record<string, unknown>): NavGroup[] {
  const groups = new Map<string, NavGroup>();
  for (const file of Object.keys(modules)) {
    const m = file.match(/\/content\/(components|foundations)\/(.+)\.mdx$/);
    if (!m) continue;
    const [, dir, name] = m;
    const path = `/${dir}/${name.toLowerCase()}`;
    const group = groups.get(dir) ?? { title: GROUP_LABEL[dir], items: [] };
    group.items.push({ path, title: name });
    groups.set(dir, group);
  }
  return [...groups.values()].map((g) => ({ ...g, items: g.items.sort((a, b) => a.title.localeCompare(b.title)) }));
}

const eager = import.meta.glob("../content/**/*.mdx", { eager: true }) as Record<string, { default: React.ComponentType }>;
export const navTree = buildNav(eager);
export const routeObjects: RouteObject[] = Object.entries(eager).map(([file, mod]) => {
  const m = file.match(/\/content\/(.+)\.mdx$/)!;
  const slug = m[1] === "index" ? "/" : `/${m[1].toLowerCase()}`;
  const Comp = mod.default;
  return { path: slug, element: <Comp /> };
});
```

- [ ] **Step 4: Run test, verify pass**

Run: `pnpm --filter @conuti-das/prince-ui-docs exec vitest run src/routes.test.ts`
Expected: PASS.

- [ ] **Step 5: Dev-Server-Smoke** — App startet, Landing rendert

Run: `pnpm --filter @conuti-das/prince-ui-docs dev` (kurz, dann stoppen) — alternativ in der Umsetzung über preview-Tools verifizieren.
Expected: `/` zeigt „prince-ui"-Landing ohne Konsole-Fehler.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/routes.tsx apps/docs/src/routes.test.ts
git commit -m "feat(docs): content-driven routing and nav"
```

---

## Phase 2 — Props-Extraktion & `<PropsTable>`

### Task 2.1: Build-Zeit-Props-Extraktion (react-docgen-typescript)

**Files:**
- Create: `apps/docs/scripts/extract-props.ts`
- Create: `apps/docs/public/props.json` (generiert; leeres `{}` committen)

- [ ] **Step 1: `extract-props.ts`** — gleiche Engine + propFilter wie `.storybook/main.ts`

```ts
import { withCustomConfig } from "react-docgen-typescript";
import { writeFileSync, mkdirSync } from "node:fs";
import { globSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../../..");

const parser = withCustomConfig(resolve(root, "tsconfig.base.json"), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
});

// Alle exportierten Komponenten der Pakete scannen.
const files = [
  ...globSync(resolve(root, "packages/ui/src/**/*.{ts,tsx}")),
  ...globSync(resolve(root, "packages/{bpmn,dmn,forms,bo4e}/src/**/*.{ts,tsx}")),
].filter((f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"));

const out: Record<string, { props: { name: string; type: string; required: boolean; defaultValue: string | null; description: string }[] }> = {};
for (const file of files) {
  for (const c of parser.parse(file)) {
    out[c.displayName] = {
      props: Object.values(c.props).map((p) => ({
        name: p.name,
        type: p.type.name,
        required: p.required,
        defaultValue: p.defaultValue?.value ?? null,
        description: p.description,
      })),
    };
  }
}

mkdirSync(resolve(here, "../public"), { recursive: true });
writeFileSync(resolve(here, "../public/props.json"), JSON.stringify(out, null, 2));
console.log(`extract-props: ${Object.keys(out).length} Komponenten → public/props.json`);
```

- [ ] **Step 2: Lauf testen**

Run: `pnpm --filter @conuti-das/prince-ui-docs extract-props`
Expected: `public/props.json` entsteht, Log nennt > 30 Komponenten, enthält `Button` mit `variant`.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/scripts/extract-props.ts apps/docs/public/props.json
git commit -m "feat(docs): build-time props extraction via react-docgen-typescript"
```

### Task 2.2: `<PropsTable>`-MDX-Komponente

**Files:**
- Create: `apps/docs/src/mdx/PropsTable.tsx`
- Create: `apps/docs/src/mdx/props-data.ts`
- Test: `apps/docs/src/mdx/props-data.test.ts`

- [ ] **Step 1: Failing test** — `selectProps` zieht die Props einer Komponente raus

`props-data.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { selectProps } from "./props-data";

const DATA = { Button: { props: [{ name: "variant", type: '"filled" | "tinted"', required: false, defaultValue: "filled", description: "" }] } };

describe("selectProps", () => {
  it("returns the props array for a known component", () => {
    expect(selectProps(DATA, "Button")[0].name).toBe("variant");
  });
  it("returns empty for unknown component", () => {
    expect(selectProps(DATA, "Nope")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run, verify fail** — `pnpm --filter @conuti-das/prince-ui-docs exec vitest run src/mdx/props-data.test.ts` → FAIL.

- [ ] **Step 3: `props-data.ts`**

```ts
export type PropEntry = { name: string; type: string; required: boolean; defaultValue: string | null; description: string };
export type PropsData = Record<string, { props: PropEntry[] }>;
export function selectProps(data: PropsData, name: string): PropEntry[] {
  return data[name]?.props ?? [];
}
```

- [ ] **Step 4: `PropsTable.tsx`** — lädt `props.json` (Fetch von `${BASE_URL}props.json`), rendert Tabelle

```tsx
import { useEffect, useState } from "react";
import { selectProps, type PropsData } from "./props-data";

export function PropsTable({ name }: { name: string }) {
  const [data, setData] = useState<PropsData | null>(null);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}props.json`).then((r) => r.json()).then(setData); }, []);
  if (!data) return null;
  const props = selectProps(data, name);
  if (props.length === 0) return <p><em>Keine Props dokumentiert.</em></p>;
  return (
    <table className="docs-props-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th></tr></thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            <td><code>{p.name}</code>{p.required && <span aria-label="erforderlich"> *</span>}<br /><small>{p.description}</small></td>
            <td><code>{p.type}</code></td>
            <td>{p.defaultValue ? <code>{p.defaultValue}</code> : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 5: Run, verify pass** — vitest grün.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/mdx/PropsTable.tsx apps/docs/src/mdx/props-data.ts apps/docs/src/mdx/props-data.test.ts
git commit -m "feat(docs): PropsTable MDX component"
```

---

## Phase 3 — Inline-Playground (Herzstück)

### Task 3.1: Control-Schema-Typ + Code-Generator (mit Unit-Tests)

**Files:**
- Create: `apps/docs/src/playground/schema.ts`
- Create: `apps/docs/src/playground/codegen.ts`
- Test: `apps/docs/src/playground/codegen.test.ts`

- [ ] **Step 1: `schema.ts`** — Control-Schema-Typ (Grundlage für seed + Playground)

```ts
export type Control =
  | { name: string; type: "text"; default: string }
  | { name: string; type: "toggle"; default: boolean }
  | { name: string; type: "number"; default: number }
  | { name: string; type: "select" | "segmented"; options: string[]; default: string };

export type ControlSchema = {
  /** Import-Name + JSX-Tag der Komponente, z. B. "Button". */
  component: string;
  /** Prop, das als Kind gerendert wird (z. B. children-Text). Optional. */
  childrenProp?: string;
  controls: Control[];
};

export type ControlState = Record<string, string | boolean | number>;

export function initialState(schema: ControlSchema): ControlState {
  return Object.fromEntries(schema.controls.map((c) => [c.name, c.default]));
}
```

- [ ] **Step 2: Failing test** — `generateCode` baut import + JSX, lässt Defaults/children korrekt weg/rein

`codegen.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { generateCode } from "./codegen";
import type { ControlSchema } from "./schema";

const schema: ControlSchema = {
  component: "Button",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Button" },
    { name: "variant", type: "segmented", options: ["filled", "tinted", "plain"], default: "filled" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};

describe("generateCode", () => {
  it("renders import and JSX with non-default props and children", () => {
    const code = generateCode(schema, { children: "Speichern", variant: "tinted", isDisabled: true });
    expect(code).toContain(`import { Button } from '@conuti-das/prince-ui';`);
    expect(code).toContain(`<Button variant="tinted" isDisabled>Speichern</Button>`);
  });
  it("omits props equal to their default and self-closes without children", () => {
    const code = generateCode(schema, { children: "", variant: "filled", isDisabled: false });
    expect(code).toContain(`<Button />`);
  });
});
```

- [ ] **Step 3: Run, verify fail** — vitest → FAIL ("generateCode is not a function").

- [ ] **Step 4: `codegen.ts` implementieren**

```ts
import type { ControlSchema, ControlState } from "./schema";

function attr(name: string, value: string | boolean | number): string | null {
  if (value === false) return null;
  if (value === true) return name;
  if (typeof value === "number") return `${name}={${value}}`;
  return `${name}=${JSON.stringify(value)}`;
}

export function generateCode(schema: ControlSchema, state: ControlState): string {
  const defaults = Object.fromEntries(schema.controls.map((c) => [c.name, c.default]));
  const children = schema.childrenProp ? String(state[schema.childrenProp] ?? "") : "";
  const attrs = schema.controls
    .filter((c) => c.name !== schema.childrenProp)
    .filter((c) => state[c.name] !== defaults[c.name])
    .map((c) => attr(c.name, state[c.name]))
    .filter(Boolean)
    .join(" ");
  const open = `<${schema.component}${attrs ? " " + attrs : ""}`;
  const jsx = children ? `${open}>${children}</${schema.component}>` : `${open} />`;
  return `import { ${schema.component} } from '@conuti-das/prince-ui';\n\n${jsx}`;
}
```

- [ ] **Step 5: Run, verify pass** — vitest grün.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/playground/schema.ts apps/docs/src/playground/codegen.ts apps/docs/src/playground/codegen.test.ts
git commit -m "feat(docs): playground control schema + code generator"
```

### Task 3.2: Komponenten-Registry + `<Playground>`-Komponente

**Files:**
- Create: `apps/docs/src/playground/registry.ts`
- Create: `apps/docs/src/playground/Controls.tsx`
- Create: `apps/docs/src/playground/Playground.tsx`
- Create: `apps/docs/src/playground/playground.css`

- [ ] **Step 1: `registry.ts`** — mappt Schema-`component`-String auf die echte React-Komponente

```ts
import type { ComponentType } from "react";
import * as ui from "@conuti-das/prince-ui";

// Registry für Live-Render im Playground. Heavy-Pakete werden in deren Seiten
// per lazy-Import ergänzt (Phase 5), Core kommt direkt aus prince-ui.
export const registry: Record<string, ComponentType<Record<string, unknown>>> =
  ui as unknown as Record<string, ComponentType<Record<string, unknown>>>;

export function resolveComponent(name: string): ComponentType<Record<string, unknown>> {
  const C = registry[name];
  if (!C) throw new Error(`Playground: Komponente "${name}" nicht in der Registry`);
  return C;
}
```

- [ ] **Step 2: `Controls.tsx`** — rendert je Control-Typ ein Eingabeelement

```tsx
import type { Control, ControlState } from "./schema";

export function Controls({ controls, state, onChange }: {
  controls: Control[]; state: ControlState; onChange: (name: string, value: string | boolean | number) => void;
}) {
  return (
    <div className="pg-controls">
      {controls.map((c) => (
        <label key={c.name} className="pg-control">
          <span className="pg-control-name">{c.name}</span>
          {c.type === "text" && <input value={String(state[c.name] ?? "")} onChange={(e) => onChange(c.name, e.target.value)} />}
          {c.type === "toggle" && <input type="checkbox" checked={Boolean(state[c.name])} onChange={(e) => onChange(c.name, e.target.checked)} />}
          {c.type === "number" && <input type="number" value={Number(state[c.name] ?? 0)} onChange={(e) => onChange(c.name, Number(e.target.value))} />}
          {(c.type === "select" || c.type === "segmented") && (
            <select value={String(state[c.name])} onChange={(e) => onChange(c.name, e.target.value)}>
              {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </label>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: `Playground.tsx`** — Schema lazy laden, State halten, links Live-Render, rechts Controls, darunter Code + Copy

```tsx
import { useMemo, useState } from "react";
import { resolveComponent } from "./registry";
import { Controls } from "./Controls";
import { generateCode } from "./codegen";
import { initialState, type ControlSchema, type ControlState } from "./schema";
import "./playground.css";

// Control-Schemata eager laden (klein, JSON-artig).
const schemas = import.meta.glob("../../content/schemas/*.controls.ts", { eager: true }) as Record<string, { default: ControlSchema }>;
function schemaFor(component: string): ControlSchema | null {
  const hit = Object.entries(schemas).find(([f]) => f.endsWith(`/${component}.controls.ts`));
  return hit ? hit[1].default : null;
}

export function Playground({ component }: { component: string }) {
  const schema = schemaFor(component);
  if (!schema) return <p><em>Kein Playground-Schema für {component}.</em></p>;
  const Comp = resolveComponent(schema.component);
  const [state, setState] = useState<ControlState>(() => initialState(schema));
  const code = useMemo(() => generateCode(schema, state), [schema, state]);
  const childrenProp = schema.childrenProp;
  const props = useMemo(() => {
    const p = { ...state };
    if (childrenProp) delete p[childrenProp];
    return p;
  }, [state, childrenProp]);
  const children = childrenProp ? String(state[childrenProp] ?? "") : undefined;

  return (
    <div className="pg">
      <div className="pg-stage"><Comp {...props}>{children}</Comp></div>
      <Controls controls={schema.controls} state={state} onChange={(n, v) => setState((s) => ({ ...s, [n]: v }))} />
      <div className="pg-code">
        <button className="pg-copy" onClick={() => navigator.clipboard.writeText(code)}>Copy</button>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `playground.css`** — Layout links Stage / rechts Controls / unten Code (mirror Screenshot), prince-ui-Tokens

```css
.pg { display: grid; grid-template-columns: 1fr 240px; gap: 1rem; background: var(--prn-bg-2, #1e252b); border: 1px solid var(--prn-separator); border-radius: 12px; padding: 1.25rem; }
.pg-stage { display: flex; align-items: center; justify-content: center; min-height: 200px; }
.pg-controls { display: flex; flex-direction: column; gap: .75rem; }
.pg-control { display: flex; flex-direction: column; gap: .25rem; font-size: .8rem; }
.pg-control-name { color: var(--prn-label-2); }
.pg-code { grid-column: 1 / -1; position: relative; }
.pg-code pre { background: var(--prn-bg, #11161b); border-radius: 8px; padding: 1rem; overflow: auto; }
.pg-copy { position: absolute; top: .5rem; right: .5rem; }
```

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/playground
git commit -m "feat(docs): inline Playground (live render + control panel + code)"
```

---

## Phase 4 — `<Example>` (react-live) & MDX-Komponenten-Mapping

### Task 4.1: `<Example>` + `<DoDont>` + `<Anatomy>` + Mapping

**Files:**
- Create: `apps/docs/src/mdx/Example.tsx`
- Create: `apps/docs/src/mdx/Callouts.tsx`
- Create: `apps/docs/src/mdx/components.tsx`

- [ ] **Step 1: `Example.tsx`** — react-live Preview + editierbarer Code, Scope = prince-ui

```tsx
import { LiveProvider, LivePreview, LiveEditor, LiveError } from "react-live";
import * as ui from "@conuti-das/prince-ui";

export function Example({ code }: { code: string }) {
  return (
    <LiveProvider code={code.trim()} scope={{ ...ui }} noInline={false}>
      <div className="docs-example">
        <div className="docs-example-preview"><LivePreview /></div>
        <LiveEditor className="docs-example-code" />
        <LiveError className="docs-example-error" />
      </div>
    </LiveProvider>
  );
}
```

- [ ] **Step 2: `Callouts.tsx`** — `<DoDont>` und `<Anatomy>` Bausteine

```tsx
import type { ReactNode } from "react";

export function DoDont({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  return (
    <div className={`docs-dodont docs-dodont-${kind}`} role="note">
      <strong>{kind === "do" ? "✓ Do" : "✗ Don't"}</strong>
      <div>{children}</div>
    </div>
  );
}

export function Anatomy({ children }: { children: ReactNode }) {
  return <figure className="docs-anatomy">{children}</figure>;
}
```

- [ ] **Step 3: `components.tsx`** — globales MDX-Komponenten-Mapping (Playground/PropsTable/Example/Callouts + Heading-Anchors)

```tsx
import type { MDXComponents } from "mdx/types";
import { Playground } from "../playground/Playground";
import { PropsTable } from "./PropsTable";
import { Example } from "./Example";
import { DoDont, Anatomy } from "./Callouts";

export const mdxComponents: MDXComponents = {
  Playground, PropsTable, Example, DoDont, Anatomy,
};
```

- [ ] **Step 4: Example-CSS an `theme.css` anhängen** (preview/edit/error)

```css
.docs-example { border: 1px solid var(--prn-separator); border-radius: 12px; overflow: hidden; margin: 1.5rem 0; }
.docs-example-preview { padding: 1.5rem; }
.docs-example-code { font-family: var(--prn-font-mono, ui-monospace); font-size: .85rem; }
.docs-dodont { border-left: 3px solid; padding: .75rem 1rem; margin: 1rem 0; }
.docs-dodont-do { border-color: var(--prn-positive, #2e7d32); }
.docs-dodont-dont { border-color: var(--prn-negative, #c62828); }
```

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/mdx apps/docs/src/chrome/theme.css
git commit -m "feat(docs): Example (react-live), Do/Dont, Anatomy + MDX mapping"
```

---

## Phase 5 — Referenzseite (Button) end-to-end + „On this page"-TOC

### Task 5.1: Auto-TOC aus den Überschriften

**Files:**
- Create: `apps/docs/src/chrome/OnThisPage.tsx`
- Modify: `apps/docs/src/chrome/AppLayout.tsx` (TOC einhängen)

- [ ] **Step 1: `OnThisPage.tsx`** — liest `h2/h3` aus `.docs-main` nach Mount, rendert Anchor-Liste

```tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function OnThisPage() {
  const loc = useLocation();
  const [items, setItems] = useState<{ id: string; text: string; level: number }[]>([]);
  useEffect(() => {
    const hs = Array.from(document.querySelectorAll(".docs-main h2, .docs-main h3"));
    setItems(hs.filter((h) => h.id).map((h) => ({ id: h.id, text: h.textContent ?? "", level: h.tagName === "H3" ? 3 : 2 })));
  }, [loc.pathname]);
  if (items.length === 0) return null;
  return (
    <nav aria-label="On this page">
      <div style={{ color: "var(--prn-label-2)", fontWeight: 600 }}>On this page</div>
      {items.map((i) => <div key={i.id} style={{ paddingLeft: (i.level - 2) * 12 }}><a href={`#${i.id}`}>{i.text}</a></div>)}
    </nav>
  );
}
```

- [ ] **Step 2: TOC in `AppLayout` einhängen** — ersetze leeres `<aside>` durch `<aside className="docs-toc"><OnThisPage /></aside>`

```tsx
// import { OnThisPage } from "./OnThisPage";
// ...
<aside className="docs-toc"><OnThisPage /></aside>
```

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/chrome/OnThisPage.tsx apps/docs/src/chrome/AppLayout.tsx
git commit -m "feat(docs): On-this-page TOC from headings"
```

### Task 5.2: Button-Control-Schema + Komponentenseite (das Template)

**Files:**
- Create: `apps/docs/content/schemas/Button.controls.ts`
- Create: `apps/docs/content/components/Button.mdx`

- [ ] **Step 1: `Button.controls.ts`** (seed entspricht `stories/components/Button.stories.tsx` argTypes)

```ts
import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Button",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Button" },
    { name: "variant", type: "segmented", options: ["filled", "tinted", "plain"], default: "filled" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
```

- [ ] **Step 2: `Button.mdx`** — die kanonische Seitenstruktur (Vorlage für alle Komponenten)

```mdx
# Button

Buttons lösen Aktionen aus — von primären Bestätigungen bis zu schlichten Inline-Aktionen.

<Playground component="Button" />

## Verwendung

Nutze **filled** für die primäre Aktion einer Ansicht, **tinted** für sekundäre und **plain** für tertiäre/Inline-Aktionen.

<DoDont kind="do">Pro Ansicht genau eine `filled`-Primäraktion.</DoDont>
<DoDont kind="dont">Mehrere `filled`-Buttons nebeneinander um Aufmerksamkeit konkurrieren lassen.</DoDont>

## Beispiele

<Example code={`<div style={{ display: 'flex', gap: 16 }}>
  <Button variant="filled">Gefüllt</Button>
  <Button variant="tinted">Getönt</Button>
  <Button variant="plain">Schlicht</Button>
</div>`} />

## Accessibility

Button basiert auf react-aria `Button`: Fokus-Ring, Tastatur (Enter/Space) und `isDisabled` sind eingebaut. Für reine Icon-Buttons ein `aria-label` setzen.

## Props

<PropsTable name="Button" />
```

- [ ] **Step 3: Verifizieren (preview-Tools)** — Seite `/components/button` lädt, Playground reagiert (Variant umschalten ändert Vorschau + Code), Copy funktioniert, PropsTable zeigt `variant`, TOC listet „Verwendung/Beispiele/Accessibility/Props".

Run: Dev-Server starten, `preview_start`, zu `/components/button` navigieren, `preview_snapshot` + Interaktion mit dem Variant-Control.
Expected: Live-Render wechselt, Code-Snippet zeigt `variant="tinted"`, keine Konsolenfehler.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/content/schemas/Button.controls.ts apps/docs/content/components/Button.mdx
git commit -m "feat(docs): Button reference page (canonical template)"
```

---

## Phase 6 — Content-Migration (fan-out auf Agent-Teams)

> **Template-Task — wird je Komponente einmal ausgeführt.** Die ~70 Komponenten aus
> `stories/components/*.stories.tsx` werden auf Doku-Seiten übertragen. Diese Tasks sind
> **unabhängig** und damit ideal für parallele Agents (ein Agent pro Paket-Batch).
> Foundations-Seiten (`tokens`, `colors`, `typography`, `theming`, `icons`) analog aus
> `stories/Tokens.stories.tsx` + tokens.css.

### Task 6.N: Seite für `<Component>` erstellen

**Files (pro Komponente `X`):**
- Create: `apps/docs/content/schemas/X.controls.ts`
- Create: `apps/docs/content/components/X.mdx`
- Quelle: `stories/components/X.stories.tsx` (argTypes → controls, render-Stories → `<Example>`)

- [ ] **Step 1: Control-Schema aus den `argTypes` der Story ableiten** — Mapping-Regeln:
  - `control: "boolean"` → `{ type: "toggle" }`
  - `control: "text"` → `{ type: "text" }`
  - `control: "number"` → `{ type: "number" }`
  - `control: { type: "inline-radio" | "radio" } / options` → `{ type: "segmented", options }`
  - `control: "select"` / `options` → `{ type: "select", options }`
  - Defaults aus `args`. `children`-Text → `childrenProp: "children"`.

- [ ] **Step 2: `X.mdx` nach der Button-Vorlage** mit Abschnitten: Titel + 1 Satz → `<Playground component="X" />` → `## Verwendung` (+ `<DoDont>`) → `## Beispiele` (curated `<Example>` aus den `render`-Stories) → `## Accessibility` → `## Props` (`<PropsTable name="X" />`).

- [ ] **Step 3: Verifizieren** — `/components/x` lädt, Playground + PropsTable + Beispiele rendern fehlerfrei (preview-Snapshot).

- [ ] **Step 4: Commit** — `git commit -m "docs(content): X component page"`

**Batch-Aufteilung für Agent-Teams (je Agent ein unabhängiger Stapel):**
- Batch A — Forms: Button, TextField, NumberField, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, ComboBox, Select, SearchField, Form, FileTrigger, DropZone
- Batch B — Date/Color: DateField, TimeField, DatePicker, DateRangePicker, Calendar, RangeCalendar, ColorField, ColorArea, ColorSlider, ColorWheel, ColorPicker, ColorSwatch, ColorSwatchPicker
- Batch C — Collections/Nav: Menu, ListBox, GridList, List, Table, Tree, Tabs, Toolbar, Breadcrumbs, Disclosure, TagGroup, SegmentedControl
- Batch D — Overlays/Status: Modal, Popover, Tooltip, Toast, Notice, ProgressBar, Meter, Badge, Link, Separator, Group, Glass, EmptyState
- Batch E — Charts/Data: BarChart, AreaChart, DonutChart, Sparkline, KpiCard, Amount, AnalyticalTable, FilterBar, ObjectPage, Card
- Batch F — Composites/Shell: AppShell, Sidebar, Launchpad, Breadcrumbs (Shell)
- Batch G — Foundations: tokens, colors, typography, theming, icons (+ Landing `index.mdx` final)

*(Heavy-Komponenten Bo4eCDocView, BpmnViewer, BpmnEditor, DmnExpertEditor, DmnTableEditor, FormBuilder, FormRenderer → Phase 7, nicht in den Batches.)*

---

## Phase 7 — Schwer-Komponenten (Editoren)

### Task 7.1: Lazy-Registry + Seiten für bpmn/dmn/forms/bo4e

**Files:**
- Create: `apps/docs/src/playground/heavy-registry.ts`
- Create: `apps/docs/content/components/{BpmnViewer,BpmnEditor,DmnExpertEditor,DmnTableEditor,FormBuilder,FormRenderer,Bo4eCDocView}.mdx`

- [ ] **Step 1: CSS-Assets der Editoren global importieren** (in `main.tsx`, analog `.storybook/preview-head.html`) — dmn-js/bpmn-js/form-js Stylesheets.

```tsx
// in main.tsx ergänzen (Pfade gemäß den jeweiligen Paketen verifizieren):
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
```

- [ ] **Step 2: Editoren-Seiten** — kein Playground-Control-Schema (zu komplex); stattdessen `<Example>` mit Demo-XML aus den Stories (`stories/components/BpmnViewer.stories.tsx` etc.) und Prosa + `<PropsTable>`.

- [ ] **Step 3: Verifizieren — kritisch** — jede Editor-Seite mounten; bpmn-Canvas zeigt Diagramm, form-js-Editor mountet eine **nicht-leere** `.fjs-container` (Preact-Dedupe greift), dmn-Editor lädt. Konsole fehlerfrei.

Run: Dev-Server, preview zu jeder Editor-Seite, `preview_snapshot` + `preview_console_logs`.
Expected: Diagramme/Editoren sichtbar, keine „React is not defined"/leere-Container-Fehler.

- [ ] **Step 4: Commit** — `git commit -m "feat(docs): heavy editor pages (bpmn/dmn/forms/bo4e)"`

---

## Phase 8 — Suche, a11y-CI, Deploy, Storybook-Abschaltung

### Task 8.1: Pagefind-Suche im Chrome

**Files:**
- Create: `apps/docs/src/chrome/Search.tsx`
- Modify: `apps/docs/src/chrome/AppLayout.tsx`

- [ ] **Step 1: `Search.tsx`** — lädt Pagefind-Bundle (`${BASE_URL}pagefind/pagefind.js`) dynamisch, Eingabe → Treffer-Liste mit Links. (Pagefind-Index entsteht im `build`-Script.)
- [ ] **Step 2: In Sidebar oben einhängen.**
- [ ] **Step 3: Verifizieren** — nach `pnpm --filter @conuti-das/prince-ui-docs build` + `preview`: Suche „Button" liefert Treffer.
- [ ] **Step 4: Commit** — `git commit -m "feat(docs): Pagefind search"`

### Task 8.2: Playwright + axe Smoke/A11y über alle Seiten

**Files:**
- Create: `apps/docs/playwright.config.ts`
- Create: `apps/docs/tests/a11y.spec.ts`

- [ ] **Step 1: `playwright.config.ts`** — startet `vite preview` als webServer, baseURL `http://localhost:4173`.
- [ ] **Step 2: `a11y.spec.ts`** — iteriert über `navTree`-Pfade: jede Seite lädt ohne Konsolenfehler **und** axe findet keine `serious/critical`-Verstöße.

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { navTree } from "../src/routes";

const paths = ["/", ...navTree.flatMap((g) => g.items.map((i) => i.path))];
for (const path of paths) {
  test(`a11y+smoke ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
```

- [ ] **Step 3: Lokal laufen lassen** — `pnpm --filter @conuti-das/prince-ui-docs build && pnpm --filter @conuti-das/prince-ui-docs exec playwright test`. Verstöße fixen, bis grün.
- [ ] **Step 4: Commit** — `git commit -m "test(docs): playwright+axe smoke over all pages"`

### Task 8.3: Deploy-Workflow ersetzen + Storybook entfernen

**Files:**
- Create: `.github/workflows/deploy-docs.yml`
- Delete: `.github/workflows/deploy-storybook.yml`, `.storybook/`, `stories/`
- Modify: root `package.json` (Storybook-Scripts/-deps raus, `storybook-static/` aus Repo)

- [ ] **Step 1: `deploy-docs.yml`** — analog `deploy-storybook.yml`, aber baut `apps/docs` mit `DOCS_BASE_PATH=/prince-ui/`, lädt `apps/docs/dist` als Pages-Artefakt.

```yaml
name: Deploy Docs to GitHub Pages
on: { push: { branches: [main] }, workflow_dispatch: {} }
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: false }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm -r --filter "./packages/*" build
      - run: pnpm --filter @conuti-das/prince-ui-docs build
        env: { DOCS_BASE_PATH: /prince-ui/ }
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: apps/docs/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Storybook entfernen** — `git rm -r .storybook stories storybook-static .github/workflows/deploy-storybook.yml`; aus root `package.json` die `storybook`/`build-storybook`-Scripts und `@storybook/*`-devDeps löschen; `pnpm install`.
- [ ] **Step 3: Verifizieren** — `pnpm install` sauber, `pnpm --filter @conuti-das/prince-ui-docs build` grün, kein verwaister Storybook-Import.
- [ ] **Step 4: Commit** — `git commit -m "feat(docs): replace storybook deploy, remove storybook"`

---

## Phase 9 — End-to-End-Verifikation & Go-Live

### Task 9.1: Volllauf + PR

- [ ] **Step 1:** `pnpm -r --filter "./packages/*" build` grün.
- [ ] **Step 2:** `pnpm --filter @conuti-das/prince-ui-docs typecheck` grün.
- [ ] **Step 3:** `pnpm --filter @conuti-das/prince-ui-docs build` (inkl. extract-props + pagefind) grün.
- [ ] **Step 4:** `pnpm --filter @conuti-das/prince-ui-docs exec playwright test` — alle Seiten grün (a11y + smoke).
- [ ] **Step 5:** Visuelle Stichprobe via preview-Tools in allen vier Themes (system/dark/light/cu).
- [ ] **Step 6:** PR `feat/docs-site` → `main` öffnen; nach Merge greift `deploy-docs.yml` und die Site geht auf `conuti-das.github.io/prince-ui/` live.

---

## Self-Review-Notizen (Plan ↔ Spec)

- **Spec §Inline-Playground** → Phase 3 (codegen + Playground). ✓
- **Spec §Props-Tabelle** → Phase 2. ✓
- **Spec §Live-Beispiele (react-live)** → Phase 4. ✓
- **Spec §Optik/Theme/i18n/Chrome** → Phase 1 (theme.css, ThemeSwitcher, I18nProvider). ✓
- **Spec §Schwer-Komponenten** → Phase 7 (+ Vite-Dedupe in Phase 1). ✓
- **Spec §Suche (Pagefind)** → Phase 8.1. ✓
- **Spec §Storybook-Abschaltung & a11y** → Phase 8.2/8.3. ✓
- **Spec §Deploy/Go-Live** → Phase 8.3 + Phase 9. ✓
- **Spec §Content „voll wie Spectrum" für alle** → Phase 6 (fan-out). ✓
- **Spec §Foundations** → Phase 6 Batch G. ✓
