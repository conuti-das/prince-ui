import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberField, Slider } from "./numeric";

describe("numeric primitives", () => {
  it("NumberField increments via the stepper button", async () => {
    const onChange = vi.fn();
    render(<NumberField label="Menge" defaultValue={5} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /increase/i }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("Slider renders its label and fires onChange on keyboard", async () => {
    const onChange = vi.fn();
    render(<Slider label="Lautstärke" defaultValue={30} onChange={onChange} />);
    expect(screen.getByText("Lautstärke")).toBeInTheDocument();
    const thumb = screen.getByRole("slider");
    thumb.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalled();
  });
});
