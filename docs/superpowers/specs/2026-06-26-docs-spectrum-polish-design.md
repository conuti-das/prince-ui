# Docs-Site Spectrum-Polish — Design-Spec

> Ziel: Die prince-ui-Doku-Site (`apps/docs`) auf das visuelle Niveau der
> React-Spectrum-Doku heben — eigene Optik (prince-ui-Tokens, Dark-first),
> aber dieselbe Informationsarchitektur und Politur: globaler Header mit
> zentrierter Suche, aufgeräumte Sidebar mit Active-State, polierter
> Playground, saubere Props-Tabelle, Scroll-Spy-TOC, echte Landingpage.
>
> Datum: 2026-06-26 · Branch: feat/docs-site · Status: zur Umsetzung
>
> **Keine urheberrechtlich geschützten Assets.** Visuals sind selbstgezeichnete
> SVGs / CSS-Gradients / prince-ui-Komponenten als Showcase. Adobe-Clean wird
> NICHT nachgebaut; es bleibt bei `--prn-font` (humanist sans) + `--prn-font-mono`.

---

## 0. Arbeitsteilung & Datei-/Klassen-Kontrakt (verbindlich)

Zwei Agents arbeiten parallel. Sie dürfen sich **nicht** in dieselben Dateien
schreiben. Harte Grenze:

### UI-Agent — besitzt ALLES unter `src/` + die beiden CSS-Dateien

Darf anlegen/ändern:
- `apps/docs/src/chrome/theme.css` (Tokens + Header + Sidebar + Prosa-Typo + Props-Tabelle + TOC + Landing-Klassen)
- `apps/docs/src/chrome/AppLayout.tsx` (Grid umbauen: Header-Zeile + 2-Spalten darunter)
- `apps/docs/src/chrome/Header.tsx` (NEU — Topbar)
- `apps/docs/src/chrome/Sidebar.tsx` (NEU — Nav mit Active-State, ausgelagert aus AppLayout)
- `apps/docs/src/chrome/Search.tsx` (Modal/⌘K, Tastatur-Nav)
- `apps/docs/src/chrome/ThemeSwitcher.tsx` (gestyltes Segmented/Select)
- `apps/docs/src/chrome/OnThisPage.tsx` (Scroll-Spy + "Copy for LLM")
- `apps/docs/src/playground/playground.css`
- `apps/docs/src/playground/Controls.tsx` (gestylte Controls: Segmented/Select/Switch/Field)
- `apps/docs/src/playground/Playground.tsx` (Code-Panel mit Copy + Open)
- `apps/docs/src/mdx/PropsTable.tsx` (Klassen-Hooks für Tabelle)
- `apps/docs/src/mdx/Callouts.tsx` (Karten-Optik für DoDont/Anatomy)
- `apps/docs/src/mdx/components.tsx` (ggf. neue HTML-Element-Overrides registrieren — siehe §5)
- `apps/docs/src/mdx/Hero.tsx`, `apps/docs/src/mdx/FeatureCard.tsx`, `apps/docs/src/mdx/ComponentCard.tsx` (NEU — Landing-Bausteine, in `mdxComponents` registrieren)

**Der UI-Agent schreibt KEIN MDX-Inhaltstext** (außer minimale Platzhalter in neuen TSX-Komponenten).

### Content-Agent — besitzt Inhalt + Assets, schreibt KEIN CSS/TSX unter `src/`

Darf anlegen/ändern:
- `apps/docs/content/index.mdx` (Landingpage neu)
- `apps/docs/content/components/*.mdx` (Anreicherung: Komponenten-Seitenkopf, Playground-Einsatz)
- `apps/docs/public/*.svg` (NEU — selbstgezeichnete Hero-/Feature-Visuals)

Der Content-Agent **verwendet ausschließlich die unten in §6 gelisteten
Klassennamen und die vom UI-Agent registrierten MDX-Komponenten**
(`<Hero>`, `<FeatureCard>`, `<ComponentCard>`, `<Playground>`, `<PropsTable>`,
`<Example>`, `<DoDont>`, `<Anatomy>`). Er schreibt kein eigenes `<style>` und
keine Inline-Farben; Layout passiert über die Klassen.

### Geteilte Datei — Konfliktregel

`src/mdx/components.tsx` wird vom UI-Agent geändert (neue Komponenten registrieren).
Der Content-Agent fasst sie NICHT an. Falls der Content-Agent eine Komponente
braucht, die noch nicht registriert ist, ist das ein UI-Agent-Task.

---

## 1. Design-Tokens (theme.css, UI-Agent)

