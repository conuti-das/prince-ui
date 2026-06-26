import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Button",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Button" },
    { name: "variant", type: "segmented", options: ["filled", "tinted", "plain"], default: "filled" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
