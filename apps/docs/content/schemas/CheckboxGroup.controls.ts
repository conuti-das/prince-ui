import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "CheckboxGroup",
  controls: [
    { name: "label", type: "text", default: "Optionen" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
