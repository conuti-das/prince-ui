import { useState } from "react";
import { DmnTableEditor } from "@conuti-das/prince-ui-dmn";
import { DMN_TABLE_XML } from "./demo-data";

/**
 * Tabellen-zentrierter DMN-Editor (uncontrolled) mit Titel/Untertitel und
 * Umschalter in den Experten-Modus — entspricht der Story „Default".
 */
export default function DmnTableEditorDemo() {
  const [, setXml] = useState(DMN_TABLE_XML);
  return (
    <div style={{ height: 520 }}>
      <DmnTableEditor
        defaultValue={DMN_TABLE_XML}
        title="E_0405 — Marktrolle ermitteln"
        subtitle="LF · 2026-04-01"
        onChange={setXml}
        onSave={(xml) => console.log("[DmnTableEditor] save", xml.length, "Zeichen")}
        onSwitchToExpert={() => console.log("[DmnTableEditor] → Experten-Modus")}
      />
    </div>
  );
}
