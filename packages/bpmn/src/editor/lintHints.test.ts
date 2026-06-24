import { describe, it, expect } from "vitest";
import { lintHint } from "./lintHints";

describe("lintHint", () => {
  it("returns a curated hint for known rules", () => {
    expect(lintHint("label-required").title).toBe("Beschriftung fehlt");
    expect(lintHint("no-disconnected").title).toBe("Element nicht verbunden");
  });
  it("falls back for unknown rules", () => {
    expect(lintHint("whatever").title).toBe("Validierungshinweis");
  });
});
