import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableValue } from "./EditableValue";
import type { FieldDoc } from "../types";

const textDoc: FieldDoc = { translation: "Name" };
const enumDoc: FieldDoc = { translation: "Energierichtung", enumRef: "ENERGIERICHTUNG", enum: { values: ["AUSSP", "EINSP"] } };

describe("EditableValue", () => {
  it("renders a text field with the current value", () => {
    render(<EditableValue doc={textDoc} value="Haiko" onChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Haiko");
  });

  it("fires onChange while typing in a text field", async () => {
    const onChange = vi.fn();
    render(<EditableValue doc={textDoc} value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "A");
    expect(onChange).toHaveBeenCalledWith("A");
  });

  it("renders an enum as a select showing the current value", () => {
    render(<EditableValue doc={enumDoc} value="AUSSP" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /AUSSP/ })).toBeInTheDocument();
  });

  it("renders a boolean as a switch", () => {
    render(<EditableValue doc={{ translation: "Unterbrechbar" }} value={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });
});
