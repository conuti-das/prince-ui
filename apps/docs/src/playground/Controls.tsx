import type { Control, ControlState } from "./schema";
import type { PropDoc } from "./use-prop-docs";

export function Controls({ controls, state, onChange, docs }: {
  controls: Control[];
  state: ControlState;
  onChange: (name: string, value: string | boolean | number) => void;
  docs?: Record<string, PropDoc>;
}) {
  return (
    <div className="pg-controls">
      {controls.map((c) => {
        const doc = docs?.[c.name];
        const tip = doc ? `${doc.type}${doc.description ? ` — ${doc.description}` : ""}` : undefined;
        return (
          <label key={c.name} className="pg-control">
            <span className="pg-control-name">
              {c.name}
              {tip && <abbr className="pg-info" title={tip}>ⓘ</abbr>}
            </span>
            {c.type === "text" && <input value={String(state[c.name] ?? "")} onChange={(e) => onChange(c.name, e.target.value)} />}
            {c.type === "toggle" && <input type="checkbox" checked={Boolean(state[c.name])} onChange={(e) => onChange(c.name, e.target.checked)} />}
            {c.type === "number" && <input type="number" value={Number(state[c.name] ?? 0)} onChange={(e) => onChange(c.name, Number(e.target.value))} />}
            {(c.type === "select" || c.type === "segmented") && (
              <select value={String(state[c.name])} onChange={(e) => onChange(c.name, e.target.value)}>
                {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </label>
        );
      })}
    </div>
  );
}
