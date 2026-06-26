import type { Meta, StoryObj } from "@storybook/react";
import { CDocView, loadBo4eSchema, type Bo4eResolvers } from "../../packages/bo4e/src/index";
import type { CDoc } from "../../packages/bo4e/src/index";
import cdoc from "../../packages/bo4e/src/__fixtures__/cdoc-example.json";
import fields from "../../packages/bo4e/src/__fixtures__/bo4e-fields.json";
import enums from "../../packages/bo4e/src/__fixtures__/bo4e-enums.json";
import bos from "../../packages/bo4e/src/__fixtures__/bo4e-bos.json";

/**
 * Smarte, sachbearbeiter-optimierte Ansicht eines BO4E-cDoc. Richtungs-Umschalter
 * (INBOUND/OUTBOUND), Gruppen-Tabs (Label ≠ boTyp), Auffälligkeiten-Leiste,
 * Marktlokation als Hero (Sparte-Icon, Status-Badges, Endkunde-Kontaktkarte,
 * Marktrollen mit Code→Name + Gültigkeits-Ampel). Jedes Feld → Schema-Popover.
 * Datumsangaben in Europe/Berlin, UTC im Popover.
 */
const schema = loadBo4eSchema({ fields, enums, bos });

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

const meta = {
  title: "BO4E/CDoc View",
  component: CDocView,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof CDocView>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Sachbearbeiter: Story = {
  args: {
    doc: cdoc as unknown as CDoc,
    schema,
    resolvers,
    now: new Date("2026-06-25T12:00:00Z"),
  },
};
