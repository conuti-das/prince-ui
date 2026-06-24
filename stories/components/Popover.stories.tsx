import type { Meta, StoryObj } from "@storybook/react";
import { Popover, DialogTrigger, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Popover für freien Inhalt auf Basis von react-aria-components `Popover`. Positionierung, Außen-Klick und Escape-Schließen übernimmt React Aria; geöffnet wird es hier über einen `DialogTrigger`.",
      },
    },
  },
} satisfies Meta<typeof Popover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <DialogTrigger>
      <Button variant="tinted">Popover öffnen</Button>
      <Popover placement="bottom start">
        <div style={{ padding: 12, maxWidth: 260 }}>
          <p style={{ margin: 0, color: "var(--prn-label-2)" }}>
            Freier Inhalt im Popover — Positionierung, Außen-Klick und Escape
            übernimmt React Aria. Dieselbe Basis nutzen FilterBar und die
            Spalten-Personalisierung der AnalyticalTable.
          </p>
        </div>
      </Popover>
    </DialogTrigger>
  ),
};