Alle neuen Werte als CSS-Custom-Properties auf `:root` definieren, damit Content
sie nie hartkodieren muss. Vorhandene prince-ui-Tokens (`--prn-*`) werden
wiederverwendet und NUR gefehlt-fallback-gemappt, nie überschrieben.

```css
:root {
  /* Spacing-Skala (4px-Basis) */
  --docs-sp-1: 0.25rem;  /*  4px */
  --docs-sp-2: 0.5rem;   /*  8px */
  --docs-sp-3: 0.75rem;  /* 12px */
  --docs-sp-4: 1rem;     /* 16px */
  --docs-sp-5: 1.5rem;   /* 24px */
  --docs-sp-6: 2rem;     /* 32px */
  --docs-sp-7: 2.5rem;   /* 40px */
  --docs-sp-8: 4rem;     /* 64px */
  --docs-sp-9: 6rem;     /* 96px — Landing-Sektionsrhythmus */

  /* Typo-Skala (Größe / line-height / weight als Trio) */
  --docs-h1-size: 2.75rem;  --docs-h1-lh: 1.1;  --docs-h1-weight: 800;
  --docs-h2-size: 1.75rem;  --docs-h2-lh: 1.2;  --docs-h2-weight: 700;
  --docs-h3-size: 1.25rem;  --docs-h3-lh: 1.3;  --docs-h3-weight: 700;
  --docs-body-size: 1rem;   --docs-body-lh: 1.65;
  --docs-small-size: 0.875rem; --docs-small-lh: 1.5;
  --docs-code-size: 0.85rem; --docs-code-lh: 1.5;
  --docs-kbd-size: 0.8rem;

  /* Rundungen (Radii-Leiter) */
  --docs-radius-chip: 4px;   /* Inline-Code */
  --docs-radius-ctrl: 8px;   /* Controls, Segmented, Buttons */
  --docs-radius-code: 10px;  /* Code-Boxen */
  --docs-radius-card: 16px;  /* Cards, Playground, Hero */
  --docs-radius-pill: 9999px;/* Such-Pille, Switch */

  /* Border / Elevation */
  --docs-border: 1px solid var(--prn-separator);
  --docs-border-strong: 2px solid var(--prn-separator);
  --docs-shadow-card: 0 4px 12px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.18);
  --docs-shadow-pop:  0 10px 40px rgba(0,0,0,.45);

  /* Layout-Maße */
  --docs-header-h: 56px;
  --docs-sidebar-w: 248px;
  --docs-toc-w: 200px;
  --docs-content-max: 50rem;

  /* Semantik-Aliase auf prince-ui-Tokens (mit Fallback, falls Theme fehlt) */
  --docs-fill: var(--prn-fill, rgba(127,127,127,.10));      /* Control-Hintergrund inaktiv */
  --docs-fill-strong: var(--prn-bg-2, rgba(127,127,127,.18));/* aktiver Control */
  --docs-accent: var(--prn-accent, #a0d22b);
  --docs-link: var(--prn-accent, #a0d22b);
  --docs-code-bg: var(--prn-bg-2, rgba(127,127,127,.10));
}
```

> Hinweis: Die bisher hartkodierten Dark-Werte (`#1e252b`, `#11161b`) werden
> durch `var(--prn-bg-2, …)` / `var(--prn-bg, …)` ersetzt, damit Light/CU-Theme
> nicht bricht.

---

## 2. Header / Topbar (UI-Agent: Header.tsx + theme.css `.docs-header*`)

Neue globale Kopfzeile, Höhe `--docs-header-h` (56px), volle Breite, sticky oben,
`background: var(--prn-bg)`, unten `--docs-border`. Suche + Theme wandern aus der
Sidebar HIERHER.

Markup-Skizze (`Header.tsx`):
```tsx
<header className="docs-header">
  <a className="docs-header-brand" href="/">
    <span className="docs-header-logo" aria-hidden /> {/* 24px SVG/CSS-Mark */}
    <span className="docs-header-wordmark">prince-ui</span>
  </a>
  <button className="docs-searchbar" onClick={openSearch}>      {/* zentrierte Pille */}
    <span className="docs-searchbar-icon" aria-hidden>⌕</span>
    <span className="docs-searchbar-placeholder">Dokumentation durchsuchen</span>
    <kbd className="docs-kbd">⌘K</kbd>
  </button>
  <div className="docs-header-actions">
    <ThemeSwitcher />
    <span className="docs-header-divider" aria-hidden />
    <a className="docs-icon-btn" href="https://github.com/…" aria-label="GitHub">{/* GH-SVG */}</a>
    <a className="docs-icon-btn" href="https://www.npmjs.com/…" aria-label="npm">{/* npm-SVG */}</a>
  </div>
</header>
```

