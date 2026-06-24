import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TagGroup, Tag } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/collections.css";

const meta = {
  title: "Components/TagGroup",
  component: TagGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Chip-Reihe auf Basis von react-aria-components `TagGroup`/`TagList`/`Tag`. Einzelne Chips werden als `Tag` übergeben; Selektion und das Entfernen (Pille mit ×-Button via `onRemove`) stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
  },
  args: { label: "Filter", selectionMode: "multiple" },
} satisfies Meta<typeof TagGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <TagGroup {...args} aria-label="Filter">
      <Tag id="strom">Strom</Tag>
      <Tag id="gas">Gas</Tag>
      <Tag id="wasser">Wasser</Tag>
      <Tag id="fernwaerme">Fernwärme</Tag>
    </TagGroup>
  ),
};

export const Entfernbar: Story = {
  render: () => {
    function Removable() {
      const [tags, setTags] = useState([
        { id: "strom", name: "Strom" },
        { id: "gas", name: "Gas" },
        { id: "wasser", name: "Wasser" },
      ]);
      return (
        <TagGroup
          label="Aktive Filter"
          aria-label="Aktive Filter"
          items={tags}
          onRemove={(keys) => setTags((prev) => prev.filter((t) => !keys.has(t.id)))}
        >
          {(item: { id: string; name: string }) => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      );
    }
    return <Removable />;
  },
};
