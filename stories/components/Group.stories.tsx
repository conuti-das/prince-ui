import type { Meta, StoryObj } from "@storybook/react";
import { Group, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/status.css";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Group",
  component: Group,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Container auf Basis von react-aria-components `Group`. Bündelt zusammengehörige Bedienelemente als beschriftbare Einheit (`aria-label`). Wird ein Element im Inneren fokussiert, erscheint ein Fokus-Ring (`data-focus-within`).",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
    "aria-label": { control: "text" },
  },
  args: { isDisabled: false, "aria-label": "Aktionen" },
} satisfies Meta<typeof Group>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Group {...args}>
      <Button variant="tinted">Speichern</Button>
      <Button variant="plain">Verwerfen</Button>
    </Group>
  ),
};

export const Toolbar: Story = {
  render: () => (
    <Group aria-label="Formatierung" style={{ padding: 4 }}>
      <Button variant="plain">Fett</Button>
      <Button variant="plain">Kursiv</Button>
      <Button variant="plain">Unterstrichen</Button>
    </Group>
  ),
};
