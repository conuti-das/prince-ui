import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ComboBox",
  controls: [
    { name: "label", type: "text", default: "Marktrolle" },
    { name: "placeholder", type: "text", default: "Suchen…" },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "allowsCustomValue", type: "toggle", default: false },
  ],
};
export default schema;
