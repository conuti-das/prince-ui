import { describe, it, expect } from "vitest";
import { formatDateDE, toUtcLabel, zonedLabelWithTz, isIsoDate } from "./datetime";

describe("datetime (Europe/Berlin)", () => {
  it("formats summer timestamp as MESZ (UTC+2)", () => {
    expect(formatDateDE("2026-05-06T09:46:00Z", { withTime: true })).toBe("06.05.2026 11:46");
  });
  it("shifts day/year across midnight boundary (winter, UTC+1)", () => {
    expect(formatDateDE("2022-12-31T23:00:00Z", { withTime: true })).toBe("01.01.2023 00:00");
  });
  it("date-only omits time", () => {
    expect(formatDateDE("2026-07-09T22:00:00Z", { withTime: false })).toBe("10.07.2026");
  });
  it("toUtcLabel returns the original Z string normalized", () => {
    expect(toUtcLabel("2026-05-06T09:46:00Z")).toBe("2026-05-06T09:46:00Z");
  });
  it("zonedLabelWithTz appends a timezone suffix", () => {
    expect(zonedLabelWithTz("2026-05-06T09:46:00Z")).toMatch(/11:46/);
    expect(zonedLabelWithTz("2026-05-06T09:46:00Z")).toMatch(/MESZ|GMT\+2|UTC\+2/);
  });
  it("isIsoDate detects ISO timestamps", () => {
    expect(isIsoDate("2026-05-06T09:46:00Z")).toBe(true);
    expect(isIsoDate("E03")).toBe(false);
    expect(isIsoDate(null)).toBe(false);
  });
});
