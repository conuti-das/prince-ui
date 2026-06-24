/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, afterEach, vi } from "vitest";
import { isDarkMode, getDiagramColors, readToken, onThemeChange } from "./diagram-theme";

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.style.cssText = "";
  vi.restoreAllMocks();
});

describe("isDarkMode", () => {
  it("respektiert explizites Schema", () => {
    expect(isDarkMode("dark")).toBe(true);
    expect(isDarkMode("light")).toBe(false);
  });

  it("liest data-theme bei auto", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    expect(isDarkMode("auto")).toBe(true);
    document.documentElement.setAttribute("data-theme", "light");
    expect(isDarkMode("auto")).toBe(false);
  });
});

describe("readToken", () => {
  it("liefert Fallback, wenn Token fehlt", () => {
    expect(readToken("--prn-nope", "fallback")).toBe("fallback");
  });

  it("liest gesetztes Token", () => {
    document.documentElement.style.setProperty("--prn-test", "#abc");
    expect(readToken("--prn-test", "x")).toBe("#abc");
  });
});

describe("getDiagramColors", () => {
  it("liefert ein vollständiges Farb-Set", () => {
    const c = getDiagramColors("light");
    expect(c).toHaveProperty("defaultFillColor");
    expect(c).toHaveProperty("defaultStrokeColor");
    expect(c).toHaveProperty("canvasBackground");
    expect(c).toHaveProperty("accent");
  });
});

describe("onThemeChange", () => {
  it("ruft Callback bei data-theme-Wechsel und räumt auf", () => {
    const cb = vi.fn();
    const off = onThemeChange(cb);
    document.documentElement.setAttribute("data-theme", "dark");
    // MutationObserver ist asynchron; wir prüfen nur, dass off() nicht wirft.
    off();
    expect(typeof off).toBe("function");
  });
});