Styling:
- `.docs-header` — `display:flex; align-items:center; gap:var(--docs-sp-4); height:var(--docs-header-h); padding:0 var(--docs-sp-5); position:sticky; top:0; z-index:30; background:var(--prn-bg); border-bottom:var(--docs-border);`
- `.docs-header-brand` — `display:flex; align-items:center; gap:var(--docs-sp-2); font-weight:700; color:var(--prn-label); text-decoration:none;`
- `.docs-header-logo` — 24px Quadrat, `border-radius:6px; background:linear-gradient(135deg, var(--docs-accent), var(--prn-accent, #6cae0f));` (selbstgezeichneter Mark — KEINE fremde Marke).
- `.docs-searchbar` — die zentrierte Such-Pille: `flex:0 1 480px; margin:0 auto; height:40px; display:flex; align-items:center; gap:var(--docs-sp-3); padding:0 var(--docs-sp-4); border-radius:var(--docs-radius-pill); border:var(--docs-border-strong); background:var(--prn-bg); color:var(--prn-label-2); cursor:pointer;` Placeholder-Text `--prn-label-2`, links Lupe, rechts `.docs-kbd`.
- `.docs-kbd` — `font:var(--docs-kbd-size)/1 var(--prn-font-mono); padding:2px 8px; border:var(--docs-border); border-radius:var(--docs-radius-card); background:var(--docs-fill); color:var(--prn-label-2);`
- `.docs-header-actions` — `display:flex; align-items:center; gap:var(--docs-sp-3); margin-left:auto;`
- `.docs-header-divider` — `width:1px; height:24px; background:var(--prn-separator);`
- `.docs-icon-btn` — 32px Quadrat, `border-radius:var(--docs-radius-ctrl); display:inline-flex; align-items:center; justify-content:center; color:var(--prn-label-2);` Hover: `background:var(--docs-fill); color:var(--prn-label);`

AppLayout-Umbau: Shell wird zu `grid-template-rows: var(--docs-header-h) 1fr;`
Header über volle Breite (`grid-column: 1 / -1`), darunter eine zweite Zeile mit
`grid-template-columns: var(--docs-sidebar-w) minmax(0,1fr) var(--docs-toc-w);`.

Mobile (<768px): Suchpille schrumpft zu Icon-Button; Hamburger bleibt links;
ThemeSwitcher in Drawer-Kopf. <1100px: TOC entfällt (wie bisher).

---

## 3. Sidebar (UI-Agent: Sidebar.tsx + theme.css `.docs-nav*`)

Aufgeräumte reine Navigation (Suche/Theme sind im Header). Breite
`--docs-sidebar-w` (248px), sticky unter dem Header, eigener Scroll.

Gruppen-IA (aus `navTree`, Reihenfolge fix): **Overview · Foundations · Components**.
Components-Liste alphabetisch. Gruppen-Header sind Caps-Label, Items einzeilig.

Markup-Skizze (`Sidebar.tsx`):
```tsx
<nav className="docs-nav" aria-label="Hauptnavigation">
  {navTree.map(group => (
    <div className="docs-nav-group" key={group.title}>
      <div className="docs-nav-group-title">{group.title}</div>
      <ul className="docs-nav-list">
        {group.items.map(it => (
          <li key={it.path}>
            <NavLink to={it.path}
              className={({isActive}) => "docs-nav-link" + (isActive ? " is-active" : "")}>
              {it.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  ))}
</nav>
```

Styling:
- `.docs-nav` — `padding:var(--docs-sp-5) var(--docs-sp-3); position:sticky; top:var(--docs-header-h); align-self:start; max-height:calc(100vh - var(--docs-header-h)); overflow-y:auto; border-right:var(--docs-border);`
- `.docs-nav-group + .docs-nav-group` — `margin-top:var(--docs-sp-5);`
- `.docs-nav-group-title` — `font-size:.7rem; text-transform:uppercase; letter-spacing:.06em; color:var(--prn-label-2); padding:0 var(--docs-sp-3); margin-bottom:var(--docs-sp-2);`
- `.docs-nav-list` — `list-style:none; margin:0; padding:0;`
- `.docs-nav-link` — Block-Link: `display:block; height:32px; line-height:32px; padding:0 var(--docs-sp-3); font-size:var(--docs-small-size); color:var(--prn-label); text-decoration:none; border-radius:var(--docs-radius-ctrl); position:relative;`
- Hover/Focus: `background:var(--docs-fill);`
- `.docs-nav-link.is-active` — `font-weight:700; color:var(--prn-label); background:var(--docs-fill);` plus linker Akzentbalken: `::before { content:""; position:absolute; left:0; top:6px; bottom:6px; width:2px; border-radius:1px; background:var(--docs-accent); }`

