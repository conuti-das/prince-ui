import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "DateRangePicker",
  controls: [
    { name: "label", type: "text", default: "Zeitraum" },
    { name: "description", type: "text", default: "" },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "isReadOnly", type: "toggle", default: false },
  ],
};
export default schema;
