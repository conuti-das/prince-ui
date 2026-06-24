import { describe, it, expect } from "vitest";
import { lintFeel, parseInputValues } from "./feel-linter";

describe("parseInputValues", () => {
  it("extrahiert quotierte Werte", () => {
    expect(parseInputValues('"Ja","Nein"')).toEqual(["Ja", "Nein"]);
  });
  it("liefert leeres Array bei leerem String", () => {
    expect(parseInputValues("")).toEqual([]);
  });
});

describe("lintFeel", () => {
  it("akzeptiert leere Zelle als 'any'", () => {
    expect(lintFeel("")).toEqual({ valid: true, type: "any" });
    expect(lintFeel("-")).toEqual({ valid: true, type: "any" });
  });

  it("erkennt String", () => {
    expect(lintFeel('"Ja"')).toEqual({ valid: true, type: "string" });
  });

  it("erkennt String-Liste", () => {
    expect(lintFeel('"Ja","Nein"')).toEqual({ valid: true, type: "string list" });
  });

  it("erkennt Zahlen", () => {
    expect(lintFeel("42")).toEqual({ valid: true, type: "number" });
    expect(lintFeel("-3.14")).toEqual({ valid: true, type: "number" });
  });

  it("erkennt Zahlenbereiche und Vergleiche", () => {
    expect(lintFeel("[1..100]").type).toBe("number range");
    expect(lintFeel("(0..10)").type).toBe("number range");
    expect(lintFeel(">= 5").type).toBe("number range");
    expect(lintFeel("< -2").type).toBe("number range");
  });

  it("erkennt Boolean", () => {
    expect(lintFeel("true").type).toBe("boolean");
    expect(lintFeel("FALSE").type).toBe("boolean");
  });

  it("erkennt Funktionen / not / contains als expression", () => {
    expect(lintFeel('not("X")').type).toBe("expression");
    expect(lintFeel('contains(x,"Y")').type).toBe("expression");
    expect(lintFeel('date("2026-01-01")').type).toBe("expression");
  });

  it("markiert unbekannten Ausdruck als ungültig", () => {
    const r = lintFeel("@@@");
    expect(r.valid).toBe(false);
    expect(r.message).toContain("Unbekannter");
  });

  it("validiert String gegen inputValues (gültig)", () => {
    const r = lintFeel('"Ja"', { inputValues: ['"Ja"', '"Nein"'] });
    expect(r.valid).toBe(true);
  });

  it("validiert String gegen inputValues (ungültig)", () => {
    const r = lintFeel('"Vielleicht"', { inputValues: ['"Ja"', '"Nein"'] });
    expect(r.valid).toBe(false);
    expect(r.message).toContain("nicht in den erlaubten");
  });

  it("validiert String-Liste gegen inputValues (ungültig)", () => {
    const r = lintFeel('"Ja","X"', { inputValues: ['"Ja"', '"Nein"'] });
    expect(r.valid).toBe(false);
    expect(r.message).toContain("Nicht erlaubt: X");
  });

  it("ignoriert inputValues, wenn leer", () => {
    expect(lintFeel('"Egal"', { inputValues: [] }).valid).toBe(true);
  });
});
