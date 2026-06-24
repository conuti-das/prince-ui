import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComboBox, ComboBoxItem } from "./combobox";

describe("ComboBox primitive", () => {
  it("renders a combobox input with label", () => {
    render(
      <ComboBox label="Sparte">
        <ComboBoxItem id="strom">Strom</ComboBoxItem>
        <ComboBoxItem id="gas">Gas</ComboBoxItem>
        <ComboBoxItem id="wasser">Wasser</ComboBoxItem>
      </ComboBox>,
    );
    const input = screen.getByRole("combobox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAccessibleName("Sparte");
  });

  it("filters options as the user types", async () => {
    render(
      <ComboBox label="Sparte">
        <ComboBoxItem id="strom">Strom</ComboBoxItem>
        <ComboBoxItem id="gas">Gas</ComboBoxItem>
        <ComboBoxItem id="wasser">Wasser</ComboBoxItem>
      </ComboBox>,
    );
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "Ga");
    expect(screen.getByRole("option", { name: "Gas" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Strom" })).not.toBeInTheDocument();
  });

  it("calls onSelectionChange with the chosen key", async () => {
    const onSelectionChange = vi.fn();
    render(
      <ComboBox label="Sparte" onSelectionChange={onSelectionChange}>
        <ComboBoxItem id="strom">Strom</ComboBoxItem>
        <ComboBoxItem id="gas">Gas</ComboBoxItem>
        <ComboBoxItem id="wasser">Wasser</ComboBoxItem>
      </ComboBox>,
    );
    const input = screen.getByRole("combobox");
    await userEvent.type(input, "Ga");
    await userEvent.click(screen.getByRole("option", { name: "Gas" }));
    expect(onSelectionChange).toHaveBeenCalledWith("gas");
  });
});
