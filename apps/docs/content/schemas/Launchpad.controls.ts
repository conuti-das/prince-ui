import type { ControlSchema } from "../../src/playground/schema";

// Launchpad ist ein Composite: die Pflicht-Prop `sections` ist ein verschachteltes
// Objekt-Array (polymorphe Cards via `kind`) und lässt sich nicht über die
// skalaren Playground-Controls (text/toggle/number/select) abbilden. Ohne
// `sections` bliebe der Live-Render leer, daher kein <Playground>, sondern
// kuratierte <Example>-Blöcke. Dieses Schema bildet nur das skalare `editable` ab.
const schema: ControlSchema = {
  component: "Launchpad",
  controls: [{ name: "editable", type: "toggle", default: false }],
};
export default schema;
