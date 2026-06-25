import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, Card, Badge, Icon } from "../../packages/ui/src/index";
import "../../packages/ui/src/composites/composites.css";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Leerzustand mit optionalem Icon, Titel, Beschreibung und Aktions-Slot — z. B. wenn eine Liste keine Daten enthält.",
      },
    },
  },
  argTypes: {
    icon: { control: false },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    icon: <Icon name="inbox" size={28} />,
    title: "Keine Transaktionen",
    description:
      "Für den gewählten Zeitraum wurden keine Transaktionen gefunden. Passe die Filter an.",
  },
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InCard: Story = {
  render: () => (
    <Card padding="none">
      <EmptyState
        icon={<Icon name="inbox" size={28} />}
        title="Keine Transaktionen"
        description="Für den gewählten Zeitraum wurden keine Transaktionen gefunden. Passe die Filter an."
        action={<Badge tone="blue">Filter zurücksetzen</Badge>}
      />
    </Card>
  ),
};
