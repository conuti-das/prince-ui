import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ProgressBar",
  controls: [
    { name: "label", type: "text", default: "Upload" },
    { name: "value", type: "number", default: 60 },
    { name: "showValue", type: "toggle", default: true },
    { name: "isIndeterminate", type: "toggle", default: false },
  ],
};
export default schema;
