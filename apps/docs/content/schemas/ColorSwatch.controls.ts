import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "ColorSwatch",
  controls: [{ name: "color", type: "text", default: "#3478F6" }],
};
export default schema;
