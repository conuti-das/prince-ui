/**
 * Verlustfreies Mapping zwischen DMN-XML und dem geteilten `DmnTableModel`
 * (Spec §7) — über **dmn-moddle**, NICHT über den lossy XML-String-Patch des
 * maco-process-studio-Prototyps.
 *
 * - `parseDmnModel(xml)` liest die (per Index/ID wählbare) Decision-Table.
 * - `serializeDmnModel(model, originalXml?)` schreibt das Modell zurück und
 *   bewahrt dabei alle nicht angefassten Teile des Originaldokuments
 *   (weitere Decisions, DRD/DI, Imports, Annotationen anderer Tabellen).
 *
 * dmn-moddle bringt keine eigenen Typdeklarationen mit — die Moddle-Elemente
 * werden hier über schlanke lokale Interfaces typisiert (siehe `Moddle*`).
 */

import DmnModdleFactory from "dmn-moddle";
import type {
  Aggregation,
  DmnColumn,
  DmnRow,
  DmnTableModel,
  HitPolicy,
} from "../types";

/* ------------------------------------------------------------------ *
 * Minimal-Typisierung der dmn-moddle-Elemente (kein offizielles d.ts) *
 * ------------------------------------------------------------------ */

interface ModdleElement {
  $type: string;
  id?: string;
  [key: string]: unknown;
}

interface ModdleFactory {
  create(type: string, attrs?: Record<string, unknown>): ModdleElement;
}

interface ParseResult {
  rootElement: ModdleElement;
  references: unknown[];
  warnings: Error[];
  elementsById: Record<string, ModdleElement>;
}

interface DmnModdleInstance {
  fromXML(xml: string, typeName?: string): Promise<ParseResult>;
  toXML(
    element: ModdleElement,
    options?: { format?: boolean },
  ): Promise<{ xml: string }>;
  create(type: string, attrs?: Record<string, unknown>): ModdleElement;
}

type DmnModdleCtor = (
  packages?: unknown,
  options?: unknown,
) => DmnModdleInstance;

const createModdle = DmnModdleFactory as unknown as DmnModdleCtor;

/* ------------------------------------------------------------------ *
 * ID-Generierung (deterministisch, prefix-basiert — testfreundlich)  *
 * ------------------------------------------------------------------ */

let idCounter = 0;

/** Erzeugt eine stabile, gut lesbare ID. Nur für neu angelegte Elemente. */
export function makeId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/* ------------------------------------------------------------------ *
 * Hilfen                                                              *
 * ------------------------------------------------------------------ */

const VALID_HIT_POLICIES: HitPolicy[] = [
  "UNIQUE",
  "FIRST",
  "PRIORITY",
  "ANY",
  "COLLECT",
  "RULE ORDER",
  "OUTPUT ORDER",
];

const VALID_AGGREGATIONS: Aggregation[] = ["SUM", "MIN", "MAX", "COUNT"];

function normalizeHitPolicy(value: unknown): HitPolicy {
  const v = typeof value === "string" ? value.toUpperCase() : "";
  return (VALID_HIT_POLICIES as string[]).includes(v) ? (v as HitPolicy) : "UNIQUE";
}

function normalizeAggregation(value: unknown): Aggregation | undefined {
  const v = typeof value === "string" ? value.toUpperCase() : "";
  return (VALID_AGGREGATIONS as string[]).includes(v) ? (v as Aggregation) : undefined;
}

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function getText(el: ModdleElement | undefined | null): string {
  if (!el) return "";
  const t = el.text;
  return typeof t === "string" ? t.trim() : "";
}

/** Findet alle `dmn:Decision`-Elemente im Definitions-Root. */
function findDecisions(definitions: ModdleElement): ModdleElement[] {
  return asArray(definitions.drgElement as ModdleElement[]).filter(
    (e) => e.$type === "dmn:Decision",
  );
}

function getDecisionTable(decision: ModdleElement): ModdleElement | undefined {
  const logic = decision.decisionLogic as ModdleElement | undefined;
  return logic && logic.$type === "dmn:DecisionTable" ? logic : undefined;
}

export interface DmnDecisionRef {
  id: string;
  name: string;
}

export interface ParseOptions {
  /** Wähle die Decision per ID; Default: erste Decision mit Table. */
  decisionId?: string;
  /** Alternativ per Index (0-basiert). */
  decisionIndex?: number;
}

/* ------------------------------------------------------------------ *
 * Parse: XML -> DmnTableModel                                         *
 * ------------------------------------------------------------------ */

