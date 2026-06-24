import type { Meta, StoryObj } from "@storybook/react";
import { DropZone, FileTrigger } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/dropzone.css";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/DropZone",
  component: DropZone,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylte Ablagefläche auf Basis von react-aria-components `DropZone`. Beim Darüberziehen von Dateien wird der Bereich über `[data-drop-target]` mit dem Akzent hervorgehoben. Der innere `FileTrigger` erlaubt zusätzlich die klassische Dateiauswahl.",
      },
    },
  },
  argTypes: {
    isDisabled: { control: "boolean" },
  },
  args: { isDisabled: false },
} satisfies Meta<typeof DropZone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <DropZone {...args}>
      <span>Dateien hierher ziehen</span>
      <FileTrigger allowsMultiple>oder auswählen</FileTrigger>
    </DropZone>
  ),
};

export const NurText: Story = {
  render: () => (
    <DropZone>
      <strong>Dokument ablegen</strong>
      <span style={{ font: "var(--prn-text-footnote)", color: "var(--prn-label-3)" }}>
        PDF, PNG oder JPG
      </span>
    </DropZone>
  ),
};
