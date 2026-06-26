import { globSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = resolve(here, "../content");

type Doc = { id: string; title: string; text: string };

// MDX/JSX grob zu reinem Text strippen — derselbe Routenpfad wie in routes.tsx
// (`/${dir}/${name.toLowerCase()}`, `index.mdx` → `/`).
function routePathFor(file: string): string {
  const rel = file
    .slice(contentDir.length + 1)
    .replace(/\\/g, "/")
    .replace(/\.mdx$/, "");
  if (rel === "index") return "/";
  return `/${rel.toLowerCase()}`;
}

function stripMdx(src: string): { title: string; text: string } {
  let s = src;
  // import/export-Zeilen entfernen
  s = s.replace(/^\s*(import|export)\s.*$/gm, "");
  // Code-Fences entfernen
  s = s.replace(/```[\s\S]*?```/g, " ");
  s = s.replace(/`[^`]*`/g, " ");
  // JSX-Tags entfernen (inkl. mehrzeiliger Attribute)
  s = s.replace(/<[^>]+>/g, " ");
  // verbleibende geschweifte JSX-Ausdrücke entfernen
  s = s.replace(/\{[^{}]*\}/g, " ");
  // Markdown-Überschriften-/Betonungs-Marker entfernen
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/[*_]{1,3}/g, "");
  // Erste Überschrift als Titel
  const titleMatch = src.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1]!.trim() : "";
  const text = s.replace(/\s+/g, " ").trim();
  return { title, text };
}

const files = globSync(resolve(contentDir, "**/*.mdx"));
const docs: Doc[] = files.map((file) => {
  const src = readFileSync(file, "utf8");
  const { title, text } = stripMdx(src);
  const id = routePathFor(file);
  return { id, title: title || id, text };
});

docs.sort((a, b) => a.id.localeCompare(b.id));

mkdirSync(resolve(here, "../public"), { recursive: true });
writeFileSync(resolve(here, "../public/search-index.json"), JSON.stringify(docs, null, 2));
console.log(`build-search-index: ${docs.length} Seiten → public/search-index.json`);
