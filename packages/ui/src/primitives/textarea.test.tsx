import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextArea } from "./textarea";

describe("TextArea", () => {
  it("Label, Beschreibung und Zeilen; ungesteuert mit Zähler", async () => {
    const onChange = vi.fn();
    render(<TextArea label="Begründung" description="Mindestens 5 Zeichen" rows={4} maxLength={20} showCount onChange={onChange} />);
    const feld = screen.getByRole("textbox", { name: "Begründung" });
    expect(feld.tagName).toBe("TEXTAREA");
    expect(feld).toHaveAttribute("rows", "4");
    expect(feld).toHaveAccessibleDescription("Mindestens 5 Zeichen");
    expect(screen.getByText("0 / 20")).toBeInTheDocument();
    await userEvent.type(feld, "Hallo\nWelt");
    expect(onChange).toHaveBeenLastCalledWith("Hallo\nWelt");
    expect(screen.getByText("10 / 20")).toBeInTheDocument();
  });

  it("gesteuert, eigene Zählertexte, maxLength begrenzt", async () => {
    render(<TextArea aria-label="Kommentar" value="abc" onChange={() => {}} maxLength={3} showCount countLabel={(n, m) => `${n} von ${m} Zeichen`} />);
    expect(screen.getByText("3 von 3 Zeichen")).toHaveAttribute("data-full");
    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "3");
  });

  it("Pflicht und Fehler", () => {
    render(<TextArea label="Begründung" isRequired isInvalid errorMessage="Bitte begründen Sie die Entscheidung." />);
    expect(screen.getByRole("textbox")).toBeRequired();
    expect(screen.getByText("Bitte begründen Sie die Entscheidung.")).toBeInTheDocument();
  });
});
