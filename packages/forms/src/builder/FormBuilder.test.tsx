import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormBuilder } from "./FormBuilder";
import type { FormSchema } from "../types";

describe("FormBuilder", () => {
  it("rendert Palette, Canvas, Eigenschaften, Vorschau", () => {
    render(<FormBuilder />);
    expect(screen.getByText("Felder")).toBeInTheDocument();
    expect(screen.getByText("Formular")).toBeInTheDocument();
    expect(screen.getByText("Eigenschaften")).toBeInTheDocument();
    expect(screen.getByText("Vorschau")).toBeInTheDocument();
    expect(screen.getByText("Leeres Formular")).toBeInTheDocument();
  });

  it("fügt per Palette-Klick ein Feld hinzu und meldet onChange", () => {
    const onChange = vi.fn();
    render(<FormBuilder onChange={onChange} />);
    fireEvent.click(screen.getByText("Textfeld"));
    expect(onChange).toHaveBeenCalled();
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components).toHaveLength(1);
    expect(schema.components[0]!.type).toBe("textfield");
  });

  it("zeigt Eigenschaften des ausgewählten Felds und editiert das Label", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "f1", type: "textfield", key: "f1", label: "Alt" }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    // Feld im Canvas auswählen
    fireEvent.click(screen.getByText("Alt", { selector: ".prn-fb-item-label" }));
    const labelInput = screen.getByLabelText("Label");
    fireEvent.change(labelInput, { target: { value: "Neu" } });
    expect(onChange).toHaveBeenCalled();
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components[0]!.label).toBe("Neu");
  });

  it("löscht das ausgewählte Feld", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "f1", type: "textfield", key: "f1", label: "X" }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByText("X", { selector: ".prn-fb-item-label" }));
    fireEvent.click(screen.getByRole("button", { name: "Feld löschen" }));
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components).toHaveLength(0);
  });

  it("ruft onSave mit dem aktuellen Schema", () => {
    const onSave = vi.fn();
    const start: FormSchema = {
      type: "default",
      components: [{ id: "f1", type: "number", key: "f1" }],
    };
    render(<FormBuilder defaultValue={start} onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Speichern" }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ type: "default" }));
  });

  it("kann in den Experten-Modus wechseln (controlled mode)", () => {
    const onModeChange = vi.fn();
    const { rerender } = render(
      <FormBuilder mode="design" onModeChange={onModeChange} />,
    );
    fireEvent.click(screen.getByText("Experte (form-js)"));
    expect(onModeChange).toHaveBeenCalledWith("expert");
    rerender(<FormBuilder mode="expert" onModeChange={onModeChange} />);
    // Im Experten-Modus ist die native Palette nicht mehr sichtbar.
    expect(screen.queryByText("Leeres Formular")).not.toBeInTheDocument();
  });

  it("fügt ein Feld per Drag&Drop aus der Palette hinzu", () => {
    const onChange = vi.fn();
    render(<FormBuilder onChange={onChange} />);
    const dataTransfer = {
      store: {} as Record<string, string>,
      setData(type: string, val: string) {
        this.store[type] = val;
      },
      getData(type: string) {
        return this.store[type] ?? "";
      },
      effectAllowed: "",
    };
    const palette = screen.getByText("Zahl");
    fireEvent.dragStart(palette, { dataTransfer });
    const dropZone = screen.getByText("Leeres Formular").closest(".prn-fb-canvas-drop")!;
    fireEvent.dragOver(dropZone, { dataTransfer });
    fireEvent.drop(dropZone, { dataTransfer });
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components).toHaveLength(1);
    expect(schema.components[0]!.type).toBe("number");
  });

  it("ordnet Felder per Drag&Drop um", () => {
    const start: FormSchema = {
      type: "default",
      components: [
        { id: "a", type: "textfield", key: "a", label: "Eins" },
        { id: "b", type: "number", key: "b", label: "Zwei" },
      ],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    const dataTransfer = {
      store: {} as Record<string, string>,
      setData(type: string, val: string) {
        this.store[type] = val;
      },
      getData(type: string) {
        return this.store[type] ?? "";
      },
      effectAllowed: "",
    };
    const items = document.querySelectorAll(".prn-fb-canvas-item");
    fireEvent.dragStart(items[0]!, { dataTransfer });
    fireEvent.dragOver(items[1]!, { dataTransfer });
    fireEvent.drop(items[1]!, { dataTransfer });
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components.map((f) => f.id)).toEqual(["b", "a"]);
  });

  it("zeigt im Experten-Modus den form-js-Host", () => {
    render(<FormBuilder mode="expert" />);
    expect(document.querySelector(".prn-fb-expert-host")).toBeInTheDocument();
  });

  it("editiert Text eines präsentationellen Felds", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "t1", type: "text", text: "Hallo" }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByText("Hallo", { selector: ".prn-fb-item-label" }));
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Welt" } });
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components[0]!.text).toBe("Welt");
  });

  it("entfernt ein Feld über die Canvas-Schaltfläche", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "f1", type: "textfield", key: "f1", label: "Weg" }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Feld entfernen" }));
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components).toHaveLength(0);
  });

  it("bearbeitet Optionen eines Select-Felds", () => {
    const start: FormSchema = {
      type: "default",
      components: [
        {
          id: "s1",
          type: "select",
          key: "s1",
          label: "Auswahl",
          values: [{ value: "a", label: "A" }],
        },
      ],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    // Canvas-Item (nicht den gleichnamigen Palette-Button) auswählen.
    fireEvent.click(screen.getByText("Auswahl", { selector: ".prn-fb-item-label" }));
    fireEvent.click(screen.getByRole("button", { name: "Option hinzufügen" }));
    const schema: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(schema.components[0]!.values).toHaveLength(2);
  });

  it("setzt required, Beschreibung und conditional.hide", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "f1", type: "textfield", key: "f1", label: "Feld" }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByText("Feld", { selector: ".prn-fb-item-label" }));
    fireEvent.click(screen.getByText("Pflichtfeld"));
    fireEvent.change(screen.getByLabelText("Beschreibung"), { target: { value: "Hilfe" } });
    fireEvent.change(
      screen.getByLabelText("Sichtbar wenn versteckt (conditional.hide)"),
      { target: { value: "other = true" } },
    );
    fireEvent.change(screen.getByLabelText("Pattern (RegEx)"), { target: { value: "^x$" } });
    const last: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    const f = last.components[0]!;
    expect(f.validate?.pattern).toBe("^x$");
    expect(f.conditional?.hide).toBe("other = true");
  });

  it("erhöht max bei Zahlenfeldern über den Stepper", () => {
    const start: FormSchema = {
      type: "default",
      components: [{ id: "n1", type: "number", key: "n1", label: "Menge", validate: { max: 8 } }],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByText("Menge", { selector: ".prn-fb-item-label" }));
    const panel = document.querySelector(".prn-fb-props-form")!;
    const incButtons = panel.querySelectorAll<HTMLButtonElement>('[slot="increment"]');
    // Reihenfolge im Panel: [Min, Max] → zweiter Stepper = Max.
    fireEvent.click(incButtons[incButtons.length - 1]!);
    const last: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(last.components[0]!.validate?.max).toBe(9);
  });

  it("entfernt eine Option im Eigenschaften-Panel", () => {
    const start: FormSchema = {
      type: "default",
      components: [
        {
          id: "s1",
          type: "radio",
          key: "s1",
          label: "RadioFeld",
          values: [
            { value: "a", label: "A" },
            { value: "b", label: "B" },
          ],
        },
      ],
    };
    const onChange = vi.fn();
    render(<FormBuilder defaultValue={start} onChange={onChange} />);
    fireEvent.click(screen.getByText("RadioFeld", { selector: ".prn-fb-item-label" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Option entfernen" })[0]!);
    const last: FormSchema = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(last.components[0]!.values).toHaveLength(1);
  });
});
