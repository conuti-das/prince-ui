import type { ControlSchema } from "../../src/playground/schema";
// `data` ist ein Objekt-Control und wird nicht im Playground exponiert (Demo-Daten
// in der Komponente). Ohne `data` zeigt BarChart automatisch den Leerzustand —
// die Skalar-Controls (color/showLabels/width/height) bleiben interaktiv.
const schema: ControlSchema = {
  component: "BarChart",
  controls: [
    { name: "color", type: "text", default: "" },
    { name: "showLabels", type: "toggle", default: true },
    { name: "width", type: "number", default: 320 },
    { name: "height", type: "number", default: 180 },
  ],
};
export default schema;
