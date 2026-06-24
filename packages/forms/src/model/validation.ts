import type { FormData, FormField, FormSchema } from "../types";
import { evalConditional, getPath } from "./conditional";
import { dataFields } from "./schema";

/** Standard-Fehlermeldungen (deutsch). Pro Feld überschreibbar wäre denkbar. */
export const VALIDATION_MESSAGES = {
  required: "Dieses Feld ist erforderlich.",
  min: (min: number) => `Wert muss mindestens ${min} sein.`,
  max: (max: number) => `Wert darf höchstens ${max} sein.`,
  minLength: (n: number) => `Mindestens ${n} Zeichen erforderlich.`,
  maxLength: (n: number) => `Höchstens ${n} Zeichen erlaubt.`,
  pattern: "Eingabe entspricht nicht dem erwarteten Format.",
};

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

/** Validiert ein einzelnes Feld gegen seinen Wert; liefert Fehlermeldungen. */
export function validateField(field: FormField, value: unknown): string[] {
  const errors: string[] = [];
  const v = field.validate;
  if (!v) return errors;

  if (v.required && isEmpty(value)) {
    errors.push(VALIDATION_MESSAGES.required);
    // Bei leerem Pflichtfeld sind weitere Constraints nicht aussagekräftig.
    return errors;
  }
  if (isEmpty(value)) return errors;

  if (typeof v.min === "number" && Number(value) < v.min) {
    errors.push(VALIDATION_MESSAGES.min(v.min));
  }
  if (typeof v.max === "number" && Number(value) > v.max) {
    errors.push(VALIDATION_MESSAGES.max(v.max));
  }
  const str = typeof value === "string" ? value : String(value);
  if (typeof v.minLength === "number" && str.length < v.minLength) {
    errors.push(VALIDATION_MESSAGES.minLength(v.minLength));
  }
  if (typeof v.maxLength === "number" && str.length > v.maxLength) {
    errors.push(VALIDATION_MESSAGES.maxLength(v.maxLength));
  }
  if (v.pattern) {
    try {
      if (!new RegExp(v.pattern).test(str)) {
        errors.push(VALIDATION_MESSAGES.pattern);
      }
    } catch {
      // Ungültiges Pattern → nicht blockieren.
    }
  }
  return errors;
}

/**
 * Validiert ein komplettes Formular gegen seine Daten. **Versteckte Felder**
 * (`conditional.hide` truthy) werden übersprungen. Liefert `{ key: messages[] }`
 * nur für Felder mit Fehlern.
 */
export function validateForm(
  schema: FormSchema,
  data: FormData,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const field of dataFields(schema)) {
    if (evalConditional(field.conditional?.hide, data)) continue;
    const key = field.key as string;
    const fieldErrors = validateField(field, getPath(data, key));
    if (fieldErrors.length > 0) errors[key] = fieldErrors;
  }
  return errors;
}
