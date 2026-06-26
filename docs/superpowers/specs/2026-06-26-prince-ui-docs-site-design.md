# Prince-UI Doku-Site — Design (Storybook-Ablösung)

> Status: abgenommen (2026-06-26). Ersetzt mittelfristig Storybook durch eine eigene,
> content-first Doku-Website im prince-ui-Look, vorbildhaft an react-spectrum.adobe.com,
> aber optisch und technisch auf prince-ui zugeschnitten.

## Ziel & Kontext

prince-ui wird heute über **Storybook 8** (react-vite) dokumentiert (74 Stories, deployed als
GitHub Pages unter `conuti-das.github.io/prince-ui/`). Gewünscht ist die **Doku-Erfahrung** von
react-spectrum.adobe.com — content-first Leseseiten, ein **interaktiver Inline-Playground**
(Regler → Live-Render **und** mitgenerierter Code-Snippet), Live-Beispiele, Props-Tabellen,
rechtes „On this page"-TOC — in **prince-ui-Optik**. Zielgruppe: **Entwickler und Öffentlichkeit
gleichwertig**. Inhaltstiefe: **voll wie Spectrum** (Intro, Guidelines, Do/Don't, Anatomie,
A11y-Hinweise, mehrere Beispiele je Komponente).

Entscheidung (Ansatz C): **Storybook wird abgelöst.** Die neue Site muss volle Storybook-Parität
erreichen — inkl. der editor-schweren Komponenten (BPMN-Viewer/-Editor, DMN-Experten-Editor,
form-js) und eines Ersatzes für Controls (→ Playground) und das a11y-Addon (→ axe im CI).

**Stack: Vite + React + MDX (custom).** Begründung: Reuse der bewährten Storybook-Vite-Config
(Preact-Dedupe, `jsx: automatic`, dmn-js/bpmn-js-Assets) → die Schwer-Editoren laufen client-seitig
sofort, kein SSR-Kampf (anders als Nextra/Next), volle Optik-Kontrolle, React-Live-Beispiele und
Playground trivial. Preis: Doku-Chrome (Nav/TOC/Suche) selbst gebaut — bounded.

## Repo-Layout

Neue App im Monorepo: **`apps/docs`** (eigenes Workspace-Paket). `pnpm-workspace.yaml` um
`- "apps/*"` erweitern.

```
apps/docs/
  package.json            # @conuti-das/prince-ui-docs (private), deps: prince-ui, -tokens, bpmn/dmn/forms
  vite.config.ts          # 1:1-Port der .storybook/viteFinal: Preact-dedupe, jsx automatic, base /prince-ui/
  index.html
  src/
    main.tsx              # React-Router + I18nProvider(de-DE) + Theme-Decorator
    chrome/               # AppLayout, SidebarNav, OnThisPageToc, ThemeSwitcher, Search
    mdx/                  # MDX-Komponenten: Playground, Example, PropsTable, DoDont, Anatomy, ApiBlock
    playground/           # Playground-Engine + Control-Renderer + Code-Generator
    content-index.ts      # generierte Routen-/Nav-Tabelle aus content/
  content/
    index.mdx             # Landing
    foundations/          # tokens.mdx, colors.mdx, typography.mdx, theming.mdx, icons.mdx
    components/           # eine .mdx je Komponente (~70)
    schemas/              # <Name>.controls.ts — Control-Schema je Komponente (seed aus argTypes)
  scripts/
    extract-props.ts      # react-docgen-typescript → public/props.json (Build-Zeit)
    seed-from-stories.ts  # einmalige Migration: argTypes/render-Stories → controls + Beispiele
  public/
    props.json            # generiert
```

## Seiten-Anatomie (pro Komponentenseite)

Reihenfolge mirror't react-spectrum (Screenshot Badge):

1. **Titel + ein Satz Beschreibung** (schmale, zentrierte Lesespalte, content-first)
2. **Inline-Playground** (Herzstück, s. u.)
3. **Live-Beispiele** (curated, editierbar)
4. **Guidelines** — Wann benutzen, **Do/Don't**, **Anatomie**, **Accessibility**
5. **API / Anatomie-Kompositionsblock** (`<Badge><Icon/><Text/></Badge>`)
6. **Props-Tabelle** (Name / Type / Default / Beschreibung)
7. Rechts sticky **„On this page"-TOC** (Anchor-Nav), optional **„Copy for LLM"**

## Inline-Playground (Herzstück)

`<Playground component="Button" />`.

- **Control-Schema** je Komponente in `content/schemas/<Name>.controls.ts`: Liste von Controls
  `{ name, type: 'text'|'toggle'|'select'|'segmented'|'number', options?, default }`. Initial
  **generiert aus den vorhandenen Storybook-`argTypes`/`args`** (`seed-from-stories.ts`), danach
  von Hand verfeinerbar.
- **Engine** hält Control-State → rendert (a) die **echte Komponente** live, (b) den
  **mitgenerierten Code-Snippet** (`import { X } from '@conuti-das/prince-ui'` + JSX mit den
  aktiven Props), mit **Copy-Button**. Layout: links Vorschau, rechts Control-Panel, darunter Code
  — exakt der Block aus dem Referenz-Screenshot.

