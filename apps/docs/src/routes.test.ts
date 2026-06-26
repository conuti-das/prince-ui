import { describe, it, expect } from "vitest";
import { buildNav } from "./routes";

describe("buildNav", () => {
  it("derives path and title from content file path", () => {
    const nav = buildNav({
      "/content/components/Button.mdx": {},
      "/content/foundations/colors.mdx": {},
    });
    const components = nav.find((g) => g.title === "Components");
    expect(components?.items).toContainEqual({ path: "/components/button", title: "Button" });
    const foundations = nav.find((g) => g.title === "Foundations");
    expect(foundations?.items).toContainEqual({ path: "/foundations/colors", title: "colors" });
  });
});
