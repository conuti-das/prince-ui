import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorPicker",
  controls: [{ name: "label", type: "text", default: "Markenfarbe" }],
};
export default schema;
