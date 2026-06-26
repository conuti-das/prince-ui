import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Meter",
  controls: [
    { name: "label", type: "text", default: "Speicher" },
    { name: "value", type: "number", default: 72 },
    { name: "showValue", type: "toggle", default: true },
    { name: "bands", type: "toggle", default: true },
  ],
};
export default schema;
