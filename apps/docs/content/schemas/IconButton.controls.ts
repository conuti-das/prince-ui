import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "IconButton",
  controls: [
    { name: "icon", type: "select", options: ["redo", "copy", "download", "info", "maximize", "filter"], default: "redo" },
    { name: "label", type: "text", default: "Aktualisieren" },
    { name: "size", type: "segmented", options: ["s", "m", "l"], default: "m" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};
export default schema;
