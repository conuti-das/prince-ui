import {
  CDocView,
  loadBo4eSchema,
  type Bo4eResolvers,
  type Bo4eStructure,
  type CDoc,
} from "@conuti-das/prince-ui-bo4e";
import cdoc from "./bo4e-fixtures/cdoc-example.json";
import fields from "./bo4e-fixtures/bo4e-fields.json";
import enums from "./bo4e-fixtures/bo4e-enums.json";
import bos from "./bo4e-fixtures/bo4e-bos.json";
import structure from "./bo4e-fixtures/bo4e-structure.json";

const schema = loadBo4eSchema({ fields, enums, bos, structure: structure as Bo4eStructure });

const NAMES: Record<string, string> = {
  "9906464000001": "Westnetz Messung GmbH",
  "9900683000008": "Netze BW GmbH",
  "9904000000005": "E.ON Energie Dialog GmbH",
  "4033872000058": "TransnetBW GmbH",
  "4033872000027": "TransnetBW GmbH",
  "4033872000034": "TransnetBW GmbH",
  "9900936000002": "Netze BW GmbH",
  "9903854000005": "Stadtwerke Musterstadt",
  "9903323000007": "Netze BW GmbH",
};

const resolvers: Bo4eResolvers = {
  marktpartner: (code) => {
    const name = NAMES[code];
    return name ? { name } : undefined;
  },
};

/**
 * Smarte, sachbearbeiter-optimierte BO4E-cDoc-Ansicht — entspricht der Story
 * „BO4E/CDoc View · Sachbearbeiter".
 */
export default function Bo4eCDocViewDemo() {
  return (
    <CDocView
      doc={cdoc as unknown as CDoc}
      schema={schema}
      resolvers={resolvers}
      now={new Date("2026-06-25T12:00:00Z")}
    />
  );
}
