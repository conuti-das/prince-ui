import "@testing-library/jest-dom/vitest";
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
});
