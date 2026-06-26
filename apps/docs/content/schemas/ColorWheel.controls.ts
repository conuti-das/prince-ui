import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorWheel",
  controls: [
    { name: "outerRadius", type: "number", default: 100 },
    { name: "innerRadius", type: "number", default: 74 },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
