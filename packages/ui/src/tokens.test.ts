import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/** Regeln aus tokens.css als [Selektor, Rumpf] (ohne @media-Hülle, Kommentare entfernt). */
function regeln(): [string, string][] {
  const css = readFileSync(resolve(process.cwd(), "../tokens/src/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const out: [string, string][] = [];
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) out.push([m[1]!.trim(), m[2]!]);
  return out;
}

describe("tokens.css", () => {
  it("setzt color-scheme nie am nackten :root (fremdes data-theme der Host-Anwendung bleibt unberührt)", () => {
    const mitScheme = regeln().filter(([, rumpf]) => /(^|;|\s)color-scheme\s*:/.test(rumpf)).map(([sel]) => sel);
    expect(mitScheme.length).toBeGreaterThan(0);
    for (const sel of mitScheme) for (const teil of sel.split(",")) expect(teil.trim()).toMatch(/^:root(:not\(\[data-theme\]\)|\[data-theme="[a-z-]+"\])$/);
  });

  it("jedes Theme und der Fallback haben ein color-scheme", () => {
    const sels = regeln().filter(([, r]) => /color-scheme\s*:/.test(r)).flatMap(([s]) => s.split(",").map((x) => x.trim()));
    for (const t of ["light", "dark", "cu-light", "cu-dark", "cu"]) expect(sels).toContain(`:root[data-theme="${t}"]`);
    expect(sels).toContain(":root:not([data-theme])");
  });

  it("bringt die globalen Basis-Helfer mit, die die Komponenten voraussetzen (Fokus-Ring, Tabellenziffern, Skeleton, Keyframes, reduzierte Bewegung)", () => {
    // .prn-tnum (Kennzahlen, Timeline, Beträge) und .prn-skeleton (AnalyticalTable beim Laden) stehen nur hier; der Block fiel in #27 mit dem C3U-Theme heraus
    const css = readFileSync(resolve(process.cwd(), "../tokens/src/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    for (const teil of [":where(:focus-visible) {", ".prn-tnum {", ".prn-skeleton {", "@keyframes prn-shimmer {", "@keyframes prn-spin {", "@media (prefers-reduced-motion: reduce) {"])
      expect(css).toContain(teil);
  });
});
