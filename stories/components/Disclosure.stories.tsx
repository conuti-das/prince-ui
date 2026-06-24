import type { Meta, StoryObj } from "@storybook/react";
import { Disclosure, DisclosureGroup } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/disclosure.css";

const meta = {
  title: "Components/Disclosure",
  component: Disclosure,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestyltes Akkordeon auf Basis von react-aria-components `Disclosure` (mit `Heading`, Trigger-`Button` und `DisclosurePanel`). Mehrere `Disclosure` lassen sich in einer `DisclosureGroup` (RAC `DisclosureGroup`) gruppieren — optional mit `allowsMultipleExpanded`.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    defaultExpanded: { control: "boolean" },
    isDisabled: { control: "boolean" },
  },
  args: { title: "Weitere Details", defaultExpanded: false, isDisabled: false },
} satisfies Meta<typeof Disclosure>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Disclosure {...args}>
      <p style={{ margin: 0 }}>
        Hier steht der aufklappbare Inhalt der Sektion. Der Chevron rotiert beim Öffnen.
      </p>
    </Disclosure>
  ),
};

export const Expanded: Story = {
  args: { title: "Vorab geöffnet", defaultExpanded: true },
  render: (args) => (
    <Disclosure {...args}>
      <p style={{ margin: 0 }}>Dieser Abschnitt ist standardmäßig ausgeklappt.</p>
    </Disclosure>
  ),
};

export const Group: Story = {
  name: "DisclosureGroup",
  render: () => (
    <DisclosureGroup allowsMultipleExpanded defaultExpandedKeys={["allgemein"]}>
      <Disclosure id="allgemein" title="Allgemein">
        <p style={{ margin: 0 }}>Grundlegende Einstellungen und Stammdaten.</p>
      </Disclosure>
      <Disclosure id="abrechnung" title="Abrechnung">
        <p style={{ margin: 0 }}>Tarife, Zahlungsweise und Rechnungsstellung.</p>
      </Disclosure>
      <Disclosure id="kontakt" title="Kontakt">
        <p style={{ margin: 0 }}>Ansprechpartner und Kommunikationswege.</p>
      </Disclosure>
    </DisclosureGroup>
  ),
};
