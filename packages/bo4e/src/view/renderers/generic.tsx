import type { Bo4eObject, Density } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { getFieldOrder } from "../../schema/load-schema";
import { NestedValue } from "../NestedValue";
import { isScalarish } from "../value-format";

export function GenericBody({
  schema,
  boTyp,
  obj,
  density = "fachlich",
}: {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density?: Density;
}) {
  if (density === "fachlich") {
    // compact: first ~6 scalar fields, schema-ordered
    const ordered = getFieldOrder(schema, boTyp).filter((k) => k in obj && isScalarish(obj[k]));
    const extra = Object.keys(obj).filter((k) => isScalarish(obj[k]) && !ordered.includes(k));
    const keys = [...ordered, ...extra].slice(0, 6);
    return (
      <div className="prn-bo-kvgrid">
        {keys.map((k) => (
          <NestedValue
            key={k}
            schema={schema}
            boTyp={boTyp}
            fieldKey={k}
            value={obj[k]}
            density="gefuellt"
            editable={false}
            path={[k]}
            depth={0}
          />
        ))}
      </div>
    );
  }
  // gefuellt / alle: full recursive body
  const keys = Object.keys(obj).filter((k) => k !== "boTyp");
  return (
    <div className="prn-bo-kvgrid">
      {keys.map((k) => (
        <NestedValue
          key={k}
          schema={schema}
          boTyp={boTyp}
          fieldKey={k}
          value={obj[k]}
          density={density}
          editable={false}
          path={[k]}
          depth={0}
        />
      ))}
    </div>
  );
}
