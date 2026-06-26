import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Disclosure",
  childrenProp: "children",
  controls: [
    { name: "title", type: "text", default: "Weitere Details" },
    { name: "children", type: "text", default: "Hier steht der aufklappbare Inhalt der Sektion." },
    { name: "defaultExpanded", type: "toggle", default: false },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
