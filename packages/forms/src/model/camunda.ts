import type { CamundaVariables, FormData, FormField, FormSchema } from "../types";
import { evalConditional, getPath } from "./conditional";
import { camundaTypeName } from "./task-form";
import { dataFields } from "./schema";

/** Leitet den Camunda-Variablentyp aus einem JS-Wert ab. */
export function camundaTypeOf(value: unknown): string {
  if (typeof value === "boolean") return "Boolean";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "Integer" : "Double";
  }
  if (value instanceof Date) return "Date";
  if (value !== null && typeof value === "object") return "Json";
  return "String";
}

/**
 * Bevorzugt den im Schema/Camunda deklarierten Typ eines Feldes, fällt
 * sonst auf die Wert-Heuristik zurück.
 */
function camundaTypeForField(field: FormField | undefined, value: unknown): string {
  if (field) {
    // Falls das Feld aus einem Camunda-TaskForm stammt, kann `_camundaType`
    // (oder ein deklarierter Typ) gesetzt sein — best effort.
    const declared = field._camundaType;
    if (typeof declared === "string" && declared) return declared;
    switch (field.type) {
      case "number":
        return camundaTypeOf(typeof value === "number" ? value : Number(value));
      case "checkbox":
        return "Boolean";
      case "datetime":
        return "Date";
      default:
        break;
    }
  }
  return camundaTypeOf(value);
}

/**
 * Wandelt Formulardaten in das Camunda-7-Submit-Variablenformat
 * `{ name: { value, type } }` (siehe finops `submitTaskForm`).
 *
 * Mit Schema werden nur **sichtbare datentragende Felder** übernommen und der
 * Typ wird – wo möglich – aus dem Feld abgeleitet. Ohne Schema werden alle
 * Top-Level-Einträge der Daten gemappt (Typ per Heuristik).
 */
export function formDataToCamundaVariables(
  data: FormData,
  schema?: FormSchema,
): CamundaVariables {
  const out: CamundaVariables = {};

  if (schema) {
    for (const field of dataFields(schema)) {
      if (evalConditional(field.conditional?.hide, data)) continue;
      const key = field.key as string;
      const value = getPath(data, key);
      if (value === undefined) continue;
      out[key] = { value, type: camundaTypeForField(field, value) };
    }
    return out;
  }

  for (const [key, value] of Object.entries(data ?? {})) {
    if (value === undefined) continue;
    out[key] = { value, type: camundaTypeOf(value) };
  }
  return out;
}
