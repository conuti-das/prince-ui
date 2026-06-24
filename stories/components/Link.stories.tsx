import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/breadcrumbs.css";

const meta = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Link auf Basis von react-aria-components `Link`. Press-Events, Fokus-Ring und Disabled-Handling stammen aus React Aria; ohne `href` rendert React Aria ein zugängliches `span` mit Link-Rolle.",
      },
    },
  },
  argTypes: {
    href: { control: "text" },
    isDisabled: { control: "boolean" },
    children: { control: "text" },
  },
  args: { href: "#", isDisabled: false, children: "Mehr erfahren" },
} satisfies Meta<typeof Link>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const ImFließtext: Story = {
  render: () => (
    <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label)", maxWidth: 420 }}>
      Bitte beachten Sie unsere <Link href="#">Datenschutzhinweise</Link> sowie die{" "}
      <Link href="#">Nutzungsbedingungen</Link>, bevor Sie fortfahren.
    </p>
  ),
};

export const Zustände: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <Link href="#">Standard</Link>
      <Link href="#" isDisabled>
        Deaktiviert
      </Link>
    </div>
  ),
};
