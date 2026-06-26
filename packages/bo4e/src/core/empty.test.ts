import { describe, it, expect } from "vitest";
import { isDeepEmpty } from "./empty";

describe("isDeepEmpty", () => {
  it("treats null/undefined/empty containers as empty", () => {
    expect(isDeepEmpty(null)).toBe(true);
    expect(isDeepEmpty(undefined)).toBe(true);
    expect(isDeepEmpty([])).toBe(true);
    expect(isDeepEmpty({})).toBe(true);
    expect(isDeepEmpty({ a: null, b: { c: null } })).toBe(true);
    expect(isDeepEmpty([{ x: null }, null])).toBe(true);
  });

  it("does NOT treat false/0/empty-string as empty (falsy trap)", () => {
    expect(isDeepEmpty(false)).toBe(false);
    expect(isDeepEmpty(0)).toBe(false);
    expect(isDeepEmpty("")).toBe(false);
    expect(isDeepEmpty({ unterbrechbar: false })).toBe(false);
    expect(isDeepEmpty({ kosten: 0 })).toBe(false);
  });

  it("treats filled scalars and deep-filled trees as non-empty", () => {
    expect(isDeepEmpty("KL")).toBe(false);
    expect(isDeepEmpty(["KL"])).toBe(false);
    expect(isDeepEmpty({ a: { b: { c: "x" } } })).toBe(false);
  });
});
