import type { ControlSchema } from "../../src/playground/schema";

// AppShell ist ein Composite: die tragenden Props (sidebar, items, menuItems,
// search, user, children) sind JSX-Slots bzw. Objekt-Arrays und lassen sich
// nicht über die skalaren Playground-Controls (text/toggle/number/select)
// abbilden. Ein sinnvoller Live-Playground ist daher nicht möglich — die Seite
// nutzt kuratierte <Example>-Blöcke statt <Playground>. Dieses Schema deckt nur
// die skalaren Chrome-Optionen ab, damit das Format dennoch korrekt bleibt.
const schema: ControlSchema = {
  component: "AppShell",
  controls: [
    { name: "title", type: "text", default: "MACO" },
    { name: "subtitle", type: "text", default: "Marktkommunikation" },
    { name: "notifications", type: "toggle", default: true },
    { name: "productSwitch", type: "toggle", default: true },
    { name: "glass", type: "toggle", default: true },
  ],
};
export default schema;
