import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../packages/ui/src/index";
// Hinweis: Das Toast-Modul ist (noch) nicht über src/index re-exportiert,
// daher direkter Import aus dem Primitive-Modul.
import { ToastRegion, toastQueue, type ToastVariant } from "../../packages/ui/src/primitives/toast";
import "../../packages/ui/src/primitives/forms.css";
import "../../packages/ui/src/primitives/toast.css";

const meta = {
  title: "Components/Toast",
  component: ToastRegion,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Prince-gestylte Toast-Benachrichtigungen auf Basis von react-aria-components `UNSTABLE_Toast`/`ToastRegion` und der `ToastQueue` aus React Stately. Toasts werden über `toastQueue.add({ title, description, variant })` eingereiht; `ToastRegion` rendert sie als erhöhte Karten unten am Bildschirm. Unterkomponenten (`Toast`, `ToastContent`, Schließen-`Button`) sind intern im Wrapper gekapselt.",
      },
    },
  },
  argTypes: {
    queue: { control: false },
  },
} satisfies Meta<typeof ToastRegion>;
export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ variant, withDescription }: { variant?: ToastVariant; withDescription?: boolean }) {
  return (
    <div style={{ minHeight: 240, display: "grid", placeItems: "center" }}>
      <Button
        onPress={() =>
          toastQueue.add({
            title:
              variant === "error"
                ? "Speichern fehlgeschlagen"
                : variant === "success"
                  ? "Gespeichert"
                  : "Neue Benachrichtigung",
            description: withDescription ? "Diese Meldung verschwindet automatisch." : undefined,
            variant,
            timeout: 5000,
          })
        }
      >
        Toast anzeigen
      </Button>
      <ToastRegion />
    </div>
  );
}

export const Playground: Story = {
  render: () => <Demo withDescription />,
};

export const Variants: Story = {
  render: () => (
    <div style={{ minHeight: 240, display: "flex", gap: 16, placeItems: "center", justifyContent: "center", padding: 24 }}>
      <Button variant="tinted" onPress={() => toastQueue.add({ title: "Erfolg", description: "Vorgang abgeschlossen.", variant: "success", timeout: 5000 })}>
        Erfolg
      </Button>
      <Button variant="tinted" onPress={() => toastQueue.add({ title: "Achtung", description: "Bitte prüfen.", variant: "warning", timeout: 5000 })}>
        Warnung
      </Button>
      <Button variant="tinted" onPress={() => toastQueue.add({ title: "Fehler", description: "Etwas ist schiefgelaufen.", variant: "error", timeout: 5000 })}>
        Fehler
      </Button>
      <ToastRegion />
    </div>
  ),
};
