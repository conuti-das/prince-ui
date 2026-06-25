/**
 * prince-ui — Prince-Look React-Komponenten auf React Aria.
 *
 * Wave 1: L1-Primitives. CSS wird über die Bereichsmodule gebündelt
 * (dist/index.css → Import via "prince-ui/styles.css").
 */

export const PRINCE_UI_VERSION = "0.7.0";

/** Die drei Prince-Modes. `null` = System folgen (prefers-color-scheme, Fallback Dark). */
export type PrinceTheme = "light" | "dark" | "cu";

/**
 * Setzt das Theme am <html>-Element.
 * - `"light"` / `"dark"` → Prince Light / Prince Dark (Apple-Optik: SF-Fonts, Apple-System-Farben, Grün)
 * - `"cu"`               → CONUTI Community-Styling (CI-Grün)
 * - `null`               → System folgen (Prince Light bei OS-Light, sonst Prince Dark)
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
export * from "./primitives/forms";
export * from "./primitives/overlays";
export * from "./primitives/navigation";

// Wave 2 — L2-Komposita
export * from "./composites/composites";
export * from "./composites/appshell";
// Wave 2 — Charts (eigene SVG)
export * from "./charts/charts";
// Wave 2 — L3-Datenschicht
export * from "./data/table";
export * from "./data/filterbar";
export * from "./data/objectpage";
export * from "./data/use-filter-state";

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

// Liquid-Glass-Optik-Schicht — zuletzt, damit glass.css NACH dem Komponenten-CSS
// gebündelt wird und die opt-in Glas-Klassen (z. B. auf Popover) gewinnen.
export * from "./surfaces/glass";
