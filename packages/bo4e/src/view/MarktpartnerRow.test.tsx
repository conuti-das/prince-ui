import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarktpartnerRow } from "./MarktpartnerRow";

describe("MarktpartnerRow", () => {
  it("resolves code to name via injected resolver", () => {
    render(
      <MarktpartnerRow
        row={{ marktrolle: "MSB", rollencodenummer: "9906464000001", gueltigkeitszeitraum: { enddatum: "2026-07-01T04:00:00Z" } }}
        resolvers={{ marktpartner: (c) => (c === "9906464000001" ? { name: "Westnetz" } : undefined) }}
        now={new Date("2026-06-25T12:00:00Z")}
      />,
    );
    expect(screen.getByText("Westnetz")).toBeInTheDocument();
    expect(screen.getByText("MSB")).toBeInTheDocument();
  });

  it("dims an expired role", () => {
    const { container } = render(
      <MarktpartnerRow
        row={{ marktrolle: "NB", rollencodenummer: "9900683000008", gueltigkeitszeitraum: { enddatum: "2025-12-31T23:00:00Z" } }}
        now={new Date("2026-06-25T12:00:00Z")}
      />,
    );
    expect(container.querySelector(".prn-bo-mpr")?.getAttribute("data-dim")).toBe("true");
  });
});
