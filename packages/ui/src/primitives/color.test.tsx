import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ColorField,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  parseColor,
} from "./color";

describe("color primitives", () => {
  it("ColorField renders its label and accepts a hex value", async () => {
    render(<ColorField label="Akzentfarbe" defaultValue="#ff0000" />);
    const input = screen.getByLabelText("Akzentfarbe") as HTMLInputElement;
    // RAC formatiert den Hex-Wert im Eingabefeld.
    expect(input.value.toUpperCase()).toContain("FF0000");
  });

  it("ColorField updates on typing a new hex", async () => {
    const onChange = vi.fn();
    render(<ColorField label="Farbe" onChange={onChange} />);
    const input = screen.getByLabelText("Farbe");
    await userEvent.type(input, "#00FF00");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalled();
  });

  it("ColorSwatch renders with the given color", () => {
    render(<ColorSwatch color="#3478F6" aria-label="Blau" />);
    const swatch = screen.getByRole("img", { name: /Blau/ });
    expect(swatch).toHaveStyle({ backgroundColor: "rgb(52, 120, 246)" });
  });

  it("ColorSwatchPicker fires onChange on selection", async () => {
    const onChange = vi.fn();
    render(
      <ColorSwatchPicker
        aria-label="Palette"
        defaultValue="#FF0000"
        onChange={onChange}
      >
        <ColorSwatchPickerItem color="#FF0000" />
        <ColorSwatchPickerItem color="#00FF00" />
        <ColorSwatchPickerItem color="#0000FF" />
      </ColorSwatchPicker>,
    );
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    await userEvent.click(options[2]!);
    expect(onChange).toHaveBeenCalledOnce();
    const arg = onChange.mock.calls[0]![0];
    expect(arg.toString("hex")).toBe(parseColor("#0000FF").toString("hex"));
  });
});
