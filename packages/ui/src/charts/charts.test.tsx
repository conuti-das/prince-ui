import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  Sparkline,
  AreaChart,
  BarChart,
  DonutChart,
  ChartEmpty,
  smoothPath,
} from "./charts";

describe("charts", () => {
  it("Sparkline renders an svg path for data", () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 8, 5]} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("Sparkline falls back to a compact empty state for no data", () => {
    const { getByText } = render(<Sparkline data={[]} />);
    expect(getByText("Keine Daten")).toBeInTheDocument();
  });

  it("BarChart renders a bar (rect) per datum", () => {
    const { container } = render(
      <BarChart
        data={[
          { label: "A", value: 1 },
          { label: "B", value: 3 },
        ]}
      />,
    );
    expect(container.querySelectorAll("rect").length).toBeGreaterThanOrEqual(2);
  });

  it("BarChart renders the empty state for no data", () => {
    const { getByText } = render(<BarChart data={[]} />);
    expect(getByText("Keine Daten")).toBeInTheDocument();
  });

  it("AreaChart renders an svg (numbers, with axes)", () => {
    const { container } = render(<AreaChart data={[1, 2, 3]} showAxes />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("path")).toBeInTheDocument();
  });

  it("AreaChart accepts explicit (x,y) points", () => {
    const { container } = render(
      <AreaChart
        data={[
          { x: 0, y: 5 },
          { x: 1, y: 2 },
          { x: 2, y: 8 },
        ]}
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("DonutChart renders an svg with one arc path per segment plus a legend", () => {
    const { container, getByText } = render(
      <DonutChart
        segments={[
          { label: "x", value: 1 },
          { label: "y", value: 2 },
        ]}
        centerLabel="3"
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("svg path").length).toBeGreaterThanOrEqual(2);
    // Legende zeigt die Labels.
    expect(getByText("x")).toBeInTheDocument();
    expect(getByText("y")).toBeInTheDocument();
  });

  it("DonutChart renders the empty state when the total is zero", () => {
    const { getByText } = render(<DonutChart segments={[]} />);
    expect(getByText("Keine Daten")).toBeInTheDocument();
  });

  it("ChartEmpty shows a custom message", () => {
    const { getByText } = render(<ChartEmpty message="Nichts" />);
    expect(getByText("Nichts")).toBeInTheDocument();
  });

  it("smoothPath returns a straight line for exactly two points and empty for one", () => {
    expect(smoothPath([{ x: 0, y: 0 }])).toBe("");
    expect(
      smoothPath([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toBe("M 0,0 L 1,1");
    expect(
      smoothPath([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ]),
    ).toContain("C");
  });
});