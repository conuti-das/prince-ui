import type { Meta, StoryObj } from "@storybook/react";
import { Notice } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Notice",
  component: Notice,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Inline-Hinweisbox mit Tonalität (info, positive, critical, negative), automatischem Leading-Glyph, optionalem Titel und freiem Textinhalt.",
      },
    },
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["info", "positive", "critical", "negative"],
    },
    title: { control: "text" },
    children: { control: "text" },
  },
  args: {
    tone: "info",
    title: "Hinweis",
    children: "Die Datenaktualisierung erfolgt alle 60 Sekunden.",
  },
} satisfies Meta<typeof Notice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <Notice tone="info" title="Hinweis">
        Die Datenaktualisierung erfolgt alle 60 Sekunden.
      </Notice>
      <Notice tone="positive" title="Erfolgreich verarbeitet">
        Alle 248 Transaktionen wurden ohne Fehler abgeschlossen.
      </Notice>
      <Notice tone="critical" title="Aufmerksamkeit erforderlich">
        3 Transaktionen warten auf manuelle Klärung.
      </Notice>
      <Notice tone="negative" title="Verarbeitungsfehler">
        EDIFACT-Segment UNH konnte nicht validiert werden.
      </Notice>
    </div>
  ),
};
