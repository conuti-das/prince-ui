import type {
  FormField,
  FormFieldOption,
  FormFieldType,
  FormFieldValidation,
  FormSchema,
  TaskFormField,
} from "../types";

/**
 * Camunda-Validierungs-Constraints (`validationConstraints`) auf die
 * form-js-kompatible {@link FormFieldValidation} mappen.
 *
 * Camunda kennt u. a. `required`, `minlength`, `maxlength`, `min`, `max`,
 * `readonly`. Unbekannte Constraints werden ignoriert (best effort).
 */
function mapValidationConstraints(
  constraints: TaskFormField["validationConstraints"],
): FormFieldValidation | undefined {
  if (!constraints || constraints.length === 0) return undefined;
  const validate: FormFieldValidation = {};
  for (const c of constraints) {
    const name = c.name?.toLowerCase();
    const cfg = c.configuration;
    switch (name) {
      case "required":
        validate.required = true;
        break;
      case "minlength":
        if (cfg != null && cfg !== "") validate.minLength = Number(cfg);
        break;
      case "maxlength":
        if (cfg != null && cfg !== "") validate.maxLength = Number(cfg);
        break;
      case "min":
        if (cfg != null && cfg !== "") validate.min = Number(cfg);
        break;
      case "max":
        if (cfg != null && cfg !== "") validate.max = Number(cfg);
        break;
      default:
        // unbekannte Constraints (z. B. readonly, custom Validator) ignorieren
        break;
    }
  }
  return Object.keys(validate).length > 0 ? validate : undefined;
}

/** Camunda-`values` (`{ value: label }`) auf {@link FormFieldOption}[] mappen. */
function mapValues(values: TaskFormField["values"]): FormFieldOption[] | undefined {
  if (!values) return undefined;
  const out = Object.entries(values).map(([value, label]) => ({
    value,
    label: label ?? value,
  }));
  return out.length > 0 ? out : undefined;
}

/** Normalisiert den Camunda-Typnamen (`{ name }` oder String). */
export function camundaTypeName(type: TaskFormField["type"]): string {
  if (typeof type === "string") return type;
  return type?.name ?? "string";
}

/**
 * Mappt einen Camunda-Typnamen auf den form-js-kompatiblen
 * {@link FormFieldType}. `enum` → `select`, `boolean` → `checkbox`,
 * `date` → `datetime`, `long`/`integer`/`double` → `number`, sonst `textfield`.
 */
export function camundaTypeToFieldType(
  field: TaskFormField,
): FormFieldType {
  const name = camundaTypeName(field.type);
  switch (name) {
    case "enum":
      return "select";
    case "boolean":
      return "checkbox";
    case "date":
      return "datetime";
    case "long":
    case "integer":
    case "double":
    case "short":
      return "number";
    case "string":
    default:
      return "textfield";
  }
}

/** Camunda-Typname → Submit-Variablentyp (`{ value, type }`). */
export function camundaSubmitType(name: string): string {
  switch (name) {
    case "boolean":
      return "Boolean";
    case "long":
    case "integer":
    case "short":
      return "Integer";
    case "double":
      return "Double";
    case "date":
      return "Date";
    case "enum":
    case "string":
    default:
      return "String";
  }
}

/**
 * Camunda-7-Task-Form-Felder (`GET /task/{id}/form`) auf das
 * form-js-kompatible {@link FormSchema} mappen.
 *
 * Vorlage: finops `UserTaskFormDialog`-Feldtypen, generalisiert auf alle
 * Camunda-`TaskFormField`-Typen (string/long/boolean/enum/date).
 */
export function taskFormToSchema(fields: TaskFormField[]): FormSchema {
  const components: FormField[] = (fields ?? []).map((f) => {
    const type = camundaTypeToFieldType(f);
    const field: FormField = {
      id: f.id,
      key: f.id,
      type,
      label: f.label ?? f.id,
    };
    if (f.defaultValue !== undefined) field.defaultValue = f.defaultValue;
    // Camunda-Typ für verlustfreies Submit-Mapping merken.
    field._camundaType = camundaSubmitType(camundaTypeName(f.type));
    const validate = mapValidationConstraints(f.validationConstraints);
    if (validate) field.validate = validate;
    const values = mapValues(f.values);
    if (values) field.values = values;
    return field;
  });

  return {
    type: "default",
    components,
    schemaVersion: 1,
    exporter: { name: "prince-ui-forms", version: "0.1.0" },
  };
}
