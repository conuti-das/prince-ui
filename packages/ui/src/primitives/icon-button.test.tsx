import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./icon-button";
import { Button } from "./forms";
import { ConfirmDialog } from "./overlays";

describe("IconButton (neutrale Hilfsaktion / Ansichtssteuerung)", () => {
  it("hat den Namen für Vorleseprogramme aus `label`, ist grau (schlicht, keine Rolle) und löst onPress aus", async () => {
    const onPress = vi.fn();
    render(<IconButton icon="redo" label="Aktualisieren" onPress={onPress} data-testid="akt" />);
    const knopf = screen.getByRole("button", { name: "Aktualisieren" });
    expect(knopf).toHaveAttribute("data-testid", "akt");
    expect(knopf).toHaveClass("prn-iconbutton");
    expect(knopf).toHaveAttribute("data-variant", "plain");
    expect(knopf).not.toHaveAttribute("data-destructive");
    expect(knopf.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(knopf);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("zeigt den Tooltip mit dem Namen bei Tastaturfokus; eigener Text und `tooltip={false}` möglich", async () => {
    const { unmount } = render(<IconButton icon="redo" label="Aktualisieren" />);
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Aktualisieren");
    unmount();
    const zwei = render(<IconButton icon="copy" label="Kopieren" tooltip="Kopieren (Strg+C)" />);
    await userEvent.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Kopieren (Strg+C)");
    zwei.unmount();
    render(<IconButton icon="copy" label="Kopieren" tooltip={false} />);
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Kopieren" })).toHaveFocus();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("übernimmt Größe und Deaktivierung", () => {
    render(<IconButton icon="redo" label="Aktualisieren" size="s" isDisabled />);
    const knopf = screen.getByRole("button", { name: "Aktualisieren" });
    expect(knopf).toHaveAttribute("data-size", "s");
    expect(knopf).toBeDisabled();
  });
});

describe("Button, Rolle „Rücknahme“", () => {
  it("setzt data-destructive nur mit `destructive`", () => {
    render(<><Button variant="tinted" destructive>Ablehnen</Button><Button variant="tinted">Kommentieren</Button></>);
    expect(screen.getByRole("button", { name: "Ablehnen" })).toHaveAttribute("data-destructive", "true");
    expect(screen.getByRole("button", { name: "Kommentieren" })).not.toHaveAttribute("data-destructive");
  });

  it("ConfirmDialog destructive: die Bestätigung ist gefüllt rot (Rolle am Knopf)", () => {
    render(<ConfirmDialog isOpen title="Auftrag zurückziehen?" confirmLabel="Zurückziehen" destructive onConfirm={() => {}}>Der Auftrag wird nicht versendet.</ConfirmDialog>);
    const ok = screen.getByRole("button", { name: "Zurückziehen" });
    expect(ok).toHaveAttribute("data-variant", "filled");
    expect(ok).toHaveAttribute("data-destructive", "true");
  });

  it("deaktiviert: Rolle bleibt erkennbar im DOM, Knopf ist deaktiviert", () => {
    render(<Button variant="tinted" destructive isDisabled>Stoppen</Button>);
    const k = screen.getByRole("button", { name: "Stoppen" });
    expect(k).toBeDisabled();
    expect(k).toHaveAttribute("data-disabled", "true");
  });
});
