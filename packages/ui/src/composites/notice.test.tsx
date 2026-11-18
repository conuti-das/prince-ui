import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Notice } from "./composites";

describe("Notice mit Schließen und Aktionen", () => {
  it("schließt über den benannten Knopf, zeigt Aktionen, Rolle alert, testid", async () => {
    const onClose = vi.fn();
    render(<Notice tone="negative" role="alert" data-testid="hinweis" onClose={onClose} closeLabel="Meldung schließen" actions={<button>Erneut laden</button>}>Senden fehlgeschlagen.</Notice>);
    expect(screen.getByRole("alert")).toHaveAttribute("data-testid", "hinweis");
    expect(screen.getByRole("button", { name: "Erneut laden" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Meldung schließen" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
  it("ohne Handler kein Knopf, Rolle status", () => {
    render(<Notice>Info</Notice>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