---

## 4. Suche (UI-Agent: Search.tsx + theme.css `.docs-search*`)

Aus der Sidebar entfernt; jetzt **Modal/Overlay**, ausgelöst durch die Header-Pille
oder ⌘K / Ctrl-K (globaler Key-Listener, `e.preventDefault()`).

Verhalten:
- Overlay zentriert oben, `.docs-search-modal` als Dialog (`role="dialog" aria-modal`).
- Auto-Fokus Input; Tippen filtert MiniSearch live (bestehende Logik bleibt).
- Tastatur: ↑/↓ bewegt aktive Ergebniszeile (`aria-activedescendant`), Enter
  navigiert (`useNavigate`), Esc schließt, Klick auf Backdrop schließt.
- Treffer-Highlight: Query-Substring im Titel `<mark class="docs-search-mark">` umfassen.

Styling:
- `.docs-search-backdrop` — `position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:60; display:flex; justify-content:center; align-items:flex-start; padding-top:12vh;`
- `.docs-search-modal` — `width:min(560px,92vw); background:var(--prn-bg); border:var(--docs-border); border-radius:var(--docs-radius-card); box-shadow:var(--docs-shadow-pop); overflow:hidden;`
- `.docs-search-input` (umgewidmet) — randlos im Modal, `width:100%; height:48px; padding:0 var(--docs-sp-4); border:0; border-bottom:var(--docs-border); background:transparent; color:var(--prn-label); font-size:1rem;`
- `.docs-search-results` — `list-style:none; margin:0; padding:var(--docs-sp-2); max-height:50vh; overflow-y:auto;`
- `.docs-search-result` — `display:block; padding:var(--docs-sp-2) var(--docs-sp-3); border-radius:var(--docs-radius-ctrl); color:var(--prn-label); text-decoration:none;`
- `.docs-search-result.is-active` / `:hover` — `background:var(--docs-fill);`
- `.docs-search-mark` — `background:transparent; color:var(--docs-accent); font-weight:700;`

---

## 5. Prosa-Typografie (UI-Agent: theme.css `.docs-prose *` + components.tsx)

Aktuell roher Browser-Default. Lösung: alle Inhaltselemente unter `.docs-main`
über einen `.docs-prose`-Scope stylen. UI-Agent fügt in `components.tsx` HTML-
Element-Overrides hinzu ODER (einfacher, bevorzugt) stylt per Descendant-Selektor
`.docs-main`. **Empfehlung: reine CSS-Selektoren auf `.docs-main`**, damit
`components.tsx` minimal bleibt (nur neue Komponenten registrieren).

```css
.docs-main h1 { font-size:var(--docs-h1-size); line-height:var(--docs-h1-lh); font-weight:var(--docs-h1-weight); margin:0 0 var(--docs-sp-4); letter-spacing:-.01em; }
.docs-main h2 { font-size:var(--docs-h2-size); line-height:var(--docs-h2-lh); font-weight:var(--docs-h2-weight); margin:var(--docs-sp-7) 0 var(--docs-sp-3); }
.docs-main h3 { font-size:var(--docs-h3-size); line-height:var(--docs-h3-lh); font-weight:var(--docs-h3-weight); margin:var(--docs-sp-5) 0 var(--docs-sp-2); }
.docs-main h2, .docs-main h3 { scroll-margin-top: calc(var(--docs-header-h) + var(--docs-sp-4)); } /* Anker-Offset unter Sticky-Header */
.docs-main p, .docs-main li { font-size:var(--docs-body-size); line-height:var(--docs-body-lh); color:var(--prn-label); }
.docs-main p { margin:0 0 var(--docs-sp-4); }
.docs-main ul, .docs-main ol { margin:0 0 var(--docs-sp-4); padding-left:var(--docs-sp-5); }
.docs-main li { margin:var(--docs-sp-1) 0; }
.docs-main a { color:var(--docs-link); text-decoration:underline; text-underline-offset:2px; }
.docs-main a:hover { text-decoration:none; }
.docs-main :not(pre) > code { background:var(--docs-code-bg); border-radius:var(--docs-radius-chip); padding:.1em .35em; font:var(--docs-code-size)/1 var(--prn-font-mono); }
.docs-main blockquote { margin:var(--docs-sp-4) 0; padding:var(--docs-sp-2) var(--docs-sp-4); border-left:3px solid var(--prn-separator); color:var(--prn-label-2); }
.docs-main hr { border:0; border-top:var(--docs-border); margin:var(--docs-sp-6) 0; }
```

