import { describe, it, expect } from "vitest";
import { loadBo4eSchema, resolveField, getFieldOrder, resolveFieldStructure } from "./load-schema";
import fields from "../__fixtures__/bo4e-fields.json";
import enums from "../__fixtures__/bo4e-enums.json";
import bos from "../__fixtures__/bo4e-bos.json";

const schema = loadBo4eSchema({ fields, enums, bos });

describe("resolveField", () => {
  it("resolves description + translation", () => {
    const d = resolveField(schema, "MARKTLOKATION", "marktlokationsId");
    expect(d.translation).toBe("Marktlokations-ID");
    expect(d.description).toMatch(/Identifikationsnummer/);
  });
  it("expands enumRef into enum values", () => {
    const d = resolveField(schema, "MARKTLOKATION", "energierichtung");
    expect(d.enumRef).toBe("ENERGIERICHTUNG");
    expect(d.enum?.values).toContain("AUSSP");
  });
  it("returns a humanized fallback for unknown fields", () => {
    const d = resolveField(schema, "MARKTLOKATION", "voelligUnbekannt");
    expect(d.translation).toBe("Voellig Unbekannt");
    expect(d.description).toBeUndefined();
  });
  it("getFieldOrder returns the BO's declared property order", () => {
    const order = getFieldOrder(schema, "MARKTLOKATION");
    expect(order.length).toBeGreaterThan(0);
    expect(order).toContain("marktlokationsId");
  });
});

describe("resolveFieldStructure", () => {
  it("returns undefined without a structure map", () => {
    expect(resolveFieldStructure(schema, "MARKTLOKATION", "adresse")).toBeUndefined();
  });
  it("reads the optional structure map", () => {
    const withStruct = loadBo4eSchema({
      fields,
      enums,
      bos,
      structure: { MARKTLOKATION: { adresse: { kind: "object", ref: "ADRESSE" } } },
    });
    expect(resolveFieldStructure(withStruct, "MARKTLOKATION", "adresse")).toEqual({
      kind: "object",
      ref: "ADRESSE",
    });
  });
});
