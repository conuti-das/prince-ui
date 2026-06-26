import type { ControlSchema, ControlState } from "./schema";

function attr(name: string, value: string | boolean | number): string | null {
  if (value === false) return null;
  if (value === true) return name;
  if (typeof value === "number") return `${name}={${value}}`;
  return `${name}=${JSON.stringify(value)}`;
}

export function generateCode(schema: ControlSchema, state: ControlState): string {
  const defaults = Object.fromEntries(schema.controls.map((c) => [c.name, c.default]));
  const children = schema.childrenProp ? String(state[schema.childrenProp] ?? "") : "";
  const attrs = schema.controls
    .filter((c) => c.name !== schema.childrenProp)
    .filter((c) => state[c.name] !== defaults[c.name])
    .map((c) => attr(c.name, state[c.name]))
    .filter(Boolean)
    .join(" ");
  const open = `<${schema.component}${attrs ? " " + attrs : ""}`;
  const jsx = children ? `${open}>${children}</${schema.component}>` : `${open} />`;
  return `import { ${schema.component} } from '@conuti-das/prince-ui';\n\n${jsx}`;
}
