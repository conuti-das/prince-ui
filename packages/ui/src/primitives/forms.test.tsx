import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Button,
  TextField,
  SearchField,
  Checkbox,
  Switch,
  Select,
  SelectItem,
} from "./forms";
import { PrinceSizeProvider } from "./size";

describe("forms primitives", () => {
  it("Button fires onPress and reflects its variant", async () => {
    const onPress = vi.fn();
    render(
      <Button variant="tinted" onPress={onPress}>
        Klick
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Klick" });
    expect(btn).toHaveAttribute("data-variant", "tinted");
    await userEvent.click(btn);
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("TextField renders label and accepts input", async () => {
    render(<TextField label="Name" placeholder="z. B. Müller" />);
    const input = screen.getByLabelText("Name");
    await userEvent.type(input, "abc");
    expect(input).toHaveValue("abc");
  });

  it("TextField shows a validation error message", () => {
    render(<TextField label="Mail" isInvalid errorMessage="Pflichtfeld" />);
    expect(screen.getByText("Pflichtfeld")).toBeInTheDocument();
  });

  it("SearchField renders its label", () => {
    render(<SearchField label="Suche" placeholder="suchen…" />);
    expect(screen.getByLabelText("Suche")).toBeInTheDocument();
  });

  it("Checkbox toggles", async () => {
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Aktiv</Checkbox>);
    await userEvent.click(screen.getByRole("checkbox", { name: "Aktiv" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("Switch toggles", async () => {
    const onChange = vi.fn();
    render(<Switch onChange={onChange}>An</Switch>);
    await userEvent.click(screen.getByRole("switch", { name: "An" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("Select opens its listbox and selects an item", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Select
        label="Sparte"
        placeholder="Bitte wählen"
        onSelectionChange={onSelectionChange}
      >
        <SelectItem id="strom">Strom</SelectItem>
        <SelectItem id="gas">Gas</SelectItem>
      </Select>,
    );
    // Trigger-Button öffnet das Popover-Listbox.
    await userEvent.click(screen.getByRole("button", { name: /Sparte/ }));
    await userEvent.click(screen.getByRole("option", { name: "Gas" }));
    expect(onSelectionChange).toHaveBeenCalledWith("gas");
  });

  it("TextField defaults to size m", () => {
    render(<TextField label="Name" />);
    expect(screen.getByLabelText("Name").closest(".prn-field")).toHaveAttribute("data-size", "m");
  });

  it("TextField reflects an explicit size on the field root", () => {
    render(<TextField label="Name" size="s" />);
    expect(screen.getByLabelText("Name").closest(".prn-field")).toHaveAttribute("data-size", "s");
  });

  it("Button reflects an explicit size", () => {
    render(<Button size="s">Klick</Button>);
    expect(screen.getByRole("button", { name: "Klick" })).toHaveAttribute("data-size", "s");
  });

  it("PrinceSizeProvider sets the default size for nested fields", () => {
    render(
      <PrinceSizeProvider size="s">
        <TextField label="Name" />
      </PrinceSizeProvider>,
    );
    expect(screen.getByLabelText("Name").closest(".prn-field")).toHaveAttribute("data-size", "s");
  });

  it("explicit size overrides the PrinceSizeProvider context", () => {
    render(
      <PrinceSizeProvider size="s">
        <TextField label="Name" size="l" />
      </PrinceSizeProvider>,
    );
    expect(screen.getByLabelText("Name").closest(".prn-field")).toHaveAttribute("data-size", "l");
  });
});