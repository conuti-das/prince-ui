import type { ControlSchema } from "../../src/playground/schema";
// `data` ist ein Objekt-Control und wird nicht im Playground exponiert (Demo-Daten
// in der Komponente). Ohne `data` zeigt Sparkline den kompakten Leerzustand —
// die Skalar-Controls (color/width/height) bleiben interaktiv.
const schema: ControlSchema = {
  component: "Sparkline",
  controls: [
    { name: "color", type: "text", default: "" },
    { name: "width", type: "number", default: 220 },
    { name: "height", type: "number", default: 40 },
  ],
};
export default schema;
