import { describe, it, expect } from "vitest";
import { scanAnomalies } from "./anomalies";

const now = new Date("2026-06-25T12:00:00Z");

describe("scanAnomalies", () => {
  it("flags #...# placeholders", () => {
    const a = scanAnomalies({ lokationsId: "#parameter1#" }, { now });
    expect(a.some((x) => x.rule === "placeholder" && x.path === "lokationsId")).toBe(true);
  });
  it("flags suspicious chars in strings", () => {
    const a = scanAnomalies({ name2: "Fisch>" }, { now });
    expect(a.some((x) => x.rule === "suspiciousChar")).toBe(true);
  });
  it("flags 00000000 and 1950 defaults", () => {
    const a = scanAnomalies({ kuendigungstermin: "00000000", startdatum: "1950-05-03T13:19:00Z" }, { now });
    expect(a.some((x) => x.rule === "defaultValue")).toBe(true);
    expect(a.some((x) => x.rule === "implausibleDate")).toBe(true);
  });
  it("flags expired gueltigBis but not active enddatum", () => {
    const a = scanAnomalies({ gueltigBis: "2025-10-14T07:52:00Z", enddatum: "2026-12-31T23:00:00Z" }, { now });
    expect(a.some((x) => x.rule === "expired" && x.path === "gueltigBis")).toBe(true);
    expect(a.some((x) => x.rule === "expired" && x.path === "enddatum")).toBe(false);
  });
  it("walks nested arrays/objects with paths", () => {
    const a = scanAnomalies({ content: { OUTBOUND: { vertrag: [{ lokationsId: "#x#" }] } } }, { now });
    expect(a.some((x) => x.path === "content.OUTBOUND.vertrag[0].lokationsId")).toBe(true);
  });
});
