import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValidityRange } from "./ValidityRange";

describe("ValidityRange", () => {
  it("renders Berlin dates and an expired hint", () => {
    render(<ValidityRange start="2022-12-31T23:00:00Z" end="2025-10-14T07:52:00Z" now={new Date("2026-06-25T12:00:00Z")} />);
    expect(screen.getByText(/01\.01\.2023/)).toBeInTheDocument();
    expect(screen.getByText(/abgelaufen/)).toBeInTheDocument();
  });
});
