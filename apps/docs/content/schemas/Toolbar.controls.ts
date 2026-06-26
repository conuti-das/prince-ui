import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Toolbar",
  controls: [
    { name: "title", type: "text", default: "Transaktionen" },
    { name: "subtitle", type: "text", default: "248 offen · zuletzt aktualisiert 12:04" },
  ],
};
export default schema;
