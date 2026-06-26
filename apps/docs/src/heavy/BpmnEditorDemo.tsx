import { useState } from "react";
import { BpmnEditor } from "@conuti-das/prince-ui-bpmn";
import { Button } from "@conuti-das/prince-ui";
import { BPMN_EDITOR_XML } from "./demo-data";

/**
 * Vollständiger bpmn-js-Modeler (controlled) mit Properties-Panel und einem
 * `actionsSlot` — entspricht den Stories „Controlled" und „Mit KI-Fix-Slot".
 */
export default function BpmnEditorDemo() {
  const [xml, setXml] = useState(BPMN_EDITOR_XML);
  return (
    <div style={{ height: 560 }}>
      <BpmnEditor
        value={xml}
        onChange={setXml}
        actionsSlot={<Button variant="tinted">KI-Assistent</Button>}
        onKiFix={(issues) => console.log("[BpmnEditor] KI-Fix für", issues.length, "Befunde")}
        onSave={(x) => console.log("[BpmnEditor] save", x.length, "Zeichen")}
      />
    </div>
  );
}
