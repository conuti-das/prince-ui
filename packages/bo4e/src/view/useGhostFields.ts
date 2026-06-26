import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";

/**
 * Unfilled, documented scalar field keys for a BO, ordered `properties ∩ dict`
 * then remaining dict keys. Source is the field-dict (`schema.fields[boTyp]`),
 * never raw `bos.properties` — the latter is stale and lists fields with no doc.
 */
export function computeGhostFields(schema: Bo4eSchema, boTyp: string, obj: Bo4eObject): string[] {
  const dict = schema.fields[boTyp] ?? {};
  const dictKeys = Object.keys(dict);
  const props = schema.bos[boTyp]?.properties ?? [];
  const ordered = [
    ...props.filter((k) => k in dict),
    ...dictKeys.filter((k) => !props.includes(k)),
  ];
  const isFilled = (k: string) => k in obj && obj[k] != null && obj[k] !== "";
  return ordered.filter((k) => k !== "boTyp" && !isFilled(k));
}
