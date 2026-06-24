import type { Meta, StoryObj } from "@storybook/react";
import { GridList, GridListItem } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/collections.css";

const meta = {
  title: "Components/GridList",
  component: GridList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Zeilenliste mit Selektion auf Basis von react-aria-components `GridList`. Zeilen werden als `GridListItem` (Wrapper über RAC `GridListItem`) übergeben; Hover, Fokus-Ring, Single-/Multi-Selektion und der Auswahlhaken stammen aus React Aria.",
      },
    },
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
  },
  args: { selectionMode: "multiple" },
} satisfies Meta<typeof GridList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <GridList {...args} aria-label="Zähler" style={{ maxWidth: 320 }}>
      <GridListItem id="z1" textValue="Zähler 1 Nord">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, width: "100%" }}>
          <span>Zähler 1</span><span style={{ color: "var(--prn-label-3)" }}>Nord</span>
        </div>
      </GridListItem>
      <GridListItem id="z2" textValue="Zähler 2 Süd">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, width: "100%" }}>
          <span>Zähler 2</span><span style={{ color: "var(--prn-label-3)" }}>Süd</span>
        </div>
      </GridListItem>
      <GridListItem id="z3" textValue="Zähler 3 West">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, width: "100%" }}>
          <span>Zähler 3</span><span style={{ color: "var(--prn-label-3)" }}>West</span>
        </div>
      </GridListItem>
    </GridList>
  ),
};

export const Einfachauswahl: Story = {
  render: () => (
    <GridList
      aria-label="Marktlokationen"
      selectionMode="single"
      defaultSelectedKeys={["malo-2"]}
      style={{ maxWidth: 320 }}
    >
      <GridListItem id="malo-1" textValue="MaLo 1001">MaLo 1001</GridListItem>
      <GridListItem id="malo-2" textValue="MaLo 1002">MaLo 1002</GridListItem>
      <GridListItem id="malo-3" textValue="MaLo 1003">MaLo 1003</GridListItem>
    </GridList>
  ),
};
