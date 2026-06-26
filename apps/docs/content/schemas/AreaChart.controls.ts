import type { ControlSchema } from "../../src/playground/schema";
// `data` ist ein Objekt-Control und wird nicht im Playground exponiert (Demo-Daten
// in der Komponente). Ohne `data` zeigt AreaChart automatisch ChartEmpty —
// die Skalar-Controls (showAxes/color/width/height) bleiben interaktiv.
const schema: ControlSchema = {
  component: "AreaChart",
  controls: [
    { name: "showAxes", type: "toggle", default: false },
    { name: "color", type: "text", default: "" },
    { name: "width", type: "number", default: 320 },
    { name: "height", type: "number", default: 180 },
  ],
};
export default schema;
