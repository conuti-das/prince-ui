import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ListBox,
  ListBoxOption,
  GridList,
  GridListItem,
  TagGroup,
  Tag,
} from "./collections";

describe("collections primitives", () => {
  it("ListBox renders its options", () => {
    render(
      <ListBox aria-label="Sparten">
        <ListBoxOption id="strom">Strom</ListBoxOption>
        <ListBoxOption id="gas">Gas</ListBoxOption>
      </ListBox>,
    );
    expect(screen.getByRole("option", { name: "Strom" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Gas" })).toBeInTheDocument();
  });

  it("ListBox selects an option (single)", async () => {
    const onSelectionChange = vi.fn();
    render(
      <ListBox aria-label="Sparten" selectionMode="single" onSelectionChange={onSelectionChange}>
        <ListBoxOption id="strom">Strom</ListBoxOption>
        <ListBoxOption id="gas">Gas</ListBoxOption>
      </ListBox>,
    );
    await userEvent.click(screen.getByRole("option", { name: "Gas" }));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("GridList renders its rows", () => {
    render(
      <GridList aria-label="Zähler">
        <GridListItem id="a" textValue="Zähler A">Zähler A</GridListItem>
        <GridListItem id="b" textValue="Zähler B">Zähler B</GridListItem>
      </GridList>,
    );
    expect(screen.getByRole("row", { name: "Zähler A" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Zähler B" })).toBeInTheDocument();
  });

  it("GridList toggles selection", async () => {
    const onSelectionChange = vi.fn();
    render(
      <GridList aria-label="Zähler" selectionMode="multiple" onSelectionChange={onSelectionChange}>
        <GridListItem id="a" textValue="Zähler A">Zähler A</GridListItem>
        <GridListItem id="b" textValue="Zähler B">Zähler B</GridListItem>
      </GridList>,
    );
    await userEvent.click(screen.getByRole("row", { name: "Zähler A" }));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it("TagGroup renders its tags with a label", () => {
    render(
      <TagGroup label="Filter" aria-label="Filter">
        <Tag id="strom">Strom</Tag>
        <Tag id="gas">Gas</Tag>
      </TagGroup>,
    );
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Strom" })).toBeInTheDocument();
  });

  it("TagGroup removes a tag via onRemove", async () => {
    const onRemove = vi.fn();
    render(
      <TagGroup aria-label="Filter" onRemove={onRemove}>
        <Tag id="strom">Strom</Tag>
        <Tag id="gas">Gas</Tag>
      </TagGroup>,
    );
    const removeButtons = screen.getAllByRole("button");
    await userEvent.click(removeButtons[0]!);
    expect(onRemove).toHaveBeenCalled();
  });
});
