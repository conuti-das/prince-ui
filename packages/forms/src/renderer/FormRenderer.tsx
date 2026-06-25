import {
  useCallback,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  ComboBox,
  ComboBoxItem,
  DatePicker,
  DescriptionList,
  Field,
  Form,
  NumberField,
  RadioGroup,
  Radio,
  Select,
  SelectItem,
  Separator,
  Switch,
  TagGroup,
  Tag,
  TextField,
} from "@conuti-das/prince-ui";
import type {
  CamundaVariables,
  FormData,
  FormField,
  FormSchema,
  FormSubmitResult,
} from "../types";
import { CalendarDate, parseDate } from "@internationalized/date";
import { evalConditional, getPath, setPath } from "../model/conditional";
import { dataFields, isDataField } from "../model/schema";
import { validateForm } from "../model/validation";
import { formDataToCamundaVariables } from "../model/camunda";
import "./FormRenderer.css";

export type SubmitVariableFormat = "camunda" | "plain";

export interface FormRendererSubmit {
  /** Roh-Formulardaten (`key -> value`, mit Nesting). */
  data: FormData;
  /** Validierungsfehler je Feld-Key (leer = valide). */
  errors: FormSubmitResult["errors"];
  /** Submit-Payload im gewählten Format (Default Camunda `{name:{value,type}}`). */
  variables: CamundaVariables | FormData;
}

export interface FormRendererProps {
  /** form-js-kompatibles Schema (`{ type:"default", components:[...] }`). */
  schema: FormSchema;
  /** Kontrollierte Daten (`key -> value`). */
  data?: FormData;
  /** Ungesteuerte Anfangsdaten. */
  defaultData?: FormData;
  /** Datenänderungen (für controlled-Nutzung). */
  onChange?: (data: FormData) => void;
  /** Submit-Callback; erhält Daten, Validierungsfehler und Submit-Variablen. */
  onSubmit?: (result: FormRendererSubmit) => void;
  /** Read-only-Darstellung über `DescriptionList`/`Field`. */
  readOnly?: boolean;
  /** Submit-Variablenformat (Default `camunda`). */
  submitVariableFormat?: SubmitVariableFormat;
  /** Label des Submit-Buttons (Default „Absenden"). `null` → kein Button. */
  submitLabel?: ReactNode;
  /** Zusätzlicher Aktions-Slot neben dem Submit-Button. */
  actionsSlot?: ReactNode;
  className?: string;
}

/** Initialwerte aus Schema (`defaultValue` + Typ-Defaults) + übergebenen Daten. */
function buildInitialData(schema: FormSchema, seed?: FormData): FormData {
  const out: FormData = seed ? structuredClone(seed) : {};
  for (const field of dataFields(schema)) {
    const key = field.key as string;
    if (getPath(out, key) !== undefined) continue;
    if (field.defaultValue !== undefined) {
      setPath(out, key, field.defaultValue);
      continue;
    }
    switch (field.type) {
      case "checkbox":
        setPath(out, key, false);
        break;
      case "checklist":
      case "taglist":
        setPath(out, key, []);
        break;
      default:
        // Text/Number/Select/Radio/Datetime starten leer.
        break;
    }
  }
  return out;
}

