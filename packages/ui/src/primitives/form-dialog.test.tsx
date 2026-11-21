import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { FormDialog, ReasonField, reasonValid, useSubmitState } from "./form-dialog";
import { Select, SelectItem } from "./forms";
import { NumberField, parseLocaleNumber } from "./numeric";

describe("FormDialog", () => {
  it("Abbrechen links, Hauptaktion rechts; Fehler im Dialog mit role=alert; Sperrgrund in der Fußzeile", () => {
    const zu = vi.fn(), ok = vi.fn();
    render(<FormDialog title="Benutzer vormerken" submitLabel="Vormerken" onClose={zu} onSubmit={ok} error="Server sagt nein" isSubmitDisabled disabledReason="Kein Mandant gewählt"
      data-testid="dlg" submitTestId="ok" cancelTestId="ab"><p>Inhalt</p></FormDialog>);
    const knoepfe = screen.getByRole("dialog").querySelectorAll(".prn-dialog-footer-actions button");
    expect(knoepfe[0]).toHaveAttribute("data-testid", "ab");
    expect(knoepfe[1]).toHaveAttribute("data-testid", "ok");
    expect(screen.getByTestId("ok")).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Server sagt nein");
    expect(screen.getByTestId("dlg-fehler")).toBeInTheDocument();
    expect(screen.getByTestId("dlg-sperrgrund")).toHaveTextContent("Kein Mandant gewählt");
    fireEvent.click(screen.getByTestId("ab"));
    expect(zu).toHaveBeenCalledTimes(1);
  });

  it("während isBusy: Knöpfe gesperrt, data-busy, Esc schließt nicht", () => {
    const zu = vi.fn();
    render(<FormDialog title="Senden" submitLabel="Senden" busyLabel="Wird gesendet …" onClose={zu} onSubmit={() => {}} isBusy submitTestId="ok" cancelTestId="ab" />);
    expect(screen.getByTestId("ok")).toBeDisabled();
    expect(screen.getByTestId("ok")).toHaveAttribute("data-busy", "true");
    expect(screen.getByTestId("ok")).toHaveTextContent("Wird gesendet …");
    expect(screen.getByTestId("ab")).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(zu).not.toHaveBeenCalled();
  });

  it("destructive färbt die Hauptaktion und setzt den Ton negative", () => {
    render(<FormDialog title="Verwerfen" submitLabel="Verwerfen" destructive onClose={() => {}} onSubmit={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-tone", "negative");
  });
});

describe("useSubmitState", () => {
  it("setzt den Fehlertext und liefert false bei Fehler, true sonst", async () => {
    let api: ReturnType<typeof useSubmitState> | null = null;
    function T() { api = useSubmitState(); return <span>{api.error ?? "-"}</span>; }
    render(<T />);
    let r = false;
    await act(async () => { r = await api!.submit(async () => { throw new Error("kaputt"); }); });
    expect(r).toBe(false);
    expect(screen.getByText("kaputt")).toBeInTheDocument();
    await act(async () => { r = await api!.submit(async () => {}); });
    expect(r).toBe(true);
    expect(api!.isBusy).toBe(false);
  });
});

describe("ReasonField", () => {
  it("Fehler erst mit showError; Mindestlänge ohne Rand-Leerzeichen", () => {
    const { rerender } = render(<ReasonField value="abc " onChange={() => {}} data-testid="b" />);
    expect(screen.getByTestId("b")).not.toHaveAttribute("data-invalid");
    rerender(<ReasonField value="abc " onChange={() => {}} showError data-testid="b" />);
    expect(screen.getByTestId("b")).toHaveAttribute("data-invalid");
    expect(screen.getByText("Mindestens 5 Zeichen")).toBeInTheDocument();
    expect(reasonValid("  abcde  ")).toBe(true);
    expect(reasonValid("", 5, false)).toBe(true);
    expect(reasonValid("ab", 5, false)).toBe(false);
  });
});

describe("Select mit leerer Kennung", () => {
  it("zeigt die gewählte leere Option und meldet beim Wählen wieder \"\"", () => {
    const wahl = vi.fn();
    function T() {
      const [w, setW] = useState("12");
      return (
        <Select label="Befristung" selectedKey={w} onSelectionChange={(k) => { wahl(k); setW(String(k)); }}>
          <SelectItem id="" textValue="unbefristet">unbefristet</SelectItem>
          <SelectItem id="12" textValue="12 Monate">12 Monate</SelectItem>
        </Select>
      );
    }
    render(<T />);
    const knopf = document.querySelector(".prn-select-button") as HTMLElement;
    expect(knopf).toHaveTextContent("12 Monate");
    fireEvent.click(knopf);
    fireEvent.click(screen.getByRole("option", { name: "unbefristet" }));
    expect(wahl).toHaveBeenLastCalledWith("");
    expect(knopf).toHaveTextContent("unbefristet");
  });
});

describe("NumberField commitOnInput", () => {
  it("liest nach dem Gebietsschema", () => {
    expect(parseLocaleNumber("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseLocaleNumber("1,", "de-DE")).toBe(1);
    expect(parseLocaleNumber("-", "de-DE")).toBeNull();
    expect(parseLocaleNumber("", "de-DE")).toBeNull();
    expect(parseLocaleNumber("1,234.5", "en-US")).toBe(1234.5);
  });
  it("meldet den Wert schon beim Tippen (ohne Verlassen), innerhalb der Grenzen", () => {
    const geaendert = vi.fn();
    render(<NumberField label="Anzahl" defaultValue={1} maxValue={100} onChange={geaendert} commitOnInput />);
    const feld = screen.getByRole("textbox");
    fireEvent.input(feld, { target: { value: "42" } });
    expect(geaendert).toHaveBeenLastCalledWith(42);
    geaendert.mockClear();
    fireEvent.input(feld, { target: { value: "420" } });
    expect(geaendert).not.toHaveBeenCalled();
  });
});

describe("Select disabledReason", () => {
  it("zeigt den Sperrgrund unter dem Feld nur, wenn gesperrt", () => {
    const { rerender } = render(<Select aria-label="Mandant" isDisabled disabledReason="Im Reiter „Meine“ fest" description="Hinweis"><SelectItem id="a">A</SelectItem></Select>);
    expect(screen.getByText("Im Reiter „Meine“ fest")).toBeInTheDocument();
    expect(screen.queryByText("Hinweis")).toBeNull();
    rerender(<Select aria-label="Mandant" disabledReason="Im Reiter „Meine“ fest" description="Hinweis"><SelectItem id="a">A</SelectItem></Select>);
    expect(screen.queryByText("Im Reiter „Meine“ fest")).toBeNull();
    expect(screen.getByText("Hinweis")).toBeInTheDocument();
  });
});

describe("Select: langer Wert", () => {
  it("steht in einer Zeile mit vollem Text als title", () => {
    const lang = "CONUTI LF Strom (Clone E im k3s, Gegenstelle Sparring-Mandant clone-e) (lf)";
    render(<Select label="Mandant" selectedKey="lf"><SelectItem id="lf" textValue={lang}>{lang}</SelectItem></Select>);
    const wert = document.querySelector(".prn-select-value span[title]") as HTMLElement;
    expect(wert).toHaveAttribute("title", lang);
    expect(wert).toHaveTextContent(lang);
  });
});
