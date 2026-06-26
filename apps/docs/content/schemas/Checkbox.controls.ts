import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Checkbox",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Nur Fehler anzeigen" },
    { name: "isSelected", type: "toggle", default: false },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "isIndeterminate", type: "toggle", default: false },
  ],
};
export default schema;
