import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tree, TreeItem } from "./tree";

function Hierarchy(props: React.ComponentProps<typeof Tree>) {
  return (
    <Tree aria-label="Marktrollen" {...props}>
      <TreeItem id="lf" title="Lieferant">
        <TreeItem id="strom" title="Strom" />
        <TreeItem id="gas" title="Gas" />
      </TreeItem>
      <TreeItem id="nb" title="Netzbetreiber">
        <TreeItem id="vnb" title="Verteilnetzbetreiber" />
      </TreeItem>
    </Tree>
  );
}

describe("tree primitive", () => {
  it("renders the top-level rows", () => {
    render(<Hierarchy selectionMode="none" />);
    expect(screen.getByRole("row", { name: /Lieferant/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Netzbetreiber/ })).toBeInTheDocument();
  });

  it("expands a collapsed item to reveal its children", async () => {
    render(<Hierarchy selectionMode="none" />);
    // Children sind anfangs nicht sichtbar.
    expect(screen.queryByRole("row", { name: /Strom/ })).not.toBeInTheDocument();
    const chevron = screen.getAllByRole("button", { name: /Aufklappen/ })[0]!;
    await userEvent.click(chevron);
    expect(screen.getByRole("row", { name: /Strom/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Gas/ })).toBeInTheDocument();
  });

  it("puts chevronTestId on the chevron and switches its label with the state", async () => {
    render(
      <Tree aria-label="Baum">
        <TreeItem id="a" title="Eltern" chevronTestId="zeile-klapp">
          <TreeItem id="b" title="Kind" />
        </TreeItem>
      </Tree>,
    );
    const pfeil = screen.getByTestId("zeile-klapp");
    expect(pfeil).toHaveAttribute("aria-label", "Aufklappen");
    await userEvent.click(pfeil);
    expect(screen.getByRole("row", { name: /Kind/ })).toBeInTheDocument();
    expect(screen.getByTestId("zeile-klapp")).toHaveAttribute("aria-label", "Zuklappen");
  });

  it("uses chevronLabel when given", () => {
    render(
      <Tree aria-label="Baum">
        <TreeItem id="a" title="Eltern" chevronLabel="Instanz aufklappen">
          <TreeItem id="b" title="Kind" />
        </TreeItem>
      </Tree>,
    );
    expect(screen.getByRole("button", { name: /^Instanz aufklappen/ })).toBeInTheDocument();
  });

  it("supports multiple selection via the selection checkbox", async () => {
    const onSelectionChange = vi.fn();
    render(
      <Hierarchy selectionMode="multiple" onSelectionChange={onSelectionChange} />,
    );
    const checkbox = screen.getAllByRole("checkbox")[0]!;
    await userEvent.click(checkbox);
    expect(onSelectionChange).toHaveBeenCalledOnce();
  });

  it("applies the prn-tree class to the tree container", () => {
    render(<Hierarchy selectionMode="none" />);
    expect(screen.getByRole("treegrid")).toHaveClass("prn-tree");
  });

  it("state selectors of tree.css reach the row inside the gridcell (expanded item rotates its chevron)", () => {
    // RAC wraps the row content in a gridcell (display: contents); a child combinator from the item to .prn-tree-row never matches.
    const { container } = render(<Hierarchy selectionMode="single" defaultExpandedKeys={["lf"]} />);
    const css = readFileSync(resolve(process.cwd(), "src/primitives/tree.css"), "utf8");
    const selectors = [...css.matchAll(/^(\.prn-tree-item\[data-[a-z-]+\][^{,]*)\{/gm)].map((m) => (m[1] ?? "").trim());
    expect(selectors.length).toBeGreaterThanOrEqual(5);
    for (const s of selectors) {
      const structure = s.replace(/\[data-[a-z-]+\]/, "");
      expect(container.querySelector(structure), s).not.toBeNull();
    }
    expect(container.querySelector(".prn-tree-item[data-expanded] .prn-tree-chevron")).not.toBeNull();
  });
  it("Einfachauswahl ohne Kästchen: Zeile wählbar, aria-selected, Balken statt Kästchen; Mehrfachauswahl behält die Kästchen", async () => {
    const onSelectionChange = vi.fn();
    const { container, unmount } = render(<Hierarchy selectionMode="single" onSelectionChange={onSelectionChange} />);
    expect(container.querySelector(".prn-tree")).toHaveAttribute("data-selection", "single");
    expect(container.querySelectorAll(".prn-tree-check")).toHaveLength(0);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
    await userEvent.click(screen.getByText("Netzbetreiber"));
    expect(screen.getByRole("row", { name: /Netzbetreiber/ })).toHaveAttribute("aria-selected", "true");
    expect([...(onSelectionChange.mock.calls[0]![0] as Set<string>)]).toEqual(["nb"]);
    const css = readFileSync(resolve(process.cwd(), "src/primitives/tree.css"), "utf8");
    expect(css).toMatch(/\.prn-tree\[data-selection="single"\] \.prn-tree-item\[data-selected\] \.prn-tree-row \{\s*box-shadow: inset 3px 0 0/);
    unmount();
    render(<Hierarchy selectionMode="multiple" />);
    expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
  });
});
