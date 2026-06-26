import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "SearchField",
  controls: [
    { name: "label", type: "text", default: "Suche" },
    { name: "placeholder", type: "text", default: "Transaktion suchen…" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
