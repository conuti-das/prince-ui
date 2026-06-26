import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Slider",
  controls: [
    { name: "label", type: "text", default: "Lautstärke" },
    { name: "minValue", type: "number", default: 0 },
    { name: "maxValue", type: "number", default: 100 },
    { name: "step", type: "number", default: 1 },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "showValue", type: "toggle", default: true },
  ],
};
export default schema;
