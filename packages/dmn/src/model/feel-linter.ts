/**
 * Heuristischer FEEL-Linter (regex-basiert) — als **nicht-blockierender Hinweis**
 * gedacht (Spec §7): valide FEEL außerhalb der Whitelist wird abgelehnt. Ein echter
 * FEEL-Parser (`feelin`) ist eine spätere Option. Portiert aus
 * maco-process-studio `useFeelLinter.ts`, aber framework-frei und gegen den
 * geteilten `DmnColumn`-Vertrag.
 */

import type { DmnColumn, FeelLintResult } from "../types";

/** Erkannter FEEL-Werttyp (für Token-Färbung im Editor). */
export type FeelValueType =
  | "string"
  | "number"
  | "boolean"
  | "string list"
  | "number range"
  | "expression"
  | "any";

/** Lint-Ergebnis mit erkanntem Typ (erweitert `FeelLintResult`). */
export interface FeelLintTypedResult extends FeelLintResult {
  type?: FeelValueType;
}

const EMPTY_RE = /^(-|)$/;
const STRING_RE = /^"[^"]*"$/;
const STRING_LIST_RE = /^"[^"]*"(\s*,\s*"[^"]*")+$/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;
const NUMBER_RANGE_RE = /^[([]\s*-?\d+(\.\d+)?\s*\.\.\s*-?\d+(\.\d+)?\s*[)\]]$/;
const COMPARISON_RE = /^(>=|<=|>|<)\s*-?\d+(\.\d+)?$/;
const BOOLEAN_RE = /^(true|false)$/i;
const NOT_RE = /^not\s*\(.+\)$/;
const CONTAINS_RE = /^contains\s*\(.+\)$/;
const FUNCTION_RE = /^[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)$/;

/** Erlaubte Werte aus einem `inputValues`-String der Form `"A","B"` parsen. */
export function parseInputValues(inputValues: string): string[] {
  const matches = inputValues.matchAll(/"([^"]*)"/g);
  return Array.from(matches, (m) => m[1] ?? "");
}

/**
 * Prüft einen FEEL-Zellausdruck heuristisch. `column` liefert (optional) die
 * erlaubten `inputValues` für eine Whitelist-Validierung.
 */
export function lintFeel(
  expr: string,
  column?: Pick<DmnColumn, "inputValues">,
): FeelLintTypedResult {
  const trimmed = expr.trim();
  const allowed =
    column?.inputValues && column.inputValues.length > 0
      ? column.inputValues.flatMap(parseInputValues)
      : [];

  if (EMPTY_RE.test(trimmed)) {
    return { valid: true, type: "any" };
  }

  if (STRING_LIST_RE.test(trimmed)) {
    if (allowed.length > 0) {
      const vals = trimmed.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const invalid = vals.filter((v) => !allowed.includes(v));
      if (invalid.length > 0) {
        return {
          valid: false,
          message: `Nicht erlaubt: ${invalid.join(", ")}`,
          type: "string list",
        };
      }
    }
    return { valid: true, type: "string list" };
  }

  if (STRING_RE.test(trimmed)) {
    if (allowed.length > 0) {
      const val = trimmed.replace(/^"|"$/g, "");
      if (!allowed.includes(val)) {
        return {
          valid: false,
          message: `"${val}" ist nicht in den erlaubten Werten`,
          type: "string",
        };
      }
    }
    return { valid: true, type: "string" };
  }

  if (NUMBER_RANGE_RE.test(trimmed)) {
    return { valid: true, type: "number range" };
  }

  if (COMPARISON_RE.test(trimmed)) {
    return { valid: true, type: "number range" };
  }

  if (NUMBER_RE.test(trimmed)) {
    return { valid: true, type: "number" };
  }

  if (BOOLEAN_RE.test(trimmed)) {
    return { valid: true, type: "boolean" };
  }

  if (NOT_RE.test(trimmed) || CONTAINS_RE.test(trimmed) || FUNCTION_RE.test(trimmed)) {
    return { valid: true, type: "expression" };
  }

  return { valid: false, message: `Unbekannter FEEL-Ausdruck: "${trimmed}"` };
}
