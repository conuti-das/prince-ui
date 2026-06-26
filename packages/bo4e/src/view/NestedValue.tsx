import { Disclosure, DisclosureGroup } from "@conuti-das/prince-ui";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { resolveField, resolveFieldStructure } from "../schema/load-schema";
import { SchemaField } from "./SchemaField";
import { EditableValue } from "./EditableValue";
import { humanize } from "../core/humanize";
import { isScalarish, displayValue } from "./value-format";
import { isDeepEmpty } from "../core/empty";
import { computeGhostFields } from "./useGhostFields";
import { itemId } from "../core/array-ids";
import type { Path } from "../core/path";

/** Object/array nesting levels (not key-hops). Real MALOs nest ~4 deep. */
export const MAX_DEPTH = 5;

export interface NestedValueProps {
  schema: Bo4eSchema;
  boTyp: string;
  fieldKey: string;
  value: unknown;
  density: Density;
  editable: boolean;
  path: Path;
  depth: number;
  /** Immutable draft mutator, threaded from the card root (edit mode only). */
  onChange?: (path: Path, value: unknown) => void;
}

function Label({
  schema,
  boTyp,
  fieldKey,
  value,
}: {
  schema: Bo4eSchema;
  boTyp: string;
  fieldKey: string;
  value: unknown;
}) {
  return (
    <SchemaField schema={schema} boTyp={boTyp} fieldKey={fieldKey} value={value}>
      <span>{humanize(fieldKey)}</span>
    </SchemaField>
  );
}

export function NestedValue(props: NestedValueProps) {
  const { schema, boTyp, fieldKey, value, density, editable, path, depth, onChange } = props;
  const label = <Label schema={schema} boTyp={boTyp} fieldKey={fieldKey} value={value} />;

  // 1. deep-empty first (covers null, [], {}, all-null trees)
  if (isDeepEmpty(value)) {
    if (density === "gefuellt") return null; // prune

    // density === "alle": structure-gated create (edit) or plain ghost
    if (editable && onChange) {
      const st = resolveFieldStructure(schema, boTyp, fieldKey);
      if (st?.kind === "array") {
        return (
          <div className="prn-bo-kv">
            <span className="k">{label}</span>
            <span className="v">
              <button
                type="button"
                className="prn-bo-addbtn"
                onClick={() => onChange([...path], [{ boTyp: st.ref }])}
              >
                + Eintrag hinzufügen
              </button>
            </span>
          </div>
        );
      }
      if (st?.kind === "object") {
        return (
          <div className="prn-bo-kv">
            <span className="k">{label}</span>
            <span className="v">
              <button
                type="button"
                className="prn-bo-addbtn"
                onClick={() => onChange([...path], { boTyp: st.ref })}
              >
                + Komponente anlegen
              </button>
            </span>
          </div>
        );
      }
      // No structure entry: only scalar-empties (null/"") may be created.
      // An empty array/object of unknown shape stays a read-only ghost — creating
      // into an unknown container would produce invalid BO4E (spec).
      const isEmptyContainer = Array.isArray(value) || (value != null && typeof value === "object");
      if (st?.kind === "scalar" || (st == null && !isEmptyContainer)) {
        // Prefill with the schema example so the user starts from a valid shape.
        const example = resolveField(schema, boTyp, fieldKey).example ?? "";
        return (
          <div className="prn-bo-kv">
            <span className="k">{label}</span>
            <span className="v">
              <button type="button" className="prn-bo-addbtn" onClick={() => onChange([...path], example)}>
                + anlegen
              </button>
            </span>
          </div>
        );
      }
    }
    // read-only ghost row
    return (
      <div className="prn-bo-kv">
        <span className="k">{label}</span>
        <span className="v" data-null="true">
          —
        </span>
      </div>
    );
  }

  // 2. scalar
  if (isScalarish(value)) {
    if (editable && onChange) {
      return (
        <div className="prn-bo-kv">
          <span className="k">{label}</span>
          <span className="v">
            <EditableValue
              doc={resolveField(schema, boTyp, fieldKey)}
              value={value}
              onChange={(v) => onChange([...path], v)}
            />
          </span>
        </div>
      );
    }
    const d = displayValue(value);
    return (
      <div className="prn-bo-kv">
        <span className="k">{label}</span>
        <span className="v" data-null={d.isNull} title={d.text}>
          {d.text}
        </span>
      </div>
    );
  }

  // depth guard for containers
  if (depth >= MAX_DEPTH) {
    return (
      <div className="prn-bo-nestedmore">
        {label} <span>… weitere Ebenen</span>
      </div>
    );
  }

  // 3a. object-array
  if (Array.isArray(value)) {
    const items = value as Bo4eObject[];
    return (
      <div className="prn-bo-nested">
        <div className="prn-bo-grph">
          {humanize(fieldKey)} · {items.length}
        </div>
        <DisclosureGroup>
          {items.map((item, i) => (
            <Disclosure key={itemId(item)} title={`${humanize(fieldKey)} ${i + 1}`} defaultExpanded>
              <NestedObject
                schema={schema}
                boTyp={item?.boTyp ?? boTyp}
                obj={item}
                density={density}
                editable={editable}
                path={[...path, i]}
                depth={depth + 1}
                onChange={onChange}
              />
            </Disclosure>
          ))}
        </DisclosureGroup>
      </div>
    );
  }

  // 3b. nested object — boTyp context switch if the sub-object is typed
  const obj = value as Bo4eObject;
  const childBoTyp = obj.boTyp ?? boTyp;
  return (
    <div className="prn-bo-nested">
      <Disclosure title={humanize(fieldKey)} defaultExpanded>
        <NestedObject
          schema={schema}
          boTyp={childBoTyp}
          obj={obj}
          density={density}
          editable={editable}
          path={[...path]}
          depth={depth + 1}
          onChange={onChange}
        />
      </Disclosure>
    </div>
  );
}

function NestedObject(props: {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
  path: Path;
  depth: number;
  onChange?: (path: Path, value: unknown) => void;
}) {
  const { schema, boTyp, obj, density, editable, path, depth, onChange } = props;
  // At "alle", surface schema-possible-but-empty sub-fields so created/nested
  // components reveal what can be filled (resolved via the merged field-dict).
  const ghosts = density === "alle" ? computeGhostFields(schema, boTyp, obj) : [];
  return (
    <div className="prn-bo-kvgrid">
      {Object.keys(obj)
        .filter((k) => k !== "boTyp")
        .map((k) => (
          <NestedValue
            key={k}
            schema={schema}
            boTyp={boTyp}
            fieldKey={k}
            value={obj[k]}
            density={density}
            editable={editable}
            path={[...path, k]}
            depth={depth}
            onChange={onChange}
          />
        ))}
      {ghosts.map((k) => (
        <NestedValue
          key={`ghost-${k}`}
          schema={schema}
          boTyp={boTyp}
          fieldKey={k}
          value={null}
          density={density}
          editable={editable}
          path={[...path, k]}
          depth={depth}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
