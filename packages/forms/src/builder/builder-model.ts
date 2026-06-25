import type { FormField, FormFieldType, FormSchema } from "../types";

/** Im Builder anlegbare Feldtypen (Palette). */
export const BUILDER_FIELD_TYPES = [
  "textfield",
  "textarea",
  "number",
  "checkbox",
  "checklist",
  "radio",
  "select",
  "datetime",
  "taglist",
  "text",
  "separator",
  "spacer",
] as const;

export type BuilderFieldType = (typeof BUILDER_FIELD_TYPES)[number];

/** Menschlich lesbare Labels für die Palette. */
export const FIELD_TYPE_LABELS: Record<BuilderFieldType, string> = {
  textfield: "Textfeld",
  textarea: "Textbereich",
  number: "Zahl",
  checkbox: "Checkbox",
  checklist: "Checkliste",
  radio: "Optionsfeld",
  select: "Auswahl",
  datetime: "Datum",
  taglist: "Tag-Liste",
  text: "Text",
  separator: "Trennlinie",
  spacer: "Abstand",
};

/** Feldtypen ohne Datenbindung (kein key/label nötig). */
const PRESENTATIONAL: ReadonlySet<FormFieldType> = new Set([
  "text",
  "separator",
  "spacer",
]);

/** Feldtypen mit Optionsliste. */
export const OPTION_TYPES: ReadonlySet<FormFieldType> = new Set([
  "select",
  "radio",
  "checklist",
  "taglist",
]);

export function isPresentational(type: FormFieldType): boolean {
  return PRESENTATIONAL.has(type);
}

export function hasOptions(type: FormFieldType): boolean {
  return OPTION_TYPES.has(type);
}

let idCounter = 0;
/** Eindeutige Feld-ID (form-js-Stil: `Field_xxxx`). */
export function generateFieldId(): string {
  idCounter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `Field_${rand}${idCounter}`;
}

/** Leeres, valides Schema. */
export function emptySchema(): FormSchema {
  return {
    type: "default",
    components: [],
    schemaVersion: 1,
    exporter: { name: "@conuti-das/prince-ui-forms", version: "0.1.0" },
  };
}

/** Erzeugt ein neues Feld eines Typs mit sinnvollen Defaults. */
export function createField(type: BuilderFieldType): FormField {
  const id = generateFieldId();
  if (isPresentational(type)) {
    if (type === "text") return { id, type, text: "Statischer Text" };
    return { id, type };
  }
  const field: FormField = {
    id,
    type,
    key: id,
    label: FIELD_TYPE_LABELS[type],
  };
  if (hasOptions(type)) {
    field.values = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];
  }
  return field;
}

/** Fügt ein Feld an Position `index` ein (Default: ans Ende). */
export function insertField(
  schema: FormSchema,
  field: FormField,
  index?: number,
): FormSchema {
  const components = [...schema.components];
  const at = index == null ? components.length : Math.max(0, Math.min(index, components.length));
  components.splice(at, 0, field);
  return { ...schema, components };
}

/** Entfernt das Feld an Position `index`. */
export function removeFieldAt(schema: FormSchema, index: number): FormSchema {
  const components = schema.components.filter((_, i) => i !== index);
  return { ...schema, components };
}

/** Verschiebt das Feld von `from` nach `to` (Reorder). */
export function moveField(schema: FormSchema, from: number, to: number): FormSchema {
  const components = [...schema.components];
  if (from < 0 || from >= components.length) return schema;
  const clampedTo = Math.max(0, Math.min(to, components.length - 1));
  const [moved] = components.splice(from, 1);
  if (moved === undefined) return schema;
  components.splice(clampedTo, 0, moved);
  return { ...schema, components };
}

/** Aktualisiert das Feld an Position `index` (Merge). */
export function updateFieldAt(
  schema: FormSchema,
  index: number,
  patch: Partial<FormField>,
): FormSchema {
  const components = schema.components.map((f, i) =>
    i === index ? { ...f, ...patch } : f,
  );
  return { ...schema, components };
}
