import type { ControlSchema } from "../../src/playground/schema";

// Sidebar ist ein Composite: die Pflicht-Prop `groups` ist ein Objekt-Array und
// `header`/`footer` sind JSX-Slots — keine skalaren Werte, die der Playground
// (text/toggle/number/select) erzeugen kann. Ohne `groups` würde der Live-Render
// leer/fehlerhaft bleiben, daher kein <Playground> auf der Seite, sondern
// kuratierte <Example>-Blöcke. Dieses Schema bildet nur die skalaren Slots ab.
const schema: ControlSchema = {
  component: "Sidebar",
  controls: [
    { name: "header", type: "text", default: "FinOps MaKo" },
    { name: "glass", type: "toggle", default: false },
  ],
};
export default schema;
