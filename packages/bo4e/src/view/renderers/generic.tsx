import type { Bo4eObject } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { getFieldOrder } from "../../schema/load-schema";
import { SchemaField } from "../SchemaField";
import { humanize } from "../../core/humanize";
import { isScalarish, displayValue } from "../value-format";

export function GenericBody({ schema, boTyp, obj }: { schema: Bo4eSchema; boTyp: string; obj: Bo4eObject }) {
  const ordered = getFieldOrder(schema, boTyp).filter((k) => k in obj && isScalarish(obj[k]));
  const extra = Object.keys(obj).filter((k) => isScalarish(obj[k]) && !ordered.includes(k));
  const keys = [...ordered, ...extra].slice(0, 6);
  return (
    <div className="prn-bo-grp">
      {keys.map((k) => (
        <div className="prn-bo-line" key={k}>
          <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={obj[k]}>
            <span className="lk">{humanize(k)}</span>
          </SchemaField>
          <span className="lv">{displayValue(obj[k]).text}</span>
        </div>
      ))}
    </div>
  );
}
