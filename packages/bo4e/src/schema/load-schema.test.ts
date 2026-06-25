import { describe, it, expect } from "vitest";
import { loadBo4eSchema, resolveField } from "./load-schema";
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
});
