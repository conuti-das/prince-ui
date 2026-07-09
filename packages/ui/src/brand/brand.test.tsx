import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CircleDot, FineLine, ResonanceField } from "./brand";

describe("CircleDot", () => {
  it("is decorative (aria-hidden) by default", () => {
    const { container } = render(<CircleDot />);
    const svg = container.querySelector(".prn-circledot");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("exposes an accessible name when a label is given", () => {
    render(<CircleDot label="Markenmarker" />);
    const img = screen.getByRole("img", { name: "Markenmarker" });
    expect(img).not.toHaveAttribute("aria-hidden");
  });

  it("applies the accent tone class and respects size", () => {
    const { container } = render(<CircleDot tone="accent" size={24} />);
    const svg = container.querySelector(".prn-circledot");
    expect(svg).toHaveClass("prn-circledot--accent");
    expect(svg).toHaveAttribute("width", "24");
  });
});

describe("FineLine", () => {
  it("renders a horizontal separator by default", () => {
    const sep = render(<FineLine />).container.querySelector(".prn-fineline");
    expect(sep).toHaveAttribute("role", "separator");
    expect(sep).toHaveAttribute("aria-orientation", "horizontal");
    expect(sep).toHaveClass("prn-fineline--horizontal");
  });

  it("supports a vertical orientation", () => {
    const sep = render(<FineLine orientation="vertical" />).container.querySelector(".prn-fineline");
    expect(sep).toHaveClass("prn-fineline--vertical");
    expect(sep).toHaveAttribute("aria-orientation", "vertical");
  });

  it("renders a center node between two segments when node is true", () => {
    const { container } = render(<FineLine node />);
    expect(container.querySelectorAll(".prn-fineline__seg")).toHaveLength(2);
    expect(container.querySelector(".prn-fineline__node .prn-circledot")).toBeInTheDocument();
  });

  it("renders a single segment and no node by default", () => {
    const { container } = render(<FineLine />);
    expect(container.querySelectorAll(".prn-fineline__seg")).toHaveLength(1);
    expect(container.querySelector(".prn-fineline__node")).not.toBeInTheDocument();
  });

  it("can be purely decorative (no separator role)", () => {
    const sep = render(<FineLine decorative />).container.querySelector(".prn-fineline");
    expect(sep).not.toHaveAttribute("role");
    expect(sep).toHaveAttribute("aria-hidden", "true");
  });
});

describe("ResonanceField", () => {
  it("renders its children above the signature background", () => {
    render(
      <ResonanceField>
        <h1>Die CONUTI Formel</h1>
      </ResonanceField>,
    );
    expect(screen.getByRole("heading", { name: "Die CONUTI Formel" })).toBeInTheDocument();
  });

  it("shows decorative resonance waves by default and hides them when disabled", () => {
    const withWaves = render(<ResonanceField>x</ResonanceField>).container;
    expect(withWaves.querySelector(".prn-resonance__waves")).toBeInTheDocument();

    const withoutWaves = render(<ResonanceField waves={false}>x</ResonanceField>).container;
    expect(withoutWaves.querySelector(".prn-resonance__waves")).not.toBeInTheDocument();
  });

  it("applies a custom wave origin via CSS custom properties", () => {
    const { container } = render(<ResonanceField origin={{ x: "20%", y: "80%" }}>x</ResonanceField>);
    const field = container.querySelector(".prn-resonance") as HTMLElement;
    expect(field.style.getPropertyValue("--prn-resonance-x")).toBe("20%");
    expect(field.style.getPropertyValue("--prn-resonance-y")).toBe("80%");
  });
});
