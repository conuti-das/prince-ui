import { useState } from "react";
import { Select, SelectItem } from "@conuti-das/prince-ui";
import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { resolveField, getFieldOrder } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import { EditableValue } from "./EditableValue";
import { humanize } from "../core/humanize";
import { isScalarish, displayValue } from "./value-format";

export interface FullDetailProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  editable?: boolean;
}

export function FullDetail({ schema, boTyp, obj, editable = false }: FullDetailProps) {
  const [draft, setDraft] = useState<Bo4eObject>(obj);
  const source = editable ? draft : obj;
  const keys = Object.keys(source).filter((k) => isScalarish(source[k]));

  if (!editable) {
    return (
      <div className="prn-bo-kvgrid">
        {keys.map((k) => {
          const d = displayValue(obj[k]);
          return (
            <div className="prn-bo-kv" key={k}>
              <span className="k">
                <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}>
                  <span>{humanize(k)}</span>
                </SchemaField>
              </span>
              <span className="v" data-null={d.isNull} title={d.text}>
                {d.text}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const setField = (k: string, v: unknown) => setDraft((d) => ({ ...d, [k]: v }));
  const candidates = getFieldOrder(schema, boTyp).filter((k) => !(k in draft));

  return (
    <div>
      <div className="prn-bo-kvgrid">
        {keys.map((k) => (
          <div className="prn-bo-kv" key={k}>
            <span className="k">
              <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={draft[k]}>
                <span>{humanize(k)}</span>
              </SchemaField>
            </span>
            <span className="v">
              <EditableValue doc={resolveField(schema, boTyp, k)} value={draft[k]} onChange={(v) => setField(k, v)} />
            </span>
          </div>
        ))}
      </div>
      {candidates.length ? (
        <div className="prn-bo-addfield">
          <Select
            aria-label="Feld hinzufügen"
            placeholder="+ Feld hinzufügen"
            selectedKey={null}
            onSelectionChange={(k) => k && setField(String(k), "")}
          >
            {candidates.map((c) => (
              <SelectItem key={c} id={c}>
                {humanize(c)}
              </SelectItem>
            ))}
          </Select>
        </div>
      ) : null}
    </div>
  );
}
