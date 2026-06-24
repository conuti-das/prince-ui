import type { Meta, StoryObj } from "@storybook/react";
import { FileTrigger } from "../../packages/ui/src/index";
import "../../packages/ui/src/primitives/forms.css";

const meta = {
  title: "Components/FileTrigger",
  component: FileTrigger,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Prince-gestylter Auslöser für die Dateiauswahl auf Basis von react-aria-components `FileTrigger`. Umschließt einen getönten Button und öffnet beim Klick den Datei-Dialog des Systems. Über `acceptedFileTypes`, `allowsMultiple` und `onSelect` steuerbar.",
      },
    },
  },
  argTypes: {
    allowsMultiple: { control: "boolean" },
    children: { control: "text" },
  },
  args: { allowsMultiple: false, children: "Datei wählen" },
} satisfies Meta<typeof FileTrigger>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Mehrfachauswahl: Story = {
  args: { allowsMultiple: true, children: "Mehrere Dateien wählen" },
};

export const NurBilder: Story = {
  args: { acceptedFileTypes: ["image/png", "image/jpeg"], children: "Bild hochladen" },
};