export function FormRenderer({
  schema,
  data,
  defaultData,
  onChange,
  onSubmit,
  readOnly = false,
  submitVariableFormat = "camunda",
  submitLabel = "Absenden",
  actionsSlot,
  className,
}: FormRendererProps) {
  const isControlled = data !== undefined;
  const [internal, setInternal] = useState<FormData>(() =>
    buildInitialData(schema, isControlled ? data : defaultData),
  );
  const values = isControlled ? data : internal;

  const [errors, setErrors] = useState<FormSubmitResult["errors"]>({});
  const [submitted, setSubmitted] = useState(false);

  const setValue = useCallback(
    (key: string, value: unknown) => {
      const next = structuredClone(values);
      setPath(next, key, value);
      if (!isControlled) setInternal(next);
      onChange?.(next);
      // Live-Revalidierung nach erstem Submit-Versuch.
      if (submitted) setErrors(validateForm(schema, next));
    },
    [values, isControlled, onChange, submitted, schema],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const errs = validateForm(schema, values);
      setErrors(errs);
      setSubmitted(true);
      const variables =
        submitVariableFormat === "camunda"
          ? formDataToCamundaVariables(values, schema)
          : values;
      onSubmit?.({ data: values, errors: errs, variables });
    },
    [schema, values, submitVariableFormat, onSubmit],
  );

  // Sichtbarkeit je Feld (conditional.hide) — memoisiert pro Render.
  const isHidden = useCallback(
    (field: FormField) => evalConditional(field.conditional?.hide, values),
    [values],
  );

  if (readOnly) {
    return (
      <ReadOnlyForm
        schema={schema}
        values={values}
        isHidden={isHidden}
        className={className}
      />
    );
  }

  return (
    <Form
      className={cxForm(className)}
      onSubmit={handleSubmit}
      validationBehavior="aria"
      data-prn-form-renderer=""
    >
      <div className="prn-form-fields">
        {schema.components.map((field, i) => (
          <FieldRenderer
            key={field.id ?? field.key ?? `${field.type}-${i}`}
            field={field}
            values={values}
            errors={errors}
            isHidden={isHidden}
            setValue={setValue}
          />
        ))}
      </div>
      {(submitLabel !== null || actionsSlot) && (
        <div className="prn-form-actions">
          {actionsSlot}
          {submitLabel !== null && (
            <Button type="submit" variant="filled">
              {submitLabel}
            </Button>
          )}
        </div>
      )}
    </Form>
  );
}

function cxForm(className?: string): string {
  return className ? `prn-form-renderer ${className}` : "prn-form-renderer";
}

/* ---------------- Read-only ---------------- */

function ReadOnlyForm({
  schema,
  values,
  isHidden,
  className,
}: {
  schema: FormSchema;
  values: FormData;
  isHidden: (f: FormField) => boolean;
  className?: string;
}) {
  const fields = dataFields(schema).filter((f) => !isHidden(f));
  return (
    <div className={cxForm(className)} data-prn-form-readonly="">
      <DescriptionList layout="stacked">
        {fields.map((field) => {
          const key = field.key as string;
          return (
            <Field
              key={field.id ?? key}
              label={field.label ?? key}
              value={formatReadOnly(field, getPath(values, key))}
            />
          );
        })}
      </DescriptionList>
    </div>
  );
}

function formatReadOnly(field: FormField, value: unknown): ReactNode {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (Array.isArray(value)) {
    const labels = value.map((v) => optionLabel(field, v));
    return labels.length ? labels.join(", ") : "—";
  }
  if (field.values) return optionLabel(field, value);
  return String(value);
}

function optionLabel(field: FormField, value: unknown): string {
  const opt = field.values?.find((o) => o.value === String(value));
  return opt?.label ?? String(value);
}

/* ---------------- Field dispatch ---------------- */

interface FieldRendererProps {
  field: FormField;
  values: FormData;
  errors: FormSubmitResult["errors"];
  isHidden: (f: FormField) => boolean;
  setValue: (key: string, value: unknown) => void;
}

function FieldRenderer({ field, values, errors, isHidden, setValue }: FieldRendererProps) {
  if (isHidden(field)) return null;

  switch (field.type) {
    case "group":
      return (
        <fieldset className="prn-form-group">
          {field.label && <legend className="prn-form-group-legend">{field.label}</legend>}
          {(field.components ?? []).map((child, i) => (
            <FieldRenderer
              key={child.id ?? child.key ?? `${child.type}-${i}`}
              field={child}
              values={values}
              errors={errors}
              isHidden={isHidden}
              setValue={setValue}
            />
          ))}
        </fieldset>
      );
    case "text":
      return <div className="prn-form-text">{field.text ?? field.label}</div>;
    case "separator":
      return <Separator className="prn-form-separator" />;
    case "spacer":
      return <div className="prn-form-spacer" aria-hidden />;
    case "button":
      return null; // Submit-Button wird zentral gerendert.
    default:
      return (
        <DataFieldRenderer
          field={field}
          values={values}
          errors={errors}
          setValue={setValue}
        />
      );
  }
}

