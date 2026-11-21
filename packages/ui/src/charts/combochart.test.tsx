import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComboChart } from "./combochart";

const LABELS = ["10:00", "10:01", "10:02", "10:03"];

describe("ComboChart", () => {
  it("draws grouped bars per bar series and a path per line series", () => {
    const { container } = render(
      <ComboChart
        labels={LABELS}
        series={[
          { id: "a", label: "gestartet", values: [4, 5, 6, 5] },
          { id: "b", label: "fertig", values: [3, 5, 6, 4] },
          { id: "soll", label: "Soll", kind: "line", values: [6, 6, 6, 6] },
        ]}
      />,
    );
    expect(container.querySelectorAll('rect[data-series="a"]')).toHaveLength(4);
    expect(container.querySelectorAll('rect[data-series="b"]')).toHaveLength(4);
    expect(container.querySelectorAll('g[data-series="soll"] path')).toHaveLength(1);
    // Balken einer Gruppe liegen nebeneinander, nicht übereinander
    const a0 = container.querySelector('rect[data-series="a"]')!, b0 = container.querySelector('rect[data-series="b"]')!;
    expect(Number(b0.getAttribute("x"))).toBeGreaterThan(Number(a0.getAttribute("x")));
  });

  it("legend names every series with word and shape (data-kind), not color alone", () => {
    render(
      <ComboChart labels={LABELS} series={[{ id: "a", label: "gestartet", values: [1, 2, 3, 4] }, { id: "s", label: "Soll", kind: "line", values: [2, 2, 2, 2] }]} />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((i) => i.textContent)).toEqual(["gestartet", "Soll"]);
    expect(items[0]).toHaveAttribute("data-kind", "bar");
    expect(items[1]).toHaveAttribute("data-kind", "line");
  });

  it("null leaves a gap: no bar, and the line breaks into two paths", () => {
    const { container } = render(
      <ComboChart
        labels={["a", "b", "c", "d", "e"]}
        series={[
          { id: "x", label: "x", values: [1, null, 3, 4, 5] },
          { id: "l", label: "l", kind: "line", values: [1, 2, null, 4, 5] },
        ]}
      />,
    );
    expect(container.querySelectorAll('rect[data-series="x"]')).toHaveLength(4);
    expect(container.querySelectorAll('g[data-series="l"] path')).toHaveLength(2);
  });

  it("value axis shows 0, half and max with the given format; labelEvery thins the x axis", () => {
    const { container } = render(
      <ComboChart labels={LABELS} series={[{ id: "a", label: "a", values: [10, 20, 40, 30] }]} showValueAxis formatValue={(n) => `${n} /min`} labelEvery={2} />,
    );
    const texte = [...container.querySelectorAll("text")].map((t) => t.textContent);
    expect(texte).toEqual(expect.arrayContaining(["0 /min", "20 /min", "40 /min"]));
    expect(texte.filter((t) => t?.startsWith("10:"))).toEqual(["10:00", "10:02"]);
  });

  it("is a named image with aria-label, decorative without; empty data renders the empty state", () => {
    const { container, rerender } = render(<ComboChart aria-label="Starts je Minute" labels={LABELS} series={[{ id: "a", label: "a", values: [1, 2, 3, 4] }]} />);
    expect(screen.getByRole("img", { name: "Starts je Minute" })).toBeInTheDocument();
    rerender(<ComboChart labels={LABELS} series={[{ id: "a", label: "a", values: [1, 2, 3, 4] }]} />);
    expect(container.querySelector("svg.prn-chart-combochart")).toHaveAttribute("aria-hidden", "true");
    rerender(<ComboChart labels={LABELS} series={[{ id: "a", label: "a", values: [null, null, null, null] }]} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
