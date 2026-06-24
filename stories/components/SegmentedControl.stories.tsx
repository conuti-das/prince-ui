import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedControl, Segment } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Segmented Control (Einfachauswahl) auf Basis von react-aria-components `ToggleButtonGroup`. Die einzelnen Segmente werden als `Segment` (ToggleButton) übergeben; Auswahl- und Tastatur-Handling stammen aus React Aria.",
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => {
    const [seg, setSeg] = useState<Set<string>>(new Set(["24h"]));
    return (
      <SegmentedControl selectedKeys={seg} onSelectionChange={(k) => setSeg(k as Set<string>)}>
        <Segment id="1h">1h</Segment>
        <Segment id="24h">24h</Segment>
        <Segment id="7d">7 Tage</Segment>
      </SegmentedControl>
    );
  },
};
