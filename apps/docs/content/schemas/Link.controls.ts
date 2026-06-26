import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Link",
  childrenProp: "children",
  controls: [
    { name: "href", type: "text", default: "#" },
    { name: "isDisabled", type: "toggle", default: false },
    { name: "children", type: "text", default: "Mehr erfahren" },
  ],
};
export default schema;
