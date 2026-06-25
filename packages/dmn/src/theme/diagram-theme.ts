/**
 * Theme-Bridge für dmn-js (DRD-SVG-Ansicht) — kolokierte Kopie des bpmn-Pakets
 * (bewusst kein geteiltes 4. Paket). Liest prince-ui-Tokens (`--prn-*`) und
 * hört auf `data-theme`.
 */

import type { DiagramColorScheme } from "../types";

export interface DiagramColors {
  defaultFillColor: string;
  defaultStrokeColor: string;
  defaultLabelColor: string;
  canvasBackground: string;
  accent: string;
}

export function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined" || !document?.documentElement) return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

export function isDarkMode(scheme: DiagramColorScheme = "auto"): boolean {
  if (scheme === "dark") return true;
  if (scheme === "light") return false;
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    // CU ist ein dunkler Surface (--prn-bg ~ #222a31) → wie dark behandeln,
    // damit Diagramm-Shapes nicht hell-auf-dunkel rendern.
    if (attr === "dark" || attr === "cu") return true;
    if (attr === "light") return false;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

export function getDiagramColors(scheme: DiagramColorScheme = "auto"): DiagramColors {
  const dark = isDarkMode(scheme);
  return {
    defaultFillColor: readToken("--prn-bg-elevated", dark ? "#1c1c1e" : "#ffffff"),
    defaultStrokeColor: readToken("--prn-label", dark ? "#e4e4e6" : "#1d1d1f"),
    defaultLabelColor: readToken("--prn-label", dark ? "#e4e4e6" : "#1d1d1f"),
    canvasBackground: readToken("--prn-bg", dark ? "#000000" : "#f5f5f7"),
    accent: readToken("--prn-accent", "#a0d22b"),
  };
}

export function onThemeChange(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.MutationObserver) return () => {};
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === "data-theme") {
        onChange();
        return;
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  let media: MediaQueryList | undefined;
  if (window.matchMedia) {
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener?.("change", onChange);
  }

  return () => {
    observer.disconnect();
    media?.removeEventListener?.("change", onChange);
  };
}
