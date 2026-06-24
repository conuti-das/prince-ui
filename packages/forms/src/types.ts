/**
 * Formular-Schema — bewusst **form-js-kompatibel** (`@bpmn-io/form-js`), damit
 * der native prince-ui-Renderer/-Builder und der form-js-Experten-Fallback
 * dasselbe Schema lesen/schreiben.
 */

export type FormFieldType =
  | "textfield"
  | "textarea"
  | "number"
  | "checkbox"
  | "checklist"
  | "radio"
  | "select"
  | "datetime"
  | "taglist"
  | "text" // statischer Text
  | "spacer"
  | "separator"
  | "button"
  | "group";

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConditional {
  /** FEEL-Ausdruck; wenn truthy, wird das Feld versteckt */
  hide?: string;
}

export interface FormField {
  id?: string;
  type: FormFieldType;
  /** Datenbindung (Punkt-Notation für Nesting) */
  key?: string;
  label?: string;
  description?: string;
  defaultValue?: unknown;
  validate?: FormFieldValidation;
  values?: FormFieldOption[];
  conditional?: FormFieldConditional;
  /** statischer Text/HTML bei type === "text" */
  text?: string;
  /** verschachtelte Felder bei type === "group" */
  components?: FormField[];
  [key: string]: unknown;
}

export interface FormSchema {
  type: "default";
  components: FormField[];
  schemaVersion?: number;
  id?: string;
  exporter?: { name: string; version: string };
}

/** Formulardaten (key -> Wert). */
export type FormData = Record<string, unknown>;

export interface FormSubmitResult {
  data: FormData;
  errors: Record<string, string[]>;
}

/**
 * Camunda-7-Task-Form-Feld (`GET /task/{id}/form`) — Quelle finops.
 * Wird über `taskFormToSchema()` auf das form-js-kompatible {@link FormSchema}
 * gemappt.
 */
export interface TaskFormField {
  id: string;
  label?: string;
  type: { name: "string" | "long" | "boolean" | "enum" | "date" } | string;
  defaultValue?: unknown;
  validationConstraints?: { name: string; configuration?: string }[];
  values?: Record<string, string>;
}

/** Camunda-Submit-Variablenformat: `{ name: { value, type } }`. */
export type CamundaVariables = Record<string, { value: unknown; type: string }>;
