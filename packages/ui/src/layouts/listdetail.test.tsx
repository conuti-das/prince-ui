import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DetailHeader, ListDetailLayout } from "./listdetail";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX { interface IntrinsicElements { "x-dialog": { open?: string } } }
}

function Demo({ onClose }: { onClose?: () => void }) {
  const [id, setId] = useState<string | null>(null);
  const [voll, setVoll] = useState(false);
  const zu = () => { setId(null); setVoll(false); onClose?.(); };
  return (
    <ListDetailLayout
      data-testid="ld"
      fullscreen={voll}
      onClose={zu}
      labels={{ list: "Fälle", detail: "Fall" }}
      list={<><button onClick={() => setId("a")}>Fall A</button><input aria-label="Suche" /></>}
      detail={id ? <><DetailHeader title={`Fall ${id}`} fullscreen={voll} onFullscreenChange={setVoll} onClose={zu} closeTestId="zu" fullscreenTestId="voll" /><button>im Detail</button></> : null}
    />
  );
}

describe("ListDetailLayout", () => {
  it("zeigt ohne Detail nur die Liste", () => {
    render(<Demo />);
    expect(screen.getByTestId("ld")).toHaveAttribute("data-layout", "list");
    expect(screen.getByRole("region", { name: "Fälle" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Fall" })).toBeNull();
  });

  it("öffnet das Detail neben der Liste, Fokus auf die Überschrift, Esc schließt und gibt den Fokus zurück", async () => {
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    const zeile = screen.getByRole("button", { name: "Fall A" });
    await userEvent.click(zeile);
    expect(screen.getByTestId("ld")).toHaveAttribute("data-layout", "split");
    const titel = screen.getByRole("heading", { level: 2, name: "Fall a" });
    await waitFor(() => expect(titel).toHaveFocus());
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByTestId("ld")).toHaveAttribute("data-layout", "list");
    await waitFor(() => expect(zeile).toHaveFocus());
  });

  it("Esc in einem Eingabefeld der Liste schließt das Detail nicht", async () => {
    const onClose = vi.fn();
    render(<Demo onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Fall A" }));
    await userEvent.click(screen.getByRole("textbox", { name: "Suche" }));
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Esc schließt nicht, solange ein Overlay offen ist (eigene Rolle oder overlaySelector)", async () => {
    const onClose = vi.fn();
    function MitOverlay({ fremd }: { fremd: boolean }) {
      return <ListDetailLayout onClose={onClose} overlaySelector="x-dialog[open]" list={<span />}
        detail={<>{fremd ? <x-dialog open="" /> : <div role="dialog" aria-label="Erledigen" />}<button>im Detail</button></>} />;
    }
    const { rerender } = render(<MitOverlay fremd={false} />);
    screen.getByRole("button", { name: "im Detail" }).focus();
    await userEvent.keyboard("{Escape}");
    rerender(<MitOverlay fremd />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("Vollbild zeigt nur das Detail, der Knopf wechselt Text und Zustand", async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole("button", { name: "Fall A" }));
    await userEvent.click(screen.getByTestId("voll"));
    expect(screen.getByTestId("ld")).toHaveAttribute("data-layout", "detail");
    expect(screen.getByTestId("voll")).toHaveAccessibleName("Vollbild beenden");
    await userEvent.click(screen.getByTestId("zu"));
    expect(screen.getByTestId("ld")).toHaveAttribute("data-layout", "list");
  });
});

describe("DetailHeader", () => {
  it("rendert Titel, Untertitel, Aktionen und eigene Texte; ohne Handler keine Knöpfe", () => {
    const { rerender } = render(<DetailHeader title="Klärfall" subtitle="55001 Anmeldung" actions={<button>Übernehmen</button>} level={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "Klärfall" })).toBeInTheDocument();
    expect(screen.getByText("55001 Anmeldung")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Schließen" })).toBeNull();
    rerender(<DetailHeader title="Klärfall" onClose={() => {}} onFullscreenChange={() => {}} labels={{ close: "Spalte schließen", fullscreen: "Ganze Breite" }} />);
    expect(screen.getByRole("button", { name: "Spalte schließen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ganze Breite" })).toBeInTheDocument();
  });
});
