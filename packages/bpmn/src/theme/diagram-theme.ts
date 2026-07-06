/**
 * Theme-Bridge für bpmn-js/diagram-js.
 *
 * SVG-Diagramme von bpmn.io werden NICHT über CSS gethemt, sondern über die
 * Renderer-Config (`bpmnRenderer`/`textRenderer`). Diese Bridge liest die
 * prince-ui-Tokens (`--prn-*`) vom Dokument und liefert konkrete Farbwerte —
 * ersetzt das frühere `data-sap-theme`-Coupling aus finops/maco-process-studio.
 *
 * Kolokiert je Paket (kein geteiltes 4. Paket) — das dmn-Paket hält eine Kopie.
 */

import type { DiagramColorScheme } from "../types";

export interface DiagramColors {
  /** Füllfarbe der Shapes */
  defaultFillColor: string;
  /** Konturfarbe der Shapes/Connections */
  defaultStrokeColor: string;
  /** Textfarbe der Labels */
  defaultLabelColor: string;
  /** Canvas-Hintergrund (für den umgebenden Container) */
  canvasBackground: string;
  /** Akzentfarbe (Selektion/aktive Elemente) */
  accent: string;
}

/** Liest einen CSS-Custom-Property-Wert vom `:root`, mit Fallback. */
export function readToken(name: string, fallback: string): string {
  if (typeof window === "undefined" || !document?.documentElement) return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** Ermittelt, ob der Dark-Mode aktiv ist (data-theme bzw. System). */
export function isDarkMode(scheme: DiagramColorScheme = "auto"): boolean {
  if (scheme === "dark") return true;
  if (scheme === "light") return false;
  if (typeof document !== "undefined") {
    const attr = document.documentElement.getAttribute("data-theme");
    // CU Dunkel (Alias "cu") ist ein dunkler Surface → wie dark behandeln.
    if (attr === "dark" || attr === "cu" || attr === "cu-dark") return true;
    if (attr === "light" || attr === "cu-light") return false;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return false;
}

/**
 * Liefert die Diagrammfarben aus den prince-ui-Tokens.
 * Fallbacks entsprechen den Token-Defaults aus `packages/tokens/src/tokens.css`.
 */
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

/**
 * Beobachtet `data-theme`-Wechsel am `<html>` und ruft `onChange` auf.
 * Gibt eine Cleanup-Funktion zurück.
 */
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
