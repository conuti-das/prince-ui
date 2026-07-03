import type { Bo4eObject, Density } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { getFieldOrder } from "../../schema/load-schema";
import { NestedValue } from "../NestedValue";
import { isScalarish } from "../value-format";

// In fachlichen Objekten sind diese Felder uninteressant → nur in „alle" zeigen.
const HIDE_UNLESS_ALLE = new Set(["botyp", "versionstruktur"]);

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
  const isHidden = (k: string) => density !== "alle" && HIDE_UNLESS_ALLE.has(k.toLowerCase());

  if (density === "fachlich") {
    // compact: first ~6 scalar fields, schema-ordered
    const ordered = getFieldOrder(schema, boTyp).filter(
      (k) => k in obj && isScalarish(obj[k]) && !isHidden(k),
    );
    const extra = Object.keys(obj).filter(
      (k) => isScalarish(obj[k]) && !ordered.includes(k) && !isHidden(k),
    );
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
  // gefuellt / alle: full recursive body (BoTyp/Versionsstruktur nur in „alle")
  const keys = Object.keys(obj).filter((k) => !isHidden(k));
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
