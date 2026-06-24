import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, Radio, CheckboxGroup } from "./choice";
import { Checkbox } from "./forms";

describe("choice primitives", () => {
  it("RadioGroup renders its label and reports the selected value", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup label="Sparte" onChange={onChange}>
        <Radio value="strom">Strom</Radio>
        <Radio value="gas">Gas</Radio>
        <Radio value="wasser">Wasser</Radio>
      </RadioGroup>,
    );
    expect(screen.getByText("Sparte")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Gas" }));
    expect(onChange).toHaveBeenCalledWith("gas");
  });

  it("CheckboxGroup reports the selected values as an array", async () => {
    const onChange = vi.fn();
    render(
      <CheckboxGroup label="Optionen" onChange={onChange}>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "A" }));
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(["a"]));
  });
});