### Komponenten-Seitenkopf (Content-Agent verwendet, UI-Agent stylt)

Neuer wiederverwendbarer Block oben auf jeder Komponenten-Seite. Content-Agent
schreibt das Markup mit Klassen; UI-Agent stylt:
```mdx
<div className="docs-component-head">
  <span className="docs-badge docs-badge-stable">Stabil</span>
  <p className="docs-component-lead">Kurzbeschreibung der Komponente.</p>
  <pre className="docs-import"><code>import {'{'} ColorSlider {'}'} from "@conuti-das/prince-ui";</code></pre>
</div>
```
- `.docs-badge` — `display:inline-flex; align-items:center; height:22px; padding:0 var(--docs-sp-2); border-radius:var(--docs-radius-pill); font-size:.72rem; font-weight:600;`
- `.docs-badge-stable` — `background:color-mix(in srgb, var(--prn-positive,#2e7d32) 22%, transparent); color:var(--prn-positive,#2e7d32);`
- `.docs-component-lead` — `font-size:1.1rem; color:var(--prn-label-2);`
- `.docs-import` — `background:var(--docs-code-bg); border-radius:var(--docs-radius-code); padding:var(--docs-sp-3) var(--docs-sp-4); overflow:auto;`

---

## 6. Playground (UI-Agent: Playground.tsx + Controls.tsx + playground.css)

### 6.1 Controls — von rohem HTML auf prince-ui-Optik

`Controls.tsx` mappt Control-Typen auf gestylte Markups (Klassen unten). Wenn
prince-ui-Komponenten (`Switch`, `Select`, `TextField`, `NumberField`) ohne
Required-Props nutzbar sind, dürfen sie verwendet werden; ansonsten gestyltes
natives Markup mit den Klassen. **Pflicht: keine nackten Default-Controls mehr.**

- `type "segmented"` (Enums) → Segmented-Control:
  ```tsx
  <div className="docs-segmented" role="group">
    {c.options.map(o => (
      <button key={o} className={"docs-segment"+(state===o?" is-active":"")}
        onClick={()=>onChange(c.name,o)}>{o}</button>
    ))}
  </div>
  ```
- `type "select"` → `<select className="docs-select">` (gestylt, trailing chevron via CSS-Background).
- `type "toggle"` → Switch: `<button role="switch" aria-checked className="docs-switch"><span className="docs-switch-knob"/></button>`.
- `type "text"` → `<input className="docs-field">`.
- `type "number"` → `<input type="number" className="docs-field">`.

ⓘ-Info: `.pg-info` rechtsbündig in der Label-Zeile (`.pg-control-name` →
`display:flex; align-items:center; justify-content:space-between;`). Required-Marker
`<span className="docs-required">*</span>` (rot, `var(--prn-negative)`).

Control-Styling (playground.css):
- `.docs-segmented` — `display:inline-flex; gap:2px; background:var(--docs-fill); border-radius:var(--docs-radius-ctrl); padding:2px;`
- `.docs-segment` — `height:28px; padding:0 var(--docs-sp-3); font-size:var(--docs-small-size); border:0; background:transparent; color:var(--prn-label); border-radius:6px; cursor:pointer;`
- `.docs-segment.is-active` — `background:var(--docs-fill-strong); color:var(--prn-label); font-weight:500;`
- `.docs-select`, `.docs-field` — `height:32px; padding:0 var(--docs-sp-3); font-size:var(--docs-small-size); background:var(--docs-fill); color:var(--prn-label); border:var(--docs-border); border-radius:var(--docs-radius-ctrl); width:100%; box-sizing:border-box;` `.docs-select` zusätzlich `appearance:none;` + chevron-Background-SVG rechts.
- `.docs-switch` — `width:38px; height:22px; border-radius:var(--docs-radius-pill); background:var(--docs-fill); border:var(--docs-border); position:relative; cursor:pointer;` aktiv (`[aria-checked=true]`): `background:var(--docs-accent);`
- `.docs-switch-knob` — `position:absolute; top:2px; left:2px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .15s;` aktiv: `left:18px;`
- `.docs-required` — `color:var(--prn-negative,#c62828); margin-left:2px;`

