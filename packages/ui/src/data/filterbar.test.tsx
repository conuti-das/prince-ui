import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar, FilterField } from "./filterbar";

describe("FilterField", () => {
  it("renders its label and control slot", () => {
    render(
      <FilterField label="Sparte">
        <input aria-label="Sparte-Eingabe" />
      </FilterField>,
    );
    expect(screen.getByText("Sparte")).toBeInTheDocument();
    expect(screen.getByLabelText("Sparte-Eingabe")).toBeInTheDocument();
  });
});

describe("FilterBar", () => {
  it("exposes the search role with its aria-label and renders children", () => {
    render(
      <FilterBar aria-label="Transaktionsfilter">
        <FilterField label="Suche">
          <input aria-label="Suche" />
        </FilterField>
      </FilterBar>,
    );
    expect(
      screen.getByRole("search", { name: "Transaktionsfilter" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Suche")).toBeInTheDocument();
  });

  it("renders active filter chips and removes one on dismiss", async () => {
    const onRemove = vi.fn();
    render(
      <FilterBar
        activeFilters={[{ id: "sparte", label: "Sparte", value: "Strom" }]}
        onRemoveFilter={onRemove}
      >
        <FilterField label="Sparte">
          <input aria-label="Sparte" />
        </FilterField>
      </FilterBar>,
    );
    expect(screen.getByText("Strom")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: /filter entfernen/i }),
    );
    expect(onRemove).toHaveBeenCalledWith("sparte");
  });

  it("calls onClearAll when the reset action is pressed", async () => {
    const onClearAll = vi.fn();
    render(
      <FilterBar activeFilters={[{ id: "a", value: "x" }]} onClearAll={onClearAll}>
        <span />
      </FilterBar>,
    );
    await userEvent.click(screen.getByRole("button", { name: /zurücksetzen/i }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });

  it("renders extra actions and a 'more filters' overflow trigger", async () => {
    render(
      <FilterBar
        moreLabel="Mehr Filter"
        moreFields={
          <FilterField label="Typ">
            <input aria-label="Typ" />
          </FilterField>
        }
        actions={<button type="button">Anwenden</button>}
      >
        <FilterField label="Suche">
          <input aria-label="Suche" />
        </FilterField>
      </FilterBar>,
    );
    expect(screen.getByRole("button", { name: "Anwenden" })).toBeInTheDocument();
    // Overflow-Trigger öffnet ein Popover mit dem ausgelagerten Feld.
    await userEvent.click(screen.getByRole("button", { name: "Mehr Filter" }));
    expect(screen.getByLabelText("Typ")).toBeInTheDocument();
  });
});