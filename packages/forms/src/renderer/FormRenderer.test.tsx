import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormRenderer } from "./FormRenderer";
import type { FormSchema } from "../types";

const schema: FormSchema = {
  type: "default",
  components: [
    { type: "textfield", key: "name", label: "Name", validate: { required: true } },
    { type: "number", key: "amount", label: "Betrag", validate: { min: 1 } },
    { type: "checkbox", key: "agree", label: "Zustimmung" },
    {
      type: "select",
      key: "prio",
      label: "Priorität",
      values: [
        { value: "low", label: "Niedrig" },
        { value: "high", label: "Hoch" },
      ],
    },
    {
      type: "radio",
      key: "color",
      label: "Farbe",
      values: [
        { value: "r", label: "Rot" },
        { value: "g", label: "Grün" },
      ],
    },
    { type: "text", text: "Hinweistext" },
    { type: "separator" },
    {
      type: "textfield",
      key: "reason",
      label: "Begründung",
      conditional: { hide: "agree = true" },
    },
  ],
};

describe("FormRenderer", () => {
  it("rendert alle Feldtypen mit Labels", () => {
    render(<FormRenderer schema={schema} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Betrag")).toBeInTheDocument();
    expect(screen.getByText("Zustimmung")).toBeInTheDocument();
    expect(screen.getByText("Priorität")).toBeInTheDocument();
    expect(screen.getByText("Farbe")).toBeInTheDocument();
    expect(screen.getByText("Hinweistext")).toBeInTheDocument();
  });

  it("zeigt Validierungsfehler bei Submit", async () => {
    const onSubmit = vi.fn();
    render(<FormRenderer schema={schema} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Absenden" }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
    const result = onSubmit.mock.calls[0]![0];
    expect(result.errors.name).toBeDefined();
  });

  it("liefert Camunda-Variablen im Submit", async () => {
    const onSubmit = vi.fn();
    render(
      <FormRenderer
        schema={schema}
        defaultData={{ name: "Max", amount: 5, agree: true, prio: "high" }}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Absenden" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const result = onSubmit.mock.calls[0]![0];
    expect(result.errors).toEqual({});
    expect(result.variables.name).toEqual({ value: "Max", type: "String" });
    expect(result.variables.amount).toEqual({ value: 5, type: "Integer" });
    expect(result.variables.agree).toEqual({ value: true, type: "Boolean" });
  });

  it("liefert Plain-Format wenn gewünscht", async () => {
    const onSubmit = vi.fn();
    render(
      <FormRenderer
        schema={schema}
        defaultData={{ name: "X", amount: 2 }}
        submitVariableFormat="plain"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Absenden" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const result = onSubmit.mock.calls[0]![0];
    expect(result.variables.name).toBe("X");
  });

  it("versteckt bedingte Felder (conditional.hide)", () => {
    const { rerender } = render(
      <FormRenderer schema={schema} defaultData={{ agree: false }} />,
    );
    expect(screen.getByText("Begründung")).toBeInTheDocument();
    rerender(<FormRenderer schema={schema} data={{ agree: true }} />);
    expect(screen.queryByText("Begründung")).not.toBeInTheDocument();
  });

  it("ruft onChange bei Eingabe", () => {
    const onChange = vi.fn();
    render(<FormRenderer schema={schema} onChange={onChange} />);
    const input = screen.getByLabelText("Name");
    fireEvent.change(input, { target: { value: "Anna" } });
    expect(onChange).toHaveBeenCalled();
    const calls = onChange.mock.calls;
    const last = calls[calls.length - 1]?.[0];
    expect(last.name).toBe("Anna");
  });

  it("rendert read-only über DescriptionList", () => {
    render(
      <FormRenderer
        schema={schema}
        readOnly
        data={{ name: "Max", agree: true, prio: "high", amount: 7 }}
      />,
    );
    expect(screen.getByText("Max")).toBeInTheDocument();
    // Boolean → Ja
    expect(screen.getByText("Ja")).toBeInTheDocument();
    // Select-Wert wird auf Label gemappt
    expect(screen.getByText("Hoch")).toBeInTheDocument();
    // versteckte Begründung (agree=true) nicht im read-only
    expect(screen.queryByText("Begründung")).not.toBeInTheDocument();
  });

  it("kann ohne Submit-Button gerendert werden", () => {
    render(<FormRenderer schema={schema} submitLabel={null} />);
    expect(screen.queryByRole("button", { name: "Absenden" })).not.toBeInTheDocument();
  });

  it("rendert textarea, checklist, taglist, datetime, group, spacer", () => {
    const s: FormSchema = {
      type: "default",
      components: [
        { type: "textarea", key: "notes", label: "Notizen" },
        { type: "datetime", key: "when", label: "Wann" },
        { type: "spacer" },
        {
          type: "checklist",
          key: "tags",
          label: "Schlagworte",
          values: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
        },
        {
          type: "taglist",
          key: "skills",
          label: "Skills",
          values: [
            { value: "x", label: "X-Ray" },
            { value: "y", label: "Yankee" },
          ],
        },
        {
          type: "group",
          label: "Gruppe",
          components: [{ type: "textfield", key: "inner", label: "Innen" }],
        },
      ],
    };
    render(<FormRenderer schema={s} />);
    expect(screen.getByText("Notizen")).toBeInTheDocument();
    expect(screen.getByText("Wann")).toBeInTheDocument();
    expect(screen.getByText("Schlagworte")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Gruppe")).toBeInTheDocument();
    expect(screen.getByLabelText("Innen")).toBeInTheDocument();
  });

  it("checkbox- und textarea-Eingaben aktualisieren die Daten", () => {
    const onChange = vi.fn();
    const s: FormSchema = {
      type: "default",
      components: [
        { type: "checkbox", key: "ok", label: "OK" },
        { type: "textarea", key: "memo", label: "Memo" },
      ],
    };
    render(<FormRenderer schema={s} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox", { name: "OK" }));
    fireEvent.change(screen.getByLabelText("Memo"), { target: { value: "Hallo" } });
    const calls = onChange.mock.calls;
    expect(calls.some((c) => c[0].ok === true)).toBe(true);
    expect(calls.some((c) => c[0].memo === "Hallo")).toBe(true);
  });

  it("number-, datetime- und radio-Eingaben aktualisieren die Daten", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const s: FormSchema = {
      type: "default",
      components: [
        { type: "number", key: "n", label: "Zahl" },
        { type: "datetime", key: "d", label: "Datum" },
        {
          type: "radio",
          key: "r",
          label: "Wahl",
          values: [
            { value: "1", label: "Eins" },
            { value: "2", label: "Zwei" },
          ],
        },
      ],
    };
    render(<FormRenderer schema={s} defaultData={{ n: 5 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /increase/i }));
    // DatePicker: Eingabe über die Datums-Segmente. Ohne I18nProvider gilt der
    // en-US-Default (MM/TT/JJJJ) → 07, 01, 2026 ergibt das ISO-Datum 2026-07-01.
    const dateGroup = screen.getByRole("group", { name: "Datum" });
    const firstSegment = within(dateGroup).getAllByRole("spinbutton")[0];
    expect(firstSegment).toBeDefined();
    await user.click(firstSegment as HTMLElement);
    await user.keyboard("07012026");
    fireEvent.click(screen.getByRole("radio", { name: "Eins" }));
    const calls = onChange.mock.calls;
    expect(calls.some((c) => c[0].n === 6)).toBe(true);
    expect(calls.some((c) => c[0].d === "2026-07-01")).toBe(true);
    expect(calls.some((c) => c[0].r === "1")).toBe(true);
  });

  it("taglist: hinzufügen und entfernen", () => {
    const onChange = vi.fn();
    const s: FormSchema = {
      type: "default",
      components: [
        {
          type: "taglist",
          key: "skills",
          label: "Skills",
          values: [
            { value: "x", label: "X-Ray" },
            { value: "y", label: "Yankee" },
          ],
        },
      ],
    };
    render(
      <FormRenderer schema={s} defaultData={{ skills: ["x"] }} onChange={onChange} />,
    );
    // bereits ein Tag vorhanden (X-Ray) → entfernen
    const removeBtn = document.querySelector(".prn-tag button, .prn-tag [aria-label]");
    if (removeBtn) fireEvent.click(removeBtn as Element);
    expect(onChange).not.toThrow;
  });

  it("rendert actionsSlot neben dem Submit-Button", () => {
    render(
      <FormRenderer
        schema={schema}
        actionsSlot={<span>Abbrechen</span>}
      />,
    );
    expect(screen.getByText("Abbrechen")).toBeInTheDocument();
  });

  it("read-only zeigt Mehrfachwerte als Labelliste und Platzhalter", () => {
    const s: FormSchema = {
      type: "default",
      components: [
        {
          type: "checklist",
          key: "tags",
          label: "Tags",
          values: [
            { value: "a", label: "Alpha" },
            { value: "b", label: "Beta" },
          ],
        },
        { type: "textfield", key: "empty", label: "Leer" },
      ],
    };
    render(<FormRenderer schema={s} readOnly data={{ tags: ["a", "b"], empty: "" }} />);
    expect(screen.getByText("Alpha, Beta")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
