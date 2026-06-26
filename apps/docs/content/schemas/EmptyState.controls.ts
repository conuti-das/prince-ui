import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "EmptyState",
  controls: [
    { name: "title", type: "text", default: "Keine Transaktionen" },
    {
      name: "description",
      type: "text",
      default:
        "Für den gewählten Zeitraum wurden keine Transaktionen gefunden. Passe die Filter an.",
    },
  ],
};
export default schema;
