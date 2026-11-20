import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "FilterChip",
  controls: [
    { name: "children", type: "text", default: "Fehler" },
    { name: "count", type: "number", default: 3 },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
