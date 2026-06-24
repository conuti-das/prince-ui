/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorPanel } from "./ErrorPanel";
import type { LintIssue } from "./lintConfig";

const issues: LintIssue[] = [
  { id: "label-required", message: "Element requires a label", category: "error", element: "Task_1" },
  { id: "no-implicit-split", message: "Implicit split", category: "warning", element: "GW_1" },
];

describe("ErrorPanel", () => {
  it("renders curated hints and the issue count", () => {
    render(
      <ErrorPanel
        issues={issues}
        elementName={(id) => (id === "Task_1" ? "Prüfen" : (id ?? ""))}
        onSelectElement={() => {}}
        onClose={() => {}}
      />,
    );
    expect(screen.getByText(/2 Befund/)).toBeInTheDocument();
    expect(screen.getByText("Beschriftung fehlt")).toBeInTheDocument();
    expect(screen.getByText("Impliziter Split")).toBeInTheDocument();
    expect(screen.getByText("Prüfen")).toBeInTheDocument();
  });

  it("selects an element when the link is pressed", async () => {
    const onSelect = vi.fn();
    render(
      <ErrorPanel
        issues={issues}
        elementName={(id) => id ?? ""}
        onSelectElement={onSelect}
        onClose={() => {}}
      />,
    );
    await userEvent.click(screen.getByText("Task_1"));
    expect(onSelect).toHaveBeenCalledWith("Task_1");
  });

  it("shows the KI-Fix button only when onKiFix is given", async () => {
    const onKiFix = vi.fn();
    const { rerender } = render(
      <ErrorPanel issues={issues} elementName={(id) => id ?? ""} onSelectElement={() => {}} onClose={() => {}} />,
    );
    expect(screen.queryByTestId("ki-fix-all")).toBeNull();
    rerender(
      <ErrorPanel issues={issues} elementName={(id) => id ?? ""} onSelectElement={() => {}} onClose={() => {}} onKiFix={onKiFix} />,
    );
    await userEvent.click(screen.getByTestId("ki-fix-all"));
    expect(onKiFix).toHaveBeenCalled();
  });

  it("closes via the close button", async () => {
    const onClose = vi.fn();
    render(
      <ErrorPanel issues={issues} elementName={(id) => id ?? ""} onSelectElement={() => {}} onClose={onClose} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Schließen" }));
    expect(onClose).toHaveBeenCalled();
  });
});