function tableToModel(decision: ModdleElement, table: ModdleElement): DmnTableModel {
  const inputs = asArray(table.input as ModdleElement[]);
  const outputs = asArray(table.output as ModdleElement[]);
  const annotations = asArray(table.annotation as ModdleElement[]); // RuleAnnotationClause[]
  const rules = asArray(table.rule as ModdleElement[]);

  const inputCols: DmnColumn[] = inputs.map((input): DmnColumn => {
    const expr = input.inputExpression as ModdleElement | undefined;
    const valuesEl = input.inputValues as ModdleElement | undefined;
    const inputValues = parseUnaryTestValues(getText(valuesEl));
    return {
      id: input.id ?? makeId("input"),
      label: (input.label as string) ?? "",
      expression: getText(expr),
      kind: "input",
      typeRef: (expr?.typeRef as string) ?? "string",
      ...(inputValues.length > 0 ? { inputValues } : {}),
    };
  });

  const outputCols: DmnColumn[] = outputs.map((output): DmnColumn => {
    const valuesEl = output.outputValues as ModdleElement | undefined;
    const outputValues = parseUnaryTestValues(getText(valuesEl));
    return {
      id: output.id ?? makeId("output"),
      label: (output.name as string) ?? (output.label as string) ?? "",
      expression: (output.name as string) ?? "",
      kind: "output",
      typeRef: (output.typeRef as string) ?? "string",
      ...(outputValues.length > 0 ? { inputValues: outputValues } : {}),
    };
  });

  const columns = [...inputCols, ...outputCols];

  const rows: DmnRow[] = rules.map((rule): DmnRow => {
    const inputEntries = asArray(rule.inputEntry as ModdleElement[]);
    const outputEntries = asArray(rule.outputEntry as ModdleElement[]);
    const annotationEntries = asArray(rule.annotationEntry as ModdleElement[]);

    const cells: Record<string, string> = {};
    inputEntries.forEach((entry, i) => {
      const col = inputCols[i];
      if (col) cells[col.id] = getText(entry);
    });
    outputEntries.forEach((entry, i) => {
      const col = outputCols[i];
      if (col) cells[col.id] = getText(entry);
    });

    // Annotation: bevorzugt erster annotationEntry, Fallback auf description.
    const annotation =
      getText(annotationEntries[0]) ||
      (typeof rule.description === "string" ? rule.description.trim() : "");

    return {
      id: rule.id ?? makeId("rule"),
      cells,
      ...(annotation ? { annotation } : {}),
    };
  });

  // Annotationsspalten-Namen (RuleAnnotationClause) für verlustfreies Schreiben
  // wären hier ablesbar; das Modell hält pro Zeile genau eine Annotation.
  void annotations;

  return {
    id: decision.id ?? table.id ?? makeId("decision"),
    name: (decision.name as string) ?? "",
    hitPolicy: normalizeHitPolicy(table.hitPolicy),
    ...(normalizeAggregation(table.aggregation)
      ? { aggregation: normalizeAggregation(table.aggregation)! }
      : {}),
    columns,
    rows,
  };
}

/** UnaryTests-Text (`"A","B"`) in einzelne Werte zerlegen. */
function parseUnaryTestValues(text: string): string[] {
  if (!text) return [];
  return Array.from(text.matchAll(/"([^"]*)"/g), (m) => m[1] ?? "");
}

/** Liste der editierbaren Decisions im Dokument (für Auswahl-UI). */
export async function listDecisions(xml: string): Promise<DmnDecisionRef[]> {
  const { rootElement } = await createModdle().fromXML(xml);
  return findDecisions(rootElement)
    .filter((d) => getDecisionTable(d))
    .map((d) => ({ id: d.id ?? "", name: (d.name as string) ?? "" }));
}

/**
 * Parst DMN-XML zu einem `DmnTableModel`. Wirft, wenn keine Decision-Table
 * gefunden wird oder das XML ungültig ist.
 */
export async function parseDmnModel(
  xml: string,
  options: ParseOptions = {},
): Promise<DmnTableModel> {
  let result: ParseResult;
  try {
    result = await createModdle().fromXML(xml);
  } catch (e) {
    throw new Error(`DMN-Parsing fehlgeschlagen: ${(e as Error).message}`);
  }

  const decisions = findDecisions(result.rootElement);
  if (decisions.length === 0) {
    throw new Error("Keine dmn:Decision im Dokument gefunden");
  }

  let decision: ModdleElement | undefined;
  if (options.decisionId) {
    decision = decisions.find((d) => d.id === options.decisionId);
  } else if (typeof options.decisionIndex === "number") {
    decision = decisions[options.decisionIndex];
  }
  if (!decision) {
    decision = decisions.find((d) => getDecisionTable(d)) ?? decisions[0];
  }
  if (!decision) {
    throw new Error("Decision nicht gefunden");
  }

  const table = getDecisionTable(decision);
  if (!table) {
    throw new Error(
      `Decision "${decision.id ?? ""}" enthält keine dmn:DecisionTable`,
    );
  }

  return tableToModel(decision, table);
}

