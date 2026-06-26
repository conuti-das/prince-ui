import { describe, it, expect } from "vitest";
import { mergeFieldDicts } from "./merge";

describe("mergeFieldDicts", () => {
  it("keeps curated field docs over generated ones", () => {
    const generated = { MALO: { a: { translation: "gen-A" } } };
    const curated = { MALO: { a: { translation: "cur-A" } } };
    expect(mergeFieldDicts(generated, curated).MALO.a).toEqual({ translation: "cur-A" });
  });

  it("adds generated fields the curated type lacks", () => {
    const generated = { MALO: { a: { translation: "A" }, b: { translation: "B" } } };
    const curated = { MALO: { a: { translation: "cur-A" } } };
    expect(Object.keys(mergeFieldDicts(generated, curated).MALO).sort()).toEqual(["a", "b"]);
  });

  it("adds generated types the curated dict lacks (e.g. ZEITRAUM)", () => {
    const generated = { ZEITRAUM: { zeiteinheit: { enumRef: "ZEITEINHEIT" } } };
    const curated = { MALO: { a: { translation: "A" } } };
    const merged = mergeFieldDicts(generated, curated);
    expect(merged.ZEITRAUM.zeiteinheit).toEqual({ enumRef: "ZEITEINHEIT" });
    expect(merged.MALO.a).toEqual({ translation: "A" });
  });
});
