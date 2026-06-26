import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Calendar",
  controls: [
    { name: "isDisabled", type: "toggle", default: false },
    { name: "isReadOnly", type: "toggle", default: false },
    { name: "autoFocus", type: "toggle", default: false },
  ],
};
export default schema;
