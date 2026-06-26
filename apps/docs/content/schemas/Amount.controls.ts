import type { ControlSchema } from "../../src/playground/schema";
const schema: ControlSchema = {
  component: "Amount",
  controls: [
    { name: "value", type: "number", default: 1234567.89 },
    { name: "currency", type: "text", default: "EUR" },
    { name: "locale", type: "text", default: "" },
    { name: "minimumFractionDigits", type: "number", default: 0 },
    { name: "maximumFractionDigits", type: "number", default: 0 },
    { name: "colored", type: "toggle", default: false },
    { name: "signed", type: "toggle", default: false },
  ],
};
export default schema;
