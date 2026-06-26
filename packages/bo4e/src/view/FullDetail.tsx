import { useState } from "react";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { NestedValue } from "./NestedValue";
import { SchemaField } from "./SchemaField";
import { humanize } from "../core/humanize";
import { computeGhostFields } from "./useGhostFields";
import { setIn, deleteIn, type Path } from "../core/path";

export interface FullDetailProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
}

export function FullDetail({ schema, boTyp, obj, density, editable }: FullDetailProps) {
  const [draft, setDraft] = useState<Bo4eObject>(obj);
  const source = editable ? draft : obj;
  const keys = Object.keys(source).filter((k) => k !== "boTyp");
  const ghosts = density === "alle" ? computeGhostFields(schema, boTyp, source) : [];

  // single path-keyed draft mutator threaded into NestedValue (edit mode)
  const onChange = (path: Path, value: unknown) => setDraft((d) => setIn(d, path, value));
  const del = (k: string) => setDraft((d) => deleteIn(d, [k]));

  return (
    <div className="prn-bo-kvgrid">
      {keys.map((k) =>
        editable ? (
          <div className="prn-bo-kv prn-bo-kv-edit" key={k}>
            <NestedValue
              schema={schema}
              boTyp={boTyp}
              fieldKey={k}
              value={draft[k]}
              density={density}
              editable
              path={[k]}
              depth={0}
              onChange={onChange}
            />
            <button
              type="button"
              className="prn-bo-delbtn"
              aria-label={`${humanize(k)} entfernen`}
              onClick={() => del(k)}
            >
              ×
            </button>
          </div>
        ) : (
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
        ),
      )}
      {ghosts.map((k) =>
        editable ? (
          <NestedValue
            key={`ghost-${k}`}
            schema={schema}
            boTyp={boTyp}
            fieldKey={k}
            value={null}
            density="alle"
            editable
            path={[k]}
            depth={0}
            onChange={onChange}
          />
        ) : (
          <div className="prn-bo-kv" key={`ghost-${k}`}>
            <span className="k">
              <SchemaField schema={schema} boTyp={boTyp} fieldKey={k} value={null}>
                <span>{humanize(k)}</span>
              </SchemaField>
            </span>
            <span className="v" data-null="true">
              —
            </span>
          </div>
        ),
      )}
    </div>
  );
}
