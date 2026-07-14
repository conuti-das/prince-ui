/**
 * Shell-per-Route-Prerendering für die SPA auf GitHub Pages.
 *
 * Problem: Eine einzelne index.html → Deep-Links liefern HTTP 404 (nur via
 * 404.html-Fallback erreichbar) und alle Seiten teilen sich denselben <title>.
 *
 * Lösung: Für jede Route eine echte `dist/<route>/index.html` schreiben (→ HTTP 200)
 * und in den <head> einen seitenspezifischen Titel + Meta-Description + Open-Graph/
 * Twitter-Tags injizieren (Link-Previews, Nicht-JS-Crawler). Der Body bleibt
 * clientseitig gerendert — kein SSR-Risiko mit den bpmn/dmn/forms-Editoren.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../content");
const distDir = resolve(here, "../dist");
const SITE = "prince-ui";

function listMdx(dir: string): string[] {
  let rels: string[];
  try {
    rels = readdirSync(dir, { recursive: true }) as unknown as string[];
  } catch {
    return [];
  }
  return rels.map((rel) => join(dir, rel)).filter((f) => f.endsWith(".mdx"));
}

function routePathFor(file: string): string {
  const rel = file.slice(contentDir.length + 1).replace(/\\/g, "/").replace(/\.mdx$/, "");
  if (rel === "index") return "/";
  return `/${rel.toLowerCase()}`;
}

// Erste Überschrift = Titel, erster Fließtext-Absatz = Description.
function titleAndDescription(src: string): { title: string; description: string } {
  const titleMatch = src.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1]!.trim() : SITE;
  let desc = "";
  const lines = src.split("\n");
  let seenHeading = false;
  for (const line of lines) {
    const t = line.trim();
    if (/^#\s/.test(t)) { seenHeading = true; continue; }
    if (!seenHeading) continue;
    if (!t || t.startsWith("<") || t.startsWith("import ") || t.startsWith("export ") || t.startsWith("#") || t.startsWith("```")) continue;
    desc = t.replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    break;
  }
  return { title, description: desc };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function headTags(title: string, description: string, path: string): string {
  const fullTitle = path === "/" ? `${SITE} — React-Design-System` : `${title} – ${SITE}`;
  const desc = description || "Das gemeinsame React-Design-System auf Basis von React Aria.";
  const t = escapeHtml(fullTitle);
  const d = escapeHtml(desc);
  return [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE}" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
  ].join("\n    ");
}

// In die Template-<head> die Tags vor </head> injizieren; vorhandenen <title> ersetzen.
function injectHead(template: string, tags: string): string {
  const withoutTitle = template.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  return withoutTitle.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}

const template = readFileSync(join(distDir, "index.html"), "utf8");
const files = listMdx(contentDir);
let written = 0;

for (const file of files) {
  const path = routePathFor(file);
  const src = readFileSync(file, "utf8");
  const { title, description } = titleAndDescription(src);
  const html = injectHead(template, headTags(title, description, path));
  if (path === "/") {
    writeFileSync(join(distDir, "index.html"), html);
  } else {
    const outDir = join(distDir, path.replace(/^\//, ""));
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html);
  }
  written++;
}

// Zusätzliche, nicht-MDX-Routen (Full-Bleed-Seiten außerhalb des AppLayout).
// Gleiche Shell-Behandlung, damit Deep-Links HTTP 200 + eigenen Titel/Meta
// liefern. Derzeit keine.
const EXTRA_ROUTES: { path: string; title: string; description: string }[] = [];

for (const { path, title, description } of EXTRA_ROUTES) {
  const html = injectHead(template, headTags(title, description, path));
  const outDir = join(distDir, path.replace(/^\//, ""));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html);
  written++;
}

// 404.html bleibt der generische SPA-Fallback (für unbekannte Pfade).
writeFileSync(join(distDir, "404.html"), template);

console.log(`prerender-shells: ${written} Routen-Shells + 404.html geschrieben`);