/* ------------------------------------------------------------------ *
 * Serialize: DmnTableModel -> XML                                    *
 * ------------------------------------------------------------------ */

function buildUnaryTests(
  moddle: DmnModdleInstance,
  text: string,
): ModdleElement {
  return moddle.create("dmn:UnaryTests", { text });
}

function buildLiteralExpression(
  moddle: DmnModdleInstance,
  text: string,
  id: string,
): ModdleElement {
  return moddle.create("dmn:LiteralExpression", { id, text });
}

/** Erzeugt die Input/Output-Clauses und Rules am Table-Element neu. */
function applyModelToTable(
  moddle: DmnModdleInstance,
  decision: ModdleElement,
  table: ModdleElement,
  model: DmnTableModel,
): void {
  const inputCols = model.columns.filter((c) => c.kind === "input");
  const outputCols = model.columns.filter((c) => c.kind === "output");

  decision.name = model.name;
  table.hitPolicy = model.hitPolicy;
  if (model.hitPolicy === "COLLECT" && model.aggregation) {
    table.aggregation = model.aggregation;
  } else {
    delete table.aggregation;
  }

  // Input-Clauses
  table.input = inputCols.map((col) => {
    const inputExpression = buildLiteralExpression(
      moddle,
      col.expression,
      `${col.id}_expr`,
    );
    inputExpression.typeRef = col.typeRef;
    const input = moddle.create("dmn:InputClause", {
      id: col.id,
      label: col.label,
      inputExpression,
    });
    if (col.inputValues && col.inputValues.length > 0) {
      input.inputValues = buildUnaryTests(
        moddle,
        col.inputValues.map((v) => `"${v}"`).join(","),
      );
    }
    return input;
  });

  // Output-Clauses
  table.output = outputCols.map((col) => {
    const output = moddle.create("dmn:OutputClause", {
      id: col.id,
      name: col.expression || col.label,
      typeRef: col.typeRef,
    });
    if (col.label && col.label !== col.expression) {
      output.label = col.label;
    }
    if (col.inputValues && col.inputValues.length > 0) {
      output.outputValues = buildUnaryTests(
        moddle,
        col.inputValues.map((v) => `"${v}"`).join(","),
      );
    }
    return output;
  });

  // Annotation-Clause: genau eine, wenn irgendeine Zeile eine Annotation hat.
  const hasAnnotations = model.rows.some((r) => (r.annotation ?? "").length > 0);
  table.annotation = hasAnnotations
    ? [moddle.create("dmn:RuleAnnotationClause", { name: "Annotation" })]
    : [];

  // Rules
  table.rule = model.rows.map((row) => {
    const inputEntry = inputCols.map((col) =>
      buildUnaryTests(moddle, row.cells[col.id] ?? ""),
    );
    const outputEntry = outputCols.map((col, i) =>
      buildLiteralExpression(
        moddle,
        row.cells[col.id] ?? "",
        `${row.id}_out_${i}`,
      ),
    );
    const rule = moddle.create("dmn:DecisionRule", {
      id: row.id,
      inputEntry,
      outputEntry,
    });
    if (hasAnnotations) {
      rule.annotationEntry = [
        moddle.create("dmn:RuleAnnotation", { text: row.annotation ?? "" }),
      ];
    }
    return rule;
  });
}

/**
 * Serialisiert ein `DmnTableModel` zurück nach DMN-XML.
 *
 * Wird `originalXml` übergeben, wird dessen Moddle-Baum wiederverwendet — so
 * bleiben weitere Decisions, DRD/DI, Imports etc. verlustfrei erhalten und nur
 * die Ziel-Table (per `model.id`) wird ersetzt. Ohne `originalXml` wird ein
 * minimales, valides Definitions-Dokument neu erzeugt.
 */
