import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Card",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Glas-Container mit Titel-Header und regulärem Innenabstand." },
    { name: "title", type: "text", default: "Übersicht" },
    { name: "padding", type: "segmented", options: ["none", "compact", "regular", "spacious"], default: "regular" },
  ],
};
export default schema;