### 6.2 Code-Panel — abgerundet, Copy + Open

`.pg-code` Box: weißes/elevated Inneres, abgerundet, Action-Leiste oben rechts mit
zwei Ghost-Icon-Buttons (Copy + Open/Expand). "Open" öffnet das Beispiel in einem
Maximize-Overlay ODER fokussiert den Live-Editor (Implementierungsfreiheit; Affordance Pflicht).

- `.pg` — Grid bleibt; `background:var(--prn-bg-elevated); border:var(--docs-border); border-radius:var(--docs-radius-card); padding:var(--docs-sp-5); gap:var(--docs-sp-5);`
- `.pg-stage` — `min-height:220px; border-radius:var(--docs-radius-code); background:var(--docs-fill);`
- `.pg-code pre` — `background:var(--prn-bg-2, #11161b); border-radius:var(--docs-radius-code); padding:var(--docs-sp-4); padding-top:2.6rem; font:var(--docs-code-size)/var(--docs-code-lh) var(--prn-font-mono); overflow:auto;`
- `.pg-actions` — oben rechts, `gap:var(--docs-sp-1);`
- `.pg-icon-btn` (NEU, ersetzt `.pg-copy`) — 24px Ghost: `width:24px; height:24px; display:inline-flex; align-items:center; justify-content:center; background:transparent; border:0; border-radius:7px; color:var(--prn-label-2); cursor:pointer;` Hover: `background:var(--docs-fill); color:var(--prn-label);`

> Syntax-Highlighting: optional in dieser Iteration. Wenn umgesetzt, Prism/Shiki
> mit prince-ui-Token-Farben (`--prn-label` Default, `--docs-accent` Keywords).
> Ist Highlighting nicht im Scope, bleibt monospace-Klartext — aber die Box-Optik
> (Radius, Action-Leiste) ist Pflicht.

---

## 7. API/Props-Tabelle (UI-Agent: PropsTable.tsx + theme.css `.docs-props-table`)

Klasse existiert, ist aber ungestylt. UI-Agent stylt + ergänzt Hooks. Spalten
**Name · Type · Default**. Beschreibung als eigene Zeile unter dem Namen (colspan).

PropsTable.tsx-Anpassung: Required-Marker als `<span className="docs-required">*</span>`;
Typ in `<code className="docs-type">`; Default-Literal in `<code className="docs-default">`
oder `—`. Beschreibung als zweite `<tr className="docs-props-desc"><td colSpan={3}>…`.

Styling:
- `.docs-props-table` — `width:100%; border-collapse:collapse; margin:var(--docs-sp-4) 0; font-size:var(--docs-small-size);`
- `thead th` — `text-align:start; font-weight:700; color:var(--prn-label); padding:var(--docs-sp-2) var(--docs-sp-3); border-bottom:var(--docs-border-strong);`
- Spaltenbreiten: `th:nth-child(1){width:32%} th:nth-child(2){width:48%} th:nth-child(3){width:20%}`
- `tbody td` — `padding:var(--docs-sp-2) var(--docs-sp-3); vertical-align:top; border-bottom:var(--docs-border);`
- Name-`code` — `color:var(--docs-accent); font-family:var(--prn-font-mono);`
- `.docs-type` — `font-family:var(--prn-font-mono); color:var(--prn-label-2);`
- `.docs-default` — `font-family:var(--prn-font-mono); color:var(--prn-positive,#2e7d32);`
- `.docs-props-desc td` — `color:var(--prn-label-2); padding-top:0; border-bottom:var(--docs-border);`
- Zebra optional: `tbody tr:nth-child(4n+1) { background:color-mix(in srgb, var(--prn-label) 3%, transparent); }`

---

## 8. Rechter TOC (UI-Agent: OnThisPage.tsx + theme.css `.docs-toc*`)

Scroll-Spy + eigener "Copy for LLM"-Block. Deutsche Überschrift **„Auf dieser Seite"**.

Verhalten:
- IntersectionObserver über `.docs-main h2,h3`; aktive ID → `.is-active`.
- Klick scrollt smooth, setzt Hash.
- Aktiver Eintrag: linker Akzentbalken (wie Sidebar) + `font-weight:700`.
- Darunter Trenner + Aktionen: „Für LLM kopieren" (kopiert Roh-Markdown/Plaintext
  der Seite in Clipboard) + Overflow-`…`-Button (Platzhalter-Menü, kann no-op sein).

