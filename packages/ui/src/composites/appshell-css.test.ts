import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/composites/appshell.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("appshell.css", () => {
  it("Seitenleiste am Desktop ohne backdrop-filter (nichts liegt darunter; Kachel-Artefakte in Chromium)", () => {
    const desktop = /@media \(min-width: 768px\)\s*\{([\s\S]*?)\}\s*\}/.exec(css);
    expect(desktop).not.toBeNull();
    expect(desktop![1]).toMatch(/\.prn-appshell-sidebar\.prn-glass\s*\{[^}]*(^|[^-])backdrop-filter:\s*none/);
  });

  it("Off-canvas am Telefon bleibt Glas (keine Regel nimmt dort den Filter weg)", () => {
    const phone = /@media \(max-width: 767px\)\s*\{([\s\S]*?)\n\}/.exec(css);
    expect(phone).not.toBeNull();
    expect(phone![1]).not.toMatch(/backdrop-filter:\s*none/);
  });
});
