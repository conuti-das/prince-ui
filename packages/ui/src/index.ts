/**
 * prince-ui — Prince-Look React-Komponenten auf React Aria.
 *
 * Wave 1: L1-Primitives. CSS wird über die Bereichsmodule gebündelt
 * (dist/index.css → Import via "@conuti-das/prince-ui/styles.css").
 */

export const PRINCE_UI_VERSION = "0.14.0";

/**
 * Die Prince-Modes. `null` = System folgen (prefers-color-scheme, Fallback Dunkel).
 * `"cu"` bleibt als Alias auf die Dunkel-Ausprägung bestehen (Rückwärtskompatibilität).
 */
export type PrinceTheme =
  | "light"
  | "dark"
  | "cu-dark"
  | "cu-light"
  | "cu";

/**
 * Setzt das Theme am <html>-Element.
 * - `"light"` / `"dark"`       → Hell / Dunkel (neutrale System-Themes: System-Font, System-Farben, Grün)
 * - `"cu-dark"` / `"cu-light"` → CONUTI-CI (Cabinet Grotesk, electric blue) als Dunkel- bzw. Hell-Ausprägung
 * - `"cu"`                     → Alias auf `"cu-dark"`
 * - `null`                     → System folgen (Hell bei OS-Light, sonst Dunkel)
 */
export function setTheme(theme: PrinceTheme | null): void {
  const root = document.documentElement;
  if (theme === null) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/** Liest das aktuell erzwungene Theme oder `null`, wenn dem System gefolgt wird. */
export function getTheme(): PrinceTheme | null {
  return (document.documentElement.getAttribute("data-theme") as PrinceTheme | null) ?? null;
}

export * from "./utils";
export * from "./icons/icons";
export * from "./primitives/size";
export * from "./primitives/forms";
export * from "./primitives/overlays";
export * from "./primitives/navigation";

// Wave 2 — L2-Komposita
export * from "./composites/composites";
export * from "./composites/appshell";
export * from "./launchpad/launchpad";
// Wave 2 — Charts (eigene SVG)
export * from "./charts/charts";
// Wave 2 — L3-Datenschicht
export * from "./data/table";
export * from "./data/filterbar";
export * from "./data/objectpage";
export * from "./data/use-filter-state";
export * from "./data/timeline";

// W1 — weitere Form-Primitives (RadioGroup/CheckboxGroup/NumberField/Slider/ComboBox/Form)
export * from "./primitives/choice";
export * from "./primitives/numeric";
export * from "./primitives/combobox";
export * from "./primitives/form";

// W2 — Collections
export * from "./primitives/collections";
export * from "./primitives/breadcrumbs";
export * from "./primitives/disclosure";
export * from "./primitives/tree";
export * from "./primitives/table-aria";
// W3 — Date & Time
export * from "./primitives/datefields";
export * from "./primitives/calendar";
export * from "./primitives/datepicker";
// W4 — Color
export * from "./primitives/color";
export * from "./primitives/color-pickers";
// W5 — Status & Misc
export * from "./primitives/status";
export * from "./primitives/toast";
export * from "./primitives/dropzone";

// Brand — CONUTI Corporate Elements (Circle Dot, Fine Lines, Resonance Field)
export * from "./brand/brand";

// Liquid-Glass-Optik-Schicht — zuletzt, damit glass.css NACH dem Komponenten-CSS
// gebündelt wird und die opt-in Glas-Klassen (z. B. auf Popover) gewinnen.
export * from "./surfaces/glass";
