/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { DmnTableEditor } from "./DmnTableEditor";
import type { DmnCellPlugin } from "../types";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
             id="def1" name="Test" namespace="http://camunda.org/schema/1.0/dmn">
  <decision id="dec1" name="TestDecision">
    <decisionTable id="dt1" hitPolicy="UNIQUE">
      <input id="col_in1" label="Eingang">
        <inputExpression id="expr1" typeRef="string"><text>eingangParam</text></inputExpression>
        <inputValues id="iv1"><text>"Ja","Nein"</text></inputValues>
      </input>
      <output id="col_out1" label="Ausgang" name="ausgangParam" typeRef="string"/>
      <rule id="rule0">
        <inputEntry id="ie0"><text>"Ja"</text></inputEntry>
        <outputEntry id="oe0"><text>"OK"</text></outputEntry>
      </rule>
    </decisionTable>
  </decision>
</definitions>`;

async function renderEditor(props = {}) {
  const utils = render(<DmnTableEditor defaultValue={XML} {...props} />);
  await waitFor(() => expect(screen.getByText(/Regeln \(1\)/)).toBeInTheDocument());
  return utils;
}

describe("DmnTableEditor", () => {
  it("zeigt einen Fehler bei ungültigem XML", async () => {
    render(<DmnTableEditor defaultValue="<<<" />);
    await waitFor(() => expect(screen.getByText(/Fehler:/)).toBeInTheDocument());
  });

  it("zeigt Hinweis ohne Dokument", () => {
    render(<DmnTableEditor />);
    expect(screen.getByText(/Kein DMN-Dokument/)).toBeInTheDocument();
  });

  it("rendert Spaltenköpfe (Input/Output) und Lint-Banner", async () => {
    await renderEditor();
    expect(screen.getByText("Eingang")).toBeInTheDocument();
    expect(screen.getByText("ausgangParam")).toBeInTheDocument();
    expect(screen.getByText(/Alle 1 Regeln valide/)).toBeInTheDocument();
  });

  it("editiert eine Zelle inline und ruft onChange", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });

    const cell = screen.getByText('"Ja"');
    fireEvent.click(cell);
    const input = await screen.findByDisplayValue('"Ja"');
    fireEvent.change(input, { target: { value: '"Nein"' } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const calls = onChange.mock.calls;
    const lastXml = calls[calls.length - 1]![0] as string;
    expect(lastXml).toContain('"Nein"');
  });

  it("bricht Inline-Edit mit Escape ab", async () => {
    await renderEditor();
    fireEvent.click(screen.getByText('"Ja"'));
    const input = await screen.findByDisplayValue('"Ja"');
    fireEvent.change(input, { target: { value: '"X"' } });
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(screen.getByText('"Ja"')).toBeInTheDocument());
  });

  it("öffnet den FEEL-Editor per Doppelklick und übernimmt einen Wert", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });

    fireEvent.doubleClick(screen.getByText('"Ja"'));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/FEEL/)).toBeInTheDocument();

    const textarea = within(dialog).getByRole("textbox");
    fireEvent.change(textarea, { target: { value: '"Nein"' } });
    fireEvent.click(within(dialog).getByText("Übernehmen"));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("fügt eine Zeile hinzu", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });
    fireEvent.click(screen.getByText("+ Zeile"));
    await waitFor(() => expect(screen.getByText(/Regeln \(2\)/)).toBeInTheDocument());
  });

  it("öffnet den Spalte-hinzufügen-Dialog und legt eine Input-Spalte an", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });
    fireEvent.click(screen.getByText("+ Input"));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByText("Anlegen"));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("wechselt die Hit-Policy auf COLLECT und zeigt die Aggregation", async () => {
    await renderEditor();
    const policySelect = screen.getByRole("button", { name: /UNIQUE/ });
    fireEvent.click(policySelect);
    const option = await screen.findByRole("option", { name: "COLLECT" });
    fireEvent.click(option);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /SUM/ })).toBeInTheDocument(),
    );
  });

  it("ruft onSave per Button", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    await renderEditor({ onSave });
    fireEvent.click(screen.getByText("Speichern"));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]![0]).toContain("dec1");
  });

  it("ruft onSave per ⌘S", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    await renderEditor({ onSave });
    fireEvent.keyDown(window, { key: "s", metaKey: true });
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });

  it("ruft onSwitchToExpert", async () => {
    const onSwitchToExpert = vi.fn();
    await renderEditor({ onSwitchToExpert });
    fireEvent.click(screen.getByText("Experte"));
    expect(onSwitchToExpert).toHaveBeenCalled();
  });

  it("nutzt ein cellPlugin als Editor", async () => {
    const plugin: DmnCellPlugin = {
      matches: (col) => col.kind === "input",
      renderEditor: ({ onCommit }) => (
        <button onClick={onCommit} data-testid="plugin-editor">
          Plugin
        </button>
      ),
    };
    await renderEditor({ cellPlugins: [plugin] });
    fireEvent.click(screen.getByText('"Ja"'));
    expect(await screen.findByTestId("plugin-editor")).toBeInTheDocument();
  });

  it("editiert eine Annotation inline", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });
    // Annotation-Zelle ist die leere Zelle in der Annotation-Spalte (–).
    const dashes = screen.getAllByText("–");
    fireEvent.click(dashes[dashes.length - 1]!);
    const input = await screen.findByDisplayValue("");
    fireEvent.change(input, { target: { value: "Notiz" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  });

  it("öffnet den Spalte-bearbeiten-Dialog und ändert/löscht", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });
    // Zahnrad-Button im Input-Spaltenkopf.
    const editButtons = screen.getAllByRole("button", { name: "Spalte bearbeiten" });
    fireEvent.click(editButtons[0]!);
    const dialog = await screen.findByRole("dialog");
    const labelInput = within(dialog).getByDisplayValue("Eingang");
    fireEvent.change(labelInput, { target: { value: "Umbenannt" } });
    fireEvent.click(within(dialog).getByText("Speichern"));
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    // erneut öffnen und löschen
    const editButtons2 = screen.getAllByRole("button", { name: "Spalte bearbeiten" });
    fireEvent.click(editButtons2[0]!);
    const dialog2 = await screen.findByRole("dialog");
    fireEvent.click(within(dialog2).getByText("Löschen"));
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));
  });

  it("nutzt FEEL-Snippet-Buttons und Abbrechen", async () => {
    await renderEditor();
    fireEvent.doubleClick(screen.getByText('"Ja"'));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByText("[1..100]"));
    expect(within(dialog).getByRole("textbox")).toHaveValue("[1..100]");
    fireEvent.click(within(dialog).getByText("Abbrechen"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("selektiert eine Zeile, verschiebt und löscht sie", async () => {
    const onChange = vi.fn();
    await renderEditor({ onChange });
    // Zeile zunächst hinzufügen, damit Verschieben sinnvoll ist.
    fireEvent.click(screen.getByText("+ Zeile"));
    await waitFor(() => expect(screen.getByText(/Regeln \(2\)/)).toBeInTheDocument());

    // Zeile über den Auswahl-Radio selektieren.
    const radios = screen.getAllByRole("radio", { name: "Zeile auswählen" });
    fireEvent.click(radios[0]!);
    await waitFor(() => {
      const del = screen.getByText("Zeile löschen");
      expect(del).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText("↓"));
    fireEvent.click(screen.getByText("Zeile löschen"));
    await waitFor(() => expect(screen.getByText(/Regeln \(1\)/)).toBeInTheDocument());
  });

  it("ist im readOnly-Modus nicht editierbar", async () => {
    render(<DmnTableEditor defaultValue={XML} readOnly />);
    await waitFor(() => expect(screen.getByText("Eingang")).toBeInTheDocument());
    expect(screen.queryByText("+ Zeile")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('"Ja"'));
    expect(screen.queryByDisplayValue('"Ja"')).not.toBeInTheDocument();
  });
});