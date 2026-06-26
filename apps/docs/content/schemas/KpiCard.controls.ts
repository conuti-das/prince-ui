import type { ControlSchema } from "../../src/playground/schema";
// `icon` ist in der Story control:false (ReactNode) und wird nicht exponiert.
const schema: ControlSchema = {
  component: "KpiCard",
  controls: [
    { name: "label", type: "text", default: "Transaktionen" },
    { name: "value", type: "text", default: "12.480" },
    { name: "delta", type: "text", default: "+8,2 %" },
    { name: "trend", type: "segmented", options: ["up", "down", "flat"], default: "up" },
  ],
};
export default schema;
