import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorSwatchPicker",
  controls: [
    { name: "layout", type: "segmented", options: ["grid", "stack"], default: "grid" },
  ],
};
export default schema;
