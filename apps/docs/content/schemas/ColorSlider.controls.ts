import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorSlider",
  controls: [
    { name: "label", type: "text", default: "Farbton" },
    {
      name: "channel",
      type: "select",
      options: ["hue", "saturation", "lightness", "brightness", "alpha"],
      default: "hue",
    },
    { name: "showValue", type: "toggle", default: true },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