## Props-Tabelle & Live-Beispiele

- **Props:** Build-Zeit-Script `extract-props.ts` nutzt **react-docgen-typescript** (die in
  `.storybook/main.ts` schon konfigurierte Engine, gleicher `propFilter` → nur prince-ui-Props) und
  schreibt `public/props.json`. `<PropsTable name="Button" />` rendert daraus die Tabelle.
- **Beispiele:** `<Example>` zeigt Vorschau + Quelltext; editierbar via **react-live**
  (in-browser, kein Bundler). Curated Beispiele wandern aus den `render`-Stories rüber.

## Optik, Theme, i18n, Chrome

- tokens.css + `data-theme`-Umschaltung (**system / dark / light / cu**) exakt wie heute in
  `.storybook/preview.tsx`; `I18nProvider locale="de-DE"` global → TT.MM.JJJJ etc.
- Das **Doku-Chrome wird mit prince-ui selbst gebaut** (Dogfooding: Sidebar, Button, SearchField,
  Tabs aus `@conuti-das/prince-ui`) → garantiert prince-ui-Optik und nutzt das System produktiv.

## Schwer-Komponenten

BPMN/DMN/forms-Editoren rendern **client-seitig** in MDX. Die Vite-Config wird aus
`.storybook/main.ts` 1:1 portiert (`resolve.dedupe` für preact*, `esbuild.jsx: automatic`,
CSS-Assets von dmn-js/bpmn-js). Kein SSR → keine `dynamic(ssr:false)`-Sonderbehandlung nötig.

## Suche

**Pagefind**: Post-Build-Index über die statische Ausgabe → schnelle clientseitige Volltextsuche
ohne eigenen Server. UI ins prince-ui-Chrome integriert (SearchField).

## Storybook-Abschaltung & a11y-Ersatz

Sobald die Site Parität hat (alle Komponenten als Seite, Editoren rendern):

- `.storybook/` und `stories/` entfernen; `@storybook/*`-devDependencies aus root entfernen.
- `deploy-storybook.yml` → durch `deploy-docs.yml` ersetzt.
- **a11y-Ersatz:** **Playwright + axe-core** als CI-Job, der die gebaute Doku crawlt. Ersetzt das
  a11y-Addon **und** dient als **Smoke-Test**, dass alle Seiten inkl. Schwer-Editoren rendern.

## Deploy & Go-Live

Neue `deploy-docs.yml` baut `apps/docs` (mit `pnpm -r --filter "./packages/*" build` vorab, wie
heute) und veröffentlicht auf **derselben** Pages-URL `conuti-das.github.io/prince-ui/`
(Vite `base: '/prince-ui/'`). Storybook-Workflow im selben PR ersetzt.

## Verifikation vor Live

`pnpm build` + `pnpm typecheck` + **Playwright/axe-Smoke über alle Seiten** (jede Komponentenseite
lädt, Playground reagiert, Editoren mounten) + visuelle Stichprobe via preview-Tools. Erst dann
Merge/Go-Live.

## Scope-Kompromiss (bewusst)

„Voll wie Spectrum" × ~70 Komponenten × „alles gleichzeitig live" ist beim **redaktionellen Text**
nicht in einem Rutsch in Endqualität leistbar. Daher:

- **Sofort & vollständig live:** Gerüst, Inline-Playground, Props-Tabelle, **Intro + Beispiele für
  ALLE** Komponenten, Foundations, Suche, Theme, Deploy, a11y-CI.
- **Seed + iterativ:** tiefe Guideline-Prosa (Do/Don't, Anatomie, A11y-Hinweise) pro Komponente
  wird mit sinnvollem Erst-Inhalt befüllt und danach nachgeschärft.

So ist die Site ab Go-Live vollständig nutzbar, ohne auf 70 ausformulierte Essays zu warten.

## Nicht im Scope (YAGNI)

- Mehrsprachigkeit der Doku-Texte (nur de, UI-Locale de-DE).
- Versionierte Doku / Multi-Version-Switcher.
- „Open in playground" als externe Sandbox (nur Inline-Playground + Copy).
- „Copy for LLM" ist optionales Nice-to-have, kein Blocker fürs Go-Live.

## Migrationsreihenfolge (Umsetzung, parallelisierbar in Agent-Teams)

1. **Fundament**: `apps/docs` scaffolden, Vite-Config-Port, Routing, Chrome, Theme, MDX-Pipeline,
   `extract-props.ts`, **eine** Referenzseite (Button) end-to-end.
2. **Playground-Engine** + `<PropsTable>` + `<Example>` (react-live) als wiederverwendbare Bausteine.
3. **Content-Migration** paketweise (ui → bpmn/dmn/forms/bo4e): je Komponente Seite + Control-Schema
   (seed) + Beispiele. Gut auf parallele Agents aufteilbar.
4. **Schwer-Komponenten** verifizieren (Editoren mounten).
5. **Suche, a11y-CI, Deploy-Workflow, Storybook-Abschaltung**, End-to-End-Verifikation, Go-Live.
