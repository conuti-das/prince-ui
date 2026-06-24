/**
 * Datenmodell der DMN-Entscheidungstabelle — geteilter Vertrag zwischen dem
 * einstiegsfreundlichen Tabelleneditor (⑤) und dem dmn-js-Expertenmodus (⑥),
 * damit das Umschalten verlustfrei bleibt.
 *
 * Anders als der maco-process-studio-Prototyp (lossy XML-Patch) wird dieses
 * Modell verlustfrei über `dmn-moddle` serialisiert (inkl. Spaltenänderungen).
 */

export type HitPolicy =
  | "UNIQUE"
  | "FIRST"
  | "PRIORITY"
  | "ANY"
  | "COLLECT"
  | "RULE ORDER"
  | "OUTPUT ORDER";

/** COLLECT-Aggregation (nur bei hitPolicy === "COLLECT"). */
export type Aggregation = "SUM" | "MIN" | "MAX" | "COUNT";

export type DmnColumnKind = "input" | "output";

export interface DmnColumn {
  id: string;
  /** Anzeigename der Spalte (Input: label, Output: name) */
  label: string;
  /** FEEL-Input-Expression (Input) bzw. Output-Name */
  expression: string;
  kind: DmnColumnKind;
  /** FEEL-Typ, z. B. string | number | boolean | date */
  typeRef: string;
  /** optionale erlaubte Werte (für Validierung/Autocomplete) */
  inputValues?: string[];
}

export interface DmnRow {
  id: string;
  /** colId -> FEEL-Entry */
  cells: Record<string, string>;
  annotation?: string;
}

export interface DmnTableModel {
  /** id der Decision */
  id: string;
  name: string;
  hitPolicy: HitPolicy;
  aggregation?: Aggregation;
  columns: DmnColumn[];
  rows: DmnRow[];
}

/** Ergebnis einer FEEL-Lint-Prüfung pro Zelle. */
export interface FeelLintResult {
  valid: boolean;
  message?: string;
}

/** Light/Dark-Steuerung. */
export type DiagramColorScheme = "auto" | "light" | "dark";

/**
 * Optionales Zell-Plugin (z. B. Prüfidentifikator-Autocomplete) — hält die
 * Pakete frei von MaCo-Domänenwissen.
 */
export interface DmnCellPlugin {
  /** trifft zu, wenn die Spalte dieses Plugin nutzen soll */
  matches(column: DmnColumn): boolean;
  /** liefert das Edit-Control für die Zelle */
  renderEditor(props: {
    value: string;
    onChange(next: string): void;
    onCommit(): void;
    onCancel(): void;
    column: DmnColumn;
  }): import("react").ReactNode;
}
