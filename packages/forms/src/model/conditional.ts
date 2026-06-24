import type { FormData } from "../types";

/**
 * Heuristische Auswertung eines `conditional.hide`-Ausdrucks (FEEL-nah).
 *
 * **Kein echter FEEL-Parser** (siehe Spec §7.2) — wir werten eine sinnvolle
 * Teilmenge aus, die in form-js-Schemata real vorkommt, und geben im Zweifel
 * `false` (nicht verstecken) zurück, damit Felder nie fälschlich verschwinden.
 *
 * Unterstützt:
 * - `=expr` (führendes Gleichheitszeichen wie in form-js)
 * - Variablenreferenzen `foo`, Punkt-Notation `foo.bar`
 * - Literale: `true`/`false`, Zahlen, `"strings"`/`'strings'`, `null`
 * - Vergleiche `==`/`=`, `!=`, `>`, `>=`, `<`, `<=`
 * - Negation `not(expr)` / `!expr`
 * - Verknüpfung ` and ` / ` or ` (links-assoziativ, kein Klammer-Parsing)
 * - bloße Truthiness einer Variable (`hide: "foo"`)
 */
export function evalConditional(
  hideExpr: string | undefined,
  data: FormData,
): boolean {
  if (!hideExpr) return false;
  let expr = hideExpr.trim();
  if (expr.startsWith("=")) expr = expr.slice(1).trim();
  if (!expr) return false;
  try {
    return Boolean(evalExpr(expr, data));
  } catch {
    // Im Zweifel sichtbar lassen.
    return false;
  }
}

/** Wertet eine `and`/`or`-Kette aus (links-assoziativ, ohne Klammern). */
function evalExpr(expr: string, data: FormData): unknown {
  const orParts = splitTopLevel(expr, " or ");
  if (orParts.length > 1) {
    return orParts.some((p) => Boolean(evalExpr(p.trim(), data)));
  }
  const andParts = splitTopLevel(expr, " and ");
  if (andParts.length > 1) {
    return andParts.every((p) => Boolean(evalExpr(p.trim(), data)));
  }
  return evalComparison(expr.trim(), data);
}

/** Trennt nur außerhalb von Quotes (rudimentär, ohne Klammertiefe). */
function splitTopLevel(expr: string, sep: string): string[] {
  const out: string[] = [];
  let buf = "";
  let quote: string | null = null;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      buf += ch;
      continue;
    }
    if (expr.startsWith(sep, i)) {
      out.push(buf);
      buf = "";
      i += sep.length - 1;
      continue;
    }
    buf += ch;
  }
  out.push(buf);
  return out;
}

const COMPARATORS = ["!=", ">=", "<=", "==", ">", "<", "="] as const;

function evalComparison(expr: string, data: FormData): unknown {
  // Negation
  if (expr.toLowerCase().startsWith("not(") && expr.endsWith(")")) {
    return !evalExpr(expr.slice(4, -1).trim(), data);
  }
  if (expr.startsWith("!")) {
    return !evalExpr(expr.slice(1).trim(), data);
  }

  for (const op of COMPARATORS) {
    const idx = findOperator(expr, op);
    if (idx >= 0) {
      const left = resolveValue(expr.slice(0, idx).trim(), data);
      const right = resolveValue(expr.slice(idx + op.length).trim(), data);
      return compare(left, right, op);
    }
  }

  // Keine Operation → bloße Truthiness des Werts.
  return Boolean(resolveValue(expr, data));
}

/** Findet einen Operator außerhalb von Quotes; `=` nicht als Teil von `!=`/`>=`/`<=`/`==`. */
function findOperator(expr: string, op: string): number {
  let quote: string | null = null;
  for (let i = 0; i <= expr.length - op.length; i++) {
    const ch = expr[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (expr.startsWith(op, i)) {
      if (op === "=") {
        const prev = expr[i - 1];
        const next = expr[i + 1];
        if (prev === "!" || prev === ">" || prev === "<" || prev === "=") continue;
        if (next === "=") continue;
      }
      return i;
    }
  }
  return -1;
}

function compare(left: unknown, right: unknown, op: string): boolean {
  switch (op) {
    case "==":
    case "=":
      return looseEq(left, right);
    case "!=":
      return !looseEq(left, right);
    case ">":
      return Number(left) > Number(right);
    case ">=":
      return Number(left) >= Number(right);
    case "<":
      return Number(left) < Number(right);
    case "<=":
      return Number(left) <= Number(right);
    default:
      return false;
  }
}

function looseEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a == null && b == null;
  return String(a) === String(b);
}

/** Auflösung eines Tokens: Literal oder Variablenpfad in `data`. */
function resolveValue(token: string, data: FormData): unknown {
  const t = token.trim();
  if (t === "") return undefined;
  if (t === "true") return true;
  if (t === "false") return false;
  if (t === "null") return null;
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  // Variablenpfad (Punkt-Notation).
  return getPath(data, t);
}

/** Liest einen Punkt-Pfad (`a.b.c`) aus einem Objekt. */
export function getPath(obj: unknown, path: string): unknown {
  if (!path) return undefined;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Setzt einen Punkt-Pfad (`a.b.c`) in einem Objekt (mutierend, mit Auto-Nesting). */
export function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i] as string;
    if (typeof cur[part] !== "object" || cur[part] === null) {
      cur[part] = {};
    }
    cur = cur[part] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1] as string] = value;
}
