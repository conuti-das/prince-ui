import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "FileTrigger",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Datei wählen" },
    { name: "allowsMultiple", type: "toggle", default: false },
  ],
};
export default schema;
