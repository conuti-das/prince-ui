import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "DropZone",
  controls: [
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
