import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/* Token des Regelwerks „Aktion, Hilfsaktion, Navigation, Ansicht“ (E: docs/prince-ui/gestaltung/GESTALTUNGSREGELN.md):
 * Aktion und Link getrennt, Rücknahme rot, Text auf getönt/schlicht und auf Rot lesbar – je Theme, hell und dunkel. */

const CSS = readFileSync(resolve(process.cwd(), "../tokens/src/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function bloecke(): [string[], Record<string, string>][] {
  const out: [string[], Record<string, string>][] = [];
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(CSS))) {
    const werte: Record<string, string> = {};
    for (const d of m[2]!.matchAll(/(--prn-[\w-]+)\s*:\s*([^;]+);/g)) werte[d[1]!] = d[2]!.trim();
    out.push([m[1]!.split(";").pop()!.trim().split(",").map((s) => s.trim()), werte]);
  }
  return out;
}

/** Werte eines Themes: Basis `:root`, darüber die Blöcke mit genau diesem Selektor (in Dateireihenfolge). */
function theme(sel: string): Record<string, string> {
  const b = bloecke();
  const basis = b.find(([s]) => s.length === 1 && s[0] === ":root")![1];
  return Object.assign({}, basis, ...b.filter(([s]) => s.includes(sel) && sel !== ":root").map(([, w]) => w));
}

type Farbe = [number, number, number, number];
function farbe(v: Record<string, string>, name: string): Farbe {
  let x = v[name];
  for (let i = 0; x?.startsWith("var(") && i < 5; i++) x = v[x.match(/var\((--[\w-]+)/)![1]!];
  if (!x) throw new Error(`${name} fehlt`);
  if (x.startsWith("#")) return [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16), 1];
  const n = x.match(/[\d.]+/g)!.map(Number);
  return [n[0]!, n[1]!, n[2]!, n[3] ?? 1];
}
const ueber = (v: Farbe, h: Farbe): Farbe => [0, 1, 2].map((i) => v[i]! * v[3] + h[i]! * (1 - v[3])).concat(1) as Farbe;
const lum = (c: Farbe) => {
  const [r, g, b] = c.slice(0, 3).map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const kontrast = (a: Farbe, b: Farbe) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x! + 0.05) / (y! + 0.05); };

// hell und dunkel: Fallback (dunkel), OS hell, erzwungen hell/dunkel, CU dunkel/hell
const THEMES: [string, string][] = [
  ["Fallback dunkel", ":root"],
  ["OS hell", ":root:not([data-theme])"],
  ["hell", ':root[data-theme="light"]'],
  ["dunkel", ':root[data-theme="dark"]'],
  ["CU dunkel", ':root[data-theme="cu-dark"]'],
  ["CU hell", ':root[data-theme="cu-light"]'],
];

describe("Token des Regelwerks", () => {
  it("Aktion und Link sind eigene Token; heute zeigen beide auf den Akzent (keine sichtbare Änderung, Leitfarbe umschaltbar)", () => {
    const basis = theme(":root");
    expect(basis["--prn-action"]).toBe("var(--prn-accent)");
    expect(basis["--prn-action-soft"]).toBe("var(--prn-accent-soft)");
    expect(basis["--prn-link"]).toBe("var(--prn-accent-strong)");
    // kein Theme stellt die Leitfarbe um (Entscheidung des Auftraggebers offen)
    for (const [, sel] of THEMES.slice(1)) {
      const eigen = bloecke().filter(([s]) => s.includes(sel)).map(([, w]) => w);
      for (const w of eigen) expect(w["--prn-action"], sel).toBeUndefined();
    }
  });

  for (const [name, sel] of THEMES) {
    it(`${name}: Text auf getönt, schlicht und Rot ist lesbar (≥ 4,5:1)`, () => {
      const v = theme(sel);
      for (const grund of ["--prn-bg-elevated", "--prn-bg"]) {
        const h = farbe(v, grund);
        expect(kontrast(farbe(v, "--prn-action-text"), ueber(farbe(v, "--prn-action-soft"), h)), `getönt auf ${grund}`).toBeGreaterThanOrEqual(4.5);
        expect(kontrast(farbe(v, "--prn-action-text"), h), `schlicht auf ${grund}`).toBeGreaterThanOrEqual(4.5);
        expect(kontrast(farbe(v, "--prn-danger-text"), ueber(farbe(v, "--prn-danger-soft"), h)), `Rücknahme getönt auf ${grund}`).toBeGreaterThanOrEqual(4.5);
      }
      expect(kontrast(farbe(v, "--prn-on-danger"), farbe(v, "--prn-danger-fill")), "Rücknahme gefüllt (Dialog)").toBeGreaterThanOrEqual(4.5);
    });
  }

  it("Knopf und Link lesen die Rollen-Token, nicht den Akzent direkt", () => {
    const formen = readFileSync(resolve(process.cwd(), "src/primitives/forms.css"), "utf8");
    const knopf = formen.slice(formen.indexOf("/* ---- Button ---- */"), formen.indexOf("/* ---- Field"));
    expect(knopf).not.toMatch(/--prn-accent/);
    expect(knopf).toMatch(/var\(--prn-action\)/);
    expect(knopf).toMatch(/var\(--prn-danger-soft\)/);
    const link = readFileSync(resolve(process.cwd(), "src/primitives/breadcrumbs.css"), "utf8");
    expect(link).toMatch(/\.prn-link \{\s*color: var\(--prn-link\)/);
  });
});
