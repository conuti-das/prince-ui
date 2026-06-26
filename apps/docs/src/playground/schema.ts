export type Control =
  | { name: string; type: "text"; default: string }
  | { name: string; type: "toggle"; default: boolean }
  | { name: string; type: "number"; default: number }
  | { name: string; type: "select" | "segmented"; options: string[]; default: string };

export type ControlSchema = {
  /** Import-Name + JSX-Tag der Komponente, z. B. "Button". */
  component: string;
  /** Prop, das als Kind gerendert wird (z. B. children-Text). Optional. */
  childrenProp?: string;
  controls: Control[];
};

export type ControlState = Record<string, string | boolean | number>;

export function initialState(schema: ControlSchema): ControlState {
  return Object.fromEntries(schema.controls.map((c) => [c.name, c.default]));
}
