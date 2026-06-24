import type { Meta, StoryObj } from "@storybook/react";
import { Modal, DialogTrigger, Button } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Dialog auf Basis von react-aria-components `ModalOverlay`/`Modal`/`Dialog`. Geöffnet wird er über einen `DialogTrigger`; Fokus-Trap, Escape-Schließen und Fokus-Rückgabe übernimmt React Aria automatisch.",
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    isDismissable: { control: "boolean" },
  },
  args: {
    title: "Widget konfigurieren",
  },
} satisfies Meta<typeof Modal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <DialogTrigger>
      <Button>Dialog öffnen</Button>
      <Modal title="Widget konfigurieren">
        <p style={{ font: "var(--prn-text-body)", color: "var(--prn-label-2)", margin: 0 }}>
          React Aria übernimmt Fokus-Trap, Escape und Fokus-Rückgabe automatisch.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="filled" slot="close">Fertig</Button>
        </div>
      </Modal>
    </DialogTrigger>
  ),
};