Markup-Skizze:
```tsx
<nav className="docs-toc-nav" aria-label="Auf dieser Seite">
  <div className="docs-toc-title">Auf dieser Seite</div>
  <ul className="docs-toc-list">
    {items.map(i => (
      <li key={i.id} style={{ paddingLeft: (i.level-2)*12 }}>
        <a className={"docs-toc-link"+(active===i.id?" is-active":"")} href={`#${i.id}`}>{i.text}</a>
      </li>
    ))}
  </ul>
  <hr className="docs-toc-sep" />
  <div className="docs-toc-actions">
    <button className="docs-toc-btn" onClick={copyForLLM}>⧉ Für LLM kopieren</button>
    <button className="docs-icon-btn" aria-label="Mehr">…</button>
  </div>
</nav>
```

Styling:
- `.docs-toc` (Container, vorhanden) — `position:sticky; top:calc(var(--docs-header-h) + var(--docs-sp-5)); align-self:start; padding:var(--docs-sp-5) var(--docs-sp-3); font-size:var(--docs-small-size);`
- `.docs-toc-title` — `font-weight:700; color:var(--prn-label); margin-bottom:var(--docs-sp-2);`
- `.docs-toc-list` — `list-style:none; margin:0 0 var(--docs-sp-3); padding:0;`
- `.docs-toc-link` — `display:block; padding:var(--docs-sp-1) var(--docs-sp-2); color:var(--prn-label-2); text-decoration:none; border-left:2px solid transparent;`
- `.docs-toc-link.is-active` — `color:var(--prn-label); font-weight:700; border-left-color:var(--docs-accent);`
- `.docs-toc-sep` — `border:0; border-top:var(--docs-border); margin:var(--docs-sp-3) 0;`
- `.docs-toc-btn` — Ghost: `height:32px; padding:0 var(--docs-sp-3); font-size:var(--docs-small-size); background:transparent; border:0; border-radius:var(--docs-radius-ctrl); color:var(--prn-label); cursor:pointer;` Hover `background:var(--docs-fill);`

---

## 9. Landing (Content-Agent: content/index.mdx + public/*.svg · UI-Agent: Hero/FeatureCard/ComponentCard + CSS)

UI-Agent liefert Bausteine + Klassen; Content-Agent komponiert die Seite und die
SVG-Visuals. **Keine Fremdbilder** — nur eigene SVGs/Gradients/prince-ui-Showcase.

### Bausteine (UI-Agent, in `mdxComponents` registrieren)
- `<Hero title eyebrow>` → rendert `.docs-hero` mit Gradient-Hintergrund, H1, Lead, Button-Paar (Slots `children` für Buttons).
- `<FeatureCard title icon variant?>` → `.docs-feature-card` (variant `dark` → dunkle Karte).
- `<ComponentCard title href>` → `.docs-component-card` für das Explore-Grid.

### Landing-Sektionen (Content-Agent in index.mdx)
1. **Hero** — `<Hero>` mit Titel „Oberflächen mit Politur", Lead, zwei Buttons:
   primär „Loslegen" (→ Getting Started), sekundär „Komponenten ansehen". Hintergrund
   ein dezenter prince-ui-Gradient (kein Adobe-Rot/Lila — eigene Akzentpalette).
2. **Feature-Bento** — Sektion `.docs-section` mit H2 „Alles für schöne Oberflächen",
   3–4 `<FeatureCard>` im Grid (`.docs-bento`): z. B. „Drei Theme-Modi", „Tokens
   statt Hex", „Prozess-Editoren inklusive", eine `variant="dark"`-Code-Karte.
3. **Explore Components** — H2 „Komponenten entdecken", `.docs-card-grid` mit
   `<ComponentCard>`-Kacheln (Button, ColorSlider, Badge, …) je mit Mini-SVG-Visual
   aus `public/`.
4. **Foundations-Highlights** — H2 „Grundlagen", Kacheln zu Farben/Typo/Spacing,
   jeweils mit einfachem selbstgezeichnetem SVG-Swatch/Token-Visual.
5. **CTA-Band** — Schlusssektion „Bereit loszulegen?" mit demselben Button-Paar.

### Styling (UI-Agent)
- `.docs-hero` — `border-radius:var(--docs-radius-card); padding:var(--docs-sp-8) var(--docs-sp-6); background:radial-gradient(120% 120% at 0% 0%, color-mix(in srgb,var(--docs-accent) 18%, var(--prn-bg)) 0%, var(--prn-bg) 60%); border:var(--docs-border); margin-bottom:var(--docs-sp-9);`
- `.docs-hero h1` — nutzt H1-Skala, optional größer via `font-size:clamp(2.5rem,5vw,3.5rem);`
- `.docs-hero-lead` — `font-size:1.2rem; color:var(--prn-label-2); max-width:42rem;`
- `.docs-hero-actions` — `display:flex; gap:var(--docs-sp-3); margin-top:var(--docs-sp-5);`
- `.docs-btn` — `height:44px; padding:0 var(--docs-sp-5); border-radius:var(--docs-radius-card); font-size:1rem; font-weight:700; display:inline-flex; align-items:center; text-decoration:none; cursor:pointer; border:var(--docs-border);`
- `.docs-btn-primary` — `background:var(--docs-accent); color:#10140a; border-color:transparent;`
- `.docs-btn-secondary` — `background:var(--docs-fill); color:var(--prn-label);`
- `.docs-section` — `margin:var(--docs-sp-9) 0;`
- `.docs-bento`, `.docs-card-grid` — `display:grid; gap:var(--docs-sp-5); grid-template-columns:repeat(auto-fit,minmax(240px,1fr));`
- `.docs-feature-card`, `.docs-component-card` — `border:var(--docs-border); border-radius:var(--docs-radius-card); padding:var(--docs-sp-5); background:var(--prn-bg-elevated); box-shadow:var(--docs-shadow-card);`
- `.docs-feature-card.is-dark` (variant dark) — `background:var(--prn-bg-2,#11161b);`
- `.docs-component-card` — Link-Karte; Hover: `border-color:var(--docs-accent); transform:translateY(-2px); transition:.15s;`

