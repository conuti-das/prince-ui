import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/* Kontrast der Texte in den CU-Themes (cu-light, cu-dark) nach WCAG 2.1 AA: Text ≥ 4,5:1 gegen seine Fläche – gerechnet aus den Token-Paaren in tokens.css,
 * je auf der Fläche einer Karte (--prn-bg-elevated) und der Seite (--prn-bg); halbdurchsichtige Farben und Tönungen werden auf die Fläche gerechnet.
 * Dazu prüft der Test, dass die Komponenten genau diese Token nutzen (sonst sagt die Rechnung nichts über die Oberfläche).
 * Anlass: Messung in MACO APP (E) über alle Routen, 241 Texte unter 4,5:1 (Zeilen-Untertitel, Link, Reiter, Anker im Dunklen, Marken, ShellBar-Zähler, Timeline). */

const TOKENS = readFileSync(resolve(process.cwd(), "../tokens/src/tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const css = (datei: string) => readFileSync(resolve(process.cwd(), "src", datei), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function bloecke(): [string[], Record<string, string>][] {
  const out: [string[], Record<string, string>][] = [];
  const re = /([^{}@]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(TOKENS))) {
    const werte: Record<string, string> = {};
    for (const d of m[2]!.matchAll(/(--prn-[\w-]+)\s*:\s*([^;]+);/g)) werte[d[1]!] = d[2]!.trim();
    out.push([m[1]!.split(";").pop()!.trim().split(",").map((s) => s.trim()), werte]);
  }
  return out;
}
/** Werte eines Themes: Basis `:root`, darüber die Blöcke, deren Selektor das Theme nennt (Dateireihenfolge) */
function theme(sel: string): Record<string, string> {
  const b = bloecke();
  const basis = b.find(([s]) => s.length === 1 && s[0] === ":root")![1];
  return Object.assign({}, basis, ...b.filter(([s]) => s.includes(sel)).map(([, w]) => w));
}

type Farbe = [number, number, number, number];
/** Farbe eines Ausdrucks (#rrggbb, rgba(), var(--x) und var(--x, Ersatz)) */
function farbe(v: Record<string, string>, ausdruck: string): Farbe {
  let x: string | undefined = ausdruck;
  for (let i = 0; x?.startsWith("var(") && i < 8; i++) {
    const name: string = x.match(/var\((--[\w-]+)/)![1]!;
    const komma = x.indexOf(",");
    x = v[name] ?? (komma > 0 ? x.slice(komma + 1, x.lastIndexOf(")")).trim() : undefined);
  }
  if (!x) throw new Error(`${ausdruck}: nicht aufgelöst`);
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

/** Paar: Name, Textfarbe, Fläche (Liste = von oben nach unten übereinander, zuunterst die Grundfläche) */
type Paar = [string, string, string[]];
const AUF = (...f: string[]) => f;
const PAARE: Paar[] = [
  ["Sekundärtext (prn-row-subtitle)", "var(--prn-label-2)", AUF()],
  ["Link", "var(--prn-link)", AUF()],
  ["gewählter Reiter (prn-tab)", "var(--prn-accent-strong)", AUF()],
  ["gewählter Anker der ObjectPage", "var(--prn-accent-strong)", AUF("var(--prn-accent-soft)")],
  ["Marke grün", "var(--prn-positive-text, var(--prn-green))", AUF("var(--prn-tint-positive)")],
  ["Marke orange", "var(--prn-critical-text, var(--prn-orange))", AUF("var(--prn-tint-critical)")],
  ["Marke rot", "var(--prn-negative-text, var(--prn-red))", AUF("var(--prn-tint-negative)")],
  ["Marke blau", "var(--prn-info-text, var(--prn-blue))", AUF("var(--prn-tint-info)")],
  ["Marke grau", "var(--prn-label-2)", AUF("var(--prn-fill-strong)")],
  ["ShellBar-Zähler", "var(--prn-on-status-fill)", AUF("var(--prn-danger-fill, var(--prn-red))")],
  ["Timeline-Zeichen grün", "var(--prn-on-green, var(--prn-on-status-fill))", AUF("var(--prn-green)")],
  ["Timeline-Zeichen orange", "var(--prn-on-orange, var(--prn-on-status-fill))", AUF("var(--prn-orange)")],
  ["Timeline-Zeichen rot", "var(--prn-on-red, var(--prn-on-status-fill))", AUF("var(--prn-red)")],
  ["Timeline-Zeichen blau", "var(--prn-on-blue, var(--prn-on-status-fill))", AUF("var(--prn-blue)")],
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n): Paar => [`Timeline-Avatar auf chart-${n}`, `var(--prn-on-chart-${n}, var(--prn-on-accent))`, AUF(`var(--prn-chart-${n})`)]),
];

