import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog, Modal } from "./overlays";

describe("Modal mit Fußzeile und Zustand", () => {
  it("Titel mit Zustand, Untertitel, Inhalt, Fußzeile mit close und Status links", async () => {
    const onOpenChange = vi.fn();
    render(
      <Modal isOpen onOpenChange={onOpenChange} title="Klärfall erledigen" subtitle="55001 Anmeldung" tone="critical" size="l" data-testid="dlg"
        footerStart="1 von 3 erledigt" footer={({ close }) => <button onClick={close}>Abbrechen</button>}>
        <p>Inhalt</p>
      </Modal>,
    );
    const dlg = screen.getByRole("dialog", { name: /Klärfall erledigen/ });
    expect(dlg).toHaveAttribute("data-testid", "dlg");
    expect(dlg).toHaveAttribute("data-tone", "critical");
    expect(screen.getByText("55001 Anmeldung")).toBeInTheDocument();
    expect(screen.getByText("1 von 3 erledigt")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Abbrechen" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Esc gesperrt mit isKeyboardDismissDisabled", async () => {
    const onOpenChange = vi.fn();
    render(<Modal isOpen onOpenChange={onOpenChange} title="Läuft" isKeyboardDismissDisabled><p>…</p></Modal>);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("ConfirmDialog", () => {
  it("alertdialog, Fokus auf Abbrechen, Bestätigen ruft onConfirm und schließt", async () => {
    const onConfirm = vi.fn(), onOpenChange = vi.fn();
    render(<ConfirmDialog isOpen onOpenChange={onOpenChange} title="Massenauftrag stoppen?" confirmLabel="Stoppen" destructive onConfirm={onConfirm} confirmTestId="ok" cancelTestId="nein">
      Offene Posten bleiben offen.</ConfirmDialog>);
    expect(screen.getByRole("alertdialog", { name: /Massenauftrag stoppen/ })).toHaveAttribute("data-tone", "negative");
    await waitFor(() => expect(screen.getByTestId("nein")).toHaveFocus());
    await userEvent.click(screen.getByTestId("ok"));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
