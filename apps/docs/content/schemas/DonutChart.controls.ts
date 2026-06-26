import type { ControlSchema } from "../../src/playground/schema";
// `segments` ist ein Objekt-Control und wird nicht im Playground exponiert
// (Demo-Daten in der Komponente). Ohne `segments` zeigt DonutChart den
// Leerzustand — die Skalar-Controls (showLegend/size/thickness) bleiben aktiv.
const schema: ControlSchema = {
  component: "DonutChart",
  controls: [
    { name: "showLegend", type: "toggle", default: true },
    { name: "size", type: "number", default: 180 },
    { name: "thickness", type: "number", default: 28 },
  ],
};
export default schema;
