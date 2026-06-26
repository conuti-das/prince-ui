import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Notice",
  childrenProp: "children",
  controls: [
    {
      name: "tone",
      type: "segmented",
      options: ["info", "positive", "critical", "negative"],
      default: "info",
    },
    { name: "title", type: "text", default: "Hinweis" },
    {
      name: "children",
      type: "text",
      default: "Die Datenaktualisierung erfolgt alle 60 Sekunden.",
    },
  ],
};
export default schema;
