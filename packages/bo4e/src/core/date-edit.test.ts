import { describe, it, expect } from "vitest";
import { isoToBerlin, berlinToIso } from "./date-edit";

describe("date-edit (Berlin <-> ISO-UTC)", () => {
  it("ISO -> Berlin keeps the absolute instant (summer = UTC+2)", () => {
    const z = isoToBerlin("2026-05-06T09:46:00Z");
    expect(z.hour).toBe(11);
    expect(z.timeZone).toBe("Europe/Berlin");
  });
  it("round-trips back to normalized ISO-UTC", () => {
    expect(berlinToIso(isoToBerlin("2026-05-06T09:46:00Z"))).toBe("2026-05-06T09:46:00Z");
  });
  it("handles the winter midnight boundary", () => {
    const z = isoToBerlin("2022-12-31T23:00:00Z");
    expect(z.hour).toBe(0);
    expect(z.day).toBe(1);
    expect(berlinToIso(z)).toBe("2022-12-31T23:00:00Z");
  });
});
