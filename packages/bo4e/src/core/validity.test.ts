import { describe, it, expect } from "vitest";
import { validityStatus } from "./validity";

const now = new Date("2026-06-25T12:00:00Z");

describe("validityStatus", () => {
  it("abgelaufen when end is in the past", () => {
    expect(validityStatus({ enddatum: "2025-12-31T23:00:00Z" }, now)).toBe("abgelaufen");
  });
  it("laeuftBald when end within 30 days", () => {
    expect(validityStatus({ enddatum: "2026-07-01T04:00:00Z" }, now)).toBe("laeuftBald");
  });
  it("aktiv when end far in future", () => {
    expect(validityStatus({ enddatum: "2026-12-31T23:00:00Z" }, now)).toBe("aktiv");
  });
  it("zukuenftig when start is in the future", () => {
    expect(validityStatus({ startdatum: "2027-01-01T00:00:00Z" }, now)).toBe("zukuenftig");
  });
  it("aktiv with no dates", () => {
    expect(validityStatus({}, now)).toBe("aktiv");
  });
});
