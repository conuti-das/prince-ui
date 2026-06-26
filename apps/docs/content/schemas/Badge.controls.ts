import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Badge",
  childrenProp: "children",
  controls: [
    {
      name: "tone",
      type: "select",
      options: ["neutral", "green", "red", "orange", "blue", "teal", "gray"],
      default: "green",
    },
    { name: "children", type: "text", default: "Erfolgreich" },
  ],
};
export default schema;
