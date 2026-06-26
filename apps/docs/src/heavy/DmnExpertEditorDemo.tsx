import { useState } from "react";
import { DmnExpertEditor } from "@conuti-das/prince-ui-dmn";
import { DMN_EXPERT_XML } from "./demo-data";

/**
 * dmn-js-Modeler (DRD + decision-table + literal), gethemt über die prince-ui-
 * Token-Bridge — entspricht der Story „Default".
 *
 * Hinweis: dmn-js ist ein optionaler Peer und wird lazy via dynamic import
 * geladen; ohne dmn-js@^17 zeigt der Canvas eine Fehlermeldung.
 */
export default function DmnExpertEditorDemo() {
  const [, setXml] = useState(DMN_EXPERT_XML);
  return (
    <div style={{ height: 520 }}>
      <DmnExpertEditor
        defaultValue={DMN_EXPERT_XML}
        onChange={setXml}
        onSave={(xml) => console.log("[DmnExpertEditor] save", xml.length)}
      />
    </div>
  );
}
