import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorArea",
  controls: [
    {
      name: "xChannel",
      type: "select",
      options: ["saturation", "brightness", "hue", "red", "green", "blue"],
      default: "saturation",
    },
    {
      name: "yChannel",
      type: "select",
      options: ["brightness", "saturation", "hue", "red", "green", "blue"],
      default: "brightness",
    },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
