import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Select",
  controls: [
    { name: "label", type: "text", default: "Sparte" },
    { name: "placeholder", type: "text", default: "Bitte wählen" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
