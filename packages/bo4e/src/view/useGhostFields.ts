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
  // Ghosts are documented fields ABSENT from the object. Keys present with an
  // empty value are already rendered by the caller's object-key loop, so adding
  // them here would duplicate the row.
  return ordered.filter((k) => k !== "boTyp" && !(k in obj));
}
