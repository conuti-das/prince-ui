import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Separator",
  controls: [
    {
      name: "orientation",
      type: "segmented",
      options: ["horizontal", "vertical"],
      default: "horizontal",
    },
  ],
};
export default schema;
