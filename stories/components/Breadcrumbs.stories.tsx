import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs, Breadcrumb, Link } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/breadcrumbs.css";

const meta = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Breadcrumb-Navigation auf Basis von react-aria-components `Breadcrumbs`. Jeder Eintrag ist ein `Breadcrumb`, der einen `Link` oder reinen Text enthält; der letzte Eintrag wird automatisch als aktuelle Seite (`[data-current]`) markiert. Chevron-Trenner werden per CSS ergänzt.",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
  },
  args: { isDisabled: false },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Breadcrumbs {...args} aria-label="Pfad">
      <Breadcrumb>
        <Link href="#">Start</Link>
      </Breadcrumb>
      <Breadcrumb>
        <Link href="#">Strom</Link>
      </Breadcrumb>
      <Breadcrumb>Tarifübersicht</Breadcrumb>
    </Breadcrumbs>
  ),
};

export const ZweiEbenen: Story = {
  render: () => (
    <Breadcrumbs aria-label="Pfad">
      <Breadcrumb>
        <Link href="#">Konto</Link>
      </Breadcrumb>
      <Breadcrumb>Einstellungen</Breadcrumb>
    </Breadcrumbs>
  ),
};

export const MitAktion: Story = {
  render: () => (
    <Breadcrumbs aria-label="Pfad" onAction={(key) => alert(`Klick: ${key}`)}>
      <Breadcrumb id="home">
        <Link>Start</Link>
      </Breadcrumb>
      <Breadcrumb id="vertraege">
        <Link>Verträge</Link>
      </Breadcrumb>
      <Breadcrumb id="detail">Vertrag 4711</Breadcrumb>
    </Breadcrumbs>
  ),
};
