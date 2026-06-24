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

// TanStack Virtual misst per offsetWidth/offsetHeight — in jsdom immer 0. Ohne
// messbare Höhe rendert der Virtualizer keine Body-Zeilen; daher stubben, damit
// die DMN-Tabellenzeilen im Test sichtbar werden.
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get() {
    return 600;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get() {
    return 800;
  },
});
