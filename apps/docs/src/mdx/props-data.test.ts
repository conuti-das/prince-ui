import { describe, it, expect } from "vitest";
import { selectProps } from "./props-data";

const DATA = { Button: { props: [{ name: "variant", type: '"filled" | "tinted"', required: false, defaultValue: "filled", description: "" }] } };

describe("selectProps", () => {
  it("returns the props array for a known component", () => {
    expect(selectProps(DATA, "Button")[0].name).toBe("variant");
  });
  it("returns empty for unknown component", () => {
    expect(selectProps(DATA, "Nope")).toEqual([]);
  });
});
