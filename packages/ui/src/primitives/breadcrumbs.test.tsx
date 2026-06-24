import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Breadcrumbs, Breadcrumb, Link } from "./breadcrumbs";

describe("breadcrumbs primitives", () => {
  it("Breadcrumbs renders its items and marks the current page", () => {
    render(
      <Breadcrumbs aria-label="Pfad">
        <Breadcrumb>
          <Link href="/">Start</Link>
        </Breadcrumb>
        <Breadcrumb>
          <Link href="/strom">Strom</Link>
        </Breadcrumb>
        <Breadcrumb>Tarif</Breadcrumb>
      </Breadcrumbs>,
    );
    expect(screen.getByRole("list", { name: "Pfad" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start" })).toBeInTheDocument();
    // Der letzte Eintrag ist die aktuelle Seite.
    const items = screen.getAllByRole("listitem");
    expect(items[items.length - 1]).toHaveAttribute("data-current", "true");
  });

  it("Breadcrumbs fires onAction with the clicked breadcrumb id", async () => {
    const onAction = vi.fn();
    render(
      <Breadcrumbs aria-label="Pfad" onAction={onAction}>
        <Breadcrumb id="home">
          <Link>Start</Link>
        </Breadcrumb>
        <Breadcrumb id="now">
          <Link>Aktuell</Link>
        </Breadcrumb>
      </Breadcrumbs>,
    );
    await userEvent.click(screen.getByRole("link", { name: "Start" }));
    expect(onAction).toHaveBeenCalledWith("home");
  });

  it("Link fires onPress when activated", async () => {
    const onPress = vi.fn();
    render(<Link onPress={onPress}>Mehr</Link>);
    await userEvent.click(screen.getByRole("link", { name: "Mehr" }));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("Link reflects its disabled state", () => {
    render(
      <Link isDisabled href="/x">
        Deaktiviert
      </Link>,
    );
    expect(screen.getByText("Deaktiviert")).toHaveAttribute("data-disabled", "true");
  });
});
