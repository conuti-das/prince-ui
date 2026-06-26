import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorField",
  controls: [
    { name: "label", type: "text", default: "Akzentfarbe" },
    { name: "description", type: "text", default: "" },
    { name: "errorMessage", type: "text", default: "" },
    { name: "placeholder", type: "text", default: "Hex, z. B. #34C759" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
