import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "DateField",
  controls: [
    { name: "label", type: "text", default: "Datum" },
    { name: "description", type: "text", default: "" },
    { name: "errorMessage", type: "text", default: "" },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "isInvalid", type: "toggle", default: false },
  ],
};
export default schema;
