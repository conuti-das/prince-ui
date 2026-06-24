import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastRegion, toastQueue } from "./toast";

afterEach(() => {
  // Queue zwischen Tests leeren.
  act(() => {
    toastQueue.clear();
  });
});

describe("toast primitives", () => {
  it("ToastRegion renders without crashing", () => {
    const { container } = render(<ToastRegion />);
    // Ohne Toasts rendert RAC keine Region in den DOM — Smoke-Test ohne Fehler.
    expect(container).toBeInTheDocument();
  });

  it("queuing a toast renders it in the region", async () => {
    render(<ToastRegion />);
    act(() => {
      toastQueue.add({ title: "Gespeichert", description: "Alles erledigt." });
    });
    await waitFor(() => {
      expect(screen.getByText("Gespeichert")).toBeInTheDocument();
    });
    expect(screen.getByText("Alles erledigt.")).toBeInTheDocument();
  });

  it("the close button dismisses the toast", async () => {
    const user = userEvent.setup();
    render(<ToastRegion />);
    act(() => {
      toastQueue.add({ title: "Hinweis" });
    });
    await waitFor(() => expect(screen.getByText("Hinweis")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Schließen" }));
    await waitFor(() => {
      expect(screen.queryByText("Hinweis")).not.toBeInTheDocument();
    });
  });
});
