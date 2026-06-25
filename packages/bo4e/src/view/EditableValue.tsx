import type { ZonedDateTime } from "@internationalized/date";
import { TextField, NumberField, Switch, Select, SelectItem, DateField } from "@conuti-das/prince-ui";
import type { FieldDoc } from "../types";
import { isIsoDate } from "../core/datetime";
import { isoToBerlin, berlinToIso } from "../core/date-edit";

export interface EditableValueProps {
  doc: FieldDoc;
  value: unknown;
  onChange: (value: unknown) => void;
}

/**
 * Schema-getriebenes Eingabe-Widget für ein einzelnes Feld:
 * Enum → Select, Boolean → Switch, Zahl → NumberField, ISO-Datum → DateField
 * (Anzeige in Europe/Berlin, Rückgabe als ISO-UTC), sonst Freitext.
 */
export function EditableValue({ doc, value, onChange }: EditableValueProps) {
  const label = doc.translation ?? "";

  if (doc.enum) {
    return (
      <Select
        aria-label={label}
        selectedKey={value == null ? null : String(value)}
        onSelectionChange={(k) => onChange(k)}
      >
        {doc.enum.values.map((v) => (
          <SelectItem key={v} id={v}>
            {v}
          </SelectItem>
        ))}
      </Select>
    );
  }

  if (typeof value === "boolean") {
    return (
      <Switch isSelected={value} onChange={onChange}>
        {value ? "Ja" : "Nein"}
      </Switch>
    );
  }

  if (typeof value === "number") {
    return <NumberField aria-label={label} value={value} onChange={onChange} />;
  }

  if (isIsoDate(value)) {
    return (
      <DateField
        aria-label={label}
        granularity="minute"
        value={isoToBerlin(value)}
        onChange={(z) => z && onChange(berlinToIso(z as ZonedDateTime))}
      />
    );
  }

  return <TextField aria-label={label} value={value == null ? "" : String(value)} onChange={onChange} />;
}
