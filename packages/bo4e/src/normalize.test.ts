import { describe, it, expect } from "vitest";
import { normalizeToCDoc } from "./normalize";
import type { CDoc } from "./types";

describe("normalizeToCDoc", () => {
  it("passes a full cDoc through unchanged", () => {
    const doc: CDoc = { id: "x", businessKey: "y", content: { OUTBOUND: { stammdaten: {} } } };
    expect(normalizeToCDoc(doc)).toBe(doc);
  });
  it("wraps a single BO under OUTBOUND grouped by boTyp", () => {
    const c = normalizeToCDoc({ boTyp: "MARKTLOKATION", marktlokationsId: "1" });
    expect(c.content.OUTBOUND?.stammdaten.MARKTLOKATION?.length).toBe(1);
  });
  it("groups an array of BOs by boTyp", () => {
    const c = normalizeToCDoc([{ boTyp: "VERTRAG" }, { boTyp: "VERTRAG" }, { boTyp: "MARKTLOKATION" }]);
    expect(c.content.OUTBOUND?.stammdaten.VERTRAG?.length).toBe(2);
    expect(c.content.OUTBOUND?.stammdaten.MARKTLOKATION?.length).toBe(1);
  });
});
