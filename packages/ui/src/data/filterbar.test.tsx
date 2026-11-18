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

  it("gives the 'more filters' trigger its own field so it can match the control height", () => {
    const { container } = render(
      <FilterBar moreFields={<input aria-label="Typ" />}>
        <FilterField label="Suche"><input aria-label="Suche" /></FilterField>
      </FilterBar>,
    );
    const more = container.querySelector(".prn-filterbar-more");
    expect(more).not.toBeNull();
    // Label-Zeile mit geschütztem Leerzeichen: gleiche Höhe wie die Labels der Nachbarfelder
    expect(more!.querySelector(".prn-filter-field-label")!.textContent).toBe("\u00a0");
  });

  it("uses custom labels for chips and the reset action", async () => {
    const onRemove = vi.fn();
    render(
      <FilterBar
        activeFilters={[{ id: "sparte", label: "Sparte", value: "Strom" }]}
        onRemoveFilter={onRemove}
        onClearAll={() => {}}
        labels={{ removeFilter: "Sparte entfernen", activeFilters: "Gesetzte Filter", clearAll: "Filter zurücksetzen" }}
      >
        <span />
      </FilterBar>,
    );
    expect(screen.getByRole("group", { name: "Gesetzte Filter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter zurücksetzen" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sparte entfernen" }));
    expect(onRemove).toHaveBeenCalledWith("sparte");
  });

  describe("collapsible", () => {
    const bar = (props: Partial<Parameters<typeof FilterBar>[0]> = {}) => (
      <FilterBar
        collapsible
        pinned={<input aria-label="Suche" />}
        moreFields={<input aria-label="Typ" />}
        activeFilters={[{ id: "a", label: "Status", value: "Offen" }, { id: "b", value: "Strom" }]}
        labels={{ toggle: "Filter" }}
        {...props}
      >
        <FilterField label="Status"><input aria-label="Status" /></FilterField>
      </FilterBar>
    );

    it("keeps pinned field and chips visible, hides fields until expanded", async () => {
      render(bar());
      expect(screen.getByLabelText("Suche")).toBeVisible();
      expect(screen.getByText("Offen")).toBeVisible();
      const toggle = screen.getByRole("button", { name: /Filter/ });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveTextContent("2");
      expect(screen.getByLabelText("Status")).not.toBeVisible();
      await userEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByLabelText("Status")).toBeVisible();
      // moreFields stehen im Bereich, nicht im Popover
      expect(screen.getByLabelText("Typ")).toBeVisible();
      expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toContainElement(screen.getByLabelText("Typ"));
    });

    it("supports controlled expansion", async () => {
      const onExpandedChange = vi.fn();
      render(bar({ expanded: false, onExpandedChange }));
      await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
      expect(onExpandedChange).toHaveBeenCalledWith(true);
      expect(screen.getByRole("button", { name: /Filter/ })).toHaveAttribute("aria-expanded", "false");
    });

    it("opens with defaultExpanded", () => {
      render(bar({ defaultExpanded: true }));
      expect(screen.getByLabelText("Status")).toBeVisible();
    });
  });
});