describe.each([["CU hell", ':root[data-theme="cu-light"]'], ["CU dunkel", ':root[data-theme="cu-dark"]']])("Kontrast der Texte (%s)", (_name, sel) => {
  const v = theme(sel);
  for (const grund of ["--prn-bg-elevated", "--prn-bg"]) {
    it.each(PAARE)(`%s ≥ 4,5:1 (auf ${grund})`, (_n, text, schichten) => {
      let flaeche = farbe(v, `var(${grund})`);
      for (const s of [...schichten].reverse()) flaeche = ueber(farbe(v, s), flaeche);
      const t = farbe(v, text);
      const k = kontrast(t[3] < 1 ? ueber(t, flaeche) : t, flaeche);
      expect(Number(k.toFixed(2))).toBeGreaterThanOrEqual(4.5);
    });
  }
  it("Leitfarbe der Aktion bleibt Deep Azure (hell #061d95, dunkel #4c69eb)", () => {
    expect(v["--prn-action"]).toBe(sel.includes("cu-light") ? "#061d95" : "#4c69eb");
  });
});

describe("Komponenten nutzen die gerechneten Token", () => {
  it("Zeilen-Untertitel mit --prn-label-2, Marken mit den Text-Token je Ton", () => {
    const c = css("composites/composites.css");
    expect(c).toMatch(/\.prn-row-subtitle \{[^}]*color: var\(--prn-label-2\)/);
    for (const [ton, tok] of [["green", "positive"], ["red", "negative"], ["orange", "critical"], ["blue", "info"]]) {
      expect(c).toMatch(new RegExp(`\\.prn-badge\\[data-tone="${ton}"\\] \\{[^}]*color: var\\(--prn-${tok}-text,`));
    }
  });
  it("ShellBar-Zähler auf --prn-danger-fill; Link, Reiter und Anker mit --prn-link bzw. --prn-accent-strong", () => {
    expect(css("composites/appshell.css")).toMatch(/\.prn-shellbar-badge \{[^}]*background: var\(--prn-danger-fill/);
    expect(css("primitives/breadcrumbs.css")).toMatch(/\.prn-link \{[^}]*color: var\(--prn-link\)/);
    expect(css("primitives/navigation.css")).toMatch(/\.prn-tab\[data-selected\] \{[^}]*color: var\(--prn-accent-strong\)/);
    expect(css("data/objectpage.css")).toMatch(/\.prn-op-anchor\[data-selected\] \{[^}]*color: var\(--prn-accent-strong\)/);
  });
  it("Timeline: Zeichen je Status mit --prn-on-<ton>, Avatar mit --prn-tl-avatar-text", () => {
    const t = css("data/timeline.css");
    for (const [st, ton] of [["success", "green"], ["info", "blue"], ["warning", "orange"], ["error", "red"]]) {
      expect(t).toMatch(new RegExp(`\\.prn-tl-node\\[data-status="${st}"\\] \\{[^}]*color: var\\(--prn-on-${ton},`));
    }
    expect(t).toMatch(/\.prn-tl-avatar \{[^}]*color: var\(--prn-tl-avatar-text/);
  });
});
