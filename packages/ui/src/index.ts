/**
 * prince-ui — Prince-Look React-Komponenten auf React Aria.
 *
 * Wave 1: L1-Primitives. CSS wird über die Bereichsmodule gebündelt
 * (dist/index.css → Import via "prince-ui/styles.css").
 */

export const PRINCE_UI_VERSION = "0.2.0";

/** Setzt das Theme am <html>-Element. `null` → System (prefers-color-scheme). */
export function setTheme(theme: "light" | "dark" | null): void {
  const root = document.documentElement;
  if (theme === null) {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

export * from "./utils";
export * from "./primitives/forms";
export * from "./primitives/overlays";
export * from "./primitives/navigation";

// Wave 2 — L2-Komposita
export * from "./composites/composites";
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
