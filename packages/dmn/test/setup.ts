import "@testing-library/jest-dom/vitest";

// jsdom hat keinen ResizeObserver / scrollTo — Stubs für AnalyticalTable/dmn-js.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error jsdom global
globalThis.ResizeObserver = globalThis.ResizeObserver ?? ResizeObserverStub;
// @ts-expect-error jsdom global
Element.prototype.scrollTo = Element.prototype.scrollTo ?? (() => {});