function DataFieldRenderer({
  field,
  values,
  errors,
  setValue,
}: Omit<FieldRendererProps, "isHidden">) {
  if (!isDataField(field)) return null;
  const key = field.key as string;
  const value = getPath(values, key);
  const error = errors[key]?.[0];
  const label = field.label ?? key;
  const required = field.validate?.required;
  const options = field.values ?? [];

  const commonField = {
    label,
    description: field.description,
    errorMessage: error,
    isInvalid: Boolean(error),
    isRequired: required,
  } as const;

  switch (field.type) {
    case "textarea":
      return (
        <TextField
          {...commonField}
          value={value == null ? "" : String(value)}
          onChange={(v) => setValue(key, v)}
        />
      );
    case "number":
      return (
        <NumberField
          {...commonField}
          value={typeof value === "number" ? value : Number.NaN}
          minValue={field.validate?.min}
          maxValue={field.validate?.max}
          onChange={(v) => setValue(key, Number.isNaN(v) ? undefined : v)}
        />
      );
    case "checkbox":
      return (
        <Checkbox
          isSelected={Boolean(value)}
          isInvalid={Boolean(error)}
          onChange={(v) => setValue(key, v)}
        >
          {label}
          {required ? " *" : ""}
        </Checkbox>
      );
    case "datetime": {
      // prince-ui DatePicker → de-DE-Format (TT.MM.JJJJ) + Apple-Segmente/Kalender.
      // Wert wird als ISO-Datum (yyyy-mm-dd) gehalten.
      let dateValue: CalendarDate | null = null;
      const raw = value == null ? "" : String(value).slice(0, 10);
      if (raw.trim()) {
        try {
          dateValue = parseDate(raw);
        } catch {
          dateValue = null;
        }
      }
      return (
        <DatePicker
          {...commonField}
          value={dateValue}
          onChange={(v) => setValue(key, v ? v.toString() : undefined)}
        />
      );
    }
    case "select":
      return (
        <div className="prn-form-select-wrap">
          <Select
            label={label}
            isInvalid={Boolean(error)}
            isRequired={required}
            selectedKey={value == null ? null : String(value)}
            onSelectionChange={(k) => setValue(key, k == null ? undefined : String(k))}
          >
            {options.map((o) => (
              <SelectItem key={o.value} id={o.value} textValue={o.label}>
                {o.label}
              </SelectItem>
            ))}
          </Select>
          {field.description && <div className="prn-form-hint">{field.description}</div>}
          {error && (
            <div className="prn-form-error" role="alert">
              {error}
            </div>
          )}
        </div>
      );
    case "radio":
      return (
        <RadioGroup
          {...commonField}
          value={value == null ? null : String(value)}
          onChange={(v) => setValue(key, v)}
        >
          {options.map((o) => (
            <Radio key={o.value} value={o.value}>
              {o.label}
            </Radio>
          ))}
        </RadioGroup>
      );
    case "checklist":
      return (
        <CheckboxGroup
          {...commonField}
          value={Array.isArray(value) ? value.map(String) : []}
          onChange={(v) => setValue(key, v)}
        >
          {options.map((o) => (
            <Checkbox key={o.value} value={o.value}>
              {o.label}
            </Checkbox>
          ))}
        </CheckboxGroup>
      );
    case "taglist":
      return (
        <TaglistField
          label={label}
          options={options}
          selected={Array.isArray(value) ? value.map(String) : []}
          onChange={(v) => setValue(key, v)}
          error={error}
        />
      );
    case "textfield":
    default:
      return (
        <TextField
          {...commonField}
          value={value == null ? "" : String(value)}
          onChange={(v) => setValue(key, v)}
        />
      );
  }
}

/**
 * Taglist: ComboBox zum Hinzufügen + TagGroup zum Entfernen (Mehrfachauswahl
 * aus `values`). Hält Mehrfachwerte als `string[]`.
 */
function TaglistField({
  label,
  options,
  selected,
  onChange,
  error,
}: {
  label: ReactNode;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  error?: string;
}) {
  const available = options.filter((o) => !selected.includes(o.value));
  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  return (
    <div className="prn-form-taglist">
      <ComboBox
        label={label}
        errorMessage={error}
        isInvalid={Boolean(error)}
        selectedKey={null}
        onSelectionChange={(k) => {
          if (k != null) onChange([...selected, String(k)]);
        }}
      >
        {available.map((o) => (
          <ComboBoxItem key={o.value} id={o.value} textValue={o.label}>
            {o.label}
          </ComboBoxItem>
        ))}
      </ComboBox>
      {selected.length > 0 && (
        <TagGroup
          aria-label={`${String(label)} Auswahl`}
          onRemove={(keys) => onChange(selected.filter((s) => !keys.has(s)))}
        >
          {selected.map((v) => (
            <Tag key={v} id={v}>
              {labelFor(v)}
            </Tag>
          ))}
        </TagGroup>
      )}
    </div>
  );
}
