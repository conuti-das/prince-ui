import type { Meta, StoryObj } from "@storybook/react";
import { Tree, TreeItem } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/tree.css";

const meta = {
  title: "Components/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Baum auf Basis von react-aria-components `Tree`/`TreeItem`. Aufklappen, Tastatur-Navigation und Auswahl stammen aus React Aria; `TreeItem` rendert seine Zeile über `TreeItemContent` und nimmt verschachtelte `TreeItem` als `children`.",
      },
    },
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["none", "single", "multiple"] },
  },
  args: { selectionMode: "multiple" },
} satisfies Meta<typeof Tree>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Tree {...args} aria-label="Marktrollen" style={{ width: 320 }} defaultExpandedKeys={["lf", "nb"]}>
      <TreeItem id="lf" title="Lieferant">
        <TreeItem id="lf-strom" title="Strom" />
        <TreeItem id="lf-gas" title="Gas" />
      </TreeItem>
      <TreeItem id="nb" title="Netzbetreiber">
        <TreeItem id="nb-vnb" title="Verteilnetzbetreiber">
          <TreeItem id="nb-vnb-strom" title="Strom" />
          <TreeItem id="nb-vnb-gas" title="Gas" />
        </TreeItem>
        <TreeItem id="nb-unb" title="Übertragungsnetzbetreiber" />
      </TreeItem>
      <TreeItem id="msb" title="Messstellenbetreiber" />
    </Tree>
  ),
};

export const SpartenHierarchie: Story = {
  name: "Sparten-Hierarchie",
  render: () => (
    <Tree aria-label="Sparten" selectionMode="single" style={{ width: 320 }} defaultExpandedKeys={["strom", "gas"]}>
      <TreeItem id="strom" title="Strom">
        <TreeItem id="strom-rlm" title="RLM (leistungsgemessen)" />
        <TreeItem id="strom-slp" title="SLP (Standardlastprofil)" />
      </TreeItem>
      <TreeItem id="gas" title="Gas">
        <TreeItem id="gas-rlm" title="RLM (leistungsgemessen)" />
        <TreeItem id="gas-slp" title="SLP (Standardlastprofil)" />
      </TreeItem>
      <TreeItem id="wasser" title="Wasser" />
    </Tree>
  ),
};

export const OhneAuswahl: Story = {
  name: "Ohne Auswahl",
  render: () => (
    <Tree aria-label="Marktrollen" selectionMode="none" style={{ width: 320 }} defaultExpandedKeys={["lf"]}>
      <TreeItem id="lf" title="Lieferant">
        <TreeItem id="lf-strom" title="Strom" />
        <TreeItem id="lf-gas" title="Gas" />
      </TreeItem>
      <TreeItem id="nb" title="Netzbetreiber" />
    </Tree>
  ),
};
