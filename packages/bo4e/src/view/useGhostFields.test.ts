import { describe, it, expect } from "vitest";
import { computeGhostFields } from "./useGhostFields";
import type { Bo4eSchema } from "../schema/load-schema";

const schema = {
  fields: { MALO: { a: { translation: "A" }, b: { translation: "B" }, c: { translation: "C" } } },
  enums: {},
  bos: { MALO: { properties: ["b", "zzz_not_in_dict", "a"] } },
} as unknown as Bo4eSchema;

describe("computeGhostFields", () => {
  it("returns unfilled dict keys, ordered by properties∩dict then rest", () => {
    expect(computeGhostFields(schema, "MALO", { a: "x" })).toEqual(["b", "c"]);
  });
  it("never offers a property that is not in the field-dict", () => {
    expect(computeGhostFields(schema, "MALO", {})).not.toContain("zzz_not_in_dict");
    expect(computeGhostFields(schema, "MALO", {})).toEqual(["b", "a", "c"]);
  });
});
