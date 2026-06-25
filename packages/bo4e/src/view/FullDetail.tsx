import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import { humanize } from "../core/humanize";
import { isScalarish, displayValue } from "./value-format";

export function FullDetail({ schema, boTyp, obj }: { schema: Bo4eSchema; boTyp: string; obj: Bo4eObject }) {
  const keys = Object.keys(obj).filter((k) => isScalarish(obj[k]));
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
