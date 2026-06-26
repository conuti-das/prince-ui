import { describe, it, expect } from "vitest";
import { setIn, deleteIn } from "./path";

describe("setIn", () => {
  it("sets a nested object key immutably", () => {
    const o = { a: { b: 1 } };
    const r = setIn(o, ["a", "b"], 2);
    expect(r).toEqual({ a: { b: 2 } });
    expect(o).toEqual({ a: { b: 1 } }); // original untouched
  });
  it("sets a nested array index immutably", () => {
    const o = { xs: [{ v: 1 }, { v: 2 }] };
    const r = setIn(o, ["xs", 1, "v"], 9);
    expect(r).toEqual({ xs: [{ v: 1 }, { v: 9 }] });
  });
  it("creates intermediate objects when missing", () => {
    expect(setIn({}, ["a", "b"], 5)).toEqual({ a: { b: 5 } });
  });
});

describe("deleteIn", () => {
  it("removes a nested object key immutably", () => {
    const o = { a: { b: 1, c: 2 } };
    expect(deleteIn(o, ["a", "b"])).toEqual({ a: { c: 2 } });
    expect(o).toEqual({ a: { b: 1, c: 2 } });
  });
  it("removes an array index immutably", () => {
    const o = { xs: [{ v: 1 }, { v: 2 }, { v: 3 }] };
    expect(deleteIn(o, ["xs", 1])).toEqual({ xs: [{ v: 1 }, { v: 3 }] });
  });
});
