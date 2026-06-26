import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Switch",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Auto-Refresh" },
    { name: "isSelected", type: "toggle", default: true },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
