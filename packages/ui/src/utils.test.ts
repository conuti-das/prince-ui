import { describe, it, expect } from "vitest";
import { cx } from "./utils";

describe("cx", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cx("a", false, "b", undefined, "c")).toBe("a b c");
  });
});
