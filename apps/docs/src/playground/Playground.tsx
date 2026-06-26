import { useMemo, useState } from "react";
import { resolveComponent } from "./registry";
import { Controls } from "./Controls";
import { generateCode } from "./codegen";
import { initialState, type ControlSchema, type ControlState } from "./schema";
import "./playground.css";

// Control-Schemata eager laden (klein, JSON-artig).
const schemas = import.meta.glob("../../content/schemas/*.controls.ts", { eager: true }) as Record<string, { default: ControlSchema }>;
function schemaFor(component: string): ControlSchema | null {
  const hit = Object.entries(schemas).find(([f]) => f.endsWith(`/${component}.controls.ts`));
  return hit ? hit[1].default : null;
}

export function Playground({ component }: { component: string }) {
  const schema = schemaFor(component);
  if (!schema) return <p><em>Kein Playground-Schema für {component}.</em></p>;
  const Comp = resolveComponent(schema.component);
  const [state, setState] = useState<ControlState>(() => initialState(schema));
  const code = useMemo(() => generateCode(schema, state), [schema, state]);
  const childrenProp = schema.childrenProp;
  const props = useMemo(() => {
    const p = { ...state };
    if (childrenProp) delete p[childrenProp];
    return p;
  }, [state, childrenProp]);
  const children = childrenProp ? String(state[childrenProp] ?? "") : undefined;

  return (
    <div className="pg">
      <div className="pg-stage"><Comp {...props}>{children}</Comp></div>
      <Controls controls={schema.controls} state={state} onChange={(n, v) => setState((s) => ({ ...s, [n]: v }))} />
      <div className="pg-code">
        <button className="pg-copy" onClick={() => navigator.clipboard.writeText(code)}>Copy</button>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}
