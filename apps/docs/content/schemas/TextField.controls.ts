import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "TextField",
  controls: [
    { name: "label", type: "text", default: "Marktpartner" },
    { name: "placeholder", type: "text", default: "z. B. 9900123000007" },
    { name: "description", type: "text", default: "" },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "isRequired", type: "toggle", default: false },
  ],
};
export default schema;