---

## 10. Callouts (UI-Agent: Callouts.tsx + theme.css `.docs-dodont*`)

Von dünnem Left-Border auf Karten-Optik: Hintergrund-Tint, Icon, Radius.
- `.docs-dodont` — `border-radius:var(--docs-radius-ctrl); padding:var(--docs-sp-4); margin:var(--docs-sp-4) 0; border-left:4px solid; background:var(--docs-fill);`
- `.docs-dodont-do` — `border-color:var(--prn-positive,#2e7d32);` Icon ✓.
- `.docs-dodont-dont` — `border-color:var(--prn-negative,#c62828);` Icon ✕.
- Titelzeile `.docs-dodont-title` — `font-weight:700; display:flex; gap:var(--docs-sp-2); align-items:center;`

---

## 11. Vollständige Klassen-Liste für den Content-Agent (nur diese verwenden)

Layout/Inhalt: `docs-component-head`, `docs-component-lead`, `docs-badge`,
`docs-badge-stable`, `docs-import`.
Landing: `docs-hero`, `docs-hero-lead`, `docs-hero-actions`, `docs-btn`,
`docs-btn-primary`, `docs-btn-secondary`, `docs-section`, `docs-bento`,
`docs-card-grid`, `docs-feature-card`, `docs-component-card`.
MDX-Komponenten: `<Hero>`, `<FeatureCard>`, `<ComponentCard>`, `<Playground>`,
`<PropsTable>`, `<Example>`, `<DoDont>`, `<Anatomy>`, `<EditorExample>`.
Prosa (h1–h3, p, ul/li, a, code, blockquote, hr) wird automatisch über den
`.docs-main`-Scope gestylt — Content schreibt normales Markdown, keine Klassen nötig.

Der Content-Agent schreibt KEINE `className` außerhalb dieser Liste und KEINE
Inline-`style`-Farben.

---

## 12. Definition of Done

- Header global mit zentrierter Such-Pille; Suche+Theme nicht mehr in der Sidebar.
- ⌘K öffnet Such-Modal; ↑/↓/Enter/Esc funktionieren.
- Sidebar zeigt aktive Seite (Akzentbalken + Bold), Hover-Fläche, Gruppen-Abstände.
- Content-Prosa hat Heading-Skala, Zeilenabstand, Link-Farbe, Inline-Code-Chips,
  Anker-Scroll-Offset unter dem Sticky-Header.
- Playground-Controls sind gestylt (Segmented/Select/Switch/Field), kein nacktes HTML.
- Props-Tabelle hat Kopfzeile, Trennlinien, Monospace-Typen, Required-Marker, Spaltenbreiten.
- TOC „Auf dieser Seite" mit Scroll-Spy + „Für LLM kopieren".
- Landing hat Hero, Feature-Bento, Explore-Grid, Foundations, CTA — mit eigenen SVGs/Gradients.
- Keine hartkodierten Dark-Hex-Werte mehr (alles über `--prn-*`/`--docs-*`).
- Light/CU-Theme bricht nicht (Tokens statt Festfarben).
```
