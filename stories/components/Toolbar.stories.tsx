import type { Meta, StoryObj } from "@storybook/react";
import { Toolbar, Badge } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Kopfleiste mit Titel und Untertitel, optionalem Leading-Slot (z. B. Zurück-Button) und rechtsbündigem Aktions-Slot.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    subtitle: { control: "text" },
  },
  args: {
    title: "Transaktionen",
    subtitle: "248 offen · zuletzt aktualisiert 12:04",
  },
} satisfies Meta<typeof Toolbar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <Toolbar {...args} actions={<Badge tone="blue">Auto-Refresh</Badge>} />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
      <Toolbar
        title="Transaktionen"
        subtitle="248 offen · zuletzt aktualisiert 12:04"
        actions={<Badge tone="blue">Auto-Refresh</Badge>}
      />
      <Toolbar
        leading={<span style={{ color: "var(--prn-accent-strong)" }}>‹ Zurück</span>}
        title="Detailansicht"
        actions={
          <>
            <Badge tone="green">Aktiv</Badge>
            <Badge tone="gray">Export</Badge>
          </>
        }
      />
    </div>
  ),
};
