import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListReportPage } from "./listreport";

describe("ListReportPage", () => {
  it("rendert Titel als h1, Inhalt neben dem Titel, Untertitel, Aktionen, Kopf und Inhalt", () => {
    render(
      <ListReportPage data-testid="seite" title="Klärfälle" titleContent={<span>3 überfällig</span>} subtitle="Mandant LF" actions={<button>Aktualisieren</button>}
        breadcrumbs={<nav aria-label="Krumen">Marktkommunikation</nav>} header={<div role="search" aria-label="Filter" />}>
        <table aria-label="Fälle" />
      </ListReportPage>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Klärfälle" })).toBeInTheDocument();
    expect(screen.getByText("3 überfällig")).toBeInTheDocument();
    expect(screen.getByText("Mandant LF")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aktualisieren" })).toBeInTheDocument();
    expect(screen.getByRole("search", { name: "Filter" })).toBeVisible();
    expect(screen.getByRole("table", { name: "Fälle" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Krumen" })).toBeInTheDocument();
    expect(screen.queryByRole("toolbar")).toBeNull(); // ohne footer keine Fußleiste
  });

  it("Kopfbereich ein- und ausklappbar (ungesteuert), mit aria-expanded und eigenen Texten", async () => {
    render(<ListReportPage title="Liste" headerCollapsible labels={{ collapseHeader: "Filter ausblenden", expandHeader: "Filter einblenden" }} header={<div role="search" aria-label="Filter" />} />);
    const knopf = screen.getByRole("button", { name: "Filter ausblenden" });
    expect(knopf).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(knopf);
    expect(screen.getByRole("button", { name: "Filter einblenden" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("search")).toBeNull();
  });

  it("gesteuert: meldet den Wechsel, ändert selbst nichts", async () => {
    const onChange = vi.fn();
    render(<ListReportPage title="Liste" headerCollapsible headerExpanded={false} onHeaderExpandedChange={onChange} header={<div>Filter</div>} />);
    await userEvent.click(screen.getByRole("button", { name: "Kopfbereich einblenden" }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button", { name: "Kopfbereich einblenden" })).toBeInTheDocument();
  });

  it("Fußleiste als Toolbar, titleLevel 2", () => {
    render(<ListReportPage title="Teil" titleLevel={2} footer={<button>Erledigen</button>} />);
    expect(screen.getByRole("heading", { level: 2, name: "Teil" })).toBeInTheDocument();
    expect(screen.getByRole("toolbar")).toContainElement(screen.getByRole("button", { name: "Erledigen" }));
  });
});