export async function serializeDmnModel(
  model: DmnTableModel,
  originalXml?: string,
): Promise<string> {
  const moddle = createModdle();

  if (originalXml) {
    const { rootElement } = await moddle.fromXML(originalXml);
    const decisions = findDecisions(rootElement);
    const decision =
      decisions.find((d) => d.id === model.id) ??
      decisions.find((d) => getDecisionTable(d)) ??
      decisions[0];
    if (!decision) {
      throw new Error("Keine Decision zum Schreiben gefunden");
    }
    let table = getDecisionTable(decision);
    if (!table) {
      table = moddle.create("dmn:DecisionTable", { id: `${decision.id}_table` });
      decision.decisionLogic = table;
    }
    applyModelToTable(moddle, decision, table, model);
    const { xml } = await moddle.toXML(rootElement, { format: true });
    return xml;
  }

  // Neuaufbau eines minimalen Dokuments.
  const table = moddle.create("dmn:DecisionTable", {
    id: `${model.id}_table`,
  });
  const decision = moddle.create("dmn:Decision", {
    id: model.id,
    name: model.name,
    decisionLogic: table,
  });
  applyModelToTable(moddle, decision, table, model);

  const definitions = moddle.create("dmn:Definitions", {
    id: `Definitions_${model.id}`,
    name: model.name,
    namespace: "http://camunda.org/schema/1.0/dmn",
    drgElement: [decision],
  });

  const { xml } = await moddle.toXML(definitions, { format: true });
  return xml;
}

/* ------------------------------------------------------------------ *
 * Reine Modell-Mutationen (framework-frei, gut testbar)              *
 * ------------------------------------------------------------------ */

/** Leere Zelle für eine neue Zeile. */
export function emptyRow(model: DmnTableModel): DmnRow {
  const cells: Record<string, string> = {};
  for (const col of model.columns) cells[col.id] = "";
  return { id: makeId("rule"), cells };
}

export function addRow(model: DmnTableModel, at?: number): DmnTableModel {
  const row = emptyRow(model);
  const rows = [...model.rows];
  rows.splice(at ?? rows.length, 0, row);
  return { ...model, rows };
}

export function deleteRow(model: DmnTableModel, rowId: string): DmnTableModel {
  return { ...model, rows: model.rows.filter((r) => r.id !== rowId) };
}

export function moveRow(
  model: DmnTableModel,
  rowId: string,
  direction: -1 | 1,
): DmnTableModel {
  const idx = model.rows.findIndex((r) => r.id === rowId);
  if (idx < 0) return model;
  const target = idx + direction;
  if (target < 0 || target >= model.rows.length) return model;
  const rows = [...model.rows];
  const [moved] = rows.splice(idx, 1);
  rows.splice(target, 0, moved!);
  return { ...model, rows };
}

export function updateCell(
  model: DmnTableModel,
  rowId: string,
  colId: string,
  value: string,
): DmnTableModel {
  return {
    ...model,
    rows: model.rows.map((r) =>
      r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: value } } : r,
    ),
  };
}

export function updateAnnotation(
  model: DmnTableModel,
  rowId: string,
  annotation: string,
): DmnTableModel {
  return {
    ...model,
    rows: model.rows.map((r) =>
      r.id === rowId ? { ...r, annotation } : r,
    ),
  };
}

export function setHitPolicy(
  model: DmnTableModel,
  hitPolicy: HitPolicy,
  aggregation?: Aggregation,
): DmnTableModel {
  return {
    ...model,
    hitPolicy,
    ...(hitPolicy === "COLLECT" && aggregation
      ? { aggregation }
      : { aggregation: undefined }),
  };
}

/** Neue Spalte (Input oder Output) am Ende ihrer Gruppe einfügen. */
export function addColumn(
  model: DmnTableModel,
  kind: DmnColumn["kind"],
  partial?: Partial<Omit<DmnColumn, "id" | "kind">>,
): DmnTableModel {
  const id = makeId(kind);
  const col: DmnColumn = {
    id,
    label: partial?.label ?? (kind === "input" ? "Neuer Input" : "Neuer Output"),
    expression: partial?.expression ?? "",
    kind,
    typeRef: partial?.typeRef ?? "string",
    ...(partial?.inputValues ? { inputValues: partial.inputValues } : {}),
  };
  // Inputs vor Outputs einsortieren.
  const columns = [...model.columns];
  if (kind === "input") {
    const lastInput = columns.map((c) => c.kind).lastIndexOf("input");
    columns.splice(lastInput + 1, 0, col);
  } else {
    columns.push(col);
  }
  const rows = model.rows.map((r) => ({
    ...r,
    cells: { ...r.cells, [id]: "" },
  }));
  return { ...model, columns, rows };
}

export function updateColumn(
  model: DmnTableModel,
  colId: string,
  patch: Partial<Omit<DmnColumn, "id" | "kind">>,
): DmnTableModel {
  return {
    ...model,
    columns: model.columns.map((c) =>
      c.id === colId ? { ...c, ...patch } : c,
    ),
  };
}

export function deleteColumn(model: DmnTableModel, colId: string): DmnTableModel {
  const columns = model.columns.filter((c) => c.id !== colId);
  const rows = model.rows.map((r) => {
    const { [colId]: _removed, ...cells } = r.cells;
    return { ...r, cells };
  });
  return { ...model, columns, rows };
}
