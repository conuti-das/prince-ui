import { describe, it, expect } from "vitest";
import { generateCode } from "./codegen";
import type { ControlSchema } from "./schema";

const schema: ControlSchema = {
  component: "Button",
  childrenProp: "children",
  controls: [
    { name: "children", type: "text", default: "Button" },
    { name: "variant", type: "segmented", options: ["filled", "tinted", "plain"], default: "filled" },
    { name: "isDisabled", type: "toggle", default: false },
  ],
};

describe("generateCode", () => {
  it("renders import and JSX with non-default props and children", () => {
    const code = generateCode(schema, { children: "Speichern", variant: "tinted", isDisabled: true });
    expect(code).toContain(`import { Button } from '@conuti-das/prince-ui';`);
    expect(code).toContain(`<Button variant="tinted" isDisabled>Speichern</Button>`);
  });
  it("omits props equal to their default and self-closes without children", () => {
    const code = generateCode(schema, { children: "", variant: "filled", isDisabled: false });
    expect(code).toContain(`<Button />`);
  });
});
