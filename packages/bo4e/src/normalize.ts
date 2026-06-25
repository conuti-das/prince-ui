import type { CDoc, Bo4eObject, Stammdaten } from "./types";

/** A SydocView accepts a full cDoc, a single BO, or an array of BOs. */
export type SydocInput = CDoc | Bo4eObject | Bo4eObject[];

function isCDoc(x: SydocInput): x is CDoc {
  return typeof x === "object" && x != null && !Array.isArray(x) && "content" in x && !("boTyp" in (x as object));
}

/** Wrap a single BO or a BO array into a minimal cDoc (grouped by boTyp under OUTBOUND). */
export function normalizeToCDoc(input: SydocInput): CDoc {
  if (isCDoc(input)) return input;
  const list = Array.isArray(input) ? input : [input];
  const stammdaten: Stammdaten = {};
  for (const o of list) {
    const k = o.boTyp ?? "UNBEKANNT";
    const bucket = (stammdaten[k] ??= []);
    bucket.push(o);
  }
  return { id: "", businessKey: "", content: { OUTBOUND: { stammdaten } } };
}
