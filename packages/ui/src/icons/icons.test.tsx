import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Icon } from "./icons";

describe("Icon", () => {
  it("renders an inline svg that inherits currentColor (monochrome)", () => {
    const { container } = render(<Icon name="heart" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toBeInTheDocument();
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("fill")).toBe("none");
  });

  it("is decorative (aria-hidden) without a title", () => {
    const { container } = render(<Icon name="menu" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("becomes an accessible image when a title is given", () => {
    const { container } = render(<Icon name="search" title="Suche" />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "Suche");
    expect(svg).not.toHaveAttribute("aria-hidden");
  });

  it("honors the size prop", () => {
    const { container } = render(<Icon name="plus" size={32} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });
});
