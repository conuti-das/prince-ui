import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "RadioGroup",
  controls: [
    { name: "label", type: "text", default: "Sparte" },
    { name: "orientation", type: "segmented", options: ["vertical", "horizontal"], default: "vertical" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
