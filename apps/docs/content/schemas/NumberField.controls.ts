import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "NumberField",
  controls: [
    { name: "label", type: "text", default: "Menge" },
    { name: "placeholder", type: "text", default: "" },
    { name: "minValue", type: "number", default: 0 },
    { name: "maxValue", type: "number", default: 100 },
    { name: "step", type: "number", default: 1 },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
