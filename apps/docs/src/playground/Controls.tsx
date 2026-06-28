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
          <div key={c.name} className="pg-control">
            <span className="pg-control-name">
              <span className="pg-control-label">{c.name}</span>
              {tip && <abbr className="pg-info" title={tip}>ⓘ</abbr>}
            </span>

            {c.type === "text" && (
              <input
                className="docs-field"
                aria-label={c.name}
                value={String(state[c.name] ?? "")}
                onChange={(e) => onChange(c.name, e.target.value)}
              />
            )}

            {c.type === "number" && (
              <input
                type="number"
                className="docs-field"
                aria-label={c.name}
                value={Number(state[c.name] ?? 0)}
                onChange={(e) => onChange(c.name, Number(e.target.value))}
              />
            )}

            {c.type === "toggle" && (
              <button
                type="button"
                role="switch"
                aria-label={c.name}
                aria-checked={Boolean(state[c.name])}
                className="docs-switch"
                onClick={() => onChange(c.name, !state[c.name])}
              >
                <span className="docs-switch-knob" />
              </button>
            )}

            {c.type === "segmented" && (
              <div className="docs-segmented" role="group" aria-label={c.name}>
                {c.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={"docs-segment" + (String(state[c.name]) === o ? " is-active" : "")}
                    aria-pressed={String(state[c.name]) === o}
                    onClick={() => onChange(c.name, o)}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {c.type === "select" && (
              <select
                className="docs-select"
                aria-label={c.name}
                value={String(state[c.name])}
                onChange={(e) => onChange(c.name, e.target.value)}
              >
                {c.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
