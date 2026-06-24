import type { FormField, FormFieldType, FormSchema } from "../types";

/** Feldtypen ohne Datenbindung (rein präsentationell). */
export const PRESENTATIONAL_TYPES: ReadonlySet<FormFieldType> = new Set([
  "text",
  "spacer",
  "separator",
  "button",
  "group",
]);

/** Hat das Feld eine Datenbindung (`key` + nicht rein präsentationell)? */
export function isDataField(field: FormField): boolean {
  return !PRESENTATIONAL_TYPES.has(field.type) && typeof field.key === "string" && field.key !== "";
}

/**
 * Flacht ein Schema (inkl. verschachtelter `group`-Felder) zu einer
 * flachen Liste ab — in Dokumentreihenfolge.
 */
export function flattenFields(schema: FormSchema): FormField[] {
  const out: FormField[] = [];
  const walk = (fields: FormField[] | undefined) => {
    if (!fields) return;
    for (const f of fields) {
      out.push(f);
      if (f.type === "group" && Array.isArray(f.components)) {
        walk(f.components);
      }
    }
  };
  walk(schema.components);
  return out;
}

/** Alle datentragenden Felder eines Schemas (flach). */
export function dataFields(schema: FormSchema): FormField[] {
  return flattenFields(schema).filter(isDataField);
}
