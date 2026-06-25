import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Launchpad } from "./launchpad";
import type { LaunchpadSection } from "./launchpad";

const sections: LaunchpadSection[] = [
  {
    id: "overview",
    title: "Überblick",
    cards: [
      { id: "tickets", kind: "kpi", title: "Offene Tickets", value: "12", delta: "−3", trend: "down" },
      { id: "nav-new", kind: "nav", title: "Neuer Prozess", description: "Service starten" },
      {
        id: "spend",
        kind: "trend",
        title: "Ausgaben Q2",
        value: "€248.300",
        delta: "+4 %",
        trend: "up",
        span: 2,
        data: [182, 196, 188, 214, 231, 248],
      },
    ],
  },
  {
    id: "inbox",
    title: "Posteingang",
    cards: [
      {
        id: "mails",
        kind: "list",
        title: "Inbox",
        count: 14,
        rows: [
          { id: "r1", title: "UTILMD offen", subtitle: "Stadtwerke" },
          { id: "r2", title: "APERAK ok", subtitle: "Netze BW" },
        ],
      },
    ],
  },
];

describe("Launchpad", () => {
  it("renders section titles and cards of every kind", () => {
    render(<Launchpad sections={sections} />);
    expect(screen.getByRole("heading", { name: "Überblick" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Posteingang" })).toBeInTheDocument();
    expect(screen.getByText("Offene Tickets")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Neuer Prozess")).toBeInTheDocument();
    expect(screen.getByText("Service starten")).toBeInTheDocument();
    expect(screen.getByText("Ausgaben Q2")).toBeInTheDocument();
    expect(screen.getByText("UTILMD offen")).toBeInTheDocument();
  });

  it("opens a drill-down popup with the full visualisation for a trend card", async () => {
    const user = userEvent.setup();
    render(<Launchpad sections={sections} />);
    // Es gibt keinen Dialog, bis man vergrößert.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const expandButtons = screen.getAllByRole("button", { name: "Vergrößern" });
    await user.click(expandButtons[0]!);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // Titel der vergrößerten Karte erscheint im Popup
    expect(dialog).toHaveTextContent("Ausgaben Q2");
  });

  it("renders a custom card and its detail in the popup", async () => {
    const user = userEvent.setup();
    render(
      <Launchpad
        sections={[
          {
            id: "s",
            cards: [
              {
                id: "c",
                kind: "custom",
                title: "Eigene Karte",
                render: () => <p>Teilansicht</p>,
                detail: <p>Vollansicht</p>,
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Teilansicht")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Vergrößern" }));
    expect(await screen.findByText("Vollansicht")).toBeInTheDocument();
  });

  it("renders a show-all affordance for list cards and fires onShowAll", async () => {
    const user = userEvent.setup();
    const onShowAll = vi.fn();
    render(
      <Launchpad
        sections={[
          {
            id: "s",
            cards: [
              {
                id: "l",
                kind: "list",
                title: "Inbox",
                onShowAll,
                rows: [{ id: "r", title: "Eine Zeile" }],
              },
            ],
          },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Alle anzeigen/ }));
    expect(onShowAll).toHaveBeenCalledTimes(1);
  });

  it("caps list rows at maxRows (rest goes to the popup)", () => {
    render(
      <Launchpad
        sections={[
          {
            id: "s",
            cards: [
              {
                id: "l",
                kind: "list",
                title: "Inbox",
                maxRows: 2,
                rows: [
                  { id: "a", title: "Zeile A" },
                  { id: "b", title: "Zeile B" },
                  { id: "c", title: "Zeile C" },
                ],
              },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByText("Zeile A")).toBeInTheDocument();
    expect(screen.getByText("Zeile B")).toBeInTheDocument();
    expect(screen.queryByText("Zeile C")).not.toBeInTheDocument();
  });
});
