import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Tooltip auf Basis von react-aria-components `TooltipTrigger`/`Tooltip`. Hover-/Fokus-Auslösung, Verzögerung und Positionierung (inkl. OverlayArrow) stammen aus React Aria.",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Tooltip trigger={<Button variant="plain">Hover für Tooltip</Button>}>
      Zeigt EDIFACT-Rohdaten
    </Tooltip>
  ),
};
