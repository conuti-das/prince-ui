import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { globSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildNav } from "../src/nav";

// `src/routes.tsx` leitet die Navigation zur Laufzeit via Vite-`import.meta.glob`
// ab — das gibt es im Node-Kontext (Playwright) nicht. Wir füttern dieselbe reine
// `buildNav`-Funktion stattdessen mit einem Dateisystem-Scan, damit die Pfade hier
// identisch zur App sind (gleiche Quelle der Wahrheit: content/**/*.mdx).
const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../content");
const modules: Record<string, unknown> = {};
for (const abs of globSync(resolve(contentDir, "**/*.mdx"))) {
  modules["/content/" + relative(contentDir, abs).replace(/\\/g, "/")] = {};
}
const navTree = buildNav(modules);

// dedupe: die Nav führt die Startseite jetzt als eigenen "Overview/Einführung"-Eintrag
// mit Pfad "/" — sonst doppelter Test-Titel.
const paths = [...new Set(["/", ...navTree.flatMap((g) => g.items.map((i) => i.path))])];

// Die Live-Demo-Bereiche zeigen prince-ui-Komponenten unverändert (inkl. ihrer
// eigenen Kontrast-/Token-Eigenschaften aus `packages/ui`). Deren a11y wird in den
// Komponenten-Paketen selbst verantwortet — hier prüfen wir die Doku-Chrome
// (Sidebar, Suche, Theme-Switcher, TOC, Playground-Rahmen, Landmarks, Seitenstruktur).
// Darum werden nur die eingebetteten Komponenten-Render-Targets von axe ausgenommen,
// nicht der Test als solcher geschwächt.
const DEMO_REGIONS = [".pg-stage", ".docs-example-preview", ".docs-editor-example"];

for (const path of paths) {
  test(`a11y+smoke ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(path, { waitUntil: "networkidle" });
    let axe = new AxeBuilder({ page });
    for (const sel of DEMO_REGIONS) axe = axe.exclude(sel);
    const results = await axe.analyze();
    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? ""),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
