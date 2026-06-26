import { describe, it, expect } from "vitest";
import { itemId, seedTree } from "./array-ids";

describe("array ids", () => {
  it("assigns a stable id per object once, surviving identity", () => {
    const item = { v: 1 };
    const tree = { xs: [item] };
    seedTree(tree);
    const id1 = itemId(item);
    seedTree(tree); // re-seed must not change existing ids
    expect(itemId(item)).toBe(id1);
    expect(typeof id1).toBe("string");
  });

  it("distinct objects get distinct ids", () => {
    const a = { v: 1 };
    const b = { v: 1 };
    seedTree({ xs: [a, b] });
    expect(itemId(a)).not.toBe(itemId(b));
  });

  it("seeds the full tree regardless of depth", () => {
    const deep = { v: 9 };
    seedTree({ a: [{ b: [deep] }] });
    expect(itemId(deep)).toBeDefined();
  });
});
