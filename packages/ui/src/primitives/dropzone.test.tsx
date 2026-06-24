import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DropZone, FileTrigger } from "./dropzone";

describe("dropzone primitives", () => {
  it("DropZone renders its children and exposes a button role", () => {
    render(
      <DropZone>
        <span>Dateien hierher ziehen</span>
      </DropZone>,
    );
    expect(screen.getByText("Dateien hierher ziehen")).toBeInTheDocument();
    // React Aria's DropZone is operable as a button for keyboard/AT users.
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("FileTrigger renders a button with an associated file input", () => {
    const { container } = render(
      <FileTrigger acceptedFileTypes={["image/png"]} allowsMultiple>
        Hochladen
      </FileTrigger>,
    );
    const btn = screen.getByRole("button", { name: "Hochladen" });
    expect(btn).toBeInTheDocument();
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("accept", "image/png");
    expect(input).toHaveAttribute("multiple");
  });

  it("FileTrigger uses the default label", () => {
    render(<FileTrigger />);
    expect(screen.getByRole("button", { name: "Datei wählen" })).toBeInTheDocument();
  });
});
