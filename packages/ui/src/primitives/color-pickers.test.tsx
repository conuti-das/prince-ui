import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseColor } from "react-aria-components";
import {
  ColorArea,
  ColorSlider,
  ColorWheel,
  ColorPicker,
} from "./color-pickers";
import { ColorField } from "./color";

describe("color-picker primitives", () => {
  it("ColorArea renders a 2D color group", () => {
    render(
      <ColorArea
        aria-label="Sättigung und Helligkeit"
        defaultValue={parseColor("hsb(200, 50%, 50%)")}
        xChannel="saturation"
        yChannel="brightness"
      />,
    );
    // ColorArea exposes role="group" wrapping the two channel sliders.
    expect(screen.getByRole("group", { name: /Sättigung und Helligkeit/ })).toBeInTheDocument();
    expect(screen.getAllByRole("slider").length).toBeGreaterThanOrEqual(1);
  });

  it("ColorSlider renders its label and channel slider", () => {
    render(
      <ColorSlider
        label="Farbton"
        colorSpace="hsl"
        channel="hue"
        defaultValue={parseColor("hsl(120, 100%, 50%)")}
      />,
    );
    expect(screen.getByText("Farbton")).toBeInTheDocument();
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("ColorSlider fires onChange on keyboard input", async () => {
    const onChange = vi.fn();
    render(
      <ColorSlider
        label="Farbton"
        colorSpace="hsl"
        channel="hue"
        defaultValue={parseColor("hsl(120, 100%, 50%)")}
        onChange={onChange}
      />,
    );
    const slider = screen.getByRole("slider");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalled();
  });

  it("ColorWheel renders a hue slider", () => {
    render(
      <ColorWheel
        defaultValue={parseColor("hsl(30, 100%, 50%)")}
        aria-label="Farbton-Rad"
      />,
    );
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("ColorField renders a labeled hex input and accepts typing", async () => {
    render(<ColorField label="Hex" defaultValue={parseColor("#ff0000")} />);
    const input = screen.getByLabelText("Hex");
    expect(input).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "#00ff00");
    expect(input).toHaveValue("#00ff00");
  });

  it("ColorPicker shows a trigger and opens its popover", async () => {
    render(<ColorPicker label="Markenfarbe" defaultValue={parseColor("#0a84ff")} />);
    const trigger = screen.getByRole("button", { name: /Markenfarbe/ });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    // Popover contains the area group + hue slider + hex field.
    expect(await screen.findByLabelText("Hex")).toBeInTheDocument();
    expect(screen.getAllByRole("slider").length).toBeGreaterThanOrEqual(1);
  });
});
