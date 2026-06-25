import { isIsoDate, formatDateDE } from "../core/datetime";

/** True for primitives, null, and arrays of primitives (i.e. not nested objects/arrays-of-objects). */
export function isScalarish(v: unknown): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.every((x) => x == null || typeof x !== "object");
  return typeof v !== "object";
}

export function displayValue(v: unknown): { text: string; isNull: boolean } {
  if (v == null) return { text: "—", isNull: true };
  if (Array.isArray(v)) return { text: v.join(", "), isNull: false };
  if (isIsoDate(v)) return { text: formatDateDE(v, { withTime: true }), isNull: false };
  if (typeof v === "boolean") return { text: v ? "Ja" : "Nein", isNull: false };
  return { text: String(v), isNull: false };
}
