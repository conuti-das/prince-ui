import { useMemo, useState } from "react";
import { resolveComponent } from "./registry";
import { Controls } from "./Controls";
import { generateCode } from "./codegen";
import { usePropDocs } from "./use-prop-docs";
import { initialState, type ControlSchema, type ControlState } from "./schema";
import "./playground.css";

// Control-Schemata eager laden (klein, JSON-artig).
const schemas = import.meta.glob("../../content/schemas/*.controls.ts", { eager: true }) as Record<string, { default: ControlSchema }>;
function schemaFor(component: string): ControlSchema | null {
  const hit = Object.entries(schemas).find(([f]) => f.endsWith(`/${component}.controls.ts`));
  return hit ? hit[1].default : null;
}

function buildLlmText(component: string, code: string, docs: ReturnType<typeof usePropDocs>): string {
  const lines = [`# ${component}`, "", "```tsx", code, "```"];
  const entries = Object.entries(docs);
  if (entries.length) {
    lines.push("", "## Props");
    for (const [name, d] of entries) {
      const def = d.defaultValue ? ` (default: ${d.defaultValue})` : "";
      const desc = d.description ? ` — ${d.description}` : "";
      lines.push(`- \`${name}\`: ${d.type}${def}${desc}`);
    }
  }
  return lines.join("\n");
}

export function Playground({ component }: { component: string }) {
  const schema = schemaFor(component);
  const docs = usePropDocs(schema?.component ?? component);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"" | "code" | "llm">("");
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

  function copy(kind: "code" | "llm") {
    const text = kind === "code" ? code : buildLlmText(schema!.component, code, docs);
    navigator.clipboard?.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="pg">
      <div className="pg-stage"><Comp {...props}>{children}</Comp></div>
      <Controls controls={schema.controls} state={state} onChange={(n, v) => setState((s) => ({ ...s, [n]: v }))} docs={docs} />
      <div className={"pg-code" + (expanded ? " is-expanded" : "")}>
        <div className="pg-actions">
          <button
            type="button"
            className="pg-icon-btn"
            aria-label={copied === "code" ? "Kopiert" : "Code kopieren"}
            title="Code kopieren"
            onClick={() => copy("code")}
          >
            {copied === "code" ? "✓" : "⧉"}
          </button>
          <button
            type="button"
            className="pg-icon-btn"
            aria-label={copied === "llm" ? "Kopiert" : "Für LLM kopieren"}
            title="Für LLM kopieren"
            onClick={() => copy("llm")}
          >
            {copied === "llm" ? "✓" : "✦"}
          </button>
          <button
            type="button"
            className="pg-icon-btn"
            aria-label={expanded ? "Code einklappen" : "Code ausklappen"}
            aria-expanded={expanded}
            title={expanded ? "Einklappen" : "Öffnen"}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "⤡" : "⤢"}
          </button>
        </div>
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}